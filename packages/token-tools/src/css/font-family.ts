import { type IDGenerator, defaultAliasTransform } from './lib.js';

export const FONT_FAMILY_KEYWORDS = new Set([
  'sans-serif',
  'serif',
  'monospace',
  'system-ui',
  'ui-monospace',
  '-apple-system',
]);

export function transformFontFamilyValue(
  value: string | string[],
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: { aliasOf?: string; partialAliasOf?: string[]; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return (typeof value === 'string' ? [value] : value)
    .map((fontName, i) =>
      partialAliasOf?.[i]
        ? transformAlias(partialAliasOf[i]!)
        : FONT_FAMILY_KEYWORDS.has(fontName)
          ? fontName
          : `"${fontName}"`,
    )
    .join(', ');
}
