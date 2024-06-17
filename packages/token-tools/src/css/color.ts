import { clampChroma, type Color, formatCss, displayable } from 'culori';
import { CSS_TO_CULORI, parseColor } from '../color.js';
import type { ColorValue } from '../types.js';
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

  const { colorSpace, channels, alpha } = typeof value === 'string' ? parseColor(value) : value;
  const color = { mode: CSS_TO_CULORI[colorSpace], alpha } as Color;
  switch (color.mode) {
    case 'a98':
    case 'rec2020':
    case 'p3':
    case 'prophoto':
    case 'lrgb':
    case 'rgb': {
      color.r = channels[0];
      color.g = channels[1];
      color.b = channels[2];
      break;
    }
    case 'hsl': {
      color.h = channels[0];
      color.s = channels[1];
      color.l = channels[2];
      break;
    }
    case 'hsv': {
      color.h = channels[0];
      color.s = channels[1];
      color.v = channels[2];
      break;
    }
    case 'hwb': {
      color.h = channels[0];
      color.w = channels[1];
      color.b = channels[2];
      break;
    }
    case 'lab':
    case 'oklab': {
      color.l = channels[0];
      color.a = channels[1];
      color.b = channels[2];
      break;
    }
    case 'lch':
    case 'oklch': {
      color.l = channels[0];
      color.c = channels[1];
      color.h = channels[2];
      break;
    }
    case 'xyz50':
    case 'xyz65': {
      color.x = channels[0];
      color.y = channels[1];
      color.z = channels[2];
      break;
    }
  }

  return displayable(color)
    ? formatCss(color)
    : {
        '.': formatCss(color),
        srgb: (typeof value === 'object' && value.hex) || formatCss(clampChroma(color, color.mode, 'rgb')),
        p3: formatCss(clampChroma(color, color.mode, 'p3')),
        rec2020: formatCss(clampChroma(color, color.mode, 'rec2020')),
      };
}
