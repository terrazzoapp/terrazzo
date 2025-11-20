import type { DocumentNode } from '@humanwhocodes/momoa';
import { maybeRawJSON } from '@terrazzo/json-schema-tools';
import type { TokenNormalizedSet } from '@terrazzo/token-tools';
import eq from 'fast-deep-equal';
import { merge } from 'merge-anything';
import type yamlToMomoa from 'yaml-to-momoa';
import { toMomoa } from '../lib/momoa.js';
import type Logger from '../logger.js';
import type { InputSource, Resolver, ResolverSourceNormalized } from '../types.js';
import { normalizeResolver } from './normalize.js';
import { isLikelyResolver, validateResolver } from './validate.js';

export interface LoadResolverOptions {
  logger: Logger;
  req: (url: URL, origin: URL) => Promise<string>;
  yamlToMomoa?: typeof yamlToMomoa;
}

/** Quick-parse input sources and find a resolver */
export async function loadResolver(
  inputs: Omit<InputSource, 'document'>[],
  { logger, req, yamlToMomoa }: LoadResolverOptions,
): Promise<Resolver | undefined> {
  let resolverDoc: DocumentNode | undefined;
  const entry = {
    group: 'parser',
    label: 'init',
  } as const;

  for (const input of inputs) {
    let document: DocumentNode | undefined;
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

  if (resolverDoc) {
    validateResolver(resolverDoc, { logger, src: inputs[0]!.src });
    const normalized = await normalizeResolver(resolverDoc, {
      filename: inputs[0]!.filename!,
      logger,
      req,
      src: inputs[0]!.src,
      yamlToMomoa,
    });
    return createResolver(normalized, { logger });
  }
}

export interface CreateResolverOptions {
  logger: Logger;
}

/** Create an interface to resolve permutations */
export function createResolver(resolverSource: ResolverSourceNormalized, { logger }: CreateResolverOptions): Resolver {
  const inputDefaults: Record<string, string> = {};
  const modifierPermutations: [string, string[]][] = []; // figure out modifiers
  for (const [name, m] of Object.entries(resolverSource.modifiers ?? {})) {
    if (typeof m.default === 'string') {
      inputDefaults[name] = m.default;
    }
    modifierPermutations.push([name, Object.keys(m.contexts)]);
  }
  for (const m of resolverSource.resolutionOrder) {
    if (!('type' in m) || m.type !== 'modifier') {
      continue;
    }
    if (typeof m.default === 'string') {
      inputDefaults[m.name] = m.default;
    }
    modifierPermutations.push([m.name, Object.keys(m.contexts)]);
  }

  const permutations = calculatePermutations(modifierPermutations);

  return {
    apply(inputRaw): TokenNormalizedSet {
      let tokens: TokenNormalizedSet = {};
      const input = { ...inputDefaults, ...inputRaw };
      for (const item of resolverSource.resolutionOrder) {
        switch (item.type) {
          case 'set': {
            for (const s of item.sources) {
              tokens = merge(tokens, s) as TokenNormalizedSet;
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
              tokens = merge(tokens, s) as TokenNormalizedSet;
            }
            break;
          }
        }
      }
      return tokens;
    },
    source: resolverSource,
    permutations,
    isValidInput(inputRaw: Record<string, string>) {
      if (!inputRaw || typeof inputRaw !== 'object') {
        logger.error({ group: 'parser', label: 'resolver', message: `Invalid input: ${JSON.stringify(inputRaw)}.` });
      }
      const input = { ...inputDefaults, ...inputRaw };
      return permutations.findIndex((p) => eq(input, p)) !== -1;
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
