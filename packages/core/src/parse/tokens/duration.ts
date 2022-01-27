import type { ParsedDurationToken } from '../../@types/token';

const DURATION_RE = /^\d+(\.\d+)?(ms|s)$/;

/**
 * 8.4 Duration
 * https://design-tokens.github.io/community-group/format/#duration
 *
 * {
 *   "duration-100": {
 *     "type": "duration",
 *     "value": "100ms"
 *   }
 * }
 */
export function normalizeDurationValue(value: unknown): ParsedDurationToken['value'] {
  // number not technically allowed, but coerce to milliseconds
  if (typeof value === 'number') {
    return `${value}ms`;
  }
  if (typeof value === 'string') {
    if (parseFloat(value) === 0) return '0ms'; // allow '0', but throw on everything else
    if (DURATION_RE.test(value)) {
      return value;
    }
    throw new Error(`invalid duration "${value}"`);
  }
  throw new Error(`expected string, received ${typeof value}`);
}
