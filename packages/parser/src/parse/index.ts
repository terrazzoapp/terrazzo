import { pluralize, type TokenNormalizedSet } from '@terrazzo/token-tools';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import type { ConfigInit, InputSource, ParseOptions, ResolverNormalized } from '../types.js';
import { loadSources } from './load.js';

export interface ParseResult {
  tokens: TokenNormalizedSet;
  sources: InputSource[];
  resolver?: ResolverNormalized | undefined;
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

  const totalStart = performance.now();
  const initStart = performance.now();
  const { tokens, sources, resolver } = await loadSources(inputs, {
    logger,
    config,
    continueOnError,
    yamlToMomoa,
    transform,
  });
  logger.debug({
    message: 'Loaded tokens',
    group: 'parser',
    label: 'core',
    timing: performance.now() - initStart,
  });

  if (skipLint !== true && config?.plugins?.length) {
    const lintStart = performance.now();
    await lintRunner({ tokens, sources, config, logger });
    logger.debug({
      message: 'Lint finished',
      group: 'plugin',
      label: 'lint',
      timing: performance.now() - lintStart,
    });
  }

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
    tokens,
    sources,
    resolver,
  };
}
