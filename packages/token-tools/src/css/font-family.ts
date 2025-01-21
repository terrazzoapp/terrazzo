import type { FontFamilyTokenNormalized } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

const FONT_NAME_KEYWORD = /^[a-z-]+$/;

export function transformFontFamily(token: FontFamilyTokenNormalized, options: TransformCSSValueOptions): string {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }
  return token.$value.map((fontName) => (FONT_NAME_KEYWORD.test(fontName) ? fontName : `"${fontName}"`)).join(', ');
}
