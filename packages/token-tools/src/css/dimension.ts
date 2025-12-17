import type { DimensionTokenNormalized } from '../types.js';
import type { StrictTransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert dimension value to CSS */
export function transformDimension(token: DimensionTokenNormalized, options: StrictTransformCSSValueOptions): string {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]);
  }

  return token.$value.value === 0 ? '0' : `${token.$value.value}${token.$value.unit}`;
}
