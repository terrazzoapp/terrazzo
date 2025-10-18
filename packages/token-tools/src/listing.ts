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

  /** Value that can be used to preview this token in a CSS engine. */
  previewValue?: string | number;

  /** Original value of the token, with aliases preserved. */
  originalValue?: unknown;
}

export interface ListedToken {
  $name: string;
  $type: string;
  $description?: string;
  $value: string | number | boolean | Record<string, unknown>;
  $deprecated?: string | boolean;
  $extensions: {
    'app.terrazzo.listing': TokenListingExtension;
  };
}

export type ListedMode = {
  name: string;
  values: string[];
  description?: string;
  default?: string;
};


export interface TokenListing {
  meta: {
    version: 1;
    authoringTool: string;
    modes?: ListedMode[];
    platforms: Record<string, { description?: string }>;
    /** Identity of the platform acting as a source of truth for this listing's tokens. */
    sourceOfTruth?: string;
  };
  data: ListedToken[];
}


/**
 * Verifies an input token listing is likely to be valid.
 * Checks that it contains the expected properties, and that
 * design tokens inside `data` look like design tokens.
 * @param listing The token listing to validate.
 * @throws If the listing is invalid.
 */
export function validateListing(listing: TokenListing): void {
  if (!listing || typeof listing !== 'object') {
    throw new Error('Invalid listing: not an object');
  }

  if (!('meta' in listing) || typeof listing.meta !== 'object') {
    throw new Error('Invalid listing: meta property should be an object');
  }

  const invalidKeys = Object.keys(listing.meta).filter(
    (key) => !['version', 'authoringTool', 'modes', 'platforms', 'sourceOfTruth'].includes(key),
  );
  if (invalidKeys.length) {
    throw new Error(`Invalid listing: meta property has unknown key(s): ${invalidKeys.join(', ')}`);
  }

  if (listing.meta.version !== 1) {
    throw new Error(`Invalid listing: unsupported version: ${listing.meta.version}`);
  }

  if (!('data' in listing) || !Array.isArray(listing.data)) {
    throw new Error('Invalid listing: data property should be an array');
  }

  if (listing.data.some((token) => typeof token !== 'object' || token === null || !('$value' in token))) {
    throw new Error('Invalid listing: all items in data should be valid design tokens');
  }

  // TODO: switch this function to zod.
}