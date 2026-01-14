import type { TokenNormalized, TokenTransformed, TransformHookOptions } from '@terrazzo/parser';
import { makeCSSVar, transformCSSValue } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import { type CSSPluginOptions, FORMAT_ID } from './lib.js';

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
    tokens: initialSet,
  },
  options: {
    baseContext,
    contextSelectors,
    exclude: userExclude,
    legacyHex,
    modeSelectors,
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
          label: '@terrazzo/plugin-css',
          message: `variableName() must return a string; received ${customName}`,
        });
      }
      return customName;
    }
    return makeCSSVar(token.id);
  }
  const transformAlias = (token: TokenNormalized) => `var(${transformName(token)})`;

  const exclude = userExclude ? wcmatch(userExclude) : undefined;

  // base set
  const baseTokens = baseContext ? resolver.apply(baseContext) : initialSet;
  for (const token of Object.values(baseTokens)) {
    if (exclude?.(token.id)) {
      continue;
    }
    const value =
      customTransform?.(token, '.') ??
      transformCSSValue(token, { tokensSet: baseTokens, transformAlias, color: { legacyHex } });
    if (value) {
      const localID = transformName(token);
      setTransform(token.id, {
        format: FORMAT_ID,
        localID,
        value,
        meta: { 'token-listing': { name: localID } },
      });
    }
  }

  // contextSelectors
  for (const selector of contextSelectors ?? []) {
    const ignore = selector.ignore ? wcmatch(selector.ignore) : undefined;
    // Note: if we throw an error here without specifying the input, a user may
    // find it impossible to debug the issue
    try {
      const input = { [selector.modifier]: selector.context };
      const tokens = resolver.apply(input);
      for (const token of Object.values(tokens)) {
        if (ignore?.(token.id) || exclude?.(token.id)) {
          continue;
        }
        const value =
          customTransform?.(token) ??
          transformCSSValue(token, { tokensSet: tokens, transformAlias, color: { legacyHex } });
        // Don’t duplicate values when unnecessary
        if (value && isDifferentValue(value, getTransforms({ format: FORMAT_ID, id: token.id })[0]?.value)) {
          const localID = transformName(token);
          setTransform(token.id, {
            format: FORMAT_ID,
            value,
            localID,
            modifier: selector.modifier,
            context: selector.context,
            meta: { 'token-listing': { name: localID } },
          });
        }
      }
    } catch (err) {
      logger.error({
        group: 'plugin',
        label: '@terrazzo/plugin-css',
        message: `There was an error trying to apply resolver input ${selector.modifier}:${selector.context}.`,
        continueOnError: true, // throw below
      });
      throw err; // note: this is most likely a nicely-formatted message from another logger instance; just pass it through
    }
  }

  // modeSelectors (legacy)
  for (const selector of modeSelectors ?? []) {
    const include = selector.tokens ? wcmatch(selector.tokens) : undefined;
    for (const token of Object.values(baseTokens)) {
      if ((include && !include(token.id)) || !token.mode[selector.mode]) {
        continue;
      }
      const value =
        customTransform?.(token, selector.mode) ??
        transformCSSValue(
          { ...token, ...(token.mode[selector.mode] as any) },
          { tokensSet: baseTokens, transformAlias, color: { legacyHex } },
        );
      if (value) {
        const localID = transformName(token);
        setTransform(token.id, {
          format: FORMAT_ID,
          value,
          localID,
          mode: selector.mode,
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
