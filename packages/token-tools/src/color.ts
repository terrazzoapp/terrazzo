import {
  A98RGB,
  type ColorConstructor,
  ColorSpace as ColorJS,
  type Coords,
  HSL,
  HWB,
  inGamut,
  Lab,
  Lab_D65,
  LCH,
  OKLab,
  OKLCH,
  Okhsv,
  P3,
  type PlainColorObject,
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

/** Complete list of CSS Module 4 color spaces */
export const COLOR_SPACE: Record<ColorSpace, ColorJS> = {
  'a98-rgb': A98RGB,
  'display-p3': P3,
  hsl: HSL,
  hwb: HWB,
  lab: Lab,
  'lab-d65': Lab_D65,
  lch: LCH,
  okhsv: Okhsv,
  oklab: OKLab,
  oklch: OKLCH,
  'prophoto-rgb': ProPhoto,
  rec2020: REC_2020,
  srgb: sRGB,
  'srgb-linear': sRGB_Linear,
  xyz: XYZ_D65,
  'xyz-d50': XYZ_D50,
  'xyz-d65': XYZ_D65,
};

const COLOR_ID_TO_SPACE: Record<string, ColorJS> = {};
for (const s of Object.values(COLOR_SPACE)) {
  ColorJS.register(s);
  COLOR_ID_TO_SPACE[s.id] = s;
  for (const alias of s.aliases ?? []) {
    COLOR_ID_TO_SPACE[alias] = s;
  }
}

/** Parse any color */
export function parseColor(color: string): ColorValueNormalized {
  const result = parse(color);
  const value: ColorValueNormalized = {
    colorSpace: COLOR_ID_TO_SPACE[result.spaceId]!.cssId as ColorSpace,
    components: result.coords,
    alpha: result.alpha ?? 1,
  };
  if (!inGamut(result, 'srgb')) {
    value.hex = serialize(result, { format: 'hex' });
  }
  return value;
}

/** Convert a color token to a Color.js color */
export function tokenToColor(value: ColorValueNormalized): ColorConstructor & PlainColorObject {
  const space = COLOR_SPACE[value.colorSpace];
  if (!space) {
    throw new Error(`Invalid color space "${value.colorSpace}".`);
  }
  return {
    spaceId: space.id,
    space: space,
    coords: value.components as Coords,
    alpha: value.alpha,
  };
}
