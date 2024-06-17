import type { CubicBézierValue } from '../types.js';
import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert cubicBezier value to CSS */
export function transformCubicBezierValue(
  value: CubicBézierValue,
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: [string | undefined, string | undefined, string | undefined, string | undefined];
    transformAlias?: IDGenerator;
  } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return `cubic-bezier(${value
    .map((v, i) => (partialAliasOf?.[i] ? transformAlias(partialAliasOf[i]!) : v))
    .join(', ')})`;
}
