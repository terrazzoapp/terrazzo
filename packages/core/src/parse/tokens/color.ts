import color from 'better-color-tools';
import type {ParsedColorToken} from '../../token.js';

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
  if (!value) throw new Error('missing value');
  if (typeof value === 'string' || typeof value === 'number') {
    try {
      const c = color.from(value); // throws on invalid color;
      if (options.convertToHex === false && typeof value === 'string') {
        return value;
      }
      return c.hex;
    } catch {
      throw new Error(`invalid color "${value}"`);
    }
  }
  throw new Error(`expected string, received ${typeof value}`);
}
