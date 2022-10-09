import type {ParsedStrokeStyleToken} from '../../@types/token';

const VALID_STROKE_STYLES = new Set(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'outset', 'inset']);

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
  if (!VALID_STROKE_STYLES.has(value as any)) throw new Error(`Unsupported stroke type "${value}", must be one of: \n  - ${[...VALID_STROKE_STYLES].join('\n  - ')}`);
  return value as string;
}
