import type { Group, ParsedToken, TokenType } from './@types/token';
export type {
  ColorToken,
  CubicBezierToken,
  DimensionToken,
  DurationToken,
  FileToken,
  FontToken,
  FontWeightName,
  GradientStop,
  GradientToken,
  Group,
  Mode,
  ParsedColorToken,
  ParsedCubicBezierToken,
  ParsedDimensionToken,
  ParsedDurationToken,
  ParsedFileToken,
  ParsedFontToken,
  ParsedGradientToken,
  ParsedShadowToken,
  ParsedToken,
  ParsedTransitionToken,
  ParsedTypographyToken,
  ParsedTypographyValue,
  ParsedURLToken,
  ShadowToken,
  ShadowValue,
  Token,
  TokenBase,
  TokenOrGroup,
  TokenType,
  TransitionToken,
  URLToken,
} from './@types/token';

import { parse } from './parse/index.js';
export { parse, ParseResult } from './parse/index.js';

export interface BuildResult {
  /** File to output inside config.outDir (ex: ./tokens.sass) */
  fileName: string;
  /** File contents */
  contents: string | Buffer;
}

export interface FigmaComponent {
  component: string;
  token: string;
  type: TokenType;
  file?: string;
}

export interface FigmaStyle {
  style: string;
  token: string;
  type: TokenType;
  file?: string;
}

export interface FigmaMapping {
  [url: string]: (FigmaStyle | FigmaComponent)[];
}

export interface ResolvedConfig {
  tokens: URL;
  outDir: URL;
  plugins: Plugin[];
  figma?: FigmaMapping;
}

export interface Plugin {
  name: string;
  /** (optional) load config */
  config?: (config: ResolvedConfig) => void;
  /** main build fn */
  build(options: { tokens: ParsedToken[]; metadata: Record<string, unknown>; rawSchema: Group }): Promise<BuildResult[]>;
}

export interface Config {
  /** path to tokens.json (default: "./tokens.json") */
  tokens?: string;
  /** output directory (default: "./tokens/") */
  outDir?: string;
  /** specify plugins (default: @cobalt-ui/plugin-json, @cobalt-ui/plugin-sass, @cobalt-ui/plugin-ts) */
  plugins: Plugin[];
  /** add figma keys */
  figma?: FigmaMapping;
}

export default {
  parse,
};
