import type { ListedToken, TokenListing } from '@terrazzo/token-tools/listing';
import { validateListing } from '@terrazzo/token-tools/listing';

import { computeDiffEntry } from './token.js';
import { flattenDiffEntry } from './flatten.js';
import type {
  ChangeType,
  DiffListingEntry,
  DiffTokenListingsOptions,
  ListedTokenWithUUID,
  TokenListingDiff,
} from './types.js';

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
 * Computes the diff entry for a given token UUID. Returns `null` when the old and new tokens are identical.
 * @param opts.uuid The UUID for a token in a given mode and platform (listing name).
 * @returns The computed diff entry if differences exist, `null` otherwise.
 */
function computeDiffListingEntry({
  uuid,
  oldToken,
  newToken,
}:{
    uuid: string;
    oldToken?: ListedTokenWithUUID;
    newToken?: ListedTokenWithUUID;
  }
): DiffListingEntry<ListedToken> {
  const [name, platform, mode] = uuid.split('...');
  if (!name || !platform || !mode) {
    throw new Error(`Invalid token uuid: ${uuid}`);
  }

  return {
    ...computeDiffEntry<ListedToken>({ oldToken, newToken }),
    name,
    platform,
    // We use `mode: null` in output formats that should be interoperable,
    // and `mode: '.'` inside Terrazzo to represent a modeless token.
    mode: mode === '.' ? null : mode,
  };
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
export function diffTokenListings(
  oldListing: TokenListing,
  newListing: TokenListing,
  opts: DiffTokenListingsOptions = {},
): TokenListingDiff {
  const data: (DiffListingEntry<ListedToken>)[] = [];

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
      data.push(computeDiffListingEntry({ uuid: oldToken.uuid, oldToken }));
      o++;
      continue;
    }

    // The oldTokens list is over. All remaining tokens are added in the diff.
    if (!oldToken && newToken) {
      data.push(computeDiffListingEntry({ uuid: newToken.uuid, newToken }));
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
      data.push(computeDiffListingEntry({ uuid: oldToken.uuid, oldToken, newToken }));
      o++;
      n++;
      continue;
    }

    // Advance only the list that's lagging behind in both these branches.
    if (oldToken.$name < newToken.$name) {
      data.push(computeDiffListingEntry({ uuid: oldToken.uuid, oldToken }));
      o++;
    } else {
      data.push(computeDiffListingEntry({ uuid: newToken.uuid, newToken }));
      n++;
    }
  }

  // 4. Return output format, filtering entries where tokens ended up being identical
  return {
    meta: {
      version: 1,
    },
    data: data
      .filter((entry) => entry.changeType !== 'none')
      .map((entry) => (opts.flat ? ({
        ...flattenDiffEntry(entry),
        name: entry.name,
        platform: entry.platform,
        mode: entry.mode,
      }) : entry)),
  };
}

/**
 * Filters diff entries by change types
 * @param diff The token listing diff to filter.
 * @param changeTypes A change type or list of change types to include in the filtered results.
 * @returns A new diff containing only entries with the specified change types.
 */
export function filterByChangeType(diff: TokenListingDiff, changeTypes: ChangeType | ChangeType[]): TokenListingDiff {
  const changeTypeList = Array.isArray(changeTypes) ? changeTypes : [changeTypes];
  return {
    meta: diff.meta,
    data: diff.data.filter((entry) => changeTypeList.includes(entry.changeType)),
  };
}

/**
 * Filters diff entries by platforms
 * @param diff The token listing diff to filter.
 * @param platforms A platform or list of platforms to include in the filtered results.
 * @returns A new diff containing only entries with the specified platforms.
 */
export function filterByPlatform(diff: TokenListingDiff, platforms: string | string[]): TokenListingDiff {
  const platformList = Array.isArray(platforms) ? platforms : [platforms];
  return {
    meta: diff.meta,
    data: diff.data.filter((entry) => platformList.includes(entry.platform)),
  };
}

/**
 * Filters diff entries by modes (supports null for non-moded tokens)
 * Modeless tokens can be filtered using either `null` or Terrazzo's `'.'` representation.
 * @param diff The token listing diff to filter.
 * @param modes A mode or list of modes to include in the filtered results. Use `null` or `'.'` to include modeless tokens.
 * @returns A new diff containing only entries with the specified modes.
 */
export function filterByMode(diff: TokenListingDiff, modes: string | null | (string | null)[]): TokenListingDiff {
  const modesList = (Array.isArray(modes) ? modes : [modes]).map((m) => (m === '.' ? null : m));
  return {
    meta: diff.meta,
    data: diff.data.filter((entry) => modesList.includes(entry.mode)),
  };
}

/**
 * Filters diff entries by token types (checks both old and new tokens)
 * @param diff The token listing diff to filter.
 * @param tokenTypes A token type or list of token types to include in the filtered results.
 * @returns A new diff containing only entries with the specified token types.
 */
export function filterByTokenType(diff: TokenListingDiff, tokenTypes: string | string[]): TokenListingDiff {
  const tokenTypeList = Array.isArray(tokenTypes) ? tokenTypes : [tokenTypes];
  return {
    meta: diff.meta,
    data: diff.data.filter((entry) => {
      const oldType = entry.old?.$type;
      const newType = entry.new?.$type;
      return tokenTypeList.includes(oldType || '') || tokenTypeList.includes(newType || '');
    }),
  };
}

/**
 * Filters diff entries by token names using exact match or regex pattern
 * @param diff The token listing diff to filter.
 * @param names A name, list of names or regex pattern to match against token names.
 * @returns A new diff containing only entries with names matching the specified criteria.
 */
export function filterByName(diff: TokenListingDiff, names: string | string[] | RegExp): TokenListingDiff {
  return {
    meta: diff.meta,
    data: diff.data.filter((entry) => {
      if (names instanceof RegExp) {
        return names.test(entry.name);
      }

      if (Array.isArray(names)) {
        return names.includes(entry.name);
      }

      return entry.name === names;
    }),
  };
}
