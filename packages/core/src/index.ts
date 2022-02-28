import type SVGO from 'svgo';
import type { Group, ParsedToken } from './@types/token';
export type {
  BorderToken,
  ColorToken,
  CubicBezierToken,
  DimensionToken,
  DurationToken,
  FontToken,
  FontWeightName,
  GradientStop,
  GradientToken,
  Group,
  LinkToken,
  Mode,
  ParsedBorderToken,
  ParsedColorToken,
  ParsedCubicBezierToken,
  ParsedDimensionToken,
  ParsedDurationToken,
  ParsedFontToken,
  ParsedGradientToken,
  ParsedLinkToken,
  ParsedShadowToken,
  ParsedStrokeStyleToken,
  ParsedToken,
  ParsedTransitionToken,
  ParsedTypographyToken,
  ParsedTypographyValue,
  ShadowToken,
  ShadowValue,
  StrokeStyleToken,
  Token,
  TokenBase,
  TokenOrGroup,
  TokenType,
  TransitionToken,
} from './@types/token';

import { parse } from './parse/index.js';
export { parse, ParseResult } from './parse/index.js';

export interface BuildResult {
  /** File to output inside config.outDir (ex: ./tokens.sass) */
  filename: string;
  /** File contents */
  contents: string | Buffer;
}

export interface FigmaDoc {
  url: string;
  tokens: FigmaToken[];
}

export interface FigmaToken {
  style?: string;
  component?: string;
  token: string;
  type: string;
  filename?: string;
  /** optional: override default optimization settings for this instance */
  optimize?: FigmaOptimizationSettings | boolean;
}

export interface FigmaOptimizationSettings {
  /** Default SVGO settings */
  svgo?: SVGO.OptimizeOptions | boolean;
}

export interface FigmaSettings {
  /** Figma docs to sync (required if "figma" is specified) */
  docs: FigmaDoc[];
  /** set default optimizations */
  optimize?: FigmaOptimizationSettings | boolean;
}

export interface ResolvedConfig {
  tokens: URL;
  outDir: URL;
  plugins: Plugin[];
  figma?: FigmaSettings;
}

export interface Plugin {
  name: string;
  /** (optional) read config, and optionally modify */
  config?(config: ResolvedConfig): void | ResolvedConfig | undefined;
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
  /** map Figma styles & components to tokens.json */
  figma?: FigmaSettings;
}

export default {
  parse,
};
