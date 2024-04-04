import type { ParsedTypographyValue } from '../../token.js';
import { camelize } from '@cobalt-ui/utils';
import { normalizeFontFamilyValue } from './fontFamily.js';
import { normalizeDimensionValue } from './dimension.js';
import { normalizeFontWeightValue } from './fontWeight.js';

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
  if (!value) {
    throw new Error('missing value');
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`expected object, received ${Array.isArray(value) ? 'array' : typeof value}`);
  }
  if (!Object.keys(value).length) {
    throw new Error('must specify at least 1 font property');
  }

  const normalized = {} as ParsedTypographyValue;
  for (const k in value) {
    const v = value[k as keyof typeof value]!;
    const property = camelize(k);
    switch (property) {
      case 'font' as 'fontFamily': // @deprecated (but keep support for now)
      case 'fontName':
      case 'fontFamily': {
        normalized.fontFamily = normalizeFontFamilyValue(v);
        break;
      }
      case 'fontWeight': {
        normalized.fontWeight = normalizeFontWeightValue(v);
        break;
      }
      default: {
        (normalized as any)[property] =
          typeof v === 'string' && Number.parseFloat(v) >= 0 ? normalizeDimensionValue(v) : v;
        break;
      }
    }
  }
  return normalized;
}
