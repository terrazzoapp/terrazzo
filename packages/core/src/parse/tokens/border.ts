import type {ParsedBorderToken} from '../../token.js';
import {isObj} from '../../util.js';
import {normalizeColorValue} from './color.js';
import {normalizeDimensionValue} from './dimension.js';
import {normalizeStrokeStyleValue} from './stroke-style.js';

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

export function normalizeBorderValue(value: unknown): ParsedBorderToken['$value'] {
  if (!isObj(value)) throw new Error(`Expected object, received ${Array.isArray(value) ? 'array' : typeof value}`);
  const normalized = {} as ParsedBorderToken['$value'];
  if (!Object.keys(value as any).length) throw new Error(`Must specify at least 1 property for border`);
  for (const k of Object.keys(value as ParsedBorderToken['$value'])) {
    // note: all properties are required
    switch (k) {
      case 'color': {
        normalized.color = normalizeColorValue((value as any).color);
        break;
      }
      case 'width': {
        normalized.width = normalizeDimensionValue((value as any).width);
        break;
      }
      case 'style': {
        normalized.style = normalizeStrokeStyleValue((value as any).style);
        break;
      }
      default: {
        throw new Error(`Unknown property "${k}" on border token`);
      }
    }
  }
  return normalized;
}
