import type { ShadowValue } from '../../@types/token';
import { normalizeColorValue } from './color.js';
import { normalizeDimensionValue } from './dimension.js';

/**
 * 9.? Shadow
 * {
 *   "type": "shadow",
 *   "value": {
 *     "color": "{color.shadow-050}",
 *     "offset-x": "{space.small}",
 *     "offset-y": "{space.small}",
 *     "blur": "1.5rem",
 *     "spread": "0rem"
 *   }
 * }
 */
export function normalizeShadowValue(value: unknown): ShadowValue {
  if (!value) throw new Error('missing value');
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid shadow');
  const v = value as any;
  ['offset-x', 'offset-y', 'blur', 'spread', 'color'].forEach((k) => {
    if ((k === 'offset-x' || k === 'offset-y') && typeof v[k] !== 'string' && v[k] !== 0) throw new Error(`missing ${k}`);
    if (v[k] > 0) throw new Error(`${k} missing units`);
  });
  return {
    'offset-x': normalizeDimensionValue(v['offset-x']),
    'offset-y': normalizeDimensionValue(v['offset-y']),
    blur: v.blur,
    spread: v.spread,
    color: normalizeColorValue(v.color),
    // extra values are discarded rather than throwing an error
  };
}
