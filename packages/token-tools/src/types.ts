import type * as momoa from '@humanwhocodes/momoa';

export interface TokenCore<E extends {} = Record<string, unknown>> {
  $description?: string | undefined;
  $deprecated?: string | boolean | undefined;
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

export type TokensSet = Record<string, Token>;

export type AliasValue = string;

export interface AliasToken extends TokenCore {
  $type?: never;
  $value: AliasValue;
}

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
  | {
      colorSpace: ColorSpace;
      components: (number | null | string)[]; // note: in the future the length will vary based on colorSpace but it’s 3 for now
      alpha?: string | number;
      hex?: string;
    };

export interface CubicBezierToken extends TokenCore {
  $type: 'cubicBezier';
  $value: CubicBezierValue | AliasValue;
}

export type CubicBezierValue = [number | string, number | string, number | string, number | string];

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
  $deprecated?: string | boolean | undefined;
  $description?: string | undefined;
  $type?: Token['$type'];
  $extensions?: Record<string, unknown>;
}

export type Group =
  | GroupCore
  | {
      [key: string]: GroupOrToken;
    };

export type GroupOrToken = Group | Token;

/**
 * Modes only have a subset of information from the root token, that is allowed
 * to diverge (e.g. id will never differ, so don’t bother storing it on mode).
 * @deprecated Use resolver.apply() to retrieve alternate token values
 */
export type TokenMode<T extends TokenNormalized> = Pick<
  T,
  '$value' | 'aliasOf' | 'aliasChain' | 'aliasedBy' | 'partialAliasOf' | 'dependencies' | 'source'
> & {
  originalValue: NonNullable<T['originalValue']>['$value'] | undefined;
};

export type ModeMap<T extends TokenNormalized> = {
  '.': TokenMode<T>;
  [mode: string]: TokenMode<T> | undefined;
};

export interface GroupNormalized {
  $description: string | undefined;
  $deprecated: string | boolean | undefined;
  $extensions: Record<string, unknown> | undefined;
  $type: Token['$type'] | undefined;
  id: string;
  /** IDs of all tokens contained in this group */
  tokens: string[];
}

export interface TokenNormalizedCore<$type extends Token['$type']> {
  $type: $type;
  $description: string | undefined;
  $extensions: Record<string, unknown> | undefined;
  $extends: string | undefined;
  $deprecated: string | boolean | undefined;
  id: string;
  /** Originating token location */
  source: {
    /** @deprecated use filename instead */
    loc?: string;
    filename: string | undefined;
    node: momoa.ObjectNode;
  };
  /** JSON Schema form of ID */
  jsonID: string;
  originalValue: unknown;
  /** The **final** aliased ID */
  aliasOf: string | undefined;
  /** The entire alias chain, starting from the source token. The last item will match `.aliasOf`. */
  aliasChain: string[] | undefined;
  /** If this token is aliased in other tokens. */
  aliasedBy: string[] | undefined;
  /** All references from other tokens that compose this one, if any */
  dependencies: string[] | undefined;
  group: GroupNormalized;
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

export type TokenNormalizedSet = Record<string, TokenNormalized>;
export interface BooleanTokenNormalized extends TokenNormalizedCore<'boolean'> {
  $value: BooleanValue;
  partialAliasOf: undefined;
  /** @deprecated */
  mode: ModeMap<BooleanTokenNormalized>;
  originalValue: BooleanToken | AliasToken | undefined;
}

export interface BorderTokenNormalized extends TokenNormalizedCore<'border'> {
  $value: BorderValueNormalized;
  partialAliasOf: Record<keyof BorderValueNormalized, string | undefined> | undefined;
  /** @deprecated */
  mode: ModeMap<BorderTokenNormalized>;
  originalValue: BorderToken | AliasToken | undefined;
}

export interface BorderValueNormalized {
  color: ColorValueNormalized;
  width: DimensionValue;
  style: StrokeStyleValue;
}

export interface ColorTokenNormalized extends TokenNormalizedCore<'color'> {
  $value: ColorValueNormalized;
  /** @deprecated */
  mode: ModeMap<ColorTokenNormalized>;
  partialAliasOf:
    | {
        colorSpace: string | undefined;
        components: (string | undefined)[];
        alpha: string | undefined;
        hex: string | undefined;
      }
    | undefined;
  originalValue: ColorToken | AliasToken | undefined;
}

export interface ColorValueNormalized {
  /**
   * Colorspace
   * @default "srgb"
   * @see https://www.w3.org/TR/css-color-4/#predefined
   */
  colorSpace: ColorSpace;
  /** Color components. Will be normalized to 1 unless the colorspace prevents it (e.g. XYZ, LAB) */
  components: (number | null)[];
  /** Alpha component, normalized from 0 – 1 */
  alpha: number;
  /** Hex fallback (for sRGB) */
  hex?: string;
}

export type ColorSpace =
  | 'a98-rgb'
  | 'display-p3'
  | 'hsl'
  | 'hwb'
  | 'lab'
  | 'lab-d65'
  | 'lch'
  | 'okhsv' // extension
  | 'oklab'
  | 'oklch'
  | 'prophoto-rgb'
  | 'rec2020'
  | 'srgb-linear'
  | 'srgb'
  | 'xyz'
  | 'xyz-d50'
  | 'xyz-d65';

export interface CubicBezierTokenNormalized extends TokenNormalizedCore<'cubicBezier'> {
  $value: CubicBezierValue;
  /** Parts of this token rely on others */
  partialAliasOf: [string | undefined, string | undefined, string | undefined, string | undefined] | undefined;
  /** @deprecated */
  mode: ModeMap<CubicBezierTokenNormalized>;
  originalValue: CubicBezierToken | AliasToken | undefined;
}

export interface DimensionTokenNormalized extends TokenNormalizedCore<'dimension'> {
  $value: DimensionValue;
  /** Parts of this token rely on others */
  partialAliasOf: undefined;
  /** @deprecated */
  mode: ModeMap<DimensionTokenNormalized>;
  originalValue: DimensionToken | AliasToken | undefined;
}

export interface DurationTokenNormalized extends TokenNormalizedCore<'duration'> {
  $value: DurationValue;
  /** Parts of this token rely on others */
  partialAliasOf: undefined;
  /** @deprecated */
  mode: ModeMap<DurationTokenNormalized>;
  originalValue: DurationToken | AliasToken | undefined;
}

export interface FontFamilyTokenNormalized extends TokenNormalizedCore<'fontFamily'> {
  $value: FontFamilyValueNormalized;
  /** Parts of this token rely on others */
  partialAliasOf: undefined;
  /** @deprecated */
  mode: ModeMap<FontFamilyTokenNormalized>;
  originalValue: FontFamilyToken | AliasToken | undefined;
}

export type FontFamilyValueNormalized = string[];

export interface FontWeightTokenNormalized extends TokenNormalizedCore<'fontWeight'> {
  $type: 'fontWeight';
  $value: FontWeightValueNormalized;
  /** Parts of this token rely on others */
  partialAliasOf: undefined;
  /** @deprecated */
  mode: ModeMap<FontWeightTokenNormalized>;
  originalValue: FontWeightToken | AliasToken | undefined;
}

export type FontWeightValueNormalized = number;

export interface GradientTokenNormalized extends TokenNormalizedCore<'gradient'> {
  $value: GradientValueNormalized;
  /** Parts of this token rely on others */
  partialAliasOf: Record<keyof GradientStopNormalized, string | undefined>[] | undefined;
  /** @deprecated */
  mode: ModeMap<GradientTokenNormalized>;
  originalValue: GradientToken | AliasToken | undefined;
}

export type GradientValueNormalized = GradientStopNormalized[];

export interface GradientStopNormalized {
  color: ColorValueNormalized;
  position: number;
}

export interface LinkTokenNormalized extends TokenNormalizedCore<'link'> {
  $value: LinkValue;
  /** Parts of this token rely on others */
  partialAliasOf: undefined;
  /** @deprecated */
  mode: ModeMap<LinkTokenNormalized>;
  originalValue: LinkToken | AliasToken | undefined;
}

export interface NumberTokenNormalized extends TokenNormalizedCore<'number'> {
  $value: NumberValue;
  /** Parts of this token rely on others */
  partialAliasOf: undefined;
  /** @deprecated */
  mode: ModeMap<NumberTokenNormalized>;
  originalValue: NumberToken | AliasToken | undefined;
}

export interface ShadowTokenNormalized extends TokenNormalizedCore<'shadow'> {
  $value: ShadowValueNormalized[];
  /** Parts of this token rely on others */
  partialAliasOf: Record<keyof ShadowValue, string | undefined>[] | undefined;
  /** @deprecated */
  mode: ModeMap<ShadowTokenNormalized>;
  originalValue: ShadowToken | AliasToken | undefined;
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
  /** Parts of this token rely on others */
  partialAliasOf: undefined;
  /** @deprecated */
  mode: ModeMap<StringTokenNormalized>;
  originalValue: StringToken | AliasToken | undefined;
}

export interface StrokeStyleTokenNormalized extends TokenNormalizedCore<'strokeStyle'> {
  $value: StrokeStyleValueExpanded;
  partialAliasOf:
    | {
        dashArray: (string | undefined)[];
      }
    | undefined;
  /** @deprecated */
  mode: ModeMap<StrokeStyleTokenNormalized>;
  originalValue: StrokeStyleToken | AliasToken | undefined;
}

export interface TransitionTokenNormalized extends TokenNormalizedCore<'transition'> {
  $value: TransitionValueNormalized;
  /** Parts of this token rely on others */
  partialAliasOf: Record<keyof TransitionValueNormalized, string | undefined> | undefined;
  /** @deprecated */
  mode: ModeMap<TransitionTokenNormalized>;
  originalValue: TransitionToken | AliasToken | undefined;
}

export interface TransitionValueNormalized {
  duration: DurationValue;
  delay: DurationValue;
  timingFunction: CubicBezierValue;
}

export interface TypographyTokenNormalized extends TokenNormalizedCore<'typography'> {
  $value: TypographyValueNormalized;
  /** Parts of this token rely on others */
  partialAliasOf: Record<keyof TypographyValueNormalized, string | undefined> | undefined;
  /** @deprecated */
  mode: ModeMap<TypographyTokenNormalized>;
  originalValue: TypographyToken | AliasToken | undefined;
}

export interface TypographyValueNormalized {
  fontFamily: FontFamilyValue;
  fontSize: DimensionValue;
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
  fontWeight: FontWeightValue;
  letterSpacing: DimensionValue;
  lineHeight: DimensionValue | NumberValue;
  textDecoration?: string;
  textTransform?: string;
  [key: string]: unknown;
}

export interface TokenTransformedBase {
  /** Original Token ID */
  id: string;
  /** ID unique to this format. */
  localID?: string;
  /** @deprecated Prefer modifier/context */
  mode: string;
  /** The modifier name this exists in, if any. */
  modifier: string | undefined;
  /** The modifier context this exists in, if any. */
  context: string | undefined;
  /** The original token. */
  token: TokenNormalized;
  /** Arbitrary metadata set by plugins. */
  meta?: Record<string | number | symbol, unknown> & {
    /**
     * Metadata for the token-listing plugin. Plugins can
     * set this to be the name of a token as it appears in code,
     * and the token-listing plugin will pick it up and use it.
     */
    'token-listing'?: { name: string | undefined };
  };
}

/** Transformed token with a single value. Note that this may be any type! */
export interface TokenTransformedSingleValue extends TokenTransformedBase {
  type: 'SINGLE_VALUE';
  value: string;
}

/** Transformed token with multiple values. Note that this may be any type! */
export interface TokenTransformedMultiValue extends TokenTransformedBase {
  type: 'MULTI_VALUE';
  value: Record<string, string>;
}

export type TokenTransformed = TokenTransformedSingleValue | TokenTransformedMultiValue;
