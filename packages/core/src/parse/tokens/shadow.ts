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
    if (typeof v[k] === 'number' && v[k] > 0) throw new Error(`${k} missing units`);
    if (k === 'offset-x' || k === 'offset-y') {
      if (typeof v[k] !== 'string' && v[k] !== 0) throw new Error(`missing ${k}`);
    }
  });
  return {
    'offset-x': normalizeDimensionValue(v['offset-x'] || '0'),
    'offset-y': normalizeDimensionValue(v['offset-y'] || '0'),
    blur: normalizeDimensionValue(v.blur || '0'),
    spread: normalizeDimensionValue(v.spread || '0'),
    color: normalizeColorValue(v.color),
    // extra values are discarded rather than throwing an error
  };
}
