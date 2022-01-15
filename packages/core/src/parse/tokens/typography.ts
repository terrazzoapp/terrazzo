import type { ParsedTypographyValue, FontWeightName } from '../../@types/token';
import { normalizeFontValue } from './font.js';
import { normalizeDimensionValue } from './dimension.js';

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
 * 9.? Typography
 * {
 *   "type": "typography",
 *   "value": {
 *     "fontName": "Roboto",
 *     "fontSize": "42px",
 *     "fontWeight": "700",
 *     "letterSpacing": "0.1px",
 *     "lineHeight": "1.2"
 *  }
 */
export function normalizeTypographyValue(value: unknown): Partial<ParsedTypographyValue> {
  if (!value) throw new Error('missing value');
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error(`expected object, received ${Array.isArray(value) ? 'array' : typeof value}`);
  if (!Object.keys(value).length) throw new Error('must specify at least 1 font property');
  const v = value as any;
  let fontWeight: number | undefined;
  if (typeof v.fontWeight === 'string') {
    const wgt = VALID_WEIGHT_NAMES.get(v.fontWeight);
    if (wgt) {
      fontWeight = wgt;
    } else {
      throw new Error(
        `invalid font weight "${v.fontWeight}", use number (1-999) or any of the following names: ${[...VALID_WEIGHT_NAMES.values()].join('\n  - ')}`
      );
    }
  } else if (typeof v.fontWeight === 'number') {
    fontWeight = Math.max(0, Math.min(999, v.fontWeight));
  }
  const normalized = {} as ParsedTypographyValue;
  if (v.fontName) normalized.fontName = normalizeFontValue(v.fontName);
  if (v.fontSize) normalized.fontSize = normalizeDimensionValue(v.fontSize);
  if (v.fontStyle) normalized.fontStyle = v.fontStyle;
  if (fontWeight) normalized.fontWeight = fontWeight;
  if (v.letterSpacing) normalized.letterSpacing = v.letterSpacing;
  if (v.lineHeight) normalized.lineHeight = v.lineHeight;
  return normalized;
}
