import { pluralize, type TokenNormalizedSet } from '@terrazzo/token-tools';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import type { ConfigInit, InputSource, ParseOptions } from '../types.js';
import { loadAll } from './load.js';
import { normalize } from './normalize.js';

export * from './json.js';

export interface ParseResult {
  tokens: TokenNormalizedSet;
  sources: InputSource[];
}

/** Parse */
export default async function parse(
  _input: Omit<InputSource, 'document'> | Omit<InputSource, 'document'>[],
  {
    logger = new Logger(),
    skipLint = false,
    config = {} as ConfigInit,
    continueOnError = false,
    yamlToMomoa,
    transform,
  }: ParseOptions = {} as ParseOptions,
): Promise<ParseResult> {
  const inputs = Array.isArray(_input) ? _input : [_input];

  // 1. Load
  const totalStart = performance.now();
  const initStart = performance.now();
  const { tokens, sources } = await loadAll(inputs, { logger, continueOnError, yamlToMomoa, transform });
  logger.debug({
    message: 'Loaded tokens',
    group: 'parser',
    label: 'core',
    timing: performance.now() - initStart,
  });

  // 2. Normalize
  const normStart = performance.now();
  const normalized = normalize(tokens, { logger, continueOnError, sources });
  logger.debug({
    message: 'Normalized values',
    group: 'parser',
    label: 'core',
    timing: performance.now() - normStart,
  });

  // 3. Lint (and validate)
  if (!skipLint && config?.plugins?.length) {
    await lintRunner({ tokens: normalized, sources, config, logger });
    const lintStart = performance.now();
    logger.debug({
      message: 'Lint finished',
      group: 'plugin',
      label: 'lint',
      timing: performance.now() - lintStart,
    });
  }

  // 4. finish up
  logger.debug({
    message: 'Finish all parser tasks',
    group: 'parser',
    label: 'core',
    timing: performance.now() - totalStart,
  });

  if (continueOnError) {
    const { errorCount } = logger.stats();
    if (errorCount > 0) {
      logger.error({
        group: 'parser',
        message: `Parser encountered ${errorCount} ${pluralize(errorCount, 'error', 'errors')}. Exiting.`,
      });
    }
  }

  return {
    tokens: normalized,
    sources,
  };
}
