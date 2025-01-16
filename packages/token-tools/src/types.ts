import type { ObjectNode } from '@humanwhocodes/momoa';

export interface TokenCore<E extends {} = Record<string, unknown>> {
  $description?: string;
  $deprecated?: string | boolean;
  $extensions?: E;
}

export type Token =
  | BooleanToken
  | BorderToken
  | ColorToken
  | CubicBezierToken
  | DimensionToken
  | DurationToken
  | FontFamilyToken
  | FontWeightToken
  | GradientToken
  | LinkToken
  | NumberToken
  | ShadowToken
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

export type ColorValue =
  | string
  | { colorSpace: ColorSpace; channels: [number, number, number]; alpha?: number; hex?: string };

export interface CubicBezierToken extends TokenCore {
  $type: 'cubicBezier';
  $value: CubicBezierValue | AliasValue;
}

export type CubicBezierValue = [number, number, number, number];

/**
 * 8.2 Dimension
 */
export interface DimensionToken extends TokenCore {
  $type: 'dimension';
  $value: DimensionValue | AliasValue;
}

export interface DimensionValue {
  value: number;
  unit: 'px' | 'em' | 'rem';
}

/**
 * 8.5 Duration
 */
export interface DurationToken extends TokenCore {
  $type: 'duration';
  $value: DurationValue | AliasValue;
}

export interface DurationValue {
  value: number;
  unit: 'ms' | 's';
}

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
  dashArray: (DimensionValue | AliasValue)[];
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
  inset?: boolean;
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
  timingFunction: CubicBezierValue | AliasValue;
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
  [key: string]: unknown;
}

export interface GroupCore {
  $description?: string;
  $type?: Token['$type'];
  $extensions?: Record<string, unknown>;
}

export type Group = GroupCore | { [key: string]: GroupOrToken | GroupCore };

export type GroupOrToken = Group | Token;

export type ModeMap<T> = { '.': T; [mode: string]: T | undefined };

export interface TokenNormalizedCore<$type extends Token['$type']> {
  $type: $type;
  $description?: string;
  $extensions?: Record<string, unknown>;
  $deprecated?: string | boolean;
  id: string;
  source: {
    loc?: string;
    node: ObjectNode;
  };
  aliasOf?: string;
  aliasedBy?: string[];
  group: {
    $description?: string;
    $extensions?: Record<string, unknown>;
    $type?: $type;
    id: string;
    /** IDs of all tokens contained in this group */
    tokens: string[];
  };
}

export type TokenNormalized =
  | BooleanTokenNormalized
  | BorderTokenNormalized
  | ColorTokenNormalized
  | CubicBezierTokenNormalized
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

export interface BooleanTokenNormalized extends TokenNormalizedCore<'boolean'> {
  $value: BooleanValue;
  partialAliasOf?: never;
  mode: ModeMap<BooleanTokenNormalized>;
  originalValue: BooleanToken;
}

export interface BorderTokenNormalized extends TokenNormalizedCore<'border'> {
  $value: BorderValueNormalized;
  partialAliasOf?: Partial<Record<keyof BorderValueNormalized, string>>;
  mode: ModeMap<BorderTokenNormalized>;
  originalValue: BorderToken;
}

export interface BorderValueNormalized {
  color: ColorValueNormalized;
  width: DimensionValue;
  style: StrokeStyleValueExpanded;
}

export interface ColorTokenNormalized extends TokenNormalizedCore<'color'> {
  $value: ColorValueNormalized;
  mode: ModeMap<ColorTokenNormalized>;
  partialAliasOf?: never;
  originalValue: ColorToken;
}

export interface ColorValueNormalized {
  /**
   * Colorspace
   * @default "srgb"
   * @see https://www.w3.org/TR/css-color-4/#predefined
   */
  colorSpace: ColorSpace;
  /** Color channels. Will be normalized to 1 unless the colorspace prevents it (e.g. XYZ, LAB) */
  channels: [number, number, number];
  /** Alpha channel, normalized from 0 – 1 */
  alpha: number;
  /** Hex fallback (for sRGB) */
  hex?: string;
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

export interface CubicBezierTokenNormalized extends TokenNormalizedCore<'cubicBezier'> {
  $value: CubicBezierValue;
  partialAliasOf?: [string | undefined, string | undefined, string | undefined, string | undefined];
  mode: ModeMap<CubicBezierTokenNormalized>;
  originalValue: CubicBezierToken;
}

export interface DimensionTokenNormalized extends TokenNormalizedCore<'dimension'> {
  $value: DimensionValue;
  partialAliasOf?: never;
  mode: ModeMap<DimensionTokenNormalized>;
  originalValue: DimensionToken;
}

export interface DurationTokenNormalized extends TokenNormalizedCore<'duration'> {
  $value: DurationValue;
  partialAliasOf?: never;
  mode: ModeMap<DurationTokenNormalized>;
  originalValue: DurationToken;
}

export interface FontFamilyTokenNormalized extends TokenNormalizedCore<'fontFamily'> {
  $value: FontFamilyValueNormalized;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: ModeMap<FontFamilyTokenNormalized>;
  originalValue: FontFamilyToken;
}

export type FontFamilyValueNormalized = string[];

export interface FontWeightTokenNormalized extends TokenNormalizedCore<'fontWeight'> {
  $type: 'fontWeight';
  $value: FontWeightValueNormalized;
  aliasOf?: string;
  partialAliasOf?: never;
  mode: ModeMap<FontWeightTokenNormalized>;
  originalValue: FontWeightToken;
}

export type FontWeightValueNormalized = number;

export interface GradientTokenNormalized extends TokenNormalizedCore<'gradient'> {
  $value: GradientValueNormalized;
  partialAliasOf?: Partial<Record<keyof GradientStopNormalized, string>>[];
  mode: ModeMap<GradientTokenNormalized>;
  originalValue: GradientTokenNormalized;
}

export type GradientValueNormalized = GradientStopNormalized[];

export interface GradientStopNormalized {
  color: ColorValueNormalized;
  position: number;
}

export interface LinkTokenNormalized extends TokenNormalizedCore<'link'> {
  $value: LinkValue;
  partialAliasOf?: never;
  mode: ModeMap<LinkTokenNormalized>;
  originalValue: LinkToken;
}

export interface NumberTokenNormalized extends TokenNormalizedCore<'number'> {
  $value: NumberValue;
  partialAliasOf?: never;
  mode: ModeMap<NumberTokenNormalized>;
  originalValue: NumberToken;
}

export interface ShadowTokenNormalized extends TokenNormalizedCore<'shadow'> {
  $value: ShadowValueNormalized[];
  partialAliasOf?: Partial<Record<keyof ShadowValueNormalized, string>>[];
  mode: ModeMap<ShadowTokenNormalized>;
  originalValue: ShadowToken;
}

export interface ShadowValueNormalized {
  color: ColorValueNormalized;
  offsetX: DimensionValue;
  offsetY: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
  inset: boolean;
}

export interface StringTokenNormalized extends TokenNormalizedCore<'string'> {
  $value: StringValue;
  partialAliasOf?: never;
  mode: ModeMap<StringTokenNormalized>;
  originalValue: StringTokenNormalized;
}

export interface StrokeStyleTokenNormalized extends TokenNormalizedCore<'strokeStyle'> {
  $value: StrokeStyleValueExpanded;
  partialAliasOf?: never;
  mode: ModeMap<StrokeStyleTokenNormalized>;
  originalValue: StrokeStyleToken;
}

export interface TransitionTokenNormalized extends TokenNormalizedCore<'transition'> {
  $value: TransitionValueNormalized;
  partialAliasOf?: Partial<Record<keyof TransitionValueNormalized, string>>;
  mode: ModeMap<TransitionTokenNormalized>;
  originalValue: TransitionToken;
}

export interface TransitionValueNormalized {
  duration: DurationValue;
  delay: DurationValue;
  timingFunction: CubicBezierValue;
}

export interface TypographyTokenNormalized extends TokenNormalizedCore<'typography'> {
  $value: TypographyValueNormalized;
  partialAliasOf?: Record<string, string>;
  mode: ModeMap<TypographyTokenNormalized>;
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
  [key: string]: unknown;
}
