import { evaluate, parse as parseJSON } from '@humanwhocodes/momoa';
import { isAlias, parseAlias } from '@terrazzo/token-tools';
import lintRunner from '../lint/index.js';
import coreLintPlugin from '../lint/plugin-core/index.js';
import Logger from '../logger.js';
import parseYAML from './yaml.js';
import validate from './validate.js';
import { getObjMembers, traverse } from './json.js';

export * from './validate.js';

/**
 * @typedef {import("../config.js").Plugin} Plugin
 * @typedef {import("../types.js").TokenNormalized} TokenNormalized
 * @typedef {object} ParseOptions
 * @typedef {Logger} ParseOptions.logger
 * @typedef {boolean=false} ParseOptions.skipLint
 * @typedef {Plugin[]} ParseOptions.plugins
 */

/**
 * Parse
 * @param {string | object} input
 * @param {ParseOptions} options
 * @return {Promise<Record<string, TokenNormalized>>}
 */
export default async function parse(input, { logger = new Logger(), skipLint = false, ...config }) {
  const totalStart = performance.now();

  // 1. Build AST
  const startParsing = performance.now();
  logger.debug({ group: 'core', task: 'parse', message: 'Start tokens parsing' });
  let ast;
  if (typeof input === 'string' && !maybeJSONString(input)) {
    ast = parseYAML(input, { logger }); // if string, but not JSON, attempt YAML
  } else {
    ast = parseJSON(typeof input === 'string' ? input : JSON.stringify(input, undefined, 2), {
      mode: 'jsonc',
    }); // everything else: assert it’s JSON-serializable
  }
  logger.debug({
    group: 'core',
    task: 'parse',
    message: 'Finish tokens parsing',
    timing: performance.now() - startParsing,
  });

  const tokens = {};

  // 2. Walk AST once to validate tokens
  const startValidation = performance.now();
  logger.debug({ group: 'core', task: 'parse', message: 'Start tokens validation' });
  traverse(ast, {
    enter(node, parent, path) {
      if (node.type === 'Member' && node.value.type === 'Object' && node.value.members) {
        const members = getObjMembers(node.value);
        if (members.$value) {
          const extensions = members.$extensions ? getObjMembers(members.$extensions) : undefined;
          validate(node, { ast, logger });
          const id = path.join('.');
          const token = {
            $description: members.$description?.value,
            $type: members.$type.value,
            $value: members.$value,
            id,
            mode: {},
            originalValue: evaluate(parent),
            group: {
              id: path.slice(0, path.length - 1).join('.'),
              tokens: [],
            },
            sourceNode: node.value,
          };
          token.mode['.'] = token.$value;
          token.group.tokens.push({ ...token });
          tokens[id] = token;
        }
      }
    },
  });
  logger.debug({
    group: 'core',
    task: 'validate',
    message: 'Finish tokens validation',
    timing: performance.now() - startValidation,
  });

  // 3. Resolve aliases, and finalize modes
  for (const id in tokens) {
    const token = tokens[id];

    if (isAlias(token.$value)) {
      const node = token.sourceNode;
      const aliasOfID = resolveAlias(token.$value, { tokens, logger, node, ast });
      const aliasOf = tokens[aliasOfID];
      token.aliasOf = { ...aliasOf };
      token.$value = { ...aliasOf.$value };
      if (token.$type !== aliasOf.$type) {
        logger.warn({
          message: `Token ${id} has $type "${token.$type}" but aliased ${aliasOfID} of $type "${aliasOf.$type}"`,
          node,
          ast,
        });
        token.$type = aliasOf.$type;
      }
    }

    // TODO: modes
  }

  // 4. Execute lint runner with loaded plugins
  if (!skipLint && plugins?.length) {
    const lintStart = performance.now();
    logger.debug({
      group: 'core',
      task: 'parse',
      message: 'Start token linting',
    });
    await lintRunner({ ast, config, logger });
    logger.debug({
      group: 'core',
      task: 'validate',
      message: 'Finish token linting',
      timing: performance.now() - lintStart,
    });
  }

  logger.debug({
    group: 'core',
    task: 'parser',
    message: 'Finish all parser tasks',
    timing: performance.now() - totalStart,
  });

  return tokens;
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
  if (!(id in tokens)) {
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
