import { type Color, clampChroma, formatHex, formatHex8, parse, formatCss } from 'culori';
import type { ParsedColorToken } from '../../token.js';

export interface ParseColorOptions {
  /** Convert color to 8-bit sRGB hexadecimal? (default: false) */
  convertToHex?: boolean;
  /** Confine colors to gamut? sRGB is smaller but widely-supported; P3 supports more colors but not all users  (default: `undefined`) */
  gamut?: 'srgb' | 'p3' | undefined;
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
export function normalizeColorValue(rawValue: unknown, options?: ParseColorOptions): ParsedColorToken['$value'] {
  if (!rawValue) {
    throw new Error('missing value');
  }
  if (typeof rawValue === 'string') {
    const parsed = parse(rawValue);
    if (!parsed) {
      throw new Error(`invalid color "${rawValue}"`);
    }

    let value = parsed as Color;
    let valueEdited = false; // keep track of this to reduce rounding errors

    // clamp to sRGB if we’re converting to hex, too!
    if (options?.gamut === 'srgb' || options?.convertToHex === true) {
      value = clampChroma(parsed, parsed.mode, 'rgb');
      valueEdited = true;
    } else if (options?.gamut === 'p3') {
      value = clampChroma(parsed, parsed.mode, 'p3');
      valueEdited = true;
    }

    // TODO: in 2.x, only convert to hex if no color loss (e.g. don’t downgrade a 12-bit color `rgb()` to 8-bit hex)
    if (options?.convertToHex === true) {
      return typeof value.alpha === 'number' && value.alpha < 1 ? formatHex8(value) : formatHex(value);
    }

    return valueEdited ? formatCss(value) : rawValue; // return the original value if we didn’t modify it; we may introduce nondeterministic rounding errors (the classic JS 0.3333… nonsense, etc.)
  }
  throw new Error(`expected string, received ${typeof rawValue}`);
}
