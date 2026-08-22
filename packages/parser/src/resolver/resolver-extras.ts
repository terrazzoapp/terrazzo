import type { TokenNormalizedSet } from '@terrazzo/token-types';

import { getPermutationID } from '../lib/resolver-utils.js';
import type { Resolver, ResolverBase } from '../types.js';

function resolveAllPermutations(
  resolver: ResolverBase,
  options?: { modifiers?: string[]; resolveAliases?: boolean },
) {
  const { modifiers, resolveAliases } = options || {};
  const possiblePermutations = resolver.listPermutations?.() || [];

  const resolvedTokens = possiblePermutations.map((input) => ({
    input,
    tokens: resolver.apply(input, {
      modifiers,
      resolveAliases,
    }),
  }));

  return resolvedTokens;
}

export function addResolverExtras(resolver: ResolverBase): Resolver {
  const resolverExtrasCache: Record<string, TokenNormalizedSet> = {};

  return {
    ...resolver,
    extras: {
      intersection(options) {
        const permutationID = `intersection_${getPermutationID(resolver.inputDefault, options)}`;

        if (resolverExtrasCache[permutationID]) {
          return resolverExtrasCache[permutationID];
        }

        const [first, ...rest] = resolveAllPermutations(resolver, options);

        if (!first?.tokens) {
          return {};
        }

        const commonTokens = Object.entries(first.tokens).reduce((acc, [id, token]) => {
          if (
            (options?.tokenOrigin === 'alias' && !token.aliasOf) ||
            (options?.tokenOrigin === 'primitive' && token.aliasOf)
          ) {
            return acc;
          }

          const isCommon = rest.every(({ tokens }) => {
            const otherToken = tokens[id];
            return otherToken && JSON.stringify(otherToken.$value) === JSON.stringify(token.$value);
          });

          if (isCommon) {
            acc[id] = token;
          }
          return acc;
        }, {} as TokenNormalizedSet);

        resolverExtrasCache[permutationID] = commonTokens;

        return commonTokens;
      },
      symmetricDifference(options) {
        const permutationID = `symmetricDifference_${getPermutationID(resolver.inputDefault, options)}`;

        if (resolverExtrasCache[permutationID]) {
          return resolverExtrasCache[permutationID];
        }

        const [first, ...rest] = resolveAllPermutations(resolver, options);

        if (!first?.tokens) {
          return {};
        }

        const uniqueTokens = Object.entries(first.tokens).reduce((acc, [id, token]) => {
          if (
            (options?.tokenOrigin === 'alias' && !token.aliasOf) ||
            (options?.tokenOrigin === 'primitive' && token.aliasOf)
          ) {
            return acc;
          }

          const isUnique = rest.some(({ tokens }) => {
            const otherToken = tokens[id];
            return otherToken && JSON.stringify(otherToken.$value) !== JSON.stringify(token.$value);
          });

          if (isUnique) {
            acc[id] = token;
          }
          return acc;
        }, {} as TokenNormalizedSet);

        resolverExtrasCache[permutationID] = uniqueTokens;

        return uniqueTokens;
      },
    },
  };
}
