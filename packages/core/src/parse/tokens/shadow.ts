import type { ParsedShadowToken } from '../../token.js';
import type { ParseColorOptions } from './color.js';
import { normalizeColorValue } from './color.js';
import { normalizeDimensionValue } from './dimension.js';

export interface ParseShadowOptions {
  color: ParseColorOptions;
}

/**
 * 9.5 Shadow
 * https://design-tokens.github.io/community-group/format/#shadow
 * {
 *   "$type": "shadow",
 *   "$value": {
 *     "color": "{color.shadow-050}",
 *     "offsetX": "{space.small}",
 *     "offsetY": "{space.small}",
 *     "blur": "1.5rem",
 *     "spread": "0rem",
 *     "inset": false
 *   }
 * }
 */
export function normalizeShadowValue(value: unknown, options: ParseShadowOptions): ParsedShadowToken['$value'] {
  if (!value) {
    throw new Error('missing value');
  }
  if (typeof value !== 'object' && !Array.isArray(value)) {
    throw new Error(`expected object or array of objects, got ${typeof value}`);
  }
  const v = Array.isArray(value) ? value : [value];
  return v.map((shadow: any, i: number) => {
    for (const k of ['offsetX', 'offsetX', 'blur', 'spread', 'color']) {
      const errorPrefix = v.length > 1 ? `shadow #${i + 1}: ` : ''; // in error message, show shadow number, but only if there are multiple shadows
      if (typeof shadow[k] === 'number' && shadow[k] > 0) {
        throw new Error(`${errorPrefix}${k} missing units`);
      }
      if (k === 'offsetX' || k === 'offsetY') {
        if (typeof shadow[k] !== 'string' && shadow[k] !== 0) {
          throw new Error(`${errorPrefix}missing ${k}`);
        }
      }
    }
    return {
      offsetX: normalizeDimensionValue(shadow.offsetX || '0'),
      offsetY: normalizeDimensionValue(shadow.offsetY || '0'),
      blur: normalizeDimensionValue(shadow.blur || '0'),
      spread: normalizeDimensionValue(shadow.spread || '0'),
      color: normalizeColorValue(shadow.color, options.color),
      inset: shadow.inset ?? false,
      // extra values are discarded rather than throwing an error
    };
  });
}
