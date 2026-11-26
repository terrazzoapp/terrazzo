import type { TokenNormalized, TransformHookOptions } from '@terrazzo/parser';
import {
  makeCSSVar,
  type SubValueAliasContext,
  transformCSSValue,
  type TransformCSSValueOptions,
} from '@terrazzo/token-tools/css';

import {
  cachedMatcher,
  createSubValueIdFormatter,
  type CSSPluginOptions,
  ensureCSSVarPrefix,
  FORMAT_ID,
  PLUGIN_NAME,
} from './lib.js';

const LEGACY_PERMUTATION_ID = JSON.stringify({ tzMode: '*' });

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
    subValueVariableName,
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
        return customName;
      }
      return ensureCSSVarPrefix(customName);
    }
    return makeCSSVar(token.id);
  }

  const formatSubValueId = createSubValueIdFormatter({ subValueVariableName, logger });

  function createTransformAlias(mode: string, permutationID: string) {
    const input: Record<string, string> = JSON.parse(permutationID);
    return (token: TokenNormalized, subValue?: SubValueAliasContext) => {
      if (subValue) {
        const parentVarName = transformName(subValue.parentToken);
        // The aliased parent token may not have been transformed yet, so `value` is empty here.
        const subVarName = formatSubValueId(parentVarName, subValue.subValueName, {
          id: subValue.parentToken.id,
          localID: parentVarName,
          mode,
          input,
          permutationID,
          token: subValue.parentToken,
          type: 'MULTI_VALUE',
          value: {},
        });
        return `var(${subVarName})`;
      }
      return `var(${transformName(token)})`;
    };
  }

  const include = userInclude ? cachedMatcher.tokenIDMatch(userInclude) : () => true;
  const exclude = userExclude ? cachedMatcher.tokenIDMatch(userExclude) : () => false;

  // permutations
  if (Array.isArray(permutations)) {
    // For backwards-compat, if this resolver allows a “default” input,
    // also duplicate the token in the global space. This plays nicer with
    // plugins that haven’t upgraded to resolvers yet.
    // If there is no “default” permutation, then take the first one
    let defaultPermutationI = permutations.findIndex(
      (p) => Object.keys(p.input ?? {}).length === 0,
    );
    if (defaultPermutationI === -1) {
      defaultPermutationI = 0;
    }

    for (let i = 0; i < permutations.length; i++) {
      const p = permutations[i]!;
      const inputRaw = p.input;
      const input =
        Object.keys(inputRaw ?? {}).length === 0
          ? (JSON.parse(resolver.getPermutationID(inputRaw ?? {})) as Record<string, string>)
          : inputRaw;

      const pInclude = p.include ? cachedMatcher.tokenIDMatch(p.include) : () => true;
      const pExclude = p.exclude ? cachedMatcher.tokenIDMatch(p.exclude) : () => false;

      // warn if trying to omit modifiers on a non-orthogonal resolver
      if (
        Array.isArray(p.only?.modifiers) &&
        p.only.modifiers?.length > 0 && // specifying [] (no modifiers) is not subject to orthogonality
        !resolver.orthogonal
      ) {
        logger.warn({
          group: 'plugin',
          label: PLUGIN_NAME,
          message:
            'Specifying `only.modifiers` on a non-orthogonal resolver may generate incorrect output. See docs.',
        });
      }

      // oxlint-disable-next-line func-style
      const includeToken = (tokenId: string): boolean =>
        include(tokenId) && pInclude(tokenId) && !exclude(tokenId) && !pExclude(tokenId);
      // Note: if we throw an error here without specifying the input, a user may
      // find it impossible to debug the issue
      try {
        const transformAlias = createTransformAlias('.', resolver.getPermutationID(input));
        const tokens = resolver.apply(input, p.only);
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
            p.transform?.(token, options) ??
            customTransform?.(token, options) ??
            transformCSSValue(token, options);
          if (value) {
            const localID = transformName(token);
            setTransform(token.id, {
              format: FORMAT_ID,
              value,
              localID,
              input,
              // Store description in metadata for plugin-css to access later
              meta: {
                'plugin-css': { description: token.$description },
                'token-listing': { name: localID },
              },
            });

            // If this is the default permutation, also duplicate to the default mode.
            // Be sure to only do this for ONE permutation! Otherwise output would break.
            if (defaultPermutationI === i) {
              setTransform(token.id, {
                format: FORMAT_ID,
                value,
                localID,
                mode: '.',
                // Store description in metadata for plugin-css to access later
                meta: {
                  'plugin-css': { description: token.$description },
                  'token-listing': { name: localID },
                },
              });
            }
          }
        }
      } catch (error) {
        logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message: `There was an error trying to apply input ${resolver.getPermutationID(input)}.`,
          continueOnError: true, // throw below
        });
        throw error; // note: this is most likely a nicely-formatted message from another logger instance; just pass it through
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
      const transformAlias = createTransformAlias(mode, LEGACY_PERMUTATION_ID);
      const options: TransformCSSValueOptions = {
        tokensSet: baseTokens,
        transformAlias,
        color: { legacyHex },
        permutation: { tzMode: '*' },
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
          meta: {
            'plugin-css': {
              description: token.$description,
            },
            'token-listing': { name: localID },
          },
        });
      }
    }
  }
}
