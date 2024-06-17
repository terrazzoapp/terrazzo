import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert link value to CSS */
export function transformLinkValue(
  value: string,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return `url("${value}")`;
}
