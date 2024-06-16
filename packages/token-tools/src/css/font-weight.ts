import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert fontWeight value to CSS */
export function transformFontWeightValue(
  value: number | string,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return String(value);
}
