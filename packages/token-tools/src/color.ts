import {
  A98RGB,
  type ColorConstructor,
  ColorSpace as ColorJS,
  type Coords,
  to as convert,
  HSL,
  HWB,
  Lab,
  Lab_D65,
  LCH,
  OKLab,
  OKLCH,
  Okhsl,
  Okhsv,
  P3,
  ProPhoto,
  parse,
  REC_2020,
  serialize,
  sRGB,
  sRGB_Linear,
  XYZ_D50,
  XYZ_D65,
} from 'colorjs.io/fn';
import type { ColorSpace, ColorValueNormalized } from './types.js';

const HEX_RE = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;

ColorJS.register(A98RGB);
ColorJS.register(HSL);
ColorJS.register(HWB);
ColorJS.register(Lab_D65);
ColorJS.register(Lab);
ColorJS.register(LCH);
ColorJS.register(Okhsl);
ColorJS.register(Okhsv);
ColorJS.register(OKLab);
ColorJS.register(OKLCH);
ColorJS.register(P3);
ColorJS.register(ProPhoto);
ColorJS.register(REC_2020);
ColorJS.register(sRGB_Linear);
ColorJS.register(sRGB);
ColorJS.register(XYZ_D50);
ColorJS.register(XYZ_D65);

const CSS_ID_TO_COLOR_ID: Record<string, string | undefined> = {
  'a98-rgb': 'a98rgb',
  'display-p3': 'p3',
  'prophoto-rgb': 'prophoto',
};

const COLOR_ID_TO_CSS_ID = Object.fromEntries(Object.entries(CSS_ID_TO_COLOR_ID).map(([k, v]) => [v, k]));

/** Parse any color */
export function parseColor(color: string): ColorValueNormalized {
  const result = parse(color);
  const value: ColorValueNormalized = {
    colorSpace: COLOR_ID_TO_CSS_ID[result.spaceId] || (result.spaceId as ColorSpace),
    components: result.coords,
    alpha: result.alpha ?? 1,
  };
  if (HEX_RE.test(color)) {
    // Note: this intentionally does NOT include alpha; it’s already in alpha.
    // Always use formatHex (not formatHex8).
    const srgb =
      result.spaceId !== 'srgb' ? convert({ ...result, alpha: undefined }, 'sRGB') : { ...result, alpha: undefined };
    value.hex = serialize(srgb, { inGamut: true, format: 'hex' });
  }
  return value;
}

/** Convert a color token to a Color.js color */
export function tokenToColor(value: ColorValueNormalized): ColorConstructor {
  return {
    spaceId: CSS_ID_TO_COLOR_ID[value.colorSpace] || value.colorSpace,
    coords: value.components as Coords,
    alpha: value.alpha,
  };
}

export interface ColorSpaceDefinition {
  ranges: [min: number, max: number][];
}

/** Complete list of CSS Module 4 color spaces */
export const COLOR_SPACE: Record<ColorSpace, ColorSpaceDefinition> = {
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
  okhsv: {
    ranges: [
      [0.0, 360.0],
      [0.0, 1.0],
      [0.0, 1.0],
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
  xyz: {
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
  'xyz-d65': {
    ranges: [
      [0.0, 1.0],
      [0.0, 1.0],
      [0.0, 1.0],
    ],
  },
};
