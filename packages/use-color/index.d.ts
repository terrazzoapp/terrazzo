import type { ColorValueNormalized } from '@terrazzo/token-tools';
import { inGamut } from 'culori/fn';

export { inGamut };

// note: redeclared color types are compatible with Culori, but stricter (for our purposes)
export type A98 =      { mode: 'a98';      readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Hsl =      { mode: 'hsl';      readonly h: number; readonly s: number; readonly l: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Hsv =      { mode: 'hsv';      readonly h: number; readonly s: number; readonly v: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Hwb =      { mode: 'hwb';      readonly h: number; readonly w: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Lab =      { mode: 'lab';      readonly l: number; readonly a: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Lch =      { mode: 'lch';      readonly l: number; readonly c: number; readonly h: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Lrgb =     { mode: 'lrgb';     readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Okhsl =    { mode: 'okhsl';    readonly h: number; readonly s: number; readonly l: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Okhsv =    { mode: 'okhsv';    readonly h: number; readonly s: number; readonly v: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Oklab =    { mode: 'oklab';    readonly l: number; readonly a: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Oklch =    { mode: 'oklch';    readonly l: number; readonly c: number; readonly h: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type P3 =       { mode: 'p3';       readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Prophoto = { mode: 'prophoto'; readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Rec2020 =  { mode: 'rec2020';  readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Rgb =      { mode: 'rgb';      readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Xyz50 =    { mode: 'xyz50';    readonly x: number; readonly y: number; readonly z: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Xyz65 =    { mode: 'xyz65';    readonly x: number; readonly y: number; readonly z: number; readonly alpha: number }; // biome-ignore format: repetitive strings

export type Color = A98 | Hsl | Hsv | Hwb | Lab | Lch | Lrgb | Okhsl | Okhsv | Oklab | Oklch | P3 | Prophoto | Rec2020 | Rgb | Xyz50 | Xyz65; // biome-ignore format: repetitive strings

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

// biome-ignore format: repetitive strings
export declare const COLORSPACES: {
  a98:      { converter: (color: ColorInput) => A98 }; // biome-ignore format: repetitive strings
  hsl:      { converter: (color: ColorInput) => Hsl }; // biome-ignore format: repetitive strings
  hsv:      { converter: (color: ColorInput) => Hsv }; // biome-ignore format: repetitive strings
  hwb:      { converter: (color: ColorInput) => Hwb }; // biome-ignore format: repetitive strings
  lab:      { converter: (color: ColorInput) => Lab }; // biome-ignore format: repetitive strings
  lch:      { converter: (color: ColorInput) => Lch }; // biome-ignore format: repetitive strings
  lrgb:     { converter: (color: ColorInput) => Lrgb }; // biome-ignore format: repetitive strings
  okhsl:    { converter: (color: ColorInput) => Okhsl }; // biome-ignore format: repetitive strings
  okhsv:    { converter: (color: ColorInput) => Okhsv }; // biome-ignore format: repetitive strings
  oklab:    { converter: (color: ColorInput) => Oklab }; // biome-ignore format: repetitive strings
  oklch:    { converter: (color: ColorInput) => Oklch }; // biome-ignore format: repetitive strings
  p3:       { converter: (color: ColorInput) => P3 }; // biome-ignore format: repetitive strings
  prophoto: { converter: (color: ColorInput) => Prophoto }; // biome-ignore format: repetitive strings
  rec2020:  { converter: (color: ColorInput) => Rec2020 }; // biome-ignore format: repetitive strings
  rgb:      { converter: (color: ColorInput) => Rgb }; // biome-ignore format: repetitive strings
  srgb:     { converter: (color: ColorInput) => Rgb }; // biome-ignore format: repetitive strings
  xyz:      { converter: (color: ColorInput) => Xyz65 }; // biome-ignore format: repetitive strings
  xyz50:    { converter: (color: ColorInput) => Xyz50 }; // biome-ignore format: repetitive strings
  xyz65:    { converter: (color: ColorInput) => Xyz65 }; // biome-ignore format: repetitive strings
};

export interface ColorOutput {
  /** Color Module 4 string */
  css: string;
  original: Color;
  /** Preserve current format (Culori) */
  a98: A98;
  hsl: Hsl;
  hsv: Hsv;
  hwb: Hwb;
  lrgb: Lrgb;
  okhsl: Okhsl;
  okhsv: Okhsv;
  oklab: Oklab;
  p3: P3;
  prophoto: Prophoto;
  rec2020: Rec2020;
  rgb: Rgb;
  srgb: Rgb;
  xyz: Xyz65;
  xyz50: Xyz50;
  xyz65: Xyz65;
}

/**
 * Format a Color as a CSS string
 */
export declare function formatCss(
  color: ColorInput,
  options?: {
    /** Number.toPrecision() parameter (default: 3) */
    precision: number;
  },
): string | undefined;

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
