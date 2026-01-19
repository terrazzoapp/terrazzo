import type { CubicBezierTokenNormalized } from '../types.js';
import type { StrictTransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert cubicBezier value to CSS */
export function transformCubicBezier(
  token: CubicBezierTokenNormalized,
  options: StrictTransformCSSValueOptions,
): string {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]);
  }
  return `cubic-bezier(${token.$value
    .map((v, i) => (token.partialAliasOf?.[i] ? transformAlias(tokensSet[token.partialAliasOf[i]]) : v))
    .join(', ')})`;
}
