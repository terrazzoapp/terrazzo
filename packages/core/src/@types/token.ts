// Base

export type Group = {
  $type?: TokenType;
  /* Group description */
  $description?: string;
  /** Extensions for Cobalt */
  $extensions?: Record<string, unknown>;
} & { [childNodes: string]: TokenOrGroup };

export type Mode<T = string> = Record<string, T>;

export interface TokenBase<T = string> {
  /** User-friendly name */
  $name?: string;
  /** Token description */
  $description?: string;
  /** Token value */
  $value: T;
  $extensions?: {
    mode?: Mode<T>;
  } & Record<string, unknown>;
}

export type Token =
  | ColorToken
  | FontToken
  | DimensionToken
  | DurationToken
  | CubicBezierToken
  | LinkToken
  | StrokeStyleToken
  | BorderToken
  | TransitionToken
  | ShadowToken
  | GradientToken
  | TypographyToken;

export type TokenOrGroup = Token | Group;
export type TokenType = Token['$type'];
export interface ParsedTokenBase<T = string> extends TokenBase<T> {
  /** unique identifier for this token */
  id: string;
  /** group metadata */
  _group: Record<string, unknown>;
}
export type ParsedToken =
  | ParsedColorToken
  | ParsedFontToken
  | ParsedDimensionToken
  | ParsedDurationToken
  | ParsedCubicBezierToken
  | ParsedLinkToken
  | ParsedStrokeStyleToken
  | ParsedBorderToken
  | ParsedTransitionToken
  | ParsedShadowToken
  | ParsedShadowToken
  | ParsedGradientToken
  | ParsedTypographyToken;

// 8.1 Color

export interface ColorToken extends TokenBase<string> {
  $type: 'color';
}
export interface ParsedColorToken extends ParsedTokenBase<string> {
  $type: 'color';
  _original: ColorToken;
}

// 8.2 Dimension

export interface DimensionToken extends TokenBase<string> {
  $type: 'dimension';
}
export interface ParsedDimensionToken extends ParsedTokenBase<string> {
  $type: 'dimension';
  _original: DimensionToken;
}

// 8.3 Font

export interface FontToken extends TokenBase<string | string[]> {
  $type: 'font';
}
export interface ParsedFontToken extends ParsedTokenBase<string[]> {
  $type: 'font';
  _original: FontToken;
}

// 8.4 Duration

export interface DurationToken extends TokenBase<string> {
  $type: 'duration';
}
export interface ParsedDurationToken extends ParsedTokenBase<string> {
  $type: 'duration';
  _original: DurationToken;
}

// 8.5 Cubic Bezier

export interface CubicBezierToken extends TokenBase<[number, number, number, number]> {
  $type: 'cubicBezier';
}
export interface ParsedCubicBezierToken extends ParsedTokenBase<[number, number, number, number]> {
  $type: 'cubicBezier';
  _original: CubicBezierToken;
}

// 8.? Link

export interface LinkToken extends TokenBase<string> {
  $type: 'link';
}
export interface ParsedLinkToken extends ParsedTokenBase<string> {
  $type: 'link';
  _original: LinkToken;
}

// 9.2 Stroke style

export interface StrokeStyleValue {
  dashArray: string;
  lineCap: string;
}

export interface StrokeStyleToken extends TokenBase<string | Partial<StrokeStyleValue>> {
  $type: 'strokeStyle';
}

export interface ParsedStrokeStyleToken extends ParsedTokenBase<StrokeStyleValue> {
  $type: 'strokeStyle';
  _original: StrokeStyleToken;
}

// 9.3 Border

export interface BorderTokenValue {
  color: ColorToken['$value'];
  width: DimensionToken['$value'];
  style: StrokeStyleValue;
}

export interface BorderToken extends TokenBase<Partial<BorderTokenValue>> {
  $type: 'border';
}

export interface ParsedBorderToken extends ParsedTokenBase<BorderTokenValue> {
  $type: 'border';
  _original: BorderToken;
}

// 9.4 Transition

export interface TransitionValue {
  duration: DurationToken['$value'];
  delay: DurationToken['$value'];
  timingFunction: CubicBezierToken['$value'];
}
export interface TransitionToken extends TokenBase<Partial<TransitionValue>> {
  $type: 'transition';
}
export interface ParsedTransitionToken extends ParsedTokenBase<TransitionValue> {
  $type: 'transition';
  _original: TransitionToken;
}

// 9.5 Shadow

export interface ShadowValue {
  offsetX: DimensionToken['$value'];
  offsetY: DimensionToken['$value'];
  blur: DimensionToken['$value'];
  spread: DimensionToken['$value'];
  color: ColorToken['$value'];
}
export interface ShadowToken extends TokenBase<Partial<ShadowValue>> {
  $type: 'shadow';
}
export interface ParsedShadowToken extends ParsedTokenBase<ShadowValue> {
  $type: 'shadow';
  _original: ShadowToken;
}

// 9.6 Gradient

export interface GradientStop {
  color: ColorToken['$value'];
  position: number;
}
export interface GradientToken extends TokenBase<Partial<GradientStop>[]> {
  $type: 'gradient';
}
export interface ParsedGradientToken extends ParsedTokenBase<GradientStop[]> {
  $type: 'gradient';
  _original: GradientToken;
}

// 9.7 Typography

export type FontWeightName =
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
  | 'ultra-black';
export interface TypographyValue {
  fontFamily: FontToken['$value'];
  fontSize: DimensionToken['$value'];
  fontStyle: string;
  fontWeight: number | FontWeightName;
  letterSpacing: DimensionToken['$value'];
  lineHeight: string | number;
  textTransform: string;
}
export interface ParsedTypographyValue extends TypographyValue {
  fontFamily: ParsedFontToken['$value'];
}
export interface TypographyToken extends TokenBase<Partial<TypographyValue>> {
  $type: 'typography';
}
export interface ParsedTypographyToken extends ParsedTokenBase<Partial<ParsedTypographyValue>> {
  $type: 'typography';
  _original: TypographyToken;
}
