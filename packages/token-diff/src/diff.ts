import type { ListedToken, TokenListing } from '@terrazzo/plugin-token-listing';
import { flattenDiffEntry } from './flatten.js';
import type {
  ChangeType,
  DeepObject,
  DeepPartial,
  DiffEntry,
  DiffListingsOptions,
  ListedTokenWithUUID,
  TokenListingDiff,
} from './lib.js';

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
    (key) => !['version', 'authoringTool', 'modes', 'names', 'sourceOfTruth'].includes(key),
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

  // Can be further improved when needed.
  if (listing.data.some((token) => typeof token !== 'object' || token === null || !('$value' in token))) {
    throw new Error('Invalid listing: all items in data should be valid design tokens');
  }
}

/**
 * Injects UUIDs into a token listing's data structure, and sorts it by UUID.
 * Allows comparing pairs of listings with the performance of a merge sort.
 * @param data The listing data to prepare.
 * @returns The sorted listing data with UUIDs.
 */
function _prepareAndSortListing(data: ListedToken[]): ListedTokenWithUUID[] {
  return data
    .flatMap((token) =>
      Object.keys(token.$extensions['app.terrazzo.listing'].names).map((platformKey) =>
        structuredClone({
          ...token,
          uuid: `${token.$name}...${platformKey}...${token.$extensions['app.terrazzo.listing'].mode ?? '.'}`,
        }),
      ),
    )
    .sort((a, b) => {
      if (a.uuid < b.uuid) {
        return -1;
      }
      if (a.uuid > b.uuid) {
        return 1;
      }
      return 0;
    });
}

/**
 * Recursively inspects two objects, and returns the subsets of these objects that differ from one another.
 * @param opts.a The first object to compare.
 * @param opts.b The second object to compare.
 * @returns An object indicating whether there are changes (`hasChanges` prop), and if there are, the
 * `a` and `b` subsets of the original objects with differences.
 */
function _recursiveComputeChanges({ a, b }: { a?: DeepObject; b?: DeepObject }):
  | { hasChanges: false }
  | {
      hasChanges: true;
      a?: DeepObject;
      b?: DeepObject;
    } {
  if (typeof a !== typeof b) {
    return { hasChanges: true, a, b };
  }

  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    const aDiff: DeepObject = {};
    const bDiff: DeepObject = {};
    let hasChanges = aKeys.length !== bKeys.length;

    // First handle keys that exist only on a
    for (const key of aKeys) {
      if (!(key in b)) {
        hasChanges = true;
        aDiff[key] = a[key];
        bDiff[key] = null;
      }
    }

    // Now handle both keys that exist only on b, and keys that exist on both
    for (const key of bKeys) {
      if (!(key in a)) {
        hasChanges = true;
        aDiff[key] = null;
        bDiff[key] = b[key];
      } else {
        const childChanges = _recursiveComputeChanges({ a: a[key], b: b[key] });
        if (childChanges.hasChanges) {
          hasChanges = true;
          aDiff[key] = childChanges.a;
          bDiff[key] = childChanges.b;
        }
      }
    }

    return { hasChanges, a: aDiff, b: bDiff };
  }

  return a !== b ? { hasChanges: true, a, b } : { hasChanges: false };
}

/**
 * Computes the diff entry for a given token UUID. Returns `null` when the old and new tokens are identical.
 * @param opts.uuid The UUID for a token in a given mode and platform (listing name).
 * @returns The computed diff entry if differences exist, `null` otherwise.
 */
function computeDiffEntry({
  uuid,
  oldToken,
  newToken,
}:
  | {
      uuid: string;
      oldToken: ListedTokenWithUUID;
      newToken?: ListedTokenWithUUID;
    }
  | {
      uuid: string;
      oldToken?: ListedTokenWithUUID;
      newToken: ListedTokenWithUUID;
    }): DiffEntry<ListedToken> | null {
  const [name, platform, mode] = uuid.split('...');
  if (!name || !platform || !mode) {
    throw new Error(`Invalid token uuid: ${uuid}`);
  }
  const changeType: ChangeType = !newToken ? 'removed' : !oldToken ? 'added' : 'modified';
  const outcome = _recursiveComputeChanges({
    a: { ...oldToken, uuid: undefined },
    b: { ...newToken, uuid: undefined },
  });

  return outcome.hasChanges
    ? {
        changeType,
        name,
        platform,
        // We use `mode: null` in output formats that should be interoperable,
        // and `mode: '.'` inside Terrazzo to represent a modeless token.
        mode: mode === '.' ? null : mode,
        old: (outcome.a ?? {}) as DeepPartial<ListedToken>,
        new: (outcome.b ?? {}) as DeepPartial<ListedToken>,
      }
    : null;
}

/**
 * Computes a diff between two token listings.
 * @param oldListing The old token listing.
 * @param newListing The new token listing.
 * @param opts.flat Whether to return flattened tokens (`true`) or DTCG tokens (`false`) in diff entries.
 * @param opts.modes Modes to include in the diff (pass '.' for tokens without a mode).
 * @param opts.platforms Platforms to include in the diff (matches the token listing names).
 * @returns The computed token listing diff.
 */
export function diffListings(
  oldListing: TokenListing,
  newListing: TokenListing,
  opts: DiffListingsOptions = {},
): TokenListingDiff {
  const data: (DiffEntry<ListedToken> | null)[] = [];

  // 0. Validate input
  validateListing(oldListing);
  validateListing(newListing);

  // 1. Sort all tokens by unique identifier on both old and new sets
  let oldTokens = _prepareAndSortListing(oldListing.data);
  let newTokens = _prepareAndSortListing(newListing.data);

  // 2. Apply platform and mode filters
  if (opts.platforms || opts.modes) {
    const filterToken = (token: ListedTokenWithUUID) => {
      const [_, platform, mode] = token.uuid.split('...');

      if (!platform || !mode) {
        return false;
      }

      if (opts.platforms && !opts.platforms.includes(platform)) {
        return false;
      }

      if (opts.modes && !opts.modes.includes(mode)) {
        return false;
      }

      return true;
    };

    oldTokens = oldTokens.filter(filterToken);
    newTokens = newTokens.filter(filterToken);
  }

  // 3. Browse both lists in parallel to inject entries
  let o = 0;
  let n = 0;

  while (o < oldTokens.length || n < newTokens.length) {
    const oldToken = oldTokens[o];
    const newToken = newTokens[n];

    // The newTokens list is over. All remaining tokens are removed in the diff.
    if (!newToken && oldToken) {
      data.push(computeDiffEntry({ uuid: oldToken.uuid, oldToken }));
      o++;
      continue;
    }

    // The oldTokens list is over. All remaining tokens are added in the diff.
    if (!oldToken && newToken) {
      data.push(computeDiffEntry({ uuid: newToken.uuid, newToken }));
      n++;
      continue;
    }

    // Help TS type inference.
    if (oldToken === undefined || newToken === undefined) {
      continue;
    }

    // Both lists still contain data. If names are equal, it means we're on the
    // same token and will report potential changes in the token. If oldToken.$name
    // is lexicographically smaller than newToken.$name, it means the old token
    // has been removed. If it's greater, it means the new token has been added.
    if (oldToken.uuid === newToken.uuid) {
      data.push(computeDiffEntry({ uuid: oldToken.uuid, oldToken, newToken }));
      o++;
      n++;
      continue;
    }

    // Advance only the list that's lagging behind in both these branches.
    if (oldToken.$name < newToken.$name) {
      data.push(computeDiffEntry({ uuid: oldToken.uuid, oldToken }));
      o++;
    } else {
      data.push(computeDiffEntry({ uuid: newToken.uuid, newToken }));
      n++;
    }
  }

  // 4. Return output format, filtering entries where tokens ended up being identical
  return {
    meta: {
      version: 1,
    },
    data: data
      .filter((entry): entry is DiffEntry<ListedToken> => entry !== null)
      .map((entry) => (opts.flat ? flattenDiffEntry(entry) : entry)),
  };
}
