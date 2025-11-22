import type * as momoa from '@humanwhocodes/momoa';
import { type InputSource, type InputSourceWithDocument, maybeRawJSON } from '@terrazzo/json-schema-tools';
import type { TokenNormalizedSet } from '@terrazzo/token-tools';
import { merge } from 'merge-anything';
import type yamlToMomoa from 'yaml-to-momoa';
import { toMomoa } from '../lib/momoa.js';
import { makeInputKey } from '../lib/resolver-utils.js';
import type Logger from '../logger.js';
import { processTokens } from '../parse/process.js';
import type { ConfigInit, Resolver, ResolverSourceNormalized } from '../types.js';
import { normalizeResolver } from './normalize.js';
import { isLikelyResolver, validateResolver } from './validate.js';

export interface LoadResolverOptions {
  config: ConfigInit;
  logger: Logger;
  req: (url: URL, origin: URL) => Promise<string>;
  yamlToMomoa?: typeof yamlToMomoa;
}

/** Quick-parse input sources and find a resolver */
export async function loadResolver(
  inputs: InputSource[],
  { config, logger, req, yamlToMomoa }: LoadResolverOptions,
): Promise<{ resolver: Resolver | undefined; tokens: TokenNormalizedSet; sources: InputSourceWithDocument[] }> {
  let resolverDoc: momoa.DocumentNode | undefined;
  let tokens: TokenNormalizedSet = {};
  const entry = {
    group: 'parser',
    label: 'init',
  } as const;

  for (const input of inputs) {
    let document: momoa.DocumentNode | undefined;
    if (typeof input.src === 'string') {
      if (maybeRawJSON(input.src)) {
        document = toMomoa(input.src);
      } else if (yamlToMomoa) {
        document = yamlToMomoa(input.src);
      } else {
        logger.error({
          ...entry,
          message: `Install yaml-to-momoa package to parse YAML, and pass in as option, e.g.:

  import { bundle } from '@terrazzo/json-schema-tools';
  import yamlToMomoa from 'yaml-to-momoa';

  bundle(yamlString, { yamlToMomoa });`,
        });
      }
    } else if (input.src && typeof input.src === 'object') {
      document = toMomoa(JSON.stringify(input.src, undefined, 2));
    } else {
      logger.error({ ...entry, message: `Could not parse ${input.filename}. Is this valid JSON or YAML?` });
    }
    if (!document || !isLikelyResolver(document)) {
      continue;
    }
    if (inputs.length > 1) {
      logger.error({ ...entry, message: `Resolver must be the only input, found ${inputs.length} sources.` });
    }
    resolverDoc = document;
    break;
  }

  let resolver: Resolver | undefined;
  if (resolverDoc) {
    validateResolver(resolverDoc, { logger, src: inputs[0]!.src });
    const normalized = await normalizeResolver(resolverDoc, {
      filename: inputs[0]!.filename!,
      logger,
      req,
      src: inputs[0]!.src,
      yamlToMomoa,
    });
    resolver = createResolver(normalized, { config, logger, sources: [{ ...inputs[0]!, document: resolverDoc }] });

    // If a resolver is present, load a single permutation to get a base token set.
    const firstInput: Record<string, string> = {};
    for (const m of resolver.source.resolutionOrder) {
      if (m.type !== 'modifier') {
        continue;
      }
      firstInput[m.name] = typeof m.default === 'string' ? m.default : Object.keys(m.contexts)[0]!;
    }
    tokens = resolver.apply(firstInput);
  }

  return {
    resolver,
    tokens,
    sources: [{ ...inputs[0]!, document: resolverDoc! }],
  };
}

export interface CreateResolverOptions {
  config: ConfigInit;
  logger: Logger;
  sources: InputSourceWithDocument[];
}

/** Create an interface to resolve permutations */
export function createResolver(
  resolverSource: ResolverSourceNormalized,
  { config, logger, sources }: CreateResolverOptions,
): Resolver {
  const inputDefaults: Record<string, string> = {};
  const validContexts: Record<string, string[]> = {};
  const allPermutations: Record<string, string>[] = [];

  const resolverCache: Record<string, any> = {};

  for (const m of resolverSource.resolutionOrder) {
    if (m.type === 'modifier') {
      if (typeof m.default === 'string') {
        inputDefaults[m.name] = m.default!;
      }
      validContexts[m.name] = Object.keys(m.contexts);
    }
  }

  return {
    apply(inputRaw): TokenNormalizedSet {
      let tokensRaw: TokenNormalizedSet = {};
      const input = { ...inputDefaults, ...inputRaw };
      const inputKey = makeInputKey(input);

      if (resolverCache[inputKey]) {
        return resolverCache[inputKey];
      }

      for (const item of resolverSource.resolutionOrder) {
        switch (item.type) {
          case 'set': {
            for (const s of item.sources) {
              tokensRaw = merge(tokensRaw, s) as TokenNormalizedSet;
            }
            break;
          }
          case 'modifier': {
            const context = input[item.name]!;
            const sources = item.contexts[context];
            if (!sources) {
              logger.error({
                group: 'parser',
                label: 'resolver',
                message: `Modifier ${item.name} has no context ${JSON.stringify(context)}.`,
              });
            }
            for (const s of sources ?? []) {
              tokensRaw = merge(tokensRaw, s) as TokenNormalizedSet;
            }
            break;
          }
        }
      }

      const src = JSON.stringify(tokensRaw, undefined, 2);
      const rootSource = { filename: resolverSource._source.filename!, document: toMomoa(src), src };
      const tokens = processTokens(rootSource, {
        config,
        logger,
        sourceByFilename: {},
        refMap: {},
        sources,
      });
      resolverCache[inputKey] = tokens;
      return tokens;
    },
    source: resolverSource,
    listPermutations() {
      // only do work on first call, then cache subsequent work. this could be thousands of possible values!
      if (!allPermutations.length) {
        allPermutations.push(...calculatePermutations(Object.entries(validContexts)));
      }
      return allPermutations;
    },
    isValidInput(input: Record<string, string>) {
      if (!input || typeof input !== 'object') {
        logger.error({ group: 'parser', label: 'resolver', message: `Invalid input: ${JSON.stringify(input)}.` });
      }
      if (!Object.keys(input).every((k) => k in validContexts)) {
        return false; // 1. invalid if unknown modifier name
      }
      for (const [name, contexts] of Object.entries(validContexts)) {
        // Note: empty strings are valid! Don’t check for truthiness.
        if (name in input) {
          if (!contexts.includes(input[name]!)) {
            return false; // 2. invalid if unknown context
          }
        } else if (!(name in inputDefaults)) {
          return false; // 3. invalid if omitted, and no default
        }
      }
      return true;
    },
  };
}

/** Calculate all permutations */
export function calculatePermutations(options: [string, string[]][]) {
  const permutationCount = [1];
  for (const [_name, contexts] of options) {
    permutationCount.push(contexts.length * (permutationCount.at(-1) || 1));
  }
  const permutations: Record<string, string>[] = [];
  for (let i = 0; i < permutationCount.at(-1)!; i++) {
    const input: Record<string, string> = {};
    for (let j = 0; j < options.length; j++) {
      const [name, contexts] = options[j]!;
      input[name] = contexts[Math.floor(i / permutationCount[j]!) % contexts.length]!;
    }
    permutations.push(input);
  }
  return permutations.length ? permutations : [{}];
}
