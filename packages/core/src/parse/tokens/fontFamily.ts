import type { ParsedFontFamilyToken } from '../../token.js';

/**
 * 8.3 Font name
 * https://design-tokens.github.io/community-group/format/#font-family
 *
 * {
 *   "Primary font": {
 *     "$type": "fontFamily",
 *     "$value": "Comic Sans MS"
 *   },
 *   "Body font": {
 *     "$type": "fontFamily",
 *     "$value": ["Helvetica", "Arial"]
 *   }
 * }
 */
export function normalizeFontFamilyValue(value: unknown): ParsedFontFamilyToken['$value'] {
  if (!value) {
    throw new Error('missing value');
  }
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    if (value.every((v) => !!v && typeof v === 'string')) {
      return value;
    }
    throw new Error('expected array of strings');
  }
  throw new Error(`expected string or array of strings, received ${typeof value}`);
}
