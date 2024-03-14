import type { ParsedFontWeightToken } from '../../token.js';

export type FontWeightName =
  | 'thin'
  | 'hairline'
  | 'extra-light'
  | 'ultra-light'
  | 'light'
  | 'normal'
  | 'regular'
  | 'book'
  | 'medium'
  | 'semi-bold'
  | 'demi-bold'
  | 'bold'
  | 'extra-bold'
  | 'ultra-bold'
  | 'black'
  | 'heavy'
  | 'extra-black'
  | 'ultra-black';

const fontWeightAliases: Record<FontWeightName, number> = {
  thin: 100,
  hairline: 100,
  'extra-light': 200,
  'ultra-light': 200,
  light: 300,
  normal: 400,
  regular: 400,
  book: 400,
  medium: 500,
  'semi-bold': 600,
  'demi-bold': 600,
  bold: 700,
  'extra-bold': 800,
  'ultra-bold': 800,
  black: 900,
  heavy: 900,
  'extra-black': 950,
  'ultra-black': 950,
};

/**
 * 8.3 Font name
 * https://design-tokens.github.io/community-group/format/#font-weight
 *
 * {
 *   "Primary font": {
 *     "$type": "fontWeight",
 *     "$value": 100
 *   },
 *   "Body font": {
 *     "$type": "fontWeight",
 *     "$value": "hairline"
 *   }
 * }
 */
export function normalizeFontWeightValue(value: unknown): ParsedFontWeightToken['$value'] {
  if (!value) throw new Error('missing value');
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value in fontWeightAliases) {
    return fontWeightAliases[value as FontWeightName];
  }
  throw new Error(`expected number or font weight alias, received ${value} (${typeof value})`);
}
