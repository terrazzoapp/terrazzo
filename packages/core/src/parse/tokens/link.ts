import type { ParsedLinkToken } from '../../token.js';

/**
 * 8.? Link
 *
 * {
 *   "icon-alert": {
 *     "$type": "link",
 *     "$value": "/icon/alert.svg"
 *   }
 * }
 */
export function normalizeLinkValue(value: unknown): ParsedLinkToken['$value'] {
  if (!value) {
    throw new Error('missing value');
  }
  if (typeof value === 'string') {
    return value;
  }
  throw new Error(`expected string, received ${typeof value}`);
}
