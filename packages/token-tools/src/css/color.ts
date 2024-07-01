import { type Color, displayable, formatCss, toGamut } from 'culori';
import { parseColor, tokenToCulori } from '../color.js';
import type { ColorTokenNormalized, ColorValue } from '../types.js';
import { type IDGenerator, defaultAliasTransform } from './lib.js';

export type WideGamutColorValue = { '.': string; srgb: string; p3: string; rec2020: string };

/** Convert color value to CSS string */
export function transformColorValue(
  value: string | ColorValue,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string | WideGamutColorValue {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }

  const { colorSpace, channels, alpha = 1 } = typeof value === 'string' ? parseColor(value) : value;
  const color = tokenToCulori({
    $type: 'color',
    $value: { colorSpace, channels, alpha },
    mode: { '.': { $type: 'color', $value: { colorSpace, channels, alpha } } },
  } as unknown as ColorTokenNormalized);

  if (!color) {
    throw new Error(`Can’t convert color ${JSON.stringify(value)} to Culori color`);
  }

  return displayable(color)
    ? formatCss(color)
    : {
        '.': formatCss(color),
        srgb: (typeof value === 'object' && value.hex) || formatCss(toGamut('rgb', 'oklch')(color) as Color),
        p3: formatCss(toGamut('p3', 'oklch')(color) as Color),
        rec2020: formatCss(toGamut('rec2020', 'oklch')(color) as Color),
      };
}
