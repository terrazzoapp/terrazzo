import { type AnyNode, parse as parseJSON, traverse, type DocumentNode } from '@humanwhocodes/momoa';
import type { Config } from '../config.js';
import lintRunner from '../lint/index.js';
import coreLintPlugin from '../lint/plugin-core/index.js';
import { Logger } from '../logger.js';
import type { TokenNormalized } from '../types.js';
import parseYAML from './yaml.js';
import validate from './validate.js';

export * from './validate.js';

export interface ParseOptions extends Config {
  logger?: Logger;
  /** Skip lint step (default: false) */
  skipLint?: boolean;
}

export default async function parse(
  input: string | object,
  { logger = new Logger(), skipLint = false, plugins }: ParseOptions = { plugins: [coreLintPlugin()] },
) {
  const totalStart = performance.now();

  // 1. Build AST
  const startParsing = performance.now();
  logger.debug({ group: 'core', task: 'parse', message: 'Start tokens parsing' });
  let ast: DocumentNode;
  if (typeof input === 'string' && !maybeJSONString(input)) {
    ast = parseYAML(input, { logger }); // if string, but not JSON, attempt YAML
  } else {
    ast = parseJSON(typeof input === 'string' ? input : JSON.stringify(input, undefined, 2)); // everything else: assert it’s JSON-serializable
  }
  logger.debug({
    group: 'core',
    task: 'parse',
    message: 'Finish tokens parsing',
    timing: performance.now() - startParsing,
  });

  const tokens: Record<string, TokenNormalized> = {};

  // 2. Walk AST once to validate tokens
  const startValidation = performance.now();
  logger.debug({ group: 'core', task: 'parse', message: 'Start tokens validation' });
  traverse(ast, {
    enter(node: AnyNode) {
      if (node.type === 'Member' && node.value.type === 'Object' && node.value.members) {
        if (node.value.members.some((m) => m.name.value === '$value')) {
          validate(node, { ast, logger });
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

  // 3. Execute lint runner with loaded plugins
  if (!skipLint && plugins?.length) {
    const lintStart = performance.now();
    logger.debug({
      group: 'core',
      task: 'parse',
      message: 'Hand off tokens to lint runner',
    });
    await lintRunner(ast, { logger, plugins });
    logger.debug({
      group: 'core',
      task: 'validate',
      message: 'Start tokens validation',
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

/** Determine if an input is likely a JSON string */
export function maybeJSONString(input: unknown) {
  return typeof input === 'string' && input.trim().startsWith('{');
}
