import { toMomoa } from '../lib/momoa.js';
import { destructiveMerge, getPermutationID } from '../lib/resolver-utils.js';
import { processTokens } from '../parse/process.js';
import type {
  CreateResolverOptions,
  Resolver,
  ResolverApplicationOptions,
  ResolverBase,
  ResolverInput,
  ResolverSourceNormalized,
  ResolveTokensOptions,
  TokenNormalizedSet,
} from '../types.js';
import { calculatePermutations } from './load.js';
import { addResolverExtras } from './resolver-extras.js';

function resolveTokens({
  input,
  resolutionOrder,
  logger,
  options,
}: ResolveTokensOptions): TokenNormalizedSet {
  const tokensRaw: TokenNormalizedSet = {};

  for (const item of resolutionOrder) {
    switch (item.type) {
      case 'set': {
        if (Array.isArray(options?.sets) && !options.sets.includes(item.name)) {
          continue;
        }
        for (const source of item.sources) {
          destructiveMerge(tokensRaw, source);
        }
        break;
      }
      case 'modifier': {
        if (Array.isArray(options?.modifiers) && !options.modifiers.includes(item.name)) {
          continue;
        }
        const context = input[item.name];

        if (!context) {
          continue;
        }

        const resolverSources = item.contexts[context];
        if (!resolverSources) {
          logger.error({
            group: 'resolver',
            message: `Modifier ${item.name} has no context ${JSON.stringify(context)}.`,
          });
        }
        for (const source of resolverSources ?? []) {
          destructiveMerge(tokensRaw, source);
        }
        break;
      }
    }
  }

  return tokensRaw;
}

/** Create an interface to resolve permutations */
export function createResolver(
  resolverSource: ResolverSourceNormalized,
  { config, logger, sources, orthogonal }: CreateResolverOptions,
): Resolver {
  const inputDefault: ResolverInput = {};
  const validContexts: Record<string, string[]> = {};
  const allPermutations: ResolverInput[] = [];
  const resolverCache: Record<string, TokenNormalizedSet> = {};

  // Important: by iterating over resolutionOrder, we
  // filter out unused modifiers/irrelevant contexts.
  for (const source of resolverSource.resolutionOrder) {
    if (source.type === 'modifier') {
      if (typeof source.default === 'string') {
        inputDefault[source.name] = source.default;
      }
      validContexts[source.name] = Object.keys(source.contexts);
    }
  }

  const permutationCount = Object.values(validContexts).reduce(
    (acc, context) => acc * context.length,
    1,
  );

  function getProcessedTokens(tokensRaw: TokenNormalizedSet, options?: ResolverApplicationOptions) {
    if (!resolverSource._source.filename) {
      return;
    }

    const src = JSON.stringify(tokensRaw, null, 2);
    const rootSource = {
      filename: resolverSource._source.filename,
      document: toMomoa(src),
      src,
    };

    const tokens = processTokens(rootSource, {
      config,
      logger,
      sourceByFilename: { [resolverSource._source.filename.href]: rootSource },
      isResolver: true,
      resolveAliases: options?.resolveAliases ?? true,
      sources,
    });

    return tokens;
  }

  const resolver: ResolverBase = {
    orthogonal,
    source: resolverSource,
    inputDefault,
    listPermutations:
      permutationCount <= config.permutationLimit
        ? () => {
            // only do work on first call, then cache subsequent work. this could be thousands of possible values!
            if (allPermutations.length === 0) {
              allPermutations.push(...calculatePermutations(Object.entries(validContexts)));
            }
            return allPermutations;
          }
        : undefined,
    apply(inputRaw, options) {
      const input = { ...inputDefault, ...inputRaw };
      const permutationID = getPermutationID(input, options);

      if (resolverCache[permutationID]) {
        return resolverCache[permutationID];
      }

      if (!resolverSource._source.filename) {
        logger.error({
          group: 'resolver',
          message: 'Resolver source has no filename property.',
        });

        return {};
      }

      const tokensRaw = resolveTokens({
        input,
        resolutionOrder: resolverSource.resolutionOrder,
        logger,
        options,
      });

      const tokens = getProcessedTokens(tokensRaw, options) || {};

      resolverCache[permutationID] = tokens;

      return tokens;
    },
    isValidInput(input, throwError = false) {
      if (!input || typeof input !== 'object') {
        logger.error({ group: 'resolver', message: `Invalid input: ${JSON.stringify(input)}.` });
      }
      for (const modifier of Object.keys(input)) {
        if (!(modifier in validContexts)) {
          if (throwError) {
            logger.error({
              group: 'resolver',
              message: `No such modifier ${JSON.stringify(modifier)}`,
            });
          }
          return false; // 1. invalid if unknown modifier name
        }
      }
      for (const [name, contexts] of Object.entries(validContexts)) {
        // Note: empty strings are valid! Don’t check for truthiness.
        if (typeof input[name] === 'string') {
          if (name === 'tzMode') {
            continue; // reserved modifier
          }
          if (!contexts.includes(input[name])) {
            if (throwError) {
              logger.error({
                group: 'resolver',
                message: `Modifier "${name}" has no context ${JSON.stringify(input[name])}.`,
              });
            }
            return false; // 2. invalid if unknown context
          }
        } else if (!(name in inputDefault)) {
          if (throwError) {
            logger.error({
              group: 'resolver',
              message: `Modifier "${name}" missing value (no default set).`,
            });
          }
          return false; // 3. invalid if omitted, and no default
        }
      }
      return true;
    },
    getPermutationID(input) {
      this.isValidInput(input, true);
      return getPermutationID({ ...inputDefault, ...input });
    },
  };

  return addResolverExtras(resolver);
}
