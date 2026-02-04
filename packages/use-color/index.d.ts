import type { ColorValueNormalized } from '@terrazzo/token-tools';
import {
  type A98RGB,
  type HSL,
  type HWB,
  inGamut,
  type Lab,
  type LCH,
  type Okhsl,
  type Okhsv,
  type OKLab,
  type OKLCH,
  type P3,
  type ProPhoto,
  type REC_2020,
  type sRGB,
  type sRGB_Linear,
  type XYZ_D50,
  type XYZ_D65,
} from 'colorjs.io/fn';

export { inGamut };

export type Color =
  | A98RGB
  | HSL
  | HWB
  | Lab
  | LCH
  | Okhsl
  | Okhsv
  | OKLab
  | OKLCH
  | P3
  | ProPhoto
  | REC_2020
  | sRGB
  | sRGB_Linear
  | XYZ_D50
  | XYZ_D65;

export type ColorInput = string | Color | ColorValueNormalized;

/** Culori omits alpha if 1; this adds it */
export declare function withAlpha(color: Color): Color;

/**
 * Clean decimal value by clamping to a certain number of digits, while also
 * avoiding the dreaded JS floating point bug. Also avoids heavy/slow-ish
 * packages like number-precision by just using Number.toFixed() / Number.toPrecision().
 *
 * We don’t want to _just_ use Number.toFixed() because some colorspaces normalize values
 * too 100 or more (LAB/LCH for lightness, or any hue degree). Likewise, we don’t want to
 * just use Number.toPrecision() because for values < 0.01 it just adds inconsistent
 * precision. This method uses a balance of both such that you’ll get equal `precision`
 * depending on the value type.
 *
 * @param {number} value
 * @param {number=5} precision - number of significant digits
 * @param {boolean=true} normalized - is this value normalized to 1? (`false` for hue and LAB/LCH values)
 */
export declare function cleanValue(value: number, normalized?: boolean, precision?: number): string;

/** Primary parse logic */
export declare function parse(color: ColorInput): Color | undefined;

export interface ColorOutput {
  /** Color Module 4 string */
  css: string;
  original: Color;
  /** Preserve current format (Culori) */
  a98: A98RGB;
  hsl: HSL;
  hwb: HWB;
  okhsl: OKHsl;
  okhsv: OKHsv;
  lab: Lab;
  lch: LCH;
  oklab: OKLab;
  okhsl: OKHsl;
  okhsv: OKHsv;
  oklch: OKLCH;
  p3: P3;
  prophoto: ProPhoto;
  rec2020: REC2020_RGB;
  srgb: sRGB;
  srgbLinear: sRGB_Linear;
  xyzd50: XYZ_D50;
  xyzd65: XYZ_D65;
}

/**
 * Given a color string, create a Proxy that converts colors to any desired
 * format once, and only once. Also, yes! You can use this outside of React
 * context.
 */
export declare function createMemoizedColor(color: ColorInput): ColorOutput;

/** memoize Culori colors and reduce unnecessary updates */
export default function useColor(
  color: ColorInput,
): [ColorOutput, (newColor: ColorInput | ((value: ColorOutput) => string | Color)) => void];
