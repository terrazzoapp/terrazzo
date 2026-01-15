import type { DurationTokenNormalized } from '../types.js';
import type { StrictTransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert duration value to CSS */
export function transformDuration(token: DurationTokenNormalized, options: StrictTransformCSSValueOptions): string {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]);
  }

  return `${token.$value.value}${token.$value.unit}`;
}
