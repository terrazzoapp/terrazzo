/** format font stack */
export function formatFontNames(fontNames: string[]): string {
  return fontNames.map((n) => (n.includes(' ') ? `"${n}"` : n)).join(', ');
}
