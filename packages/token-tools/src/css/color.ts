import { type Color, displayable, formatCss, formatHex, formatHex8, toGamut } from 'culori/fn';
import { parseColor, tokenToCulori } from '../color.js';
import type { ColorValue } from '../types.js';
import { type IDGenerator, defaultAliasTransform } from './lib.js';

export type WideGamutColorValue = { '.': string; srgb: string; p3: string; rec2020: string };

/** Convert color value to CSS string */
export function transformColorValue(
  value: string | ColorValue,
  {
    aliasOf,
    transformAlias = defaultAliasTransform,
    color: colorOptions,
  }: { aliasOf?: string; transformAlias?: IDGenerator; color?: { legacyHex?: boolean } } = {},
): string | WideGamutColorValue {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }

  const { colorSpace, channels, alpha = 1 } = typeof value === 'string' ? parseColor(value) : value;
  const color = tokenToCulori({ colorSpace, channels, alpha });

  if (!color) {
    throw new Error(`Can’t convert color ${JSON.stringify(value)} to Culori color`);
  }

  let formatColor: (color: Color) => string = formatCss;
  if (colorOptions?.legacyHex) {
    formatColor = color.alpha !== 1 ? formatHex8 : formatHex;
  }

  return displayable(color)
    ? formatColor(color)
    : {
        '.': formatColor(color),
        srgb: (typeof value === 'object' && value.hex) || formatColor(toGamut('rgb', 'oklch')(color) as Color),
        p3: formatColor(toGamut('p3', 'oklch')(color) as Color),
        rec2020: formatColor(toGamut('rec2020', 'oklch')(color) as Color),
      };
}
