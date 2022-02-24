import type { CubicBezierToken, ParsedTransitionToken } from '../../@types/token';
import { normalizeDurationValue } from './duration.js';
import { normalizeCubicBezierValue } from './cubic-bezier.js';

const EASE: CubicBezierToken['$value'] = [0.25, 0.1, 0.25, 1];

/**
 * 9.4 Transition
 * https://design-tokens.github.io/community-group/format/#transition
 *
 * {
 *   "$type": "transition",
 *   "$value": {
 *     "duration": "200ms",
 *     "delay": "0ms",
 *     "timingFunction": [0.5, 0, 1, 1]
 *   }
 * }
 */
export function normalizeTransitionValue(value: unknown): ParsedTransitionToken['$value'] {
  if (!value) throw new Error('missing value');
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid transition format, e');
  if (!Object.keys(value).length) throw new Error('At least 1 transition property is required');
  const v = value as any;
  return {
    duration: normalizeDurationValue(v.duration || '0'),
    delay: normalizeDurationValue(v.delay || '0'),
    timingFunction: normalizeCubicBezierValue(v.timingFunction || EASE),
  };
}
