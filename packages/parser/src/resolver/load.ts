import type * as momoa from '@humanwhocodes/momoa';
import {
  type InputSource,
  type InputSourceWithDocument,
  maybeRawJSON,
} from '@terrazzo/json-schema-tools';
import type { TokenNormalizedSet } from '@terrazzo/token-tools';

import { toMomoa } from '../lib/momoa.js';
import type Logger from '../logger.js';
import type {
  LoadResolverOptions,
  Resolver,
  ResolverInput,
  ResolverSourceNormalized,
} from '../types.js';
import { createResolver } from './create-resolver.js';
import { normalizeResolver } from './normalize.js';
import { isLikelyResolver, validateResolver } from './validate.js';

/** Quick-parse input sources and find a resolver */
export async function loadResolver(
  inputs: InputSource[],
  { config, logger, req, yamlToMomoa }: LoadResolverOptions,
): Promise<{
  resolver: Resolver | undefined;
  tokens: TokenNormalizedSet;
  sources: InputSourceWithDocument[];
}> {
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
      logger.error({
        ...entry,
        message: `Could not parse ${input.filename}. Is this valid JSON or YAML?`,
      });
    }
    if (!document || !isLikelyResolver(document)) {
      continue;
    }
    if (inputs.length > 1) {
      logger.error({
        ...entry,
        message: `Resolver must be the only input, found ${inputs.length} sources.`,
      });
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

    resolver = createResolver(normalized, {
      config,
      logger,
      sources: [{ ...inputs[0]!, document: resolverDoc }],
      orthogonal: false, // we’ll override this in the next step
    });

    // Load initial tokens
    const firstInput: ResolverInput = {};
    for (const m of resolver.source.resolutionOrder) {
      if (m.type !== 'modifier') {
        continue;
      }
      firstInput[m.name] = typeof m.default === 'string' ? m.default : Object.keys(m.contexts)[0]!;
    }
    tokens = resolver.apply(firstInput);

    // Determine orthogonality
    resolver.orthogonal = isResolverOrthogonal(normalized, logger);
  }

  return {
    resolver,
    tokens,
    sources: [{ ...inputs[0]!, document: resolverDoc! }],
  };
}

/** Determine Resolver orthogonality using as little work as possible */
function isResolverOrthogonal(resolver: ResolverSourceNormalized, logger: Logger): boolean {
  // Keep a record of which tokens are in which modifier.
  // Note that modifiers are allowed to have multiple appearances of the same
  // token! So don’t simply return `false` on the reappearance of the same
  // token, only return `false` for a token that appeared in another modifier.
  const tokensByModifier: Record<string, string> = {};

  // Note: this is a muuuuch lighter-weight walking utility than we need
  // anywhere else. We want this to be as fast as possible, and do as little
  // work as possible, and also have the unique property of stopping the walk
  // under certain conditions.
  function discoverTokens(
    node: any,
    onVisit: (id: string) => boolean | undefined,
    path: string[] = [],
  ): boolean {
    if (!node || typeof node !== 'object') {
      return true;
    }
    const keys = Object.keys(node);
    for (const key of keys) {
      if (key === '$extends') {
        logger.warn({
          group: 'parser',
          label: 'init',
          message: `Can’t determine orthogonality with $extends.`,
        });
      }
      // "$value" marks a token
      else if (key === '$value') {
        const shouldContinue = onVisit(path.join('.'));
        if (shouldContinue === false) {
          return false;
        }
      } else {
        const shouldContinue = discoverTokens(node[key], onVisit, [...path, key]);
        if (shouldContinue === false) {
          return false;
        }
      }
    }
    return true;
  }

  for (const modifier of resolver.resolutionOrder) {
    if (modifier.type !== 'modifier') {
      continue;
    }
    for (const sources of Object.values(modifier.contexts)) {
      for (const source of sources) {
        const didComplete = discoverTokens(source, (id) => {
          if (!tokensByModifier[id]) {
            tokensByModifier[id] = modifier.name;
            return true;
          }
          return tokensByModifier[id] === modifier.name;
        });
        if (!didComplete) {
          return false;
        }
      }
    }
  }

  return true;
}

/** Calculate all permutations */
export function calculatePermutations(options: [string, string[]][]) {
  const permutationCount = [1];
  for (const [_name, contexts] of options) {
    permutationCount.push(contexts.length * (permutationCount.at(-1) || 1));
  }
  const permutations: Record<string, string>[] = [];
  for (let i = 0; i < permutationCount.at(-1)!; i++) {
    const input: ResolverInput = {};
    for (let j = 0; j < options.length; j++) {
      const [name, contexts] = options[j]!;
      input[name] = contexts[Math.floor(i / permutationCount[j]!) % contexts.length]!;
    }
    permutations.push(input);
  }
  return permutations.length > 0 ? permutations : [{}];
}
