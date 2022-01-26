// Base

export type Group = {
  metadata?: Record<string, unknown>;
} & {
  [childNode: string]: TokenOrGroup;
};

export type Mode<T = string> = Record<string, T>;

export interface TokenBase<T = string> {
  /** User-friendly name */
  name?: string;
  /** Token description */
  description?: string;
  /** Token value */
  value: T;
  /** Mode variants */
  mode?: Mode<T>;
}

export type Token =
  | ColorToken
  | FontToken
  | DimensionToken
  | DurationToken
  | CubicBezierToken
  | FileToken
  | URLToken
  | TransitionToken
  | ShadowToken
  | GradientToken
  | TypographyToken;

export type TokenType = Token['type'];
export type TokenOrGroup = Group | Token;
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
  | ParsedFileToken
  | ParsedURLToken
  | ParsedShadowToken
  | ParsedTransitionToken
  | ParsedShadowToken
  | ParsedGradientToken
  | ParsedTypographyToken;

// 8.1 Color

export interface ColorToken extends TokenBase<string> {
  type: 'color';
}
export interface ParsedColorToken extends ParsedTokenBase<string> {
  type: 'color';
  _original: ColorToken;
}

// 8.2 Dimension

export interface DimensionToken extends TokenBase<string> {
  type: 'dimension';
}
export interface ParsedDimensionToken extends ParsedTokenBase<string> {
  type: 'dimension';
  _original: DimensionToken;
}

// 8.3 Font

export interface FontToken extends TokenBase<string | string[]> {
  type: 'font';
}
export interface ParsedFontToken extends ParsedTokenBase<string[]> {
  type: 'font';
  _original: FontToken;
}

// 8.4 Duration

export interface DurationToken extends TokenBase<string> {
  type: 'duration';
}
export interface ParsedDurationToken extends ParsedTokenBase<string> {
  type: 'duration';
  _original: DurationToken;
}

// 8.5 Cubic Bezier

export interface CubicBezierToken extends TokenBase<[number, number, number, number]> {
  type: 'cubic-bezier';
}
export interface ParsedCubicBezierToken extends ParsedTokenBase<[number, number, number, number]> {
  type: 'cubic-bezier';
  _original: CubicBezierToken;
}

// 8.? File

export interface FileToken extends TokenBase<string> {
  type: 'file';
}
export interface ParsedFileToken extends ParsedTokenBase<string> {
  type: 'file';
  _original: FileToken;
}

// 8.? URL

export interface URLToken extends TokenBase<string> {
  type: 'url';
}
export interface ParsedURLToken extends ParsedTokenBase<string> {
  type: 'url';
  _original: URLToken;
}

// 9.? Transition

export interface TransitionValue {
  duration: DurationToken['value'];
  delay: DurationToken['value'];
  'timing-function': CubicBezierToken['value'];
}
export interface TransitionToken extends TokenBase<Partial<TransitionValue>> {
  type: 'transition';
}
export interface ParsedTransitionToken extends ParsedTokenBase<Partial<TransitionValue>> {
  type: 'transition';
  _original: TransitionToken;
}

// 9.? Shadow

export interface ShadowValue {
  'offset-x': DimensionToken['value'];
  'offset-y': DimensionToken['value'];
  blur: DimensionToken['value'];
  spread: DimensionToken['value'];
  color: ColorToken['value'];
}
export interface ShadowToken extends TokenBase<Partial<ShadowValue>> {
  type: 'shadow';
}
export interface ParsedShadowToken extends ParsedTokenBase<ShadowValue> {
  type: 'shadow';
  _original: ShadowToken;
}

// 9.? Gradient

export interface GradientStop {
  color: ColorToken['value'];
  position: number;
}
export interface GradientToken extends TokenBase<Partial<GradientStop>[]> {
  type: 'gradient';
}
export interface ParsedGradientToken extends ParsedTokenBase<GradientStop[]> {
  type: 'gradient';
  _original: GradientToken;
}

// 9.? Typography

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
  fontName: FontToken['value'];
  fontSize: DimensionToken['value'];
  fontStyle: string;
  fontWeight: number | FontWeightName;
  letterSpacing: DimensionToken['value'];
  lineHeight: string | number;
}
export interface ParsedTypographyValue extends TypographyValue {
  fontName: ParsedFontToken['value'];
}
export interface TypographyToken extends TokenBase<Partial<TypographyValue>> {
  type: 'typography';
}
export interface ParsedTypographyToken extends ParsedTokenBase<Partial<ParsedTypographyValue>> {
  type: 'typography';
  _original: TypographyToken;
}
