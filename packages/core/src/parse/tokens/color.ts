import type {ParsedColorToken} from '../../token.js';
import color from 'better-color-tools';

/**
 * 8.1 Color
 * https://design-tokens.github.io/community-group/format/#color
 *
 * {
 *   "$type": "color",
 *   "$value": "#ff00ff"
 * }
 */
export function normalizeColorValue(value: unknown): ParsedColorToken['$value'] {
  if (!value) throw new Error('missing value');
  if (typeof value === 'string' || typeof value === 'number') {
    try {
      return color.from(value).hex;
    } catch {
      throw new Error(`invalid color "${value}"`);
    }
  }
  throw new Error(`expected string, received ${typeof value}`);
}
