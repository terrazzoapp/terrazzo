import yaml from "js-yaml";

export type TokenType = "color" | "dimension" | "font" | "cubic-bezier" | "file" | "url" | "shadow" | "linear-gradient" | "radial-gradient" | "conic-gradient";

export interface Shadow {
  /** Shadow offset (default: center). Any valid CSS position such as "12px -12px", "0% 50%", or "bottom right" */
  position?: string;
  /** Shadow blur (default: 0). Any valid CSS size such as "4px" or "200%" */
  size?: string | 0;
  /** Shadow inner size (default: 0). Any valid CSS size such as "4px" or "200%" */
  spread?: string | 0;
  /** A valid hex color (default: #0000000c) */
  color?: string;
}

export interface LinearGradient {
  angle?: string;
  stops: string[];
}

export interface RadialGradient {
  shape?: "circle" | "ellipse";
  position?: string;
  stops: string[];
}

export interface ConicGradient {
  angle?: string;
  position?: string;
  stops: string[];
}

/** tokens.yaml as-written, before parsing and before validation */
export interface RawTokenSchema {
  /** Manifest name */
  name?: string;
  /** Metadata. Useful for any arbitrary data */
  metadata?: Record<string, any>;
  /** Version. Only useful for the design system */
  version?: number;
  /** Tokens. Required */
  tokens: {
    [tokensOrGroup: string]: any; // note: can’t statically determine groups or tokens until parsing
  };
}

/** Initialized tokens.yaml that’s been parsed & validated (internal use only) */
export interface TokenSchema extends RawTokenSchema {
  tokens: {
    [tokensOrGroup: string]: GroupNode | TokenNode;
  };
}

/** An arbitrary grouping of tokens. Groups can be nested infinitely to form namespaces. */
export interface GroupNode {
  /** complete path (e.g. "color.gray") */
  id: string;
  /** short name within group (e.g. "gray") */
  localID: string;
  /** group reference (yes, groups can be nested!) */
  group?: GroupNode;
  tokens: {
    [tokensOrGroup: string]: SchemaNode;
  };
}

interface RawTokenBase {
  /** (optional) human-readable name */
  name?: string;
  /** (optional) description of this token */
  description?: string;
  /** (optional) declare alternate modes of this token */
  mode?: { [modeName: string]: string };
}

export type RawColorToken = RawTokenBase & { type: "color"; value: string };
export type RawDimensionToken = RawTokenBase & { type: "dimension"; value: string };
export type RawFontToken = RawTokenBase & { type: "font"; value: string | string[] };
export type RawCubicBezierToken = RawTokenBase & { type: "cubic-bezier"; value: [number, number, number, number] };
export type RawFileToken = RawTokenBase & { type: "file"; value: string };
export type RawURLToken = RawTokenBase & { type: "url"; value: string };
export type RawShadowToken = RawTokenBase & { type: "shadow"; value: Shadow | Shadow[] };
export type RawLinearGradientToken = RawTokenBase & { type: "linear-gradient"; value: LinearGradient };
export type RawRadialGradientToken = RawTokenBase & { type: "radial-gradient"; value: RadialGradient };
export type RawConicGradientToken = RawTokenBase & { type: "conic-gradient"; value: ConicGradient };
export type RawTokenNode = RawColorToken | RawDimensionToken | RawFontToken | RawCubicBezierToken | RawFileToken | RawURLToken | RawShadowToken | RawLinearGradientToken | RawRadialGradientToken | RawConicGradientToken;

export type TokenBase = RawTokenBase & { group?: GroupNode };
export type ColorToken = TokenBase & RawColorToken;
export type DimensionToken = TokenBase & RawDimensionToken;
export type FontToken = TokenBase & RawFontToken;
export type CubicBezierToken = TokenBase & RawCubicBezierToken;
export type FileToken = TokenBase & RawFileToken;
export type URLToken = TokenBase & RawURLToken;
export type ShadowToken = TokenBase & RawShadowToken;
export type LinearGradientToken = TokenBase & RawLinearGradientToken;
export type RadialGradientToken = TokenBase & RawRadialGradientToken;
export type ConicGradientToken = TokenBase & RawConicGradientToken;
export type TokenNode = ColorToken | DimensionToken | FontToken | CubicBezierToken | FileToken | URLToken | ShadowToken | LinearGradientToken | RadialGradientToken | ConicGradientToken;

export type SchemaNode = GroupNode | TokenNode;

export function parse(source: string): RawTokenSchema {
  return yaml.load(source) as RawTokenSchema;
}
