import { type Color, displayable, formatCss, formatHex, formatHex8, toGamut } from 'culori/fn';
import { parseColor, tokenToCulori } from '../color.js';
import type { ColorTokenNormalized } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

export type WideGamutColorValue = { '.': string; srgb: string; p3: string; rec2020: string };

/** Convert color value to CSS string */
export function transformColor(
  token: ColorTokenNormalized,
  options: TransformCSSValueOptions,
): string | WideGamutColorValue {
  const { transformAlias = defaultAliasTransform, tokensSet } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }

  const {
    colorSpace,
    channels,
    alpha = 1,
  } = typeof token.$value === 'string' ? parseColor(token.$value) : token.$value;
  const color = tokenToCulori({ colorSpace, channels, alpha });

  if (!color) {
    throw new Error(`Can’t convert color ${JSON.stringify(token.$value)} to Culori color`);
  }

  let formatColor: (color: Color) => string = formatCss;
  if (options.color?.legacyHex) {
    formatColor = color.alpha !== 1 ? formatHex8 : formatHex;
  }

  return displayable(color)
    ? formatColor(color)
    : {
        '.': formatColor(color),
        srgb:
          (typeof token.$value === 'object' && token.$value.hex) ||
          formatColor(toGamut('rgb', 'oklch')(color) as Color),
        p3: formatColor(toGamut('p3', 'oklch')(color) as Color),
        rec2020: formatColor(toGamut('rec2020', 'oklch')(color) as Color),
      };
}
