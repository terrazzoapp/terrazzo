import type * as momoa from '@humanwhocodes/momoa';
import type { Group, TokenNormalized, TokensSet } from '@terrazzo/token-tools';
import type ytm from 'yaml-to-momoa';
import type Logger from './logger.js';

export interface PluginHookContext {
  logger: Logger;
}

export interface BuildHookOptions {
  /** Plugin hook context (provides access to shared logger) */
  context: PluginHookContext;
  /** Map of tokens */
  tokens: Record<string, TokenNormalized>;
  /** Query transformed values */
  getTransforms(params: TransformParams): TokenTransformed[];
  /** Momoa documents */
  sources: InputSource[];
  outputFile: (
    /** Filename to output (relative to outDir) */
    filename: string,
    /** Contents to write to file */
    contents: string | Buffer,
  ) => void;
}

export interface BuildRunnerResult {
  outputFiles: OutputFileExpanded[];
}

export interface BuildEndHookOptions {
  /** Plugin hook context (provides access to shared logger) */
  context: PluginHookContext;
  /** Map of tokens */
  tokens: Record<string, TokenNormalized>;
  /** Query transformed values */
  getTransforms(params: TransformParams): TokenTransformed[];
  /** Momoa documents */
  sources: InputSource[];
  /** Final files to be written */
  outputFiles: OutputFileExpanded[];
}

// loosey-goosey user-defined config
export interface Config {
  /**
   * Path to tokens.json
   * @default "./tokens.json"
   */
  tokens?: string | string[];
  /**
   * Output directory
   * @default "./tokens/"
   */
  outDir?: string;
  /** Specify plugins */
  plugins?: Plugin[];
  /** Specify linting settings */
  lint?: {
    /** Configure build behavior */
    build?: {
      /**
       * Should linters run with `tz build`?
       * @default true
       */
      enabled?: boolean;
    };
    /** Configure lint rules */
    rules?: Record<string, LintRuleShorthand | LintRuleLonghand>;
  };
  /** Ignore token groups */
  ignore?: {
    /** Token patterns to ignore. Accepts globs. */
    tokens?: string[];
    /** Ignore deprecated tokens */
    deprecated?: boolean;
  };
}

export interface VisitorContext {
  parent?: momoa.AnyNode;
  filename: URL;
  path: string[];
}

export type Visitor<T extends momoa.AnyNode = momoa.ObjectNode | momoa.DocumentNode> = (
  node: T,
  context: VisitorContext,
  // biome-ignore lint/suspicious/noConfusingVoidType: TS requires void
) => T | void | null | undefined;

export interface TransformVisitors {
  boolean?: Visitor;
  border?: Visitor;
  color?: Visitor;
  cubicBezier?: Visitor;
  dimension?: Visitor;
  duration?: Visitor;
  fontFamily?: Visitor;
  fontWeight?: Visitor;
  gradient?: Visitor;
  group?: Visitor;
  link?: Visitor;
  number?: Visitor;
  root?: Visitor;
  shadow?: Visitor;
  strokeStyle?: Visitor;
  token?: Visitor;
  transition?: Visitor;
  typography?: Visitor;
  [key: string]: Visitor | undefined;
}

// normalized, finalized config
export interface ConfigInit {
  tokens: URL[];
  outDir: URL;
  plugins: Plugin[];
  lint: {
    build: NonNullable<NonNullable<Config['lint']>['build']>;
    rules: Record<string, LintRuleLonghand>;
  };
  ignore: {
    tokens: NonNullable<NonNullable<Config['ignore']>['tokens']>;
    deprecated: NonNullable<NonNullable<Config['ignore']>['deprecated']>;
  };
}

export interface ConfigOptions {
  logger?: Logger;
  /** @terrazzo/parser needs cwd so this can be run without Node.js. Importing defineConfig from @terrazzo/cli doesn’t need this. */
  cwd: URL;
}

export interface InputSource {
  filename?: URL;
  src: any;
  document: momoa.DocumentNode;
}

export interface LintNotice {
  /** Lint message shown to the user */
  message: string;
  /** Erring node (used to point to a specific line) */
  node?: momoa.AnyNode;
}

export type LintRuleSeverity = 'error' | 'warn' | 'off';
export type LintRuleShorthand = LintRuleSeverity | 0 | 1 | 2;
export type LintRuleLonghand = [LintRuleSeverity | 0 | 1 | 2, any];

export interface LintRuleNormalized<O = any> {
  id: string;
  severity: LintRuleSeverity;
  options?: O;
}

export type LintReportDescriptor<MessageIds extends string> = {
  /** To error on a specific token source file, provide a Momoa node */
  node?: momoa.AnyNode;
  /** To provide correct line numbers, specify the filename (usually found on `token.source.loc`) */
  filename?: string;
  /** Provide data for messages */
  data?: Record<string, unknown>;
} & (
  | {
      /** Provide the error message to display */
      message: string;
      messageId?: never;
    }
  | {
      message?: never;
      /** Provide the error message ID */
      messageId: MessageIds;
    }
);

// Note: lint types intentionally steal the API from ESLint. Options were
// omitted where they don’t make sense (or were deprecated from ESLint—we don’t
// need to worry about backwards compat). The types also leave room in the
// future to be expanded easily if needed.

export interface LintRule<
  MessageIds extends string,
  LintRuleOptions extends Record<string, any> = Record<string, never>,
  LintRuleDocs = unknown,
> {
  meta?: LintRuleMetaData<MessageIds, LintRuleOptions, LintRuleDocs>;
  /**
   * Function which returns an object with methods that ESLint calls to “visit”
   * nodes while traversing the abstract syntax tree.
   */
  create(context: Readonly<LintRuleContext<MessageIds, LintRuleOptions>>): void | Promise<void>;
  /**
   * Default options the rule will be run with
   */
  defaultOptions: LintRuleOptions;
}

export interface LintRuleContext<MessageIds extends string, LintRuleOptions extends object | undefined = undefined> {
  /** The rule ID. */
  id: string;
  /**
   * An array of the configured options for this rule. This array does not
   * include the rule severity.
   */
  options: LintRuleOptions;
  /** The current working directory. */
  cwd?: URL;
  /**
   * All source files present in this run. To find the original source, match a
   * token’s `source.loc` filename to one of the source’s `filename`s.
   */
  sources: InputSource[];
  /** Source file location. */
  filename?: URL;
  /** ID:Token map of all tokens. */
  tokens: Record<string, TokenNormalized>;
  /** Reports a problem in the code. */
  report(descriptor: LintReportDescriptor<MessageIds>): void;
}

export interface LintRuleMetaData<
  MessageIds extends string,
  LintRuleOptions extends object | undefined = undefined,
  LintRuleDocs = unknown,
> {
  /**
   * Documentation for the rule
   */
  docs?: LintRuleDocs & LintRuleMetaDataDocs;
  /**
   * A map of messages which the rule can report. The key is the messageId, and
   * the string is the parameterized error string.
   */
  messages?: Record<MessageIds, string>;
  /**
   * Specifies default options for the rule. If present, any user-provided
   * options in their config will be merged on top of them recursively. This
   * merging will be applied directly to `context.options`.
   */
  defaultOptions?: LintRuleOptions;
}

export interface LintRuleMetaDataDocs {
  /** Concise description of the rule. */
  description: string;
  /** The URL of the rule's docs. */
  url?: string;
}

export interface OutputFile {
  /** Filename, relative to outDir */
  filename: string;
  /** File contents */
  contents: string | Buffer;
  /** Plugin name that generated the file */
  plugin?: string;
  /** Time taken to generate file */
  time?: number;
}

export interface OutputFileExpanded extends OutputFile {
  /** The `name` of the plugin that produced this file. */
  plugin: string;
  /** How long this output took to make. */
  time: number;
}

export interface ParseOptions {
  logger?: Logger;
  config: ConfigInit;
  /**
   * Skip lint step
   * @default false
   */
  skipLint?: boolean;
  /**
   * Continue on error? (Useful for `tz check`)
   * @default false
   */
  continueOnError?: boolean;
  /** Provide yamlToMomoa module to parse YAML (by default, this isn’t shipped to cut down on package weight) */
  yamlToMomoa?: typeof ytm;
  /**
   * Transform API
   * @see https://terrazzo.app/docs/api/js#transform-api
   */
  transform?: TransformVisitors;
  /** (internal cache; do not use) */
  _sources?: Record<string, InputSource>;
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
  lint?(): Record<string, LintRule<any, any, any>>;
  transform?(options: TransformHookOptions): Promise<void>;
  build?(options: BuildHookOptions): Promise<void>;
  buildEnd?(options: BuildEndHookOptions): Promise<void>;
}

export interface ReferenceObject {
  $ref: string;
}

export interface Resolver {
  /** Human-friendly name of this resolver */
  name?: string;
  /** DTCG version */
  version: '2025.10';
  /** Description of this resolver */
  description?: string;
  /** Mapping of sets */
  sets?: Record<string, ResolverSet>;
  /** Mapping of modifiers */
  modifiers?: Record<string, ResolverModifier>;
  resolutionOrder: (ResolverSetInline | ResolverModifierInline | ReferenceObject)[];
  $extensions?: Record<string, unknown>;
  $defs?: Record<string, unknown>;
}

/** Resolver where all tokens are loaded and flattened in-memory, so only the final merging is left */
export interface ResolverNormalized extends Omit<Resolver, 'resolutionOrder'> {
  /**
   * Array of all sets and modifiers that have been converted to inline,
   * regardless of original declaration. In a normalized resolver, only a single
   * pass over the resolutionOrder array is needed.
   */
  resolutionOrder: (
    | {
        name: string;
        type: 'set';
        description: string | undefined;
        sources: Group[];
        $extensions: Record<string, unknown> | undefined;
        $defs: Record<string, unknown> | undefined;
      }
    | {
        name: string;
        type: 'modifier';
        description: string | undefined;
        contexts: Record<string, Group[]>;
        default: string | undefined;
        $extensions: Record<string, unknown> | undefined;
        $defs: Record<string, unknown> | undefined;
      }
  )[];
}

export interface ResolverModifier<Context extends string = string> {
  description?: string;
  contexts: Record<Context, (Group | ReferenceObject)[]>;
  default?: Context;
  $extensions?: Record<string, unknown>;
  $defs?: Record<string, unknown>;
}

export type ResolverModifierInline<Context extends string = string> = ResolverModifier<Context> & {
  name: string;
  type: 'modifier';
};

export interface ResolverSet {
  description?: string;
  sources: (Group | ReferenceObject)[];
  $extensions?: Record<string, unknown>;
  $defs?: Record<string, unknown>;
}

export type ResolverSetInline = ResolverSet & { name: string; type: 'set' };

interface TokenTransformedBase {
  /** Original Token ID */
  id: string;
  /** ID unique to this format. */
  localID?: string;
  /**
   * The mode of this value
   * @default "."
   */
  mode: string;
  /** The original token. */
  token: TokenNormalized;
  /** Arbitrary metadata set by plugins. */
  meta?: Record<string | number | symbol, unknown> & {
    /**
     * Metadata for the token-listing plugin. Plugins can
     * set this to be the name of a token as it appears in code,
     * and the token-listing plugin will pick it up and use it.
     */
    'token-listing'?: { name: string | undefined };
  };
}

/** Transformed token with a single value. Note that this may be any type! */
export interface TokenTransformedSingleValue extends TokenTransformedBase {
  type: 'SINGLE_VALUE';
  value: string;
}

/** Transformed token with multiple values. Note that this may be any type! */
export interface TokenTransformedMultiValue extends TokenTransformedBase {
  type: 'MULTI_VALUE';
  value: Record<string, string>;
}

export type TokenTransformed = TokenTransformedSingleValue | TokenTransformedMultiValue;

export interface TransformParams {
  /** ID of an existing format */
  format: string;
  /** Glob of tokens to select (e.g. `"color.*"` to select all tokens starting with `"color."`) */
  id?: string | string[];
  /** $type(s) to filter for */
  $type?: string | string[];
  /**
   * Mode name, if selecting a mode
   * @default "."
   */
  mode?: string | string[];
}

export interface TransformHookOptions {
  /** Plugin hook context (provides access to shared logger) */
  context: PluginHookContext;
  /** Map of tokens */
  tokens: Record<string, TokenNormalized>;
  /** Query transformed values */
  getTransforms(params: TransformParams): TokenTransformed[];
  /** Update transformed values */
  setTransform(
    id: string,
    params: {
      format: string;
      localID?: string;
      value: string | Record<string, string>; // allow looser type for input (`undefined` will just get stripped)
      mode?: string;
      meta?: TokenTransformedBase['meta'];
    },
  ): void;
  /** Momoa documents */
  sources: InputSource[];
}
