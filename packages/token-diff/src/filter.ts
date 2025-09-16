import type { ChangeType, TokenListingDiff } from './lib.js';

export type { DiffListingsOptions, TokenListingDiff } from './lib.js';

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
