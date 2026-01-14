import type { TokenNormalized, TransformHookOptions } from '@terrazzo/parser';
import { makeCSSVar, transformCSSValue } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import { type CSSPluginOptions, FORMAT_ID } from './lib.js';

export type TransformOptions = Pick<TransformHookOptions, 'context' | 'resolver' | 'setTransform' | 'tokens'> &
  Pick<CSSPluginOptions, 'baseContext' | 'contextSelectors' | 'exclude' | 'modeSelectors' | 'variableName'>;

export function transform({
  baseContext,
  context: { logger },
  contextSelectors,
  exclude: userExclude,
  modeSelectors,
  resolver,
  setTransform,
  tokens: initialSet,
  variableName,
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
    const value = transformCSSValue(token, { tokensSet: baseTokens, transformAlias });
    if (value) {
      setTransform(token.id, { format: FORMAT_ID, value });
    }
  }

  // contextSelectors
  for (const selector of contextSelectors ?? []) {
    const ignore = selector.ignore ? wcmatch(selector.ignore) : undefined;
    const tokens = resolver.apply({ [selector.modifier]: selector.context });
    for (const token of Object.values(tokens)) {
      if (ignore?.(token.id) || exclude?.(token.id)) {
        continue;
      }
      const value = transformCSSValue(token, { tokensSet: tokens, transformAlias });
      if (value) {
        setTransform(token.id, {
          format: FORMAT_ID,
          value,
          localID: transformName(token),
          modifier: selector.modifier,
          context: selector.context,
        });
      }
    }
  }

  // modeSelectors (legacy)
  for (const selector of modeSelectors ?? []) {
    const include = selector.tokens ? wcmatch(selector.tokens) : undefined;
    for (const token of Object.values(baseTokens)) {
      if ((include && !include(token.id)) || !token.mode[selector.mode]) {
        continue;
      }
      const value = transformCSSValue(
        { ...token, ...(token.mode[selector.mode] as any) },
        { tokensSet: baseTokens, transformAlias },
      );
      if (value) {
        setTransform(token.id, { format: FORMAT_ID, value, localID: transformName(token), mode: selector.mode });
      }
    }
  }
}
