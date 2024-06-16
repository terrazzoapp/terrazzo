import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert duration value to CSS */
export function transformDurationValue(
  value: number | string,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  if (typeof value === 'number' || String(Number.parseFloat(value)) === value) {
    return `${value}ms`;
  }
  return value;
}
