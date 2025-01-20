import type { StringTokenNormalized } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert string value to CSS */
export function transformString(token: StringTokenNormalized, options: TransformCSSValueOptions): string {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }
  // this seems like a useless function—because it is—but this is a placeholder
  // that can handle unexpected values in the future should any arise
  return String(token.$value);
}
