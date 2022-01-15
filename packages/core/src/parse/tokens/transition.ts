import type { ParsedTransitionToken } from '../../@types/token';
import { normalizeDurationValue } from './duration.js';
import { normalizeCubicBezierValue } from './cubic-bezier.js';

/**
 * 9.? Transition
 *
 * {
 *   "type": "transition",
 *   "value": {
 *     "duration": "200ms",
 *     "delay": "0ms",
 *     "timing-function": [0.5, 0, 1, 1]
 *   }
 * }
 */
export function normalizeTransitionValue(value: unknown): ParsedTransitionToken['value'] {
  if (!value) throw new Error('missing value');
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid transition format, e');
  if (!Object.keys(value).length) throw new Error('At least 1 transition property is required');
  const v = value as any;
  return {
    duration: v.duration ? normalizeDurationValue(v.duration) : undefined,
    delay: v.delay ? normalizeDurationValue(v.delay) : undefined,
    'timing-function': v['timing-function'] ? normalizeCubicBezierValue(v['timing-function']) : undefined,
  };
}
