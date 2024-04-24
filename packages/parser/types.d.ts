import type { ObjectNode } from '@humanwhocodes/momoa';

export interface TokenCore<E extends {} = Record<string, unknown>> {
  $description?: string;
  $extensions?: E;
}

export type Token =
  | BooleanToken
  | BorderToken
  | ColorToken
  | CubicBézierToken
  | DimensionToken
  | DurationToken
  | FontFamilyToken
  | FontWeightToken
  | GradientToken
  | LinkToken
  | NumberToken
  | ShadowToken
  | StringToken
  | StringToken
  | TransitionToken
  | TypographyToken
  | StrokeStyleToken;

export type AliasValue = string;

/**
 * 8.? Boolean (beta)
 */
export interface BooleanToken extends TokenCore {
  $type: 'boolean';
  $value: BooleanValue | AliasValue;
}

export type BooleanValue = boolean;

/**
 * 9.3 Border
 */
export interface BorderToken extends TokenCore {
  $type: 'border';
  $value: BorderValue | AliasValue;
}

export interface BorderValue {
  color: ColorValue | AliasValue;
  width: DimensionValue | AliasValue;
  style: StrokeStyleValue | AliasValue;
}

/**
 * 8.1 Color
 */
export interface ColorToken extends TokenCore {
  $type: 'color';
  $value: ColorValue | AliasValue;
}

export type ColorValue = AliasValue | string;

export interface CubicBézierToken extends TokenCore {
  $type: 'cubicBezier';
  $value: CubicBézierValue | AliasValue;
}

export type CubicBézierValue = [number, number, number, number];

/**
 * 8.2 Dimension
 */
export interface DimensionToken extends TokenCore {
  $type: 'dimension';
  $value: string | AliasValue;
}

export type DimensionValue = `${number}px` | `${number}em` | `${number}rem`;

/**
 * 8.5 Duration
 */
export interface DurationToken extends TokenCore {
  $type: 'duration';
  $value: string | AliasValue;
}

export type DurationValue = `${number}ms` | `${number}s`;

/**
 * 9.6 Gradient
 */
export interface GradientToken extends TokenCore {
  $type: 'gradient';
  $value: GradientValue | AliasValue;
}

export type GradientValue = GradientStop[];

export interface GradientStop {
  color: ColorValue | AliasValue;
  position: NumberValue | AliasValue;
}

/**
 * 8.3 Font Family
 */
export interface FontFamilyToken extends TokenCore {
  $type: 'fontFamily';
  $value: FontFamilyValue | AliasValue;
}

export type FontFamilyValue = string | string[];

/**
 * 8.4 Font Weight
 */
export interface FontWeightToken extends TokenCore {
  $type: 'fontWeight';
  $value: FontWeightValue | AliasValue;
}

export type FontWeightValue =
  | 'thin'
  | 'hairline'
  | 'extra-light'
  | 'ultra-light'
  | 'light'
  | 'normal'
  | 'regular'
  | 'book'
  | 'medium'
  | 'semi-bold'
  | 'demi-bold'
  | 'bold'
  | 'extra-bold'
  | 'ultra-bold'
  | 'black'
  | 'heavy'
  | 'extra-black'
  | 'ultra-black'
  | number;

/**
 * 8.? Link (beta)
 */
export interface LinkToken extends TokenCore {
  $type: 'link';
  $value: LinkValue | AliasValue;
}

export type LinkValue = string;

/**
 * 8.7 Number
 */
export interface NumberToken extends TokenCore {
  $type: 'number';
  $value: NumberValue | AliasValue;
}

export type NumberValue = number;

/**
 * 8.? String (beta)
 */
export interface StringToken extends TokenCore {
  $type: 'string';
  $value: StringValue | AliasValue;
}

export type StringValue = string;

/**
 * 9.2 Stroke Style
 */
export interface StrokeStyleToken extends TokenCore {
  $type: 'strokeStyle';
  $value: StrokeStyleValue | AliasValue;
}

export type StrokeStyleValue =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'outset'
  | 'inset'
  | StrokeStyleValueExpanded;

export interface StrokeStyleValueExpanded {
  dashArray: DimensionValue[];
  lineCap: 'round' | 'butt' | 'square';
}

/**
 * 9.5 Shadow
 */
export interface ShadowToken extends TokenCore {
  $type: 'shadow';
  $value: ShadowValue | ShadowValue[] | AliasValue;
}

export interface ShadowValue {
  color: ColorValue | AliasValue;
  offsetX: DimensionValue | AliasValue;
  offsetY: DimensionValue | AliasValue;
  blur?: DimensionValue | AliasValue;
  spread?: DimensionValue | AliasValue;
}

/**
 * 9.4 Transition
 */
export interface TransitionToken extends TokenCore {
  $type: 'transition';
  $value: TransitionValue | AliasValue;
}

export interface TransitionValue {
  duration: DurationValue | AliasValue;
  delay: DurationValue | AliasValue;
  timingFunction: CubicBézierValue | AliasValue;
}

/**
 * 9.7 Typography
 */
export interface TypographyToken extends TokenCore {
  $type: 'typography';
  $value: TypographyValue | AliasValue;
}

export interface TypographyValue {
  fontFamily?: FontFamilyValue | AliasValue;
  fontSize?: DimensionValue | AliasValue;
  fontStyle?: string;
  fontVariant?: string;
  fontVariantAlternatives?: string;
  fontVariantCaps?: string;
  fontVariantEastAsian?: string;
  fontVariantEmoji?: string;
  fontVariantLigatures?: string;
  fontVariantNumeric?: string;
  fontVariantPosition?: string;
  fontVariationSettings?: string;
  fontWeight?: FontWeightValue | AliasValue;
  letterSpacing?: DimensionValue | AliasValue;
  lineHeight?: DimensionValue | NumberValue | AliasValue;
  textDecoration?: string;
  textTransform?: string;
  [key: string]: any;
}

export interface GroupCore {
  $description?: string;
  $type?: Token['$type'];
  $extensions?: Record<string, unknown>;
}

export type Group = GroupCore & { [key: string]: GroupOrToken };

export type GroupOrToken = Group | Token;

export interface TokenNormalizedCore {
  $description?: string;
  $extensions?: Record<string, unknown>;
  id: string;
  sourceNode: ObjectNode;
  group: {
    $description?: string;
    $extensions?: Record<string, unknown>;
    id: string;
    tokens: TokenNormalized[];
  };
}

export type TokenNormalized =
  | BooleanTokenNormalized
  | BorderTokenNormalized
  | ColorTokenNormalized
  | CubicBézierTokenNormalized
  | DimensionTokenNormalized
  | DurationTokenNormalized
  | FontFamilyTokenNormalized
  | FontWeightTokenNormalized
  | GradientTokenNormalized
  | LinkTokenNormalized
  | NumberTokenNormalized
  | ShadowTokenNormalized
  | StringTokenNormalized
  | StrokeStyleTokenNormalized
  | TransitionTokenNormalized
  | TypographyTokenNormalized;

export interface BooleanTokenNormalized extends TokenNormalizedCore {
  $type: 'boolean';
  $value: BooleanValue;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, BooleanTokenNormalized | undefined>;
  originalValue: BooleanToken;
}

export interface BorderTokenNormalized extends TokenNormalizedCore {
  $type: 'border';
  $value: BorderValueNormalized;
  aliasOf?: string;
  partialAliasOf?: { width?: string; color?: string; style?: string };
  mode: Record<string, BorderTokenNormalized | undefined>;
  originalValue: BorderToken;
}

export interface BorderValueNormalized {
  color: ColorValueNormalized;
  width: DimensionValue;
  style: StrokeStyleValueExpanded;
}

export interface ColorTokenNormalized extends TokenNormalizedCore {
  $type: 'color';
  $value: ColorValueNormalized;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, ColorTokenNormalized | undefined>;
  originalValue: ColorToken;
}

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

export interface CubicBézierTokenNormalized extends TokenNormalizedCore {
  $type: 'cubicBezier';
  $value: CubicBézierValue;
  aliasOf?: string;
  partialAliasOf?: [string | undefined, string | undefined, string | undefined, string | undefined];
  mode: Record<string, CubicBézierTokenNormalized | undefined>;
  originalValue: CubicBézierToken;
}

export interface DimensionTokenNormalized extends TokenNormalizedCore {
  $type: 'dimension';
  $value: DimensionValue;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, DimensionTokenNormalized | undefined>;
  originalValue: DimensionToken;
}

export interface DurationTokenNormalized extends TokenNormalizedCore {
  $type: 'duration';
  $value: DurationValue;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, DurationTokenNormalized | undefined>;
  originalValue: DurationToken;
}

export interface FontFamilyTokenNormalized extends TokenNormalizedCore {
  $type: 'fontFamily';
  $value: FontFamilyValueNormalized;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, FontFamilyTokenNormalized | undefined>;
  originalValue: FontFamilyToken;
}

export type FontFamilyValueNormalized = string[];

export interface FontWeightTokenNormalized extends TokenNormalizedCore {
  $type: 'fontWeight';
  $value: FontWeightValueNormalized;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, FontWeightTokenNormalized | undefined>;
  originalValue: FontWeightToken;
}

export type FontWeightValueNormalized = number;

export interface GradientTokenNormalized extends TokenNormalizedCore {
  $type: 'gradient';
  $value: GradientValueNormalized;
  aliasOf?: string;
  partialAliasOf?: { color?: string; position?: string }[];
  mode: Record<string, GradientTokenNormalized | undefined>;
  originalValue: GradientTokenNormalized;
}

export type GradientValueNormalized = GradientStopNormalized[];

export interface GradientStopNormalized {
  color: ColorValueNormalized;
  position: number;
}

export interface LinkTokenNormalized extends TokenNormalizedCore {
  $type: 'link';
  $value: LinkValue;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, LinkTokenNormalized | undefined>;
  originalValue: LinkToken;
}

export interface NumberTokenNormalized extends TokenNormalizedCore {
  $type: 'number';
  $value: NumberValue;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, NumberTokenNormalized | undefined>;
  originalValue: NumberToken;
}

export interface ShadowTokenNormalized extends TokenNormalizedCore {
  $type: 'shadow';
  $value: ShadowValueNormalized[];
  aliasOf?: string;
  partialAliasOf?: { color?: string; offsetX?: string; offsetY?: string; blur?: string; spread?: string }[];
  mode: Record<string, ShadowTokenNormalized | undefined>;
  originalValue: ShadowToken;
}

export interface ShadowValueNormalized {
  color: ColorValueNormalized;
  offsetX: DimensionValue;
  offsetY: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
}

export interface StringTokenNormalized extends TokenNormalizedCore {
  $type: 'string';
  $value: StringValue;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, StringTokenNormalized | undefined>;
  originalValue: StringTokenNormalized;
}

export interface StrokeStyleTokenNormalized extends TokenNormalizedCore {
  $type: 'strokeStyle';
  $value: StrokeStyleValueExpanded;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: Record<string, StrokeStyleTokenNormalized | undefined>;
  originalValue: StrokeStyleToken;
}

export interface TransitionTokenNormalized extends TokenNormalizedCore {
  $type: 'transition';
  $value: TransitionValueNormalized;
  aliasOf?: string;
  partialAliasOf?: { duration?: string; delay?: string; timingFunction?: string };
  mode: Record<string, TransitionTokenNormalized | undefined>;
  originalValue: TransitionToken;
}

export interface TransitionValueNormalized {
  duration: DurationValue;
  delay: DurationValue;
  timingFunction: CubicBézierValue;
}

export interface TypographyTokenNormalized extends TokenNormalizedCore {
  $type: 'typography';
  $value: TypographyValueNormalized;
  aliasOf?: string;
  partialAliasOf?: {
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
    [key: string]: string | undefined;
  };
  mode: Record<string, TypographyTokenNormalized | undefined>;
  originalValue: TypographyToken;
}

export interface TypographyValueNormalized {
  fontFamily?: FontFamilyValue;
  fontSize?: DimensionValue;
  fontStyle?: string;
  fontVariant?: string;
  fontVariantAlternatives?: string;
  fontVariantCaps?: string;
  fontVariantEastAsian?: string;
  fontVariantEmoji?: string;
  fontVariantLigatures?: string;
  fontVariantNumeric?: string;
  fontVariantPosition?: string;
  fontVariationSettings?: string;
  fontWeight?: FontWeightValue;
  letterSpacing?: DimensionValue;
  lineHeight?: DimensionValue | NumberValue;
  textDecoration?: string;
  textTransform?: string;
  [key: string]: any;
}
