import type { LinkTokenNormalized } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert link value to CSS */
export function transformLink(token: LinkTokenNormalized, options: TransformCSSValueOptions): string {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }
  return `url("${token.$value}")`;
}
