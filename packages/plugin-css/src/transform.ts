import type { TokenNormalized, TokenTransformed, TransformHookOptions } from '@terrazzo/parser';
import { getTokenMatcher } from '@terrazzo/token-tools';
import { makeCSSVar, type TransformCSSValueOptions, transformCSSValue } from '@terrazzo/token-tools/css';
import { type CSSPluginOptions, FORMAT_ID, PLUGIN_NAME } from './lib.js';

export interface TransformOptions {
  transform: TransformHookOptions;
  options: CSSPluginOptions;
}

export default function transformCSS({
  transform: {
    context: { logger },
    resolver,
    getTransforms,
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

  const include = userInclude ? getTokenMatcher(userInclude) : () => true;
  const exclude = userExclude ? getTokenMatcher(userExclude) : () => false;

  // permutations
  if (permutations?.length) {
    for (const p of permutations) {
      const input = p.input;
      const pInclude = p.include ? getTokenMatcher(p.include) : () => true;
      const pExclude = p.exclude ? getTokenMatcher(p.exclude) : () => false;

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
          const value = customTransform?.(token, options) ?? transformCSSValue(token, options);
          // Don’t duplicate values when unnecessary
          if (value && isDifferentValue(value, getTransforms({ format: FORMAT_ID, id: token.id })[0]?.value)) {
            const localID = transformName(token);
            setTransform(token.id, {
              format: FORMAT_ID,
              value,
              localID,
              input,
              meta: { 'token-listing': { name: localID } },
            });
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
          meta: { 'token-listing': { name: localID } },
        });
      }
    }
  }
}

/** Is the transformed value different from the base value? */
function isDifferentValue(
  value: TokenTransformed['value'] | undefined,
  baseValue: TokenTransformed['value'] | undefined,
): boolean {
  if (!value || !baseValue || typeof value !== typeof baseValue) {
    return true;
  }
  if (typeof value === 'string' && typeof baseValue === 'string') {
    return value !== baseValue;
  }
  const keysA = Object.keys(value);
  const keysB = Object.keys(baseValue);
  if (keysA.length !== keysB.length) {
    return true;
  }
  if (
    !keysA.every(
      (k) => keysB.includes(k) && (value as Record<string, string>)[k] === (baseValue as Record<string, string>)[k],
    )
  ) {
    return true;
  }
  return false;
}
