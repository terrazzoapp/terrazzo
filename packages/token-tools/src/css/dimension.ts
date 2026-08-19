import type { DimensionTokenNormalized, TokenTransformedSingleValue } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert dimension value to CSS */
export function transformDimension(
  token: DimensionTokenNormalized,
  options: TransformCSSValueOptions,
): TokenTransformedSingleValue['value'] {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }

  // Legacy string dimensions, bare numbers and CSS keywords reach here too:
  // `core/valid-dimension` reports them, but the parser still passes them through.
  const $value = token.$value as unknown;
  if (typeof $value === 'string' || typeof $value === 'number') {
    return String($value);
  }

  return `${token.$value.value}${token.$value.unit}`;
}
