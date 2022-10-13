import type {ParsedFontToken} from '../../token.js';

/**
 * 8.3 Font name
 * https://design-tokens.github.io/community-group/format/#font-name
 *
 * {
 *   "Primary font": {
 *     "$type": "font",
 *     "$value": "Comic Sans MS"
 *   },
 *   "Body font": {
 *     "$type": "font",
 *     "$value": ["Helvetica", "Arial"]
 *   }
 * }
 */
export function normalizeFontValue(value: unknown): ParsedFontToken['$value'] {
  if (!value) throw new Error('missing value');
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    if (value.every((v) => !!v && typeof v === 'string')) {
      return value;
    }
    throw new Error('expected array of strings');
  }
  throw new Error(`expected string or array of strings, received ${typeof value}`);
}
