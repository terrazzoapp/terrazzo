export type Mode<T = string> = Record<string, T>;

interface TokenBase {
  /** unique identifier */
  id: string;
  /** (optional) friendly name */
  name?: string;
  /** (optinal) longer description, examples, etc. */
  description?: string;
}

export interface ColorToken extends TokenBase {
  type: "color";
  /** hex value */
  value: string;
  mode?: Mode<string>;
}

export interface DimensionToken extends TokenBase {
  type: "dimension";
  /** unit of measurement (px, em, etc.) */
  value: string;
  mode?: Mode<string>;
}

export interface FontToken extends TokenBase {
  type: "font";
  /** font stack array (in order of preference) */
  value: string[];
  mode?: Mode<string[]>;
}

export interface CubicBezierToken extends TokenBase {
  type: "cubic-bezier";
  /** [x1, y1, x2, y2] */
  value: [number, number, number, number];
  mode?: Mode<[number, number, number, number]>;
}

export interface FileToken extends TokenBase {
  type: "file";
  value: string;
  mode?: Mode<string>;
}

export interface URLToken extends TokenBase {
  type: "url";
  value: string;
  mode?: Mode<string>;
}

export interface ShadowToken extends TokenBase {
  type: "shadow";
  value: string[];
  mode?: Mode<string[]>;
}

export interface LinearGradientToken extends TokenBase {
  type: "linear-gradient";
  value: string;
  mode?: Mode<string>;
}

export interface RadialGradientToken extends TokenBase {
  type: "radial-gradient";
  value: string;
  mode?: Mode<string>;
}

export interface ConicGradientToken extends TokenBase {
  type: "conic-gradient";
  value: string;
  mode?: Mode<string>;
}

export type Token = ColorToken | DimensionToken | FontToken | CubicBezierToken | FileToken | URLToken | ShadowToken | LinearGradientToken | RadialGradientToken | ConicGradientToken;

export interface Schema {
  metadata: {
    name?: string;
    version?: string;
    metadata?: Record<string, unknown>;
  };
  tokens: Token[];
}

export interface BuildResult {
  fileName: string;
  contents: string | Buffer;
}

export interface Plugin {
  name: string;
  build(schema: Schema): Promise<BuildResult[]>;
}

export interface Config {
  /** path to tokens.yaml (default: "./tokens.yaml") */
  tokens?: string;
  /** output directory (default: "./tokens/") */
  outDir?: string;
  /** Cobalt plugins */
  plugins?: Plugin[];
  /** Figma config */
  figma?: {
    [url: string]: FigmaToken[];
  }
}

export type FigmaToken = ({ component: string } | { style: string }) & { token: string } & ({ type: "file", file: string } | { type: Omit<Token["type"], "file"> });

declare namespace Cobalt {
  function parse(schema: string): Schema;
  function loadConfig(userConfig?: Partial<Config>): Promise<Config>;
  function build(schema: Schema, config?: Config): Promise<BuildResult[]>;
  function sync(config?: Config): Promise<Token[]>;
}
