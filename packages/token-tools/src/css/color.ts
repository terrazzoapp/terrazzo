import { type ColorConstructor, to as convert, inGamut, serialize } from 'colorjs.io/fn';
import { parseColor, tokenToColor } from '../color.js';
import type { ColorTokenNormalized, TokenTransformed } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

export type WideGamutColorValue = {
  '.': string;
  srgb: string;
  p3: string;
  rec2020: string;
};

/** Convert color value to CSS string */
export function transformColor(
  token: ColorTokenNormalized,
  options: TransformCSSValueOptions,
): TokenTransformed['value'] {
  const { transformAlias = defaultAliasTransform, tokensSet } = options;

  const firstAlias = token.aliasChain?.[0];
  if (firstAlias && tokensSet[firstAlias]) {
    return transformAlias(tokensSet[firstAlias]);
  }

  const {
    colorSpace,
    components,
    alpha = 1,
  } = typeof token.$value === 'string' ? parseColor(token.$value) : token.$value;
  const color = tokenToColor({ colorSpace, components, alpha });

  if (!color) {
    throw new Error(`Can’t convert color ${JSON.stringify(token.$value)} to Culori color`);
  }

  return inGamut(color, 'srgb')
    ? serialize(color, { format: options.color?.legacyHex ? 'hex' : undefined })
    : downsample({ colorSpace, components, alpha }, color, options.color?.depth);
}

export const DEPTH_ROUNDING = {
  24: 4, // 24-bit almost fits into 3 decimal places, but not quite
  30: 4,
  36: 5,
  48: 6,
};

export type Depth = keyof typeof DEPTH_ROUNDING | 'unlimited';

/**
 * Downsample color to srgb, display-p3, and rec2020 color spaces.
 */
function downsample($value: ColorTokenNormalized['$value'], color: ColorConstructor, depth: Depth = 30) {
  const srgb = convert(color, $value.colorSpace, { inGamut: { space: 'srgb' } });
  const p3 = convert(color, $value.colorSpace, { inGamut: { space: 'p3' } });
  const rec2020 = convert(color, $value.colorSpace, { inGamut: { space: 'rec2020' } });
  if (typeof depth === 'number' && !DEPTH_ROUNDING[depth]) {
    throw new Error(`Invalid bit depth: ${depth}. Supported values: ${Object.keys(DEPTH_ROUNDING).join(', ')}`);
  }
  const precision = DEPTH_ROUNDING[depth as keyof typeof DEPTH_ROUNDING] || undefined;
  return {
    '.': serialize(color, { precision }),
    srgb: serialize(srgb, { precision }),
    p3: serialize(p3, { precision }),
    rec2020: serialize(rec2020, { precision }),
  };
}
