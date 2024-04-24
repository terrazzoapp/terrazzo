import { evaluate, parse as parseJSON } from '@humanwhocodes/momoa';
import { isAlias, parseAlias } from '@terrazzo/token-tools';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import normalize from './normalize.js';
import parseYAML from './yaml.js';
import validate from './validate.js';
import { getObjMembers, injectObjMembers, traverse } from './json.js';

export * from './validate.js';

/**
 * @typedef {import("@humanwhocodes/momoa").DocumentNode} DocumentNode
 * @typedef {import("../config.js").Plugin} Plugin
 * @typedef {import("../types.js").TokenNormalized} TokenNormalized
 * @typedef {object} ParseOptions
 * @typedef {Logger} ParseOptions.logger
 * @typedef {boolean=false} ParseOptions.skipLint
 * @typedef {Plugin[]} ParseOptions.plugins
 * @typedef {object} ParseResult
 * @typedef {Record<string, TokenNormalized} ParseResult.tokens
 * @typedef {DocumentNode} ParseResult.ast
 */

/**
 * Parse
 * @param {string | object} input
 * @param {ParseOptions} options
 * @return {Promise<ParseResult>}
 */
export default async function parse(input, { logger = new Logger(), skipLint = false, config } = {}) {
  const { plugins } = config;

  const totalStart = performance.now();

  // 1. Build AST
  const startParsing = performance.now();
  logger.debug({ group: 'parser', task: 'parse', message: 'Start tokens parsing' });
  let ast;
  if (typeof input === 'string' && !maybeJSONString(input)) {
    ast = parseYAML(input, { logger }); // if string, but not JSON, attempt YAML
  } else {
    ast = parseJSON(typeof input === 'string' ? input : JSON.stringify(input, undefined, 2), {
      mode: 'jsonc',
    }); // everything else: assert it’s JSON-serializable
  }
  logger.debug({
    group: 'parser',
    task: 'parse',
    message: 'Finish tokens parsing',
    timing: performance.now() - startParsing,
  });

  const tokens = {};

  // 2. Walk AST once to validate tokens
  const startValidation = performance.now();
  logger.debug({ group: 'parser', task: 'validate', message: 'Start tokens validation' });
  let last$Type;
  traverse(ast, {
    enter(node, parent, path) {
      if (node.type === 'Member' && node.value.type === 'Object' && node.value.members) {
        const members = getObjMembers(node.value);

        // keep track of closest-scoped $type
        // note: this is only reliable in a synchronous, single-pass traversal;
        // otherwise we’d have to do something more complicated
        if (members.$type && members.$type.type === 'String') {
          last$Type = node.value.members.find((m) => m.name.value === '$type');
        }

        if (members.$value) {
          const extensions = members.$extensions ? getObjMembers(members.$extensions) : undefined;
          const sourceNode = structuredClone(node);
          if (last$Type && !members.$type) {
            sourceNode.value = injectObjMembers(sourceNode.value, [last$Type]);
          }
          validate(sourceNode, { ast, logger });

          const id = path.join('.');
          const token = {
            $type: members.$type?.value ?? last$Type?.value.value,
            $value: evaluate(members.$value),
            id,
            mode: {},
            originalValue: evaluate(node.value),
            group: {
              id: path.slice(0, path.length - 1).join('.'),
              tokens: {},
            },
            sourceNode: sourceNode.value,
          };
          if (members.$description?.value) {
            token.$description = members.$description.value;
          }

          // handle modes: note: avoid circular refs here, such as not duplicating `modes`
          const modeValues = extensions?.mode ? getObjMembers(extensions.mode) : {};
          for (const mode of ['.', ...Object.keys(modeValues)]) {
            token.mode[mode] = { id: token.id, $type: token.$type };
            if (token.$description) {
              token.mode[mode].$description = token.$description;
            }
            token.mode[mode].$value = mode === '.' ? structuredClone(token.$value) : evaluate(modeValues[mode]);
          }

          // TODO: group + group tokens

          tokens[id] = token;
        } else if (members.value) {
          logger.warn({ message: `Group ${id} has "value". Did you mean "$value"?`, node, ast });
        }
      }
    },
  });
  logger.debug({
    group: 'parser',
    task: 'validate',
    message: 'Finish tokens validation',
    timing: performance.now() - startValidation,
  });

  // 3. Resolve aliases, and finalize modes
  for (const id in tokens) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }

    const token = tokens[id];
    const node = token.sourceNode;

    if (isAlias(token.$value)) {
      const aliasOfID = resolveAlias(token.$value, { tokens, logger, node, ast });
      const aliasOf = aliasOfID;
      token.$value = structuredClone(tokens[aliasOfID].$value);
      if (token.$type !== aliasOf.$type) {
        logger.warn({
          message: `Token ${id} has $type "${token.$type}" but aliased ${aliasOfID} of $type "${aliasOf.$type}"`,
          node,
          ast,
        });
        token.$type = aliasOf.$type;
      }
    } else if (Array.isArray(token.$value)) {
      for (let i = 0; i < token.$value.length; i++) {
        if (isAlias(token.$value[i])) {
          if (!token.partialAliasOf) {
            token.partialAliasOf = [];
          }
          const aliasOfID = resolveAlias(token.$value[i], { tokens, logger, node, ast });
          token.partialAliasOf[i] = aliasOfID;
          token.$value[i] = structuredClone(tokens[aliasOfID].$value);
        } else if (typeof token.$value[i] === 'object') {
          for (const property in token.$value[i]) {
            if (isAlias(token.$value[i][property])) {
              if (!token.partialAliasOf) {
                token.partialAliasOf = [];
              }
              if (!token.partialAliasOf[i]) {
                token.partialAliasOf[i] = {};
              }
              const aliasOfID = resolveAlias(token.$value[i][property], { tokens, logger, node, ast });
              token.$value[i][property] = tokens[aliasOfID].$value[i][property];
              token.partialAliasOf[i][property] = aliasOfID;
            }
          }
        }
      }
    } else if (typeof token.$value === 'object') {
      for (const property in token.$value) {
        if (!Object.hasOwn(token.$value, property)) {
          continue;
        }

        if (isAlias(token.$value[property])) {
          if (!token.partialAliasOf) {
            token.partialAliasOf = {};
          }
          const aliasOfID = resolveAlias(token.$value[property], { tokens, logger, node, ast });
          token.partialAliasOf[property] = aliasOfID;
          token.$value[property] = structuredClone(tokens[aliasOfID].$value);
        }
      }
    }

    for (const mode in token.modes) {
      const modeValue = token.modes[mode];
      if (isAlias(modeValue.$value)) {
        const aliasOfID = resolveAlias(modeValue.$value, { tokens, logger, node, ast });
        token.modes[mode].aliasOf = aliasOfID;
        token.modes[mode].$value = tokens[aliasOfID].$value;
      } else if (Array.isArray(modeValue)) {
        for (let i = 0; i < modeValue.length; i++) {
          if (isAlias(modeValue.$value[i])) {
            if (!modeValue.partialAliasOf) {
              modeValue.partialAliasOf = [];
            }
            const aliasOfID = resolveAlias(modeValue.$value[i], { tokens, logger, node, ast });
            modeValue.partialAliasOf[i] = aliasOfID;
            modeValue.$value[i] = structuredClone(tokens[aliasOfID].$value);
          } else if (typeof modeValue.$value[i] === 'object') {
            for (const property in modeValue.$value[i]) {
              if (isAlias(modeValue.$value[i][property])) {
                if (!modeValue.partialAliasOf) {
                  modeValue.partialAliasOf = [];
                }
                if (!modeValue.partialAliasOf[i]) {
                  modeValue.partialAliasOf[i] = {};
                }
                const aliasOfID = resolveAlias(modeValue.$value[i][property], { tokens, logger, node, ast });
                modeValue.$value[i][property] = tokens[aliasOfID].$value[i][property];
                modeValue.partialAliasOf[i][property] = aliasOfID;
              }
            }
          }
        }
      } else if (typeof modeValue === 'object') {
        for (const property in modeValue.$value) {
          if (!Object.hasOwn(modeValue.$value, property)) {
            continue;
          }

          if (isAlias(modeValue.$value[property])) {
            if (!modeValue.partialAliasOf) {
              modeValue.partialAliasOf = {};
            }
            const aliasOfID = resolveAlias(modeValue.$value[property], { tokens, logger, node, ast });
            modeValue.partialAliasOf[property] = aliasOfID;
            modeValue.$value[property] = structuredClone(tokens[aliasOfID].$value);
          }
        }
      }
    }
  }

  // 4. Execute lint runner with loaded plugins
  if (!skipLint && plugins?.length) {
    const lintStart = performance.now();
    logger.debug({
      group: 'parser',
      task: 'validate',
      message: 'Start token linting',
    });
    await lintRunner({ ast, config, logger });
    logger.debug({
      group: 'parser',
      task: 'validate',
      message: 'Finish token linting',
      timing: performance.now() - lintStart,
    });
  }

  // 5. normalize values
  for (const id in tokens) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }

    tokens[id].$value = normalize(tokens[id]);
  }

  logger.debug({
    group: 'parser',
    task: 'core',
    message: 'Finish all parser tasks',
    timing: performance.now() - totalStart,
  });

  return {
    tokens,
    ast,
  };
}

/**
 * Determine if an input is likely a JSON string
 * @param {string} input
 * @return {boolean}
 */
export function maybeJSONString(input) {
  return typeof input === 'string' && input.trim().startsWith('{');
}

/**
 * Resolve alias
 * @param {string} alias
 * @param {Object} options
 * @param {Record<string, TokenNormalized>} options.tokens
 * @param {Logger} options.logger
 * @param {AnyNode | undefined} options.node
 * @param {DocumentNode | undefined} options.ast
 * @param {string[]=[]} options.scanned
 * @param {string}
 */
export function resolveAlias(alias, { tokens, logger, ast, node, scanned = [] }) {
  const { id } = parseAlias(alias);
  if (!tokens[id]) {
    logger.error({ message: `Alias "${alias}" not found`, ast, node });
  }
  if (scanned.includes(id)) {
    logger.error({ message: `Circular alias detected from "${alias}"`, ast, node });
  }
  const token = tokens[id];
  if (!isAlias(token.$value)) {
    return id;
  }
  return resolveAlias(alias, { tokens, logger, ast, node, scanned: [...scanned, id] });
}
