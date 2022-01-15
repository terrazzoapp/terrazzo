import type { ParsedFileToken } from '../../@types/token';

/**
 * 8.? File
 *
 * {
 *   "icon-alert": {
 *     "type": "file",
 *     "value": "./icon/alert.svg"
 *   }
 * }
 */
export function normalizeFileValue(value: unknown): ParsedFileToken['value'] {
  if (!value) throw new Error('missing value');
  if (typeof value === 'string') {
    return value;
  }
  throw new Error(`expected string, received ${typeof value}`);
}
