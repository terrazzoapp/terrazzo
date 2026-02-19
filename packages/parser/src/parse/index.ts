import type fsType from 'node:fs/promises';
import type { InputSource, InputSourceWithDocument } from '@terrazzo/json-schema-tools';
import { pluralize, type TokenNormalizedSet } from '@terrazzo/token-tools';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import { createSyntheticResolver } from '../resolver/create-synthetic-resolver.js';
import { loadResolver } from '../resolver/load.js';
import type { ConfigInit, ParseOptions, Resolver } from '../types.js';
import { loadSources } from './load.js';

export interface ParseResult {
  tokens: TokenNormalizedSet;
  sources: InputSourceWithDocument[];
  resolver: Resolver;
}

/** Parse */
export default async function parse(
  _input: InputSource | InputSource[],
  {
    logger = new Logger(),
    req = defaultReq,
    skipLint = false,
    config = {} as ConfigInit,
    continueOnError = false,
    yamlToMomoa,
    transform,
  }: ParseOptions = {} as ParseOptions,
): Promise<ParseResult> {
  const inputs = Array.isArray(_input) ? _input : [_input];
  let tokens: TokenNormalizedSet = {};
  let resolver: Resolver | undefined;
  let sources: InputSourceWithDocument[] = [];

  // 0. validate
  if (inputs.length === 0) {
    logger.error({ group: 'parser', label: 'init', message: 'Nothing to parse.' });
  }
  for (let i = 0; i < inputs.length; i++) {
    if (
      !inputs[i] ||
      typeof inputs[i] !== 'object' ||
      !inputs[i]?.src ||
      (inputs[i]?.filename && !(inputs[i]!.filename instanceof URL))
    ) {
      logger.error({ group: 'parser', label: 'init', message: `Input ${i}: expected { src: any; filename: URL }` });
    }
  }

  const totalStart = performance.now();

  // 1. Load tokens
  const initStart = performance.now();
  const resolverResult = await loadResolver(inputs, { config, logger, req, yamlToMomoa });
  // 1a. Resolver
  if (resolverResult.resolver) {
    tokens = resolverResult.tokens;
    sources = resolverResult.sources;
    resolver = resolverResult.resolver;
  } else {
    // 1b. No resolver
    const tokenResult = await loadSources(inputs, {
      req,
      logger,
      config,
      continueOnError,
      yamlToMomoa,
      transform,
    });
    tokens = tokenResult.tokens;
    sources = tokenResult.sources;
  }
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

  const resolverTiming = performance.now();
  const finalResolver = resolver || (await createSyntheticResolver(tokens, { config, logger, req, sources }));
  logger.debug({
    message: 'Resolver finalized',
    group: 'parser',
    label: 'core',
    timing: performance.now() - resolverTiming,
  });

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
    resolver: finalResolver,
  };
}

let fs: typeof fsType | undefined;

/** Fallback req */
async function defaultReq(src: URL, _origin: URL) {
  if (src.protocol === 'file:') {
    if (!fs) {
      fs = await import('node:fs/promises');
    }
    return await fs.readFile(src, 'utf8');
  }
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`${src} responded with ${res.status}\n${await res.text()}`);
  }
  return await res.text();
}
