import type {ParsedNumberToken} from '../../token.js';

/**
 * 8.3 Font name
 * https://design-tokens.github.io/community-group/format/#font-family
 *
 * {
 *   "Spacing": {
 *     "$type": "number",
 *       "large": {
 *         "$value": 24
 *       },
 *       "small": {
 *         "$value": 16
 *       }
 *     }
 *   },
 * }
 */
export function normalizeNumberValue(value: unknown): ParsedNumberToken['$value'] {
  if (value === null || value === undefined) throw new Error('missing value');
  if (typeof value === 'number') return value;
  throw new Error(`expected number, received ${typeof value}`);
}
