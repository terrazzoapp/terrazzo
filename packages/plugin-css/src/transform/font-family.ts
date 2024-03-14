import type { ParsedFontFamilyToken } from '@cobalt-ui/core';

/** transform font family */
export default function transformFontFamily(value: ParsedFontFamilyToken['$value']): string {
  return formatFontNames(value);
}

function formatFontNames(fontNames: string[]): string {
  return fontNames.map((n) => (n.includes(' ') ? `"${n}"` : n)).join(', ');
}
