import type { GradientStop, ParsedGradientToken } from '../../token.js';
import { ParseColorOptions, normalizeColorValue } from './color.js';

export interface ParseGradientOptions {
  color: ParseColorOptions;
}

/**
 * 9.6 Gradient
 * https://design-tokens.github.io/community-group/format/#gradient
 * {
 *   "$type": "gradient",
 *   "$value": [
 *     {"color": "blue", "position": 0},
 *     {"color": "lime", "position": 1}
 *   ]
 * }
 */
export function normalizeGradientValue(value: unknown, options: ParseGradientOptions): ParsedGradientToken['$value'] {
  if (!value) throw new Error('missing value');
  if (!Array.isArray(value)) throw new Error(`expected array, received ${typeof value}`);
  if (value.some((v) => !v || !v.color)) throw new Error('all gradient stops must have color');
  return (value as any).map((v: GradientStop) => ({
    color: normalizeColorValue(v.color, options.color),
    position: typeof v.position === 'number' ? Math.max(0, Math.min(1, v.position)) : undefined,
  }));
}
