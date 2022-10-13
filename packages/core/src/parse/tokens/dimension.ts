import type {ParsedDimensionToken} from '../../token.js';

/**
 * 8.2 Dimension
 * https://design-tokens.github.io/community-group/format/#dimension
 *
 * {
 *   "spacingStack1X": {
 *     "$type": "dimension",
 *     "$value": "0.25rem"
 *   }
 * }
 */
export function normalizeDimensionValue(value: unknown): ParsedDimensionToken['$value'] {
  // number not technically allowed, but it can be easily coerced into a string
  if (typeof value === 'number') {
    if (value === 0) return '0';
    throw new Error('missing units');
  }
  if (typeof value === 'string') {
    if (parseFloat(value) === 0) return '0';
    return value;
  }
  throw new Error(`expected string, received ${typeof value}`);
}
