import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert number value to CSS */
export function transformNumberValue(
  value: number,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  return aliasOf ? transformAlias(aliasOf) : String(value);
}
