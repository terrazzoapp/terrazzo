import {
  type StringNode,
  parse as parseJSON,
  type DocumentNode,
  type ParseOptions as MomoaParseOptions,
  evaluate,
} from '@humanwhocodes/momoa';
import type { Config } from '../config.js';
import lintRunner from '../lint/index.js';
import coreLintPlugin from '../lint/plugin-core/index.js';
import Logger from '../logger.js';
import type { Token, TokenNormalized } from '../types.js';
import parseYAML from './yaml.js';
import validate from './validate.js';
import { getObjMembers, traverse } from './json.js';

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
    ast = parseJSON(typeof input === 'string' ? input : JSON.stringify(input, undefined, 2), {
      mode: 'jsonc',
    } as MomoaParseOptions); // everything else: assert it’s JSON-serializable
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
    enter(node, parent, path) {
      if (node.type === 'Member' && node.value.type === 'Object' && node.value.members) {
        const members = getObjMembers(node.value);
        if (members.$value) {
          validate(node, { ast, logger });
          const id = path.join('.');
          tokens[id] = {
            $description: (members.$description as StringNode | undefined)?.value,
            $type: (members.$type as StringNode).value as Token['$type'],
            $value: members.$value,
            id,
            _original: evaluate(parent) as unknown as Token,
            _group: parent,
          };
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

  // 3. Walk AST again to resolve aliases

  // 4. Execute lint runner with loaded plugins
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
