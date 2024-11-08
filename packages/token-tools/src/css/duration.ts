import type { AliasValue, DurationValue } from '../types.js';
import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert duration value to CSS */
export function transformDurationValue(
  value: DurationValue | AliasValue,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  } else if (typeof value === 'string') {
    throw new Error(`Could not resolve alias ${value}`);
  }
  // Note: always return unit, even if `0`
  return `${value.value}${value.unit}`;
}
