import type { TokenType, ParseResult, Schema } from './parse.js';
export type {
  ColorToken,
  ConicGradientToken,
  CubicBezierToken,
  DimensionToken,
  FileToken,
  FontToken,
  Group,
  LinearGradientToken,
  Mode,
  ParsedMetadata,
  ParsedToken,
  ParseResult,
  RadialGradientToken,
  Schema,
  ShadowToken,
  Token,
  TokenBase,
  TokenOrGroup,
  TokenType,
} from './parse.js';
import { parse } from './parse.js';
export { parse } from './parse.js';

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

export interface Config {
  tokens: URL;
  outDir: URL;
  plugins: Plugin[];
  figma?: FigmaMapping;
}

export interface Plugin {
  name: string;
  /** (optional) load config */
  config?: (config: Config) => void;
  /** main build fn */
  build(options: { schema: ParseResult['result']; rawSchema: Schema }): Promise<BuildResult[]>;
}

export interface UserConfig {
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
