import 'culori/css';
import { type Color, formatHex, parse } from 'culori/fn';
import type { ColorSpace, ColorValueNormalized } from './types.js';

const HEX_RE = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;

export const CULORI_TO_CSS: Record<
  Extract<
    Color['mode'],
    | 'a98'
    | 'lab'
    | 'lch'
    | 'oklab'
    | 'oklch'
    | 'hsl'
    | 'hsv'
    | 'hwb'
    | 'lrgb'
    | 'p3'
    | 'prophoto'
    | 'rec2020'
    | 'rgb'
    | 'xyz50'
    | 'xyz65'
  >,
  ColorSpace
> = {
  a98: 'a98',
  hsl: 'hsl',
  hsv: 'hsv',
  hwb: 'hwb',
  lab: 'lab',
  lch: 'lch',
  lrgb: 'srgb-linear',
  oklab: 'oklab',
  oklch: 'oklch',
  p3: 'display-p3',
  prophoto: 'prophoto-rgb',
  rec2020: 'rec2020',
  rgb: 'srgb',
  xyz50: 'xyz-d50',
  xyz65: 'xyz-d65',
};

export const CSS_TO_CULORI = {
  a98: 'a98',
  'display-p3': 'p3',
  hsl: 'hsl',
  hsv: 'hsv',
  hwb: 'hwb',
  lab: 'lab',
  lch: 'lch',
  oklab: 'oklab',
  oklch: 'oklch',
  'prophoto-rgb': 'prophoto',
  rec2020: 'rec2020',
  srgb: 'rgb',
  'srgb-linear': 'lrgb',
  'xyz-d50': 'xyz50',
  'xyz-d65': 'xyz65',
};

/** Parse any color */
export function parseColor(color: string): ColorValueNormalized {
  const result = parse(color);
  if (!result) {
    throw new Error(`Unable to parse color "${color}"`);
  }
  if (!(result.mode in CULORI_TO_CSS)) {
    throw new Error(`Unsupported color space: ${result.mode}`);
  }
  const colorSpace = CULORI_TO_CSS[result.mode as keyof typeof CULORI_TO_CSS];
  let channels: [number, number, number] = [0, 0, 0];
  switch (result.mode) {
    case 'a98':
    case 'rec2020':
    case 'p3':
    case 'prophoto':
    case 'lrgb':
    case 'rgb': {
      channels = [result.r, result.g, result.b];
      break;
    }
    case 'hsl': {
      channels = [result.h ?? 0, result.s, result.l];
      break;
    }
    case 'hsv': {
      channels = [result.h ?? 0, result.s, result.v];
      break;
    }
    case 'hwb': {
      channels = [result.h ?? 0, result.w, result.b];
      break;
    }
    case 'lab':
    case 'oklab': {
      channels = [result.l, result.a, result.b];
      break;
    }
    case 'lch':
    case 'oklch': {
      channels = [result.l, result.c, result.h ?? 0];
      break;
    }
    case 'xyz50':
    case 'xyz65': {
      channels = [result.x, result.y, result.z];
      break;
    }
  }
  const value: ColorValueNormalized = {
    colorSpace,
    channels,
    alpha: result.alpha ?? 1,
  };
  if (HEX_RE.test(color)) {
    // Note: this intentionally does NOT include alpha; it’s already in alpha.
    // Always use formatHex (not formatHex8).
    value.hex = formatHex(result);
  }
  return value;
}

/** Convert a color token to a Culori color */
export function tokenToCulori(value: ColorValueNormalized): Color | undefined {
  switch (value.colorSpace) {
    case 'a98':
    case 'display-p3':
    case 'prophoto-rgb':
    case 'rec2020':
    case 'srgb':
    case 'srgb-linear': {
      const [r, g, b] = value.channels;
      return {
        mode: CSS_TO_CULORI[value.colorSpace] || value.colorSpace,
        r,
        g,
        b,
        alpha: value.alpha,
      } as Color;
    }
    case 'hsl': {
      const [h, s, l] = value.channels;
      return { mode: 'hsl', h, s, l, alpha: value.alpha };
    }
    case 'hsv': {
      const [h, s, v] = value.channels;
      return { mode: 'hsv', h, s, v, alpha: value.alpha };
    }
    case 'hwb': {
      const [h, w, b] = value.channels;
      return { mode: 'hwb', h, w, b, alpha: value.alpha };
    }
    case 'lab':
    case 'oklab': {
      const [l, a, b] = value.channels;
      return { mode: value.colorSpace, l, a, b, alpha: value.alpha };
    }
    case 'lch':
    case 'oklch': {
      const [l, c, h] = value.channels;
      return { mode: value.colorSpace, l, c, h, alpha: value.alpha };
    }
    case 'xyz-d50': {
      const [x, y, z] = value.channels;
      return { mode: 'xyz50', x, y, z, alpha: value.alpha };
    }
    case 'xyz-d65': {
      const [x, y, z] = value.channels;
      return { mode: 'xyz65', x, y, z, alpha: value.alpha };
    }
  }
}
