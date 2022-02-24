import type { ParsedTypographyValue, FontWeightName } from '../../@types/token';
import { normalizeFontValue } from './font.js';
import { normalizeDimensionValue } from './dimension.js';

const KEBAB_CASE_RE = /[-_]+[^-_]/g;
const VALID_WEIGHT_NAMES = new Map<FontWeightName, number>([
  ['thin', 100],
  ['hairline', 100],
  ['extra-light', 200],
  ['ultra-light', 200],
  ['light', 300],
  ['normal', 400],
  ['regular', 400],
  ['book', 400],
  ['medium', 500],
  ['semi-bold', 600],
  ['demi-bold', 600],
  ['bold', 700],
  ['extra-bold', 800],
  ['ultra-bold', 800],
  ['black', 900],
  ['heavy', 900],
  ['extra-black', 950],
  ['ultra-black', 950],
]);

/**
 * 9.7 Typography
 * https://design-tokens.github.io/community-group/format/#typography
 * {
 *   "$type": "typography",
 *   "$value": {
 *     "fontFamily": "Roboto",
 *     "fontSize": "42px",
 *     "fontWeight": "700",
 *     "letterSpacing": "0.1px",
 *     "lineHeight": "1.2",
 *     "textTransform": "none"
 *  }
 */
export function normalizeTypographyValue(value: unknown): Partial<ParsedTypographyValue> {
  if (!value) throw new Error('missing value');
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error(`expected object, received ${Array.isArray(value) ? 'array' : typeof value}`);
  if (!Object.keys(value).length) throw new Error('must specify at least 1 font property');

  const normalized = {} as ParsedTypographyValue;
  for (const [k, v] of Object.entries(value)) {
    const property = k.replace(KEBAB_CASE_RE, (letter) => letter.charAt(letter.length - 1).toUpperCase());
    switch (property) {
      case 'fontName':
      case 'fontFamily': {
        normalized.fontFamily = normalizeFontValue(v);
        break;
      }
      case 'fontWeight': {
        if (typeof v === 'string') {
          const wgt = VALID_WEIGHT_NAMES.get(v as any);
          if (wgt) {
            normalized.fontWeight = wgt;
          } else {
            throw new Error(`invalid font weight "${v}", use number (1-999) or any of the following names: ${[...VALID_WEIGHT_NAMES.values()].join('\n  - ')}`);
          }
        } else if (typeof v === 'number') {
          normalized.fontWeight = Math.max(1, Math.min(999, v));
        }
        break;
      }
      default: {
        (normalized as any)[property] = typeof v === 'string' && parseFloat(v) >= 0 ? normalizeDimensionValue(v) : v;
        break;
      }
    }
  }
  return normalized;
}
