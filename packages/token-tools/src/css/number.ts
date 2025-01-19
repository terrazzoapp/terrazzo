import type { NumberTokenNormalized } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert number value to CSS */
export function transformNumber(token: NumberTokenNormalized, options: TransformCSSValueOptions): string {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }
  return String(token.$value);
}
