/** @see https://www.w3.org/TR/css-values-4/#common-keywords */
const CSS_WIDE_KEYWORDS = ['inherit', 'initial', 'revert', 'revert-layer', 'unset'];

/** `normal` is the initial value of both and resolves from font metrics, so it has no numeric form. */
const TYPOGRAPHY_KEYWORDS: Record<string, string[]> = {
  lineHeight: ['normal', ...CSS_WIDE_KEYWORDS],
  letterSpacing: ['normal', ...CSS_WIDE_KEYWORDS],
};

/** Narrow by design: any other non-object value stays an error, so the legacy-format warning still fires. */
export function isTypographyKeyword(property: string, value: unknown): boolean {
  return typeof value === 'string' && !!TYPOGRAPHY_KEYWORDS[property]?.includes(value);
}
