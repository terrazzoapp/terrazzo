import type { TokenNormalized, TransformHookOptions } from '@terrazzo/parser';
import { makeCSSVar, type TransformCSSValueOptions, transformCSSValue } from '@terrazzo/token-tools/css';
import { type CSSPluginOptions, cachedMatcher, FORMAT_ID, PLUGIN_NAME } from './lib.js';

export interface TransformOptions {
  transform: TransformHookOptions;
  options: CSSPluginOptions;
}

export default function transformCSS({
  transform: {
    context: { logger },
    resolver,
    setTransform,
    tokens: baseTokens,
  },
  options: {
    permutations,
    include: userInclude,
    exclude: userExclude,
    legacyHex,
    transform: customTransform,
    variableName,
  },
}: TransformOptions) {
  function transformName(token: TokenNormalized) {
    const customName = variableName?.(token);
    if (customName !== undefined) {
      if (typeof customName !== 'string') {
        logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message: `variableName() must return a string; received ${customName}`,
        });
      }
      return customName;
    }
    return makeCSSVar(token.id);
  }
  const transformAlias = (token: TokenNormalized) => `var(${transformName(token)})`;

  const include = userInclude ? cachedMatcher.tokenIDMatch(userInclude) : () => true;
  const exclude = userExclude ? cachedMatcher.tokenIDMatch(userExclude) : () => false;

  // permutations
  if (Array.isArray(permutations)) {
    // For backwards-compat, if this resolver allows a “default” input,
    // also duplicate the token in the global space. This plays nicer with
    // plugins that haven’t upgraded to resolvers yet.
    // If there is no “default” permutation, then take the first one
    let defaultPermutationI = permutations.findIndex((p) => !Object.keys(p).length);
    if (defaultPermutationI === -1) {
      defaultPermutationI = 0;
    }

    for (let i = 0; i < permutations.length; i++) {
      const p = permutations[i]!;
      const input = p.input;
      const pInclude = p.include ? cachedMatcher.tokenIDMatch(p.include) : () => true;
      const pExclude = p.exclude ? cachedMatcher.tokenIDMatch(p.exclude) : () => false;

      const includeToken = (tokenId: string): boolean => {
        return include(tokenId) && pInclude(tokenId) && !exclude(tokenId) && !pExclude(tokenId);
      };
      // Note: if we throw an error here without specifying the input, a user may
      // find it impossible to debug the issue
      try {
        const tokens = resolver.apply(input);
        for (const token of Object.values(tokens)) {
          if (!includeToken(token.id)) {
            continue;
          }
          const options: TransformCSSValueOptions = {
            tokensSet: tokens,
            transformAlias,
            color: { legacyHex },
            permutation: input,
          };
          const value =
            p.transform?.(token, options) ?? customTransform?.(token, options) ?? transformCSSValue(token, options);
          if (value) {
            const localID = transformName(token);
            setTransform(token.id, {
              format: FORMAT_ID,
              value,
              localID,
              input,
              // TODO: plugin-css shouldn’t set metadata for plugin-token-listing; move this there
              meta: { 'token-listing': { name: localID } },
            });

            // If this is the default permutation, also duplicate to the default mode.
            // Be sure to only do this for ONE permutation! Otherwise output would break.
            if (defaultPermutationI === i) {
              setTransform(token.id, {
                format: FORMAT_ID,
                value,
                localID,
                mode: '.',
                // TODO: plugin-css shouldn’t set metadata for plugin-token-listing; move this there
                meta: { 'token-listing': { name: localID } },
              });
            }
          }
        }
      } catch (err) {
        logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message: `There was an error trying to apply input ${resolver.getPermutationID(input)}.`,
          continueOnError: true, // throw below
        });
        throw err; // note: this is most likely a nicely-formatted message from another logger instance; just pass it through
      }
    }

    return;
  }

  // modes (legacy)
  for (const token of Object.values(baseTokens)) {
    if (!include(token.id) || exclude(token.id)) {
      continue;
    }
    for (const mode of Object.keys(token.mode)) {
      const tokenArgs: TokenNormalized = { ...token, ...(token.mode[mode] as any) };
      const options: TransformCSSValueOptions = {
        tokensSet: baseTokens,
        transformAlias,
        color: { legacyHex },
        permutation: { tzMode: '.' },
      };
      const value = customTransform?.(tokenArgs, options) ?? transformCSSValue(tokenArgs, options);
      if (value) {
        const localID = transformName(token);
        setTransform(token.id, {
          format: FORMAT_ID,
          localID,
          value,
          mode,
          // TODO: plugin-css shouldn’t set metadata for plugin-token-listing; move this there
          meta: { 'token-listing': { name: localID } },
        });
      }
    }
  }
}
