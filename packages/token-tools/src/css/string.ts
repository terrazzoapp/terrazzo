import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert string value to CSS */
export function transformStringValue(
  value: string | number | boolean,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  // this seems like a useless function—because it is—but this is a placeholder
  // that can handle unexpected values in the future should any arise
  return aliasOf ? transformAlias(aliasOf) : String(value);
}
