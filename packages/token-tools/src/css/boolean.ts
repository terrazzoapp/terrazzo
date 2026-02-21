import type { BooleanTokenNormalized, TokenTransformedSingleValue } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert boolean value to CSS string */
export function transformBoolean(
  token: BooleanTokenNormalized,
  options: TransformCSSValueOptions,
): TokenTransformedSingleValue['value'] {
  if (token.aliasChain?.[0]) {
    return (options.transformAlias ?? defaultAliasTransform)(options.tokensSet[token.aliasChain[0]]!);
  }
  return token.$value === true ? '1' : '0';
}
