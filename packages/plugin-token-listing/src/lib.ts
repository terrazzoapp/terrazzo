import type { Logger, Resolver, ResolverModifierNormalized, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';

/** ID of this plugin's per-token extension key, and of the format produced by this plugin. */
export const FORMAT_ID = 'listing';

export interface CustomFunctionParams {
  logger: Logger;
  mode: string;
  token: TokenNormalized;
  tokensSet: Record<string, TokenNormalized>;
}

/** Per-platform information about a token. */
export interface ListedTokenPlatform {
  /** Identifier of the token on this platform (e.g. CSS variable name, Figma path). */
  name: string;
  /** Built/serialised value of the token on this platform, when available. */
  value?: string;
  /** Deprecation marker on this platform. May diverge from the token-level $deprecated. */
  deprecated?: string | boolean;
}

/** Content of the DTCG $extension property computed by this plugin. */
export interface TokenListingExtension {
  /**
   * Per-platform information about this token. Presence of an entry indicates the token exists on
   * that platform; absence means it does not.
   */
  platforms: Record<string, ListedTokenPlatform>;

  /** Name of the mode used to compute this token. Omitted when the mode is the default `.`. */
  mode?: string;

  /** Hint for tools to specialise how this token is visually presented. */
  subtype?: Subtype;

  /** In multi-source-of-truth systems, name of the platform acting as a source of truth for this token. */
  sourceOfTruth?: string;

  /**
   * Ordered chain of token IDs along the alias resolution path, from source to leaf. Omitted for
   * non-aliased tokens.
   */
  aliasChain?: string[];

  /** Valid CSS expression that can be used to preview this token. */
  previewValue?: string;

  /** Origin of the token in the source documents. */
  source?: {
    /** RFC 6901 JSON Pointer to the token's location. */
    $ref: string;
    /**
     * Same-document JSON Pointer into the resolver document, identifying the resolver entry that
     * brought this token in (e.g. `#/sets/color` or `#/modifiers/theme/contexts/dark`). Omitted
     * when no `resolver.json` was provided.
     */
    via?: string;
    /** Byte/line/column range of the token's authoring location. */
    loc?: {
      start: { line: number; column: number; offset: number };
      end: { line: number; column: number; offset: number };
    };
  };
}

export interface ListedToken {
  $name: string;
  $type: string;
  $description?: string;
  $value: string | number | boolean | Record<string, unknown>;
  $deprecated?: string | boolean;
  $extensions: {
    [FORMAT_ID]: TokenListingExtension;
  };
}

export interface TokenListing {
  meta: {
    version: 1;
    authoringTool: string;
    modes?: ModeOption[];
    platforms?: Record<string, { description?: string }>;
    /** Group-level descriptions and deprecation, keyed by group ID. */
    groups?: Record<string, { description?: string; deprecated?: string | boolean }>;
    /** Identity of the platform acting as a source of truth for this listing's tokens. */
    sourceOfTruth?: string;
  };
  data: ListedToken[];
}

export type ModeOption = Omit<ResolverModifierNormalized, 'type' | '$extensions' | '$defs'>;

export type PlatformOption =
  | string
  | {
      description?: string;
      filter?: string | ((params: CustomFunctionParams) => boolean);
      name?: string | ((params: CustomFunctionParams) => string | undefined);
      value?: string | ((params: CustomFunctionParams) => string | undefined);
      deprecated?: string | ((params: CustomFunctionParams) => string | boolean | undefined);
    };

export type SourceOfTruthOption =
  | string
  | {
      default: string;
      custom: (params: CustomFunctionParams) => string | undefined;
    };

export type Subtype =
  | 'bgColor'
  | 'fgColor'
  | 'borderColor'
  | 'padding'
  | 'margin'
  | 'gap'
  | 'size'
  | 'borderWidth'
  | 'borderRadius';

export interface TokenListingPluginOptions {
  /**
   * Where to output the listing files
   * @default "tokens.listing.json"
   */
  filename?: string;

  /**
   * List of modes included in the listing.
   *
   * When a `resolver.json` is provided, modes are derived from the resolver's modifiers. Entries
   * in this list may only enrich the resolver-derived modes with descriptions; entries that
   * introduce new mode names, mismatched values, or mismatched defaults cause a build error.
   *
   * When no resolver is provided, modes come from this list verbatim.
   */
  modes?: ModeOption[];

  /**
   * Platforms included in this listing. Used to produce the per-token `platforms` map and to compute
   * names of design tokens in individual platforms. Also used to filter tokens that aren't
   * included in a specific platform.
   *
   * Each platform has an id key and a value, which can be a plugin name (in which case the
   * plugin's logic will be used to filter and name tokens) or an object with:
   * - `description`: description of the platform
   * - `filter`: either a plugin name or a custom function returning `true` for tokens to include
   * - `name`: either a plugin name or a custom function returning each token's name
   * - `value`: either a plugin name or a custom function returning the per-platform built value
   * - `deprecated`: either a plugin name or a custom function returning a per-platform deprecation marker
   */
  platforms?: Record<string, PlatformOption>;

  /**
   * Identity of the platform acting as a source of truth for this listing's tokens. In
   * multi-source-of-truth systems, a custom function can be provided to compute the
   * source of truth on a per-token basis, and a default value can be specified.
   */
  sourceOfTruth?: SourceOfTruthOption;

  /**
   * Hook to customise the preview value of a token. Otherwise, preview values are computed
   * automatically as CSS properties. Numeric returns are coerced to strings.
   * @param token The token for which to compute a preview value.
   * @returns The computed preview value, or `undefined` to use the automatically computed one.
   */
  previewValue?: (params: CustomFunctionParams) => string | number | undefined;

  /**
   * Hook to compute subtypes for design tokens, e.g. to hint which colors are backgrounds, borders,
   * foregrounds, etc. Used by documentation tools to customise the presentation of design tokens.
   * @param token The token for which to compute a subtype.
   * @returns The computed subtype, or `undefined` to use the DTCG $type for token presentation.
   */
  subtype?: (params: CustomFunctionParams) => Subtype | undefined;
}

export interface BuildListingExtensionOptions {
    /** Tz utility to retrieve transformed values from other Tz plugins. */
    getTransforms: (params: TransformParams) => TokenTransformed[];
    /** Tz logger instance. */
    logger: Logger;
    mode: string;
    resolver: Resolver | undefined;
    resolverRootDir: string;
    token: TokenNormalized;
    tokensSet: Record<string, TokenNormalized>;
  }