import type { DurationTokenNormalized, TokenTransformedSingleValue } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert duration value to CSS */
export function transformDuration(
  token: DurationTokenNormalized,
  options: TransformCSSValueOptions,
): TokenTransformedSingleValue['value'] {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }

  return `${token.$value.value}${token.$value.unit}`;
}
