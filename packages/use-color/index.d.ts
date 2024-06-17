import { inGamut } from 'culori/fn';

export { inGamut };

// note: redeclared color types are compatible with Culori, but stricter (for our purposes)
export type A98 =      readonly { readonly mode: 'a98';      readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Hsl =      readonly { readonly mode: 'hsl';      readonly h: number; readonly s: number; readonly l: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Hsv =      readonly { readonly mode: 'hsv';      readonly h: number; readonly s: number; readonly v: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Hwb =      readonly { readonly mode: 'hwb';      readonly h: number; readonly w: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Lab =      readonly { readonly mode: 'lab';      readonly l: number; readonly a: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Lch =      readonly { readonly mode: 'lch';      readonly l: number; readonly c: number; readonly h: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Lrgb =     readonly { readonly mode: 'lrgb';     readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Okhsl =    readonly { readonly mode: 'okhsl';    readonly h: number; readonly s: number; readonly l: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Okhsv =    readonly { readonly mode: 'okhsv';    readonly h: number; readonly s: number; readonly v: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Oklab =    readonly { readonly mode: 'oklab';    readonly l: number; readonly a: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Oklch =    readonly { readonly mode: 'oklch';    readonly l: number; readonly c: number; readonly h: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type P3 =       readonly { readonly mode: 'p3';       readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Prophoto = readonly { readonly mode: 'prophoto'; readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Rec2020 =  readonly { readonly mode: 'rec2020';  readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Rgb =      readonly { readonly mode: 'rgb';      readonly r: number; readonly g: number; readonly b: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Xyz50 =    readonly { readonly mode: 'xyz50';    readonly x: number; readonly y: number; readonly z: number; readonly alpha: number }; // biome-ignore format: repetitive strings
export type Xyz65 =    readonly { readonly mode: 'xyz65';    readonly x: number; readonly y: number; readonly z: number; readonly alpha: number }; // biome-ignore format: repetitive strings

export type Color = A98 | Hsl | Hsv | Hwb | Lab | Lch | Lrgb | Okhsl | Okhsv | Oklab | Oklch | P3 | Prophoto | Rec2020 | Rgb | Xyz50 | Xyz65; // biome-ignore format: repetitive strings

export type ColorInput = string | Color;

export declare function parse(color: ColorInput): Color | undefined;

export declare function clampChroma(color: ColorInput, mode: Color['mode'], gamut: 'rgb' | 'p3' | 'rec2020'): Color;

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
 * Given a color string, create a Proxy that converts colors to any desired
 * format once, and only once. Also, yes! You can use this outside of React
 * context.
 */
export declare function createMemoizedColor(color: ColorInput): ColorOutput;

/**
 * Format a Color as a CSS string
 */
export declare function formatCss(
  color: ColorInput,
  options?: {
    /** Round values to a certain precision (default: 0.001) */
    precision: number;
  },
): string | undefined;

/** memoize Culori colors and reduce unnecessary updates */
export default function useColor(
  color: string | Color,
): [ColorOutput, (newColor: string | Color | ((value: ColorOutpt) => string | Color)) => void];
