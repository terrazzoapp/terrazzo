import 'culori/css';
import { type Color, parse } from 'culori/fn';

export interface ColorValueNormalized {
  /** Colorspace (default: `srgb`) @see https://www.w3.org/TR/css-color-4/#predefined */
  colorSpace: ColorSpace;
  /** Color channels. Will be normalized to 1 unless the colorspace prevents it (e.g. XYZ, LAB) */
  channels: [number, number, number];
  /** Alpha channel, normalized from 0 – 1 */
  alpha: number;
}

export type ColorSpace =
  | 'a98'
  | 'display-p3'
  | 'hsb'
  | 'hsl'
  | 'hsv'
  | 'hwb'
  | 'lab'
  | 'lch'
  | 'oklab'
  | 'oklch'
  | 'prophoto-rgb'
  | 'rec2020'
  | 'srgb-linear'
  | 'srgb'
  | 'xyz-d50'
  | 'xyz-d65';

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

export const CSS_TO_CULORI: Record<string, string> = {};
for (const k in CULORI_TO_CSS) {
  CSS_TO_CULORI[CULORI_TO_CSS[k as keyof typeof CULORI_TO_CSS]] = k;
}

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
