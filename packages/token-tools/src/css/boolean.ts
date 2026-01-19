import type { BooleanTokenNormalized } from '../types.js';
import type { StrictTransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert boolean value to CSS string */
export function transformBoolean(
  token: BooleanTokenNormalized,
  { tokensSet, transformAlias = defaultAliasTransform }: StrictTransformCSSValueOptions,
): string {
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]);
  }
  return token.$value === true ? '1' : '0';
}
