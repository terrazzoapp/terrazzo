import type * as momoa from '@humanwhocodes/momoa';
import type { InputSourceWithDocument } from '@terrazzo/json-schema-tools';
import type {
  Group,
  TokenNormalized,
  TokenNormalizedSet,
  TokenTransformed,
  TokenTransformedBase,
} from '@terrazzo/token-tools';
import type ytm from 'yaml-to-momoa';
import type Logger from './logger.js';

// Export some types as a convenience, because they originally came from this package
export type {
  Group,
  TokenNormalized,
  TokenNormalizedSet,
  TokenTransformed,
  TokenTransformedBase,
} from '@terrazzo/token-tools';

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
  sources: InputSourceWithDocument[];
  /** Resolver */
  resolver: Resolver;
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
  sources: InputSourceWithDocument[];
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
  /** Alphabetize tokens by ID to make output more consistent (note: some plugins may not preserve this order). @default true */
  alphabetize?: boolean;
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
  alphabetize: boolean;
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
  sources: InputSourceWithDocument[];
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
   * Handle requests to loading remote files, either from a remote URL or on the filesystem.
   * - Remote requests will have an "https:' protocol
   * - Filesystem files will have a "file:" protocol
   */
  req?: (src: URL, origin: URL) => Promise<string>;
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
  _sources?: Record<string, InputSourceWithDocument>;
}

export interface Plugin {
  name: string;
  /** Read config, and optionally modify */
  // biome-ignore lint/suspicious/noConfusingVoidType format: this helps plugins be a little looser on their typing
  config?(config: ConfigInit, context: PluginHookContext): void | ConfigInit | undefined;
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

export interface Resolver<
  Inputs extends Record<string, string[]> = Record<string, string[]>,
  Input = Record<keyof Inputs, Inputs[keyof Inputs][number]>,
> {
  /**
   * Supply values to modifiers to produce a final tokens set. This caches the
   * results, so calling a 2nd time with the same inputs will return the same
   * results (it ignores object key order, and takes defaults into account for
   * better caching).
   */
  apply: (input: Partial<Input>) => TokenNormalizedSet;
  /**
   * List all possible valid input combinations. Ignores default values, as they
   * would duplicate some other permutations. This also caches results, so it’s
   * only computed once on the first call.
   */
  listPermutations: () => Input[];
  /* Generate a stable ID from any input */
  getPermutationID: (input: Input) => string;
  /** The original resolver document, simplified */
  source: ResolverSourceNormalized;
  /** Helper function for permutations—see if a particular input is valid. Automatically applies default values. */
  isValidInput: (input: Input, throwError?: boolean) => boolean;
}

export interface ResolverSource {
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
export interface ResolverSourceNormalized {
  name: string | undefined;
  version: '2025.10';
  description: string | undefined;
  sets: Record<string, ResolverSet> | undefined;
  modifiers: Record<string, ResolverModifier> | undefined;
  /**
   * Array of all sets and modifiers that have been converted to inline,
   * regardless of original declaration. In a normalized resolver, only a single
   * pass over the resolutionOrder array is needed.
   */
  resolutionOrder: (ResolverSetNormalized | ResolverModifierNormalized)[];
  _source: {
    filename?: URL;
    document: momoa.DocumentNode;
  };
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

export interface ResolverModifierNormalized {
  name: string;
  type: 'modifier';
  description: string | undefined;
  contexts: Record<string, Group[]>;
  default: string | undefined;
  $extensions: Record<string, unknown> | undefined;
  $defs: Record<string, unknown> | undefined;
}

export interface ResolverSet {
  description?: string;
  sources: (Group | ReferenceObject)[];
  $extensions?: Record<string, unknown>;
  $defs?: Record<string, unknown>;
}

export type ResolverSetInline = ResolverSet & { name: string; type: 'set' };

export interface ResolverSetNormalized {
  name: string;
  type: 'set';
  description: string | undefined;
  sources: Group[];
  $extensions: Record<string, unknown> | undefined;
  $defs: Record<string, unknown> | undefined;
}

export type TransformParams = TransformParamsLegacy | TransformParamsResolver;

export interface TransformParamsBase {
  /** ID of an existing format */
  format: string;
  /** Glob of tokens to select (e.g. `"color.*"` to select all tokens starting with `"color."`) */
  id?: string | string[];
  /** $type(s) to filter for */
  $type?: string | string[];
}

export interface TransformParamsLegacy extends TransformParamsBase {
  /**
   * Mode name, if selecting a mode
   * @deprecated Use input instead.
   * @default "."
   */
  mode?: string | string[];
  /** Input that marks the transformation as a permutation */
  input?: never;
}

export interface TransformParamsResolver extends TransformParamsBase {
  mode?: never;
  /** Input that marks the transformation as a permutation */
  input: Record<string, string>;
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
    params:
      | {
          format: string;
          localID?: string;
          value: string | Record<string, string>; // allow looser type for input (`undefined` will just get stripped)
          /** @deprecated */
          mode?: string;
          input?: never;
          meta?: TokenTransformedBase['meta'];
        }
      | {
          format: string;
          localID?: string;
          value: string | Record<string, string>;
          mode?: never;
          input: Record<string, string>;
          meta?: TokenTransformedBase['meta'];
        },
  ): void;
  /** Resolver */
  resolver: Resolver;
  /** Momoa documents */
  sources: InputSourceWithDocument[];
}

export interface RefMapEntry {
  filename: string;
  refChain: string[];
}

export type RefMap = Record<string, RefMapEntry>;
