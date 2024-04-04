import type { Group, ParsedToken } from './token.js';
export type {
  BorderToken,
  BorderTokenValue,
  ColorToken,
  CubicBezierToken,
  DimensionToken,
  DurationToken,
  FontFamilyToken,
  FontWeightToken,
  GradientStop,
  GradientToken,
  Group,
  LinkToken,
  Mode,
  NumberToken,
  ParsedBorderToken,
  ParsedColorToken,
  ParsedCubicBezierToken,
  ParsedDimensionToken,
  ParsedDurationToken,
  ParsedFontFamilyToken,
  ParsedFontWeightToken,
  ParsedGradientToken,
  ParsedLinkToken,
  ParsedNumberToken,
  ParsedShadowToken,
  ParsedStrokeStyleToken,
  ParsedToken,
  ParsedTransitionToken,
  ParsedTypographyToken,
  ParsedTypographyValue,
  ShadowToken,
  ShadowValue,
  StrokeStyleToken,
  StrokeStyleValue,
  Token,
  TokenBase,
  TokenOrGroup,
  TokenType,
  TransitionToken,
  TransitionValue,
  TypographyToken,
  TypographyValue,
} from './token.js';
import { parse, type LintNotice, type LintRule, type LintRuleSeverity, type ParseOptions } from './parse/index.js';

export * from './parse/index.js';
export { default as lintCore } from './lint-core/index.js';
export * from './lint-core/index.js';
export * from './util.js';

export interface BuildResult {
  /** File to output inside config.outDir (ex: ./tokens.sass) */
  filename: string;
  /** File contents */
  contents: string | Buffer;
}

export interface ResolvedConfig extends Omit<ParseOptions, 'lint'> {
  tokens: URL[];
  outDir: URL;
  plugins: Plugin[];
  lint: {
    build: { enabled: boolean };
    rules: Record<string, LintRule>;
  };
}

export interface BuildStageOptions {
  /** Parsed, normalized, resolved tokens schema */
  tokens: ParsedToken[];
  metadata: Record<string, unknown>;
  /** The user’s original schema, as-authored */
  rawSchema: Group;
}

export interface LintStageOptions {
  /** Parsed, normalized, resolved tokens schema */
  tokens: ParsedToken[];
  /** IDs of enabled rules to report on (warning: may be empty!) */
  rules: LintRule[];
  /** The user’s original schema, as-authored */
  rawSchema: Group;
}

export interface Plugin {
  name: string;
  /** (optional) read config, and optionally modify */
  // biome-ignore lint/suspicious/noConfusingVoidType format: this helps plugins be a little looser on their typing
  config?(config: ResolvedConfig): void | ResolvedConfig | undefined;
  /** (optional) register lint rule IDs */
  registerRules?(): Omit<LintRule, 'options'>[];
  /** (optional) throw lint errors/warnings */
  lint?(options: LintStageOptions): Promise<LintNotice[] | undefined>;
  /** main build fn */
  build?(options: BuildStageOptions): Promise<BuildResult[]>;
}

type LintRuleShorthand = LintRuleSeverity | 0 | 1 | 2;
type LintRuleLonghand = [LintRuleSeverity | 0 | 1 | 2, any];

export interface Config extends Partial<Omit<ParseOptions, 'lint'>> {
  /** path to tokens.json (default: "./tokens.json") */
  tokens?: string | string[];
  /** output directory (default: "./tokens/") */
  outDir?: string;
  /** specify plugins */
  plugins: Plugin[];
  /** specify linting settings */
  lint?: {
    /** configure build behavior */
    build?: {
      /** should linters run with `co build`? (default: true) */
      enabled?: boolean;
    };
    /** configure lint rules */
    rules?: Record<string, LintRuleShorthand | LintRuleLonghand>;
  };
}

export default {
  parse,
};
