import type { ParsedStrokeStyleToken } from '../../token.js';

const VALID_STROKE_STYLES = new Set(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'outset', 'inset']);
const VALID_LINECAPS = new Set(['butt', 'round', 'square']);

/**
 * 9.2 Stroke Style
 * https://design-tokens.github.io/community-group/format/#stroke-style
 * {
 *   "focus-ring-style": {
 *     "$type": "strokeStyle",
 *     "$value": "dashed"
 *   },
 *   "alert-border-style": {
 *     "$type": "strokeStyle",
 *     "$value": {
 *       "dashArray": ["0.5rem", "0.25rem"],
 *       "lineCap": "round"
 *     }
 *   }
 * }
 */

// Note: object type isn’t supported for now!

export function normalizeStrokeStyleValue(value: unknown): ParsedStrokeStyleToken['$value'] {
  if (!value) {
    throw new Error(`Missing $value`);
  }
  if (typeof value === 'string') {
    if (!VALID_STROKE_STYLES.has(value as any)) {
      throw new Error(`Unsupported stroke type "${value}", expected be one of: \n  - ${[...VALID_STROKE_STYLES].join('\n  - ')}`);
    }
    return value as string;
  }
  if (Array.isArray(value)) {
    throw new Error(`Unexpected $value type: expected string or object, got array`);
  }
  if (typeof value === 'object') {
    if (!('dashArray' in value) || !value.dashArray) {
      throw new Error(`$value.dashArray is required for object format`);
    }
    if (!Array.isArray(value.dashArray) || !value.dashArray.length) {
      throw new Error(`$value.dashArray must be an array with at least 1 dimension`);
    }
    if (!('lineCap' in value) || typeof value.lineCap !== 'string' || !VALID_LINECAPS.has(value.lineCap)) {
      throw new Error(`Unsupported line cap "${value}", expected one of: \n  - ${[...VALID_LINECAPS].join('\n  - ')}`);
    }
    return value as any;
  }
  throw new Error(`Unexpected $value type: expected string or object, got ${typeof value}`);
}
