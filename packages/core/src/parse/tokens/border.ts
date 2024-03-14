import type { BorderToken, ParsedBorderToken } from '../../token.js';
import { isObj } from '../../util.js';
import type { ParseColorOptions } from './color.js';
import { normalizeColorValue } from './color.js';
import { normalizeDimensionValue } from './dimension.js';
import { normalizeStrokeStyleValue } from './stroke-style.js';

export interface ParseBorderOptions {
  color: ParseColorOptions;
}

/**
 * 9.Border
 * https://design-tokens.github.io/community-group/format/#border
 * {
 *   "$type": "border",
 *   "$value": {
 *     "color": "#36363600",
 *     "width": "3px",
 *     "style": "solid"
 *   }
 * }
 */

export function normalizeBorderValue(value: unknown, options: ParseBorderOptions): ParsedBorderToken['$value'] {
  if (!isObj(value)) {
    throw new Error(`Expected object, received ${Array.isArray(value) ? 'array' : typeof value}`);
  }
  const tokenValue = value as BorderToken['$value'];
  if (!('color' in tokenValue)) {
    throw new Error(`Token missing required "color" property`);
  }
  if (!('width' in tokenValue)) {
    throw new Error(`Token missing required "width" property`);
  }
  if (!('style' in tokenValue)) {
    throw new Error(`Token missing required "style" property`);
  }
  return {
    color: normalizeColorValue(tokenValue.color, options.color),
    width: normalizeDimensionValue(tokenValue.width),
    style: normalizeStrokeStyleValue(tokenValue.style),
  };
}
