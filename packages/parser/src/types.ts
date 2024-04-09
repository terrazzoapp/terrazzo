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
  _group: {
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
  alias?: BooleanTokenNormalized;
  mode: Record<string, BooleanTokenNormalized | undefined>;
  _original: BooleanToken;
}

export interface BorderTokenNormalized extends TokenNormalizedCore {
  $type: 'border';
  alias?: BorderTokenNormalized;
  $value: BorderValueNormalized;
  mode: Record<string, BorderTokenNormalized | undefined>;
  _original: BorderToken;
}

export interface BorderValueNormalized {
  color: ColorValueNormalized;
  width: DimensionValue;
  style: StrokeStyleValueExpanded;
}

export interface ColorTokenNormalized {
  alias?: ColorTokenNormalized;
  $type: 'color';
  $value: ColorValueNormalized;
  mode: Record<string, ColorTokenNormalized | undefined>;
  _original: ColorToken;
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
  alias?: CubicBézierToken;
  mode: Record<string, CubicBézierTokenNormalized | undefined>;
  _original: CubicBézierToken;
}

export interface DimensionTokenNormalized extends TokenNormalizedCore {
  $type: 'dimension';
  $value: DimensionValue;
  alias?: Record<string, DimensionTokenNormalized | undefined>;
  mode: Record<string, DimensionTokenNormalized | undefined>;
  _original: DimensionToken;
}

export interface DurationTokenNormalized extends TokenNormalizedCore {
  $type: 'duration';
  $value: DurationValue;
  alias?: DurationTokenNormalized;
  mode: Record<string, DurationTokenNormalized | undefined>;
  _original: DurationToken;
}

export interface FontFamilyTokenNormalized extends TokenNormalizedCore {
  $type: 'fontFamily';
  $value: FontFamilyValueNormalized;
  alias?: FontFamilyTokenNormalized;
  mode: Record<string, FontFamilyTokenNormalized | undefined>;
  _original: FontFamilyToken;
}

export type FontFamilyValueNormalized = string[];

export interface FontWeightTokenNormalized extends TokenNormalizedCore {
  $type: 'fontWeight';
  $value: FontWeightValueNormalized;
  alias?: FontWeightTokenNormalized;
  mode: Record<string, FontWeightTokenNormalized | undefined>;
  _original: FontWeightToken;
}

export type FontWeightValueNormalized = number;

export interface GradientTokenNormalized extends TokenNormalizedCore {
  $type: 'gradient';
  $value: GradientValueNormalized;
  alias?: GradientTokenNormalized;
  mode: Record<string, GradientTokenNormalized | undefined>;
  _original: GradientTokenNormalized;
}

export type GradientValueNormalized = GradientStopNormalized[];

export interface GradientStopNormalized {
  color: ColorValueNormalized;
  position: number;
}

export interface LinkTokenNormalized extends TokenNormalizedCore {
  $type: 'link';
  $value: LinkValue;
  $alias?: LinkTokenNormalized;
  mode: Record<string, LinkTokenNormalized | undefined>;
  _original: LinkToken;
}

export interface NumberTokenNormalized extends TokenNormalizedCore {
  $type: 'number';
  $value: NumberValue;
  alias?: NumberTokenNormalized;
  mode: Record<string, NumberTokenNormalized | undefined>;
  _original: NumberToken;
}

export interface ShadowTokenNormalized extends TokenNormalizedCore {
  $type: 'shadow';
  $value: ShadowValueNormalized;
  alias?: ShadowTokenNormalized;
  mode: Record<string, ShadowTokenNormalized | undefined>;
  _original: ShadowToken;
}

export interface ShadowValueNormalized {
  color: ColorValueNormalized;
  offsetX: DimensionValue;
  offsetY: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
}

export interface StringTokenNormalized {
  $type: 'strokeStyle';
  $value: StringValue;
  alias?: StringTokenNormalized;
  mode: Record<string, StringTokenNormalized | undefined>;
  _original: StringTokenNormalized;
}

export interface StrokeStyleTokenNormalized {
  $type: 'strokeStyle';
  $value: StrokeStyleValueExpanded;
  alias?: StrokeStyleTokenNormalized;
  mode: Record<string, StrokeStyleTokenNormalized | undefined>;
  _original: StrokeStyleToken;
}

export interface TransitionTokenNormalized extends TokenNormalizedCore {
  $type: 'transition';
  $value: TransitionValueNormalized;
  alias?: TransitionTokenNormalized;
  mode: Record<string, TransitionTokenNormalized | undefined>;
  _original: TransitionToken;
}

export interface TransitionValueNormalized {
  duration: DurationValue;
  delay: DurationValue;
  timingFunction: CubicBézierValue;
}

export interface TypographyTokenNormalized extends TokenNormalizedCore {
  $type: 'typography';
  $value: TypographyValueNormalized;
  alias?: TypographyTokenNormalized;
  mode: Record<string, TypographyTokenNormalized | undefined>;
  _original: TypographyToken;
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
