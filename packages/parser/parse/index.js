import { evaluate, parse as parseJSON, print } from '@humanwhocodes/momoa';
import { isAlias, parseAlias, pluralize, splitID } from '@terrazzo/token-tools';
import { fileURLToPath } from 'node:url';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import normalize from './normalize.js';
import parseYAML from './yaml.js';
import validate from './validate.js';
import { getObjMembers, injectObjMembers, traverse } from './json.js';

export * from './validate.js';

/** @typedef {import("@humanwhocodes/momoa").DocumentNode} DocumentNode */
/** @typedef {import("../config.js").Plugin} Plugin */
/** @typedef {import("../types.js").TokenNormalized} TokenNormalized */
/**
 * @typedef {object} ParseResult
 * @property {Record<string, TokenNormalized} tokens
 * @property {Object[]} sources
 */
/**
 * @typedef {object} ParseInput
 * @property {string | object} src
 * @property {URL} [filename]
 */
/**
 * @typedef {object} ParseOptions
 * @property {Logger} logger
 * @property {import("../config.js").Config} config
 * @property {boolean} [skipLint=false]
 * @property {boolean} [continueOnError=false]
 */
/**
 * Parse
 * @param {ParseInput[]} input
 * @param {ParseOptions} [options]
 * @return {Promise<ParseResult>}
 */
export default async function parse(
  input,
  { logger = new Logger(), skipLint = false, config = {}, continueOnError = false } = {},
) {
  let tokens = {};
  // note: only keeps track of sources with locations on disk; in-memory sources are discarded
  // (it’s only for reporting line numbers, which doesn’t mean as much for dynamic sources)
  const sources = {};

  if (!Array.isArray(input)) {
    logger.error({ group: 'parser', task: 'init', message: 'Input must be an array of input objects.' });
  }
  for (let i = 0; i < input.length; i++) {
    if (!input[i] || typeof input[i] !== 'object') {
      logger.error({ group: 'parser', task: 'init', message: `Input (${i}) must be an object.` });
    }
    if (!input[i].src || (typeof input[i].src !== 'string' && typeof input[i].src !== 'object')) {
      logger.error({
        group: 'parser',
        task: 'init',
        message: `Input (${i}) missing "src" with a JSON/YAML string, or JSON object.`,
      });
    }
    if (input[i].filename && !(input[i].filename instanceof URL)) {
      logger.error({
        group: 'parser',
        task: 'init',
        message: `Input (${i}) "filename" must be a URL (remote or file URL).`,
      });
    }

    const result = await parseSingle(input[i].src, {
      filename: input[i].filename,
      logger,
      config,
      skipLint,
      continueOnError,
    });

    tokens = Object.assign(tokens, result.tokens);
    if (input[i].filename) {
      sources[input[i].filename.protocol === 'file:' ? fileURLToPath(input[i].filename) : input[i].filename.href] = {
        filename: input[i].filename,
        source: result.source,
        document: result.document,
      };
    }
  }

  const totalStart = performance.now();

  // 5. Resolve aliases and populate groups
  for (const id in tokens) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }
    const token = tokens[id];
    applyAliases(token, {
      tokens,
      filename: sources[token.source.loc]?.filename,
      source: sources[token.source.loc]?.source,
      node: token.source.node,
      logger,
    });
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
      applyAliases(tokens[id].mode[mode], { tokens, node: tokens[id].mode[mode].source.node, logger });
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

  if (continueOnError) {
    const { errorCount } = logger.stats();
    if (errorCount > 0) {
      logger.error({
        message: `Parser encountered ${errorCount} ${pluralize(errorCount, 'error', 'errors')}. Exiting.`,
      });
    }
  }

  return {
    tokens,
    sources,
  };
}

/**
 * Parse a single input
 * @param {string | object} input
 * @param {object} options
 * @param {URL} [options.filename]
 * @param {Logger} [options.logger]
 * @param {import("../config.js").Config} [options.config]
 * @param {boolean} [options.skipLint]
 */
async function parseSingle(input, { filename, logger, config, skipLint, continueOnError = false }) {
  // 1. Build AST
  let source;
  if (typeof input === 'string') {
    source = input;
  }
  const startParsing = performance.now();
  logger.debug({ group: 'parser', task: 'parse', message: 'Start tokens parsing' });
  let document;
  if (typeof input === 'string' && !maybeJSONString(input)) {
    document = parseYAML(input, { logger }); // if string, but not JSON, attempt YAML
  } else {
    document = parseJSON(
      typeof input === 'string' ? input : JSON.stringify(input, undefined, 2), // everything else: assert it’s JSON-serializable
      {
        mode: 'jsonc',
      },
    );
  }
  if (!source) {
    source = print(document, { indent: 2 });
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
  traverse(document, {
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

          validate(sourceNode, { filename, source, logger });

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
            source: {
              loc: filename ? fileURLToPath(filename) : undefined,
              node: sourceNode.value,
            },
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
              source: {
                loc: filename ? fileURLToPath(filename) : undefined,
                node: mode === '.' ? structuredClone(token.source.node) : modeValues[mode],
              },
            };
            if (token.$description) {
              token.mode[mode].$description = token.$description;
            }
          }

          tokens[id] = token;
        } else if (members.value) {
          logger.warn({ message: `Group ${id} has "value". Did you mean "$value"?`, filename, node, source });
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
  if (!skipLint && config?.plugins?.length) {
    const lintStart = performance.now();
    logger.debug({
      group: 'parser',
      task: 'validate',
      message: 'Start token linting',
    });
    await lintRunner({ document, filename, source, config, logger });
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
      let { node } = tokens[id].source;
      const members = getObjMembers(node);
      if (members.$value) {
        node = members.$value;
      }
      logger.error({ message: err.message, filename, source, node, continueOnError });
    }
    for (const mode in tokens[id].mode) {
      if (mode === '.') {
        continue;
      }
      try {
        tokens[id].mode[mode].$value = normalize(tokens[id].mode[mode]);
      } catch (err) {
        let { node } = tokens[id].source;
        const members = getObjMembers(node);
        if (members.$value) {
          node = members.$value;
        }
        logger.error({
          message: err.message,
          filename,
          source,
          node: tokens[id].mode[mode].source.node,
          continueOnError,
        });
      }
    }
  }
  logger.debug({
    group: 'parser',
    task: 'normalize',
    message: 'Finish token normalization',
    timing: performance.now() - normalizeStart,
  });

  return { tokens, document, source };
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
 * @param {string} [options.filename]
 * @param {AnyNode} [options.node]
 * @param {string} [options.string]
 * @param {string} [options.scanned=[]]
 * @param {string}
 */
export function resolveAlias(alias, { tokens, logger, filename, source, node, scanned = [] }) {
  const { id } = parseAlias(alias);
  if (!tokens[id]) {
    logger.error({ message: `Alias "${alias}" not found`, filename, source, node });
  }
  if (scanned.includes(id)) {
    logger.error({ message: `Circular alias detected from "${alias}"`, filename, source, node });
  }
  const token = tokens[id];
  if (!isAlias(token.$value)) {
    return id;
  }
  return resolveAlias(token.$value, { tokens, logger, filename, node, source, scanned: [...scanned, id] });
}

/** Resolve aliases, update values, and mutate `token` to add `aliasOf` / `partialAliasOf` */
function applyAliases(token, { tokens, logger, filename, source, node }) {
  // handle simple aliases
  if (isAlias(token.$value)) {
    const aliasOfID = resolveAlias(token.$value, { tokens, logger, filename, node, source });
    const { mode: aliasMode } = parseAlias(token.$value);
    const aliasOf = tokens[aliasOfID];
    token.aliasOf = aliasOfID;
    token.$value = aliasOf.mode[aliasMode]?.$value || aliasOf.$value;
    if (token.$type && token.$type !== aliasOf.$type) {
      logger.warn({
        message: `Token ${token.id} has $type "${token.$type}" but aliased ${aliasOfID} of $type "${aliasOf.$type}"`,
        node,
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
        const aliasOfID = resolveAlias(token.$value[i], { tokens, logger, filename, node, source });
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
            const aliasOfID = resolveAlias(token.$value[i][property], { tokens, logger, filename, node, source });
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
        const aliasOfID = resolveAlias(token.$value[property], { tokens, logger, filename, node, source });
        const { mode: aliasMode } = parseAlias(token.$value[property]);
        token.partialAliasOf[property] = aliasOfID;
        token.$value[property] = tokens[aliasOfID].mode[aliasMode]?.$value || tokens[aliasOfID].$value;
      }
      // strokeStyle has an array within an object
      else if (Array.isArray(token.$value[property])) {
        for (let i = 0; i < token.$value[property].length; i++) {
          if (isAlias(token.$value[property][i])) {
            const aliasOfID = resolveAlias(token.$value[property][i], { tokens, logger, filename, node, source });
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
