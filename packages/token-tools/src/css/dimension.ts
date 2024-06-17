import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert dimension value to CSS */
export function transformDimensionValue(
  value: number | string,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  if (typeof value === 'number') {
    return value === 0 ? '0' : `${value}px`;
  }
  return value === '0' || Number.parseFloat(value) === 0 ? '0' : value;
}
