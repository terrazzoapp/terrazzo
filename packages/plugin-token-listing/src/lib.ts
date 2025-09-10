import type {
  AliasValue,
  BooleanValue,
  BorderValue,
  ColorValue,
  CubicBezierValue,
  DimensionValue,
  DurationValue,
  FontFamilyValue,
  FontWeightValue,
  GradientValue,
  NumberValue,
  LinkValue,
  ShadowValue,
  StringValue,
  StrokeStyleValue,
  TokenNormalized,
  TransitionValue,
  TypographyValue,
} from '@terrazzo/parser';

export const FORMAT_ID = 'token-listing';

/** Content of the DTCG $extension property computed by this plugin. */
export interface TokenListingExtension {
  /** Dictionary of names for the current design token, in all platforms where it exists. */
  names: Record<string, string>;

  /** Name of the mode used to compute this token. */
  mode?: string;

  /** Hint for tools to specialise how this token is visually presented. */
  subtype?: string;

  /** In multi-source-of-truth systems, name of the platform acting as a source of truth for this token, when different from the listing's default source of truth. */
  sourceOfTruth?: string;

  /** Resource where the source for this token is located, and location in the resource. */
  source?: {
    resource: string;
    loc?: {
      start: { line: number; column: number; offset: number };
      end: { line: number; column: number; offset: number };
    };
  };

  /** Value that can be used to preview this token in a Web environment. */
  previewValue?: PreviewValue;

  /** Original value of the token, with aliases preserved. */
  originalValue?:
    | AliasValue
    | BooleanValue
    | BorderValue
    | ColorValue
    | CubicBezierValue
    | DimensionValue
    | DurationValue
    | FontFamilyValue
    | FontWeightValue
    | GradientValue
    | LinkValue
    | NumberValue
    | ShadowValue
    | ShadowValue[]
    | StringValue
    | StrokeStyleValue
    | TransitionValue
    | TypographyValue;
}

export interface ListedToken {
  $name: string;
  $type: string;
  $value: string | number | boolean | Record<string, any>;
  $extensions: {
    'app.terrazzo.listing': TokenListingExtension;
  };
}

export type ModeOption = {
  name: string;
  values: string[];
  description?: string;
};

export type PlatformOption =
  | {
      description?: string;
      filter?: string | ((token: TokenNormalized, mode: string | undefined) => boolean);
      name: string | ((token: TokenNormalized, mode: string | undefined) => string);
    }
  | string;

export type SourceOfTruthOption =
  | string
  | {
      default: string;
      custom: (token: TokenNormalized) => string | undefined;
    };

interface PreviewValueObject {
  [key: string]: string | number | boolean | PreviewValueObject;
}
export type PreviewValue = string | number | boolean | PreviewValueObject;

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
   */
  modes?: ModeOption[];

  /**
   * Platforms included in this listing. Used to produce the `names` metadata and to compute
   * names of design tokens in individual platforms. Also used to filter tokens that aren't
   * included in a specific platform.
   *
   * Each platform has an id key and a value, which can be a plugin name (in which case the
   * plugin's logic will be used to filter and name tokens) or an object with:
   * - `description`: description of the platform
   * - `filter`: either a plugin name or a custom function returning `true` for tokens to include
   * - `name`: either a plugin name or a custom function returning each token's name
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
   * automatically as CSS properties.
   * @param token The token for which to compute a preview value.
   * @returns The computed preview value, or `undefined` to use the automatically computed one.
   */
  previewValue?: (token: TokenNormalized) => PreviewValue | undefined;

  /**
   * Hook to compute subtypes for design tokens, e.g. to hint which colors are backgrounds, borders,
   * foregrounds, etc. Used by documentation tools to customise the presentation of design tokens.
   * @param token The token for which to compute a subtype.
   * @returns The computed subtype, or `undefined` to use the DTCG $type for token presentation.
   */
  subtype?: (token: TokenNormalized) => Subtype | undefined;
}
