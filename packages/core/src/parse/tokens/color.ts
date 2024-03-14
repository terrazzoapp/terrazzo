import { formatHex, formatHex8, parse } from 'culori';
import type { ParsedColorToken } from '../../token.js';

export interface ParseColorOptions {
  /** Convert color to sRGB hex? (default: true) */
  convertToHex?: boolean;
}

/**
 * 8.1 Color
 * https://design-tokens.github.io/community-group/format/#color
 *
 * {
 *   "$type": "color",
 *   "$value": "#ff00ff"
 * }
 */
export function normalizeColorValue(value: unknown, options: ParseColorOptions): ParsedColorToken['$value'] {
  if (!value) {
    throw new Error('missing value');
  }
  if (typeof value === 'string') {
    if (options.convertToHex === true) {
      const parsed = parse(value);
      if (!parsed) {
        throw new Error(`invalid color "${value}"`);
      }
      return typeof parsed.alpha === 'number' && parsed.alpha < 1 ? formatHex8(parsed) : formatHex(parsed);
    }
    return value;
  }
  throw new Error(`expected string, received ${typeof value}`);
}
