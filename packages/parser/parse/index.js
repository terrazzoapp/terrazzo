import { evaluate, parse as parseJSON } from '@humanwhocodes/momoa';
import { isAlias, parseAlias, splitID } from '@terrazzo/token-tools';
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
  const $typeInheritance = {};
  traverse(ast, {
    enter(node, parent, path) {
      if (node.type === 'Member' && node.value.type === 'Object' && node.value.members) {
        const members = getObjMembers(node.value);

        // keep track of $types
        if (members.$type && members.$type.type === 'String' && !members.$value) {
          $typeInheritance[path.join('.') || '.'] = node.value.members.find((m) => m.name.value === '$type');
        }

        if (members.$value) {
          const extensions = members.$extensions ? getObjMembers(members.$extensions) : undefined;
          const sourceNode = structuredClone(node);
          const id = path.join('.');

          // get parent type by taking the closest-scoped $type (length === closer)
          let parent$type;
          let longestPath = '';
          for (const [k, v] of Object.entries($typeInheritance)) {
            if (k === '.' || id.startsWith(k)) {
              if (k.length > longestPath.length) {
                parent$type = v;
                longestPath = k;
              }
            }
          }
          if (parent$type && !members.$type) {
            sourceNode.value = injectObjMembers(sourceNode.value, [parent$type]);
          }
          validate(sourceNode, { ast, logger });

          const group = { id: splitID(id).group, tokens: [] };
          if (parent$type) {
            group.$type = parent$type.value.value;
          }
          // note: this will also include sibling tokens, so be selective about only accessing group-specific properties
          const groupMembers = getObjMembers(parent);
          if (groupMembers.$description) {
            group.$description = evaluate(groupMembers.$description);
          }
          if (groupMembers.$extensions) {
            group.$extensions = evaluate(groupMembers.$extensions);
          }
          const token = {
            $type: members.$type?.value ?? parent$type?.value.value,
            $value: evaluate(members.$value),
            id,
            mode: {},
            originalValue: evaluate(node.value),
            group,
            sourceNode: sourceNode.value,
          };
          if (members.$description?.value) {
            token.$description = members.$description.value;
          }

          // handle modes
          // note that circular refs are avoided here, such as not duplicating `modes`
          const modeValues = extensions?.mode ? getObjMembers(extensions.mode) : {};
          for (const mode of ['.', ...Object.keys(modeValues)]) {
            token.mode[mode] = {
              id: token.id,
              $type: token.$type,
              $value: mode === '.' ? token.$value : evaluate(modeValues[mode]),
              sourceNode: mode === '.' ? structuredClone(token.sourceNode) : modeValues[mode],
            };
            if (token.$description) {
              token.mode[mode].$description = token.$description;
            }
          }

          tokens[id] = token;
        } else if (members.value) {
          logger.warn({ message: `Group ${id} has "value". Did you mean "$value"?`, node, ast });
        }
      }

      // edge case: if $type appears at root of tokens.json, collect it
      if (node.type === 'Document' && node.body.type === 'Object' && node.body.members) {
        const members = getObjMembers(node.body);
        if (members.$type && members.$type.type === 'String' && !members.$value) {
          $typeInheritance['.'] = node.body.members.find((m) => m.name.value === '$type');
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

  // 3. Execute lint runner with loaded plugins
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

  // 4. normalize values
  const normalizeStart = performance.now();
  logger.debug({
    group: 'parser',
    task: 'normalize',
    message: 'Start token normalization',
  });
  for (const id in tokens) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }
    try {
      tokens[id].$value = normalize(tokens[id]);
    } catch (err) {
      logger.error({ message: err.message, ast, node: tokens[id].sourceNode });
    }
    for (const mode in tokens[id].mode) {
      if (mode === '.') {
        continue;
      }
      try {
        tokens[id].mode[mode].$value = normalize(tokens[id].mode[mode]);
      } catch (err) {
        logger.error({ message: err.message, ast, node: tokens[id].mode[mode].sourceNode });
      }
    }
  }
  logger.debug({
    group: 'parser',
    task: 'normalize',
    message: 'Finish token normalization',
    timing: performance.now() - normalizeStart,
  });

  // 5. Resolve aliases and populate groups
  for (const id in tokens) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }
    const token = tokens[id];
    applyAliases(token, { tokens, ast, node: token.sourceNode, logger });
    token.mode['.'].$value = token.$value;
    if (token.aliasOf) {
      token.mode['.'].aliasOf = token.aliasOf;
    }
    if (token.partialAliasOf) {
      token.mode['.'].partialAliasOf = token.partialAliasOf;
    }
    const { group: parentGroup } = splitID(id);
    for (const siblingID in tokens) {
      const { group: siblingGroup } = splitID(siblingID);
      if (siblingGroup?.startsWith(parentGroup)) {
        token.group.tokens.push(siblingID);
      }
    }
  }

  // 6. resolve mode aliases
  const modesStart = performance.now();
  logger.debug({
    group: 'parser',
    task: 'modes',
    message: 'Start mode resolution',
  });
  for (const id in tokens) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }
    for (const mode in tokens[id].mode) {
      if (mode === '.') {
        continue; // skip shadow of root value
      }
      applyAliases(tokens[id].mode[mode], { tokens, ast, node: tokens[id].mode[mode].sourceNode, logger });
    }
  }
  logger.debug({
    group: 'parser',
    task: 'modes',
    message: 'Finish token modes',
    timing: performance.now() - modesStart,
  });

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

/** Resolve aliases, update values, and mutate `token` to add `aliasOf` / `partialAliasOf` */
function applyAliases(token, { tokens, logger, ast, node }) {
  // handle simple aliases
  if (isAlias(token.$value)) {
    const aliasOfID = resolveAlias(token.$value, { tokens, logger, node, ast });
    const { mode: aliasMode } = parseAlias(token.$value);
    const aliasOf = tokens[aliasOfID];
    token.aliasOf = aliasOfID;
    token.$value = aliasOf.mode[aliasMode]?.$value || aliasOf.$value;
    if (token.$type && token.$type !== aliasOf.$type) {
      logger.warn({
        message: `Token ${token.id} has $type "${token.$type}" but aliased ${aliasOfID} of $type "${aliasOf.$type}"`,
        node,
        ast,
      });
      token.$type = aliasOf.$type;
    } else {
      token.$type = aliasOf.$type;
    }
  }
  // handle aliases within array values (e.g. cubicBezier, gradient)
  else if (Array.isArray(token.$value)) {
    // some arrays are primitives, some are objects. handle both
    for (let i = 0; i < token.$value.length; i++) {
      if (isAlias(token.$value[i])) {
        if (!token.partialAliasOf) {
          token.partialAliasOf = [];
        }
        const aliasOfID = resolveAlias(token.$value[i], { tokens, logger, node, ast });
        const { mode: aliasMode } = parseAlias(token.$value[i]);
        token.partialAliasOf[i] = aliasOfID;
        token.$value[i] = tokens[aliasOfID].mode[aliasMode]?.$value || tokens[aliasOfID].$value;
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
            const { mode: aliasMode } = parseAlias(token.$value[i][property]);
            token.$value[i][property] = tokens[aliasOfID].mode[aliasMode]?.$value || tokens[aliasOfID].$value;
            token.partialAliasOf[i][property] = aliasOfID;
          }
        }
      }
    }
  }
  // handle aliases within object (composite) values (e.g. border, typography, transition)
  else if (typeof token.$value === 'object') {
    for (const property in token.$value) {
      if (!Object.hasOwn(token.$value, property)) {
        continue;
      }

      if (isAlias(token.$value[property])) {
        if (!token.partialAliasOf) {
          token.partialAliasOf = {};
        }
        const aliasOfID = resolveAlias(token.$value[property], { tokens, logger, node, ast });
        const { mode: aliasMode } = parseAlias(token.$value[property]);
        token.partialAliasOf[property] = aliasOfID;
        token.$value[property] = tokens[aliasOfID].mode[aliasMode]?.$value || tokens[aliasOfID].$value;
      }
      // strokeStyle has an array within an object
      else if (Array.isArray(token.$value[property])) {
        for (let i = 0; i < token.$value[property].length; i++) {
          if (isAlias(token.$value[property][i])) {
            const aliasOfID = resolveAlias(token.$value[property][i], { tokens, logger, node, ast });
            if (!token.partialAliasOf) {
              token.partialAliasOf = {};
            }
            if (!token.partialAliasOf[property]) {
              token.partialAliasOf[property] = [];
            }
            const { mode: aliasMode } = parseAlias(token.$value[property][i]);
            token.partialAliasOf[property][i] = aliasOfID;
            token.$value[property][i] = tokens[aliasOfID].mode[aliasMode]?.$value || tokens[aliasOfID].$value;
          }
        }
      }
    }
  }
}
