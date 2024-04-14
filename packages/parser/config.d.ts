import type { BuildHookOptions, BuildRunnerResult, TransformHookOptions } from './build/index.js';
import type { LintRuleShorthand, LintRuleLonghand, LintRule, Linter } from './lint/index.js';
import type Logger from './logger.js';

export interface Config {
  /** Path to tokens.json (default: "./tokens.json") */
  tokens?: string | string[];
  /** Output directory (default: "./tokens/") */
  outDir?: string;
  /** Specify plugins */
  plugins?: Plugin[];
  /** Specify linting settings */
  lint?: {
    /** Configure build behavior */
    build?: {
      /** Should linters run with `co build`? (default: true) */
      enabled?: boolean;
    };
    /** Configure lint rules */
    rules?: Record<string, LintRuleShorthand | LintRuleLonghand>;
  };
}

export interface ConfigInit {
  tokens: URL[];
  outDir: URL;
  plugins: Plugin[];
  lint: {
    build: NonNullable<NonNullable<Config['lint']>['build']>;
    rules: Record<string, LintRule>;
  };
}

export interface Plugin {
  name: string;
  /** Read config, and optionally modify */
  // biome-ignore lint/suspicious/noConfusingVoidType format: this helps plugins be a little looser on their typing
  config?(config: ConfigInit): void | ConfigInit | undefined;
  /**
   * Declare:
   * - `"pre"`: run this plugin BEFORE all others
   * - `"post"`: run this plugin AFTER all others
   * - (default) run this plugin in default order (array order)
   */
  enforce?: 'pre' | 'post';
  /** Throw lint errors/warnings */
  lint?(): Record<string, Linter>;
  transform?(options: TransformHookOptions): Promise<void>;
  build?(options: BuildHookOptions): Promise<void>;
  buildEnd?(result: BuildRunnerResult): Promise<void>;
}

export interface ConfigOptions {
  logger?: Logger;
  /** Configs need CWD so this can be run without Node.js */
  cwd: URL;
}

/**
 * Validate and normalize a config
 */
export default function validateAndNormalizeConfig(rawConfig: Config, options: ConfigOptions): ConfigInit;

export function mergeConfigs(a: Config, b: Config): Config;
