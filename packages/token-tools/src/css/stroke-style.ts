import type { StrokeStyleTokenNormalized, TokenTransformedSingleValue } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert strokeStyle value to CSS */
export function transformStrokeStyle(
  token: StrokeStyleTokenNormalized,
  options: TransformCSSValueOptions,
): TokenTransformedSingleValue['value'] {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }
  return typeof token.$value === 'string' ? token.$value : 'dashed'; // CSS doesn’t have `dash-array`; it’s just "dashed"
}
