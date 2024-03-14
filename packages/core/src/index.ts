import type { Group, ParsedToken } from './token.js';
export type {
  BorderToken,
  ColorToken,
  CubicBezierToken,
  DimensionToken,
  DurationToken,
  FontFamilyToken,
  FontWeightToken,
  NumberToken,
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
  ParsedFontFamilyToken,
  ParsedFontWeightToken,
  ParsedNumberToken,
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
  TypographyToken,
  TypographyValue,
} from './token.js';

import { ParseOptions, parse } from './parse/index.js';
export { parse, ParseOptions, ParseResult } from './parse/index.js';

export interface BuildResult {
  /** File to output inside config.outDir (ex: ./tokens.sass) */
  filename: string;
  /** File contents */
  contents: string | Buffer;
}

export interface ResolvedConfig extends ParseOptions {
  tokens: URL[];
  outDir: URL;
  plugins: Plugin[];
}

export interface Plugin {
  name: string;
  /** (optional) read config, and optionally modify */
  config?(config: ResolvedConfig): void | ResolvedConfig | undefined;
  /** main build fn */
  build(options: { tokens: ParsedToken[]; metadata: Record<string, unknown>; rawSchema: Group }): Promise<BuildResult[]>;
}

export interface Config extends Partial<ParseOptions> {
  /** path to tokens.json (default: "./tokens.json") */
  tokens?: string | string[];
  /** output directory (default: "./tokens/") */
  outDir?: string;
  /** specify plugins */
  plugins: Plugin[];
}

export default {
  parse,
};
