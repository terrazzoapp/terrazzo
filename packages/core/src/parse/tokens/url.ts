import type { ParsedURLToken } from '../../@types/token';

/**
 * 8.? URL
 *
 * {
 *   "illustration": {
 *     "type": "url",
 *     "value": "https://mycdn.com/image.jpg"
 *   }
 * }
 */
export function normalizeURLValue(value: unknown): ParsedURLToken['value'] {
  if (!value) throw new Error('missing value');
  if (typeof value === 'string') {
    try {
      return value;
    } catch {
      throw new Error(`Invalid URL "${value}" (use "type": "file" for local paths)`);
    }
  }
  throw new Error(`expected string, received ${typeof value}`);
}
