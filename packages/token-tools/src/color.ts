import 'culori/css';
import { type Color, parse } from 'culori/fn';
import type { ColorSpace, ColorTokenNormalized, ColorValueNormalized } from './types.js';

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
  return {
    colorSpace,
    channels,
    alpha: result.alpha ?? 1,
  };
}

/** Convert a color token to a Culori color */
export function tokenToCulori(token: ColorTokenNormalized): Color | undefined {
  if (token.$type !== 'color') {
    return undefined;
  }

  switch (token.$value.colorSpace) {
    case 'a98':
    case 'display-p3':
    case 'prophoto-rgb':
    case 'rec2020':
    case 'srgb':
    case 'srgb-linear': {
      const [r, g, b] = token.$value.channels;
      return {
        mode: CSS_TO_CULORI[token.$value.colorSpace] || token.$value.colorSpace,
        r,
        g,
        b,
        alpha: token.$value.alpha,
      } as Color;
    }
    case 'hsl': {
      const [h, s, l] = token.$value.channels;
      return { mode: 'hsl', h, s, l, alpha: token.$value.alpha };
    }
    case 'hsv': {
      const [h, s, v] = token.$value.channels;
      return { mode: 'hsv', h, s, v, alpha: token.$value.alpha };
    }
    case 'hwb': {
      const [h, w, b] = token.$value.channels;
      return { mode: 'hwb', h, w, b, alpha: token.$value.alpha };
    }
    case 'lab':
    case 'oklab': {
      const [l, a, b] = token.$value.channels;
      return { mode: token.$value.colorSpace, l, a, b, alpha: token.$value.alpha };
    }
    case 'lch':
    case 'oklch': {
      const [l, c, h] = token.$value.channels;
      return { mode: token.$value.colorSpace, l, c, h, alpha: token.$value.alpha };
    }
    case 'xyz-d50': {
      const [x, y, z] = token.$value.channels;
      return { mode: 'xyz50', x, y, z, alpha: token.$value.alpha };
    }
    case 'xyz-d65': {
      const [x, y, z] = token.$value.channels;
      return { mode: 'xyz65', x, y, z, alpha: token.$value.alpha };
    }
  }
}
