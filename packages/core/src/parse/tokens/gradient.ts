import type { GradientStop, ParsedGradientToken } from '../../@types/token';
import { normalizeColorValue } from './color.js';

/**
 * 9.? Gradient
 * {
 *   "type": "gradient",
 *   "value": [
 *     { "color": "blue", "position": 0 },
 *     { "color": "lime", "position": 1 }
 *   ]
 * }
 */
export function normalizeGradientValue(value: unknown): ParsedGradientToken['value'] {
  if (!value) throw new Error('missing value');
  if (!Array.isArray(value)) throw new Error(`expected array of gradient stops, received ${typeof value}`);
  if (value.some((v) => !v || !v.color)) throw new Error('all gradient stops must have color');
  return (value as any).map((v: GradientStop) => ({
    color: normalizeColorValue(v.color),
    position: typeof v.position === 'number' ? Math.max(0, Math.min(1, v.position)) : undefined,
  }));
}
