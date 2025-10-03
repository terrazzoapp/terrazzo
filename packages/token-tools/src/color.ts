import 'culori/css';
import { type Color, formatHex, parse } from 'culori/fn';
import type { ColorSpace, ColorValueNormalized } from './types.js';

const HEX_RE = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;

export const CULORI_TO_CSS: Record<
  Extract<
    Color['mode'],
    | 'a98'
    | 'lab'
    | 'lab65'
    | 'lch'
    | 'oklab'
    | 'oklch'
    | 'okhsv'
    | 'hsl'
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
  a98: 'a98-rgb',
  hsl: 'hsl',
  hwb: 'hwb',
  lab: 'lab',
  lab65: 'lab-d65',
  lch: 'lch',
  lrgb: 'srgb-linear',
  oklab: 'oklab',
  oklch: 'oklch',
  okhsv: 'okhsv',
  p3: 'display-p3',
  prophoto: 'prophoto-rgb',
  rec2020: 'rec2020',
  rgb: 'srgb',
  xyz50: 'xyz-d50',
  xyz65: 'xyz-d65',
} as const;

export const CSS_TO_CULORI = {
  'a98-rgb': 'a98',
  'display-p3': 'p3',
  hsl: 'hsl',
  hwb: 'hwb',
  lab: 'lab',
  'lab-d65': 'lab65',
  lch: 'lch',
  oklab: 'oklab',
  oklch: 'oklch',
  okhsv: 'okhsv',
  'prophoto-rgb': 'prophoto',
  rec2020: 'rec2020',
  srgb: 'rgb',
  'srgb-linear': 'lrgb',
  xyz: 'xyz65',
  'xyz-d50': 'xyz50',
  'xyz-d65': 'xyz65',
} as const;

/** Parse any color */
export function parseColor(color: string): ColorValueNormalized {
  const result = parse(color);
  if (!result) {
    throw new Error(`Unable to parse color "${color}"`);
  }
  if (!(result.mode in CULORI_TO_CSS)) {
    throw new Error(`Unsupported color space: ${result.mode}`);
  }
  const colorSpace = CULORI_TO_CSS[result.mode as keyof typeof CULORI_TO_CSS]!;
  let components: [number, number, number] = [0, 0, 0];
  switch (result.mode) {
    case 'a98':
    case 'rec2020':
    case 'p3':
    case 'prophoto':
    case 'lrgb':
    case 'rgb': {
      components = [result.r, result.g, result.b];
      break;
    }
    case 'hsl': {
      const maxS = COLORSPACE[colorSpace].ranges[1]?.[1] ?? 1.0;
      const maxL = COLORSPACE[colorSpace].ranges[2]?.[1] ?? 1.0;
      components = [result.h ?? 0, result.s * maxS, result.l * maxL];
      break;
    }
    case 'hwb': {
      const maxW = COLORSPACE[colorSpace].ranges[1]?.[1] ?? 1.0;
      const maxB = COLORSPACE[colorSpace].ranges[2]?.[1] ?? 1.0;
      components = [result.h ?? 0, result.w * maxW, result.b * maxB];
      break;
    }
    case 'lab':
    case 'lab65':
    case 'oklab': {
      components = [result.l, result.a, result.b];
      break;
    }
    case 'lch':
    case 'oklch': {
      components = [result.l, result.c, result.h ?? 0];
      break;
    }
    case 'okhsv': {
      components = [result.h ?? 0, result.s, result.v];
      break;
    }
    case 'xyz50':
    case 'xyz65': {
      components = [result.x, result.y, result.z];
      break;
    }
  }
  const value: ColorValueNormalized = {
    colorSpace,
    components,
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
    case 'a98-rgb':
    case 'display-p3':
    case 'prophoto-rgb':
    case 'rec2020':
    case 'srgb':
    case 'srgb-linear': {
      const [r, g, b] = value.components;
      return {
        mode: CSS_TO_CULORI[value.colorSpace] || value.colorSpace,
        r,
        g,
        b,
        alpha: value.alpha,
      } as Color;
    }
    case 'hsl': {
      const [h, s, l] = value.components;
      const maxS = COLORSPACE[value.colorSpace].ranges[1]?.[1] ?? 1;
      const maxL = COLORSPACE[value.colorSpace].ranges[2]?.[1] ?? 1;
      return { mode: 'hsl', h: h!, s: s! / maxS, l: l! / maxL, alpha: value.alpha };
    }
    case 'hwb': {
      const [h, w, b] = value.components;
      const maxW = COLORSPACE[value.colorSpace].ranges[1]?.[1] ?? 1;
      const maxB = COLORSPACE[value.colorSpace].ranges[2]?.[1] ?? 1;
      return { mode: 'hwb', h: h!, w: w! / maxW, b: b! / maxB, alpha: value.alpha };
    }
    case 'lab':
    case 'lab-d65':
    case 'oklab': {
      const [l = 0, a = 0, b = 0] = value.components;
      const mode = value.colorSpace === 'lab-d65' ? 'lab65' : value.colorSpace;
      return { mode, l: l!, a: a!, b: b!, alpha: value.alpha };
    }
    case 'lch':
    case 'oklch': {
      const [l, c, h] = value.components;
      return { mode: value.colorSpace, l: l!, c: c!, h: h!, alpha: value.alpha };
    }
    case 'okhsv': {
      const [h, s, v] = value.components;
      return { mode: value.colorSpace, h: h!, s: s!, v: v!, alpha: value.alpha };
    }
    case 'xyz':
    case 'xyz-d50':
    case 'xyz-d65': {
      const [x, y, z] = value.components;
      return { mode: CSS_TO_CULORI[value.colorSpace], x: x!, y: y!, z: z!, alpha: value.alpha };
    }
    default: {
      throw new Error(
        `Invalid colorSpace "${value.colorSpace}". Expected one of ${Object.keys(CSS_TO_CULORI).join(', ')}`,
      );
    }
  }
}

export interface ColorSpaceDefinition {
  ranges: [min: number, max: number][];
}

/** Complete list of CSS Module 4 Colorspaces */
export const COLORSPACE: Record<ColorSpace, ColorSpaceDefinition> = {
  'a98-rgb': {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  'display-p3': {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  hsl: {
    ranges: [
      [0.0, 360.0],
      [0.0, 100.0],
      [0.0, 100.0],
    ],
  },
  hwb: {
    ranges: [
      [0.0, 360.0],
      [0.0, 100.0],
      [0.0, 100.0],
    ],
  },
  lab: {
    ranges: [
      [0.0, 100.0],
      [-125.0, 125.0],
      [-125.0, 125.0],
    ],
  },
  'lab-d65': {
    ranges: [
      [0.0, 100.0],
      [-125.0, 125.0],
      [-125.0, 125.0],
    ],
  },
  lch: {
    ranges: [
      [0.0, 100.0],
      [0, 150.0],
      [0.0, 360.0],
    ],
  },
  oklab: {
    ranges: [
      [0.0, 1.0],
      [-0.4, 0.4],
      [-0.4, 0.4],
    ],
  },
  oklch: {
    ranges: [
      [0.0, 1.0],
      [0.0, 0.4],
      [0.0, 360.0],
    ],
  },
  okhsv: {
    ranges: [
      [0.0, 360.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  'prophoto-rgb': {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  rec2020: {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  srgb: {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  'srgb-linear': {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  'xyz-d50': {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  xyz: {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
  'xyz-d65': {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
};
