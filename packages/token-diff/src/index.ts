import type { ListedToken, TokenListing } from '@terrazzo/plugin-token-listing';
import type { ChangeType, ListedTokenOnPlatform, ListedTokenPartial, TokenListingDiff } from './lib.js';

export type { TokenListingDiff } from './lib.js';

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

  // TODO improve validation later.
  if (listing.data.some((token) => typeof token !== 'object' || token === null || !('$value' in token))) {
    throw new Error('Invalid listing: all items in data should be valid design tokens');
  }
}

function prepareAndSortListing(data: ListedToken[]): ListedTokenOnPlatform[] {
  return data
    .flatMap((token) =>
      Object.keys(token.$extensions['app.terrazzo.listing'].names).map((platformKey) =>
        structuredClone({
          ...token,
          uuid: `${token.$name}...${platformKey}...${token.$extensions['app.terrazzo.listing'].mode}`,
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

// 3. accumulate all changes with a changeType across a single array
function computeChanges(
  oldToken?: ListedTokenOnPlatform,
  newToken?: ListedTokenOnPlatform,
): { old: ListedTokenPartial; new: ListedTokenPartial } {
  const oldValues: ListedTokenPartial = { $extensions: { 'app.terrazzo.listing': {} } };
  const newValues: ListedTokenPartial = { $extensions: { 'app.terrazzo.listing': {} } };

  if (oldToken?.$value !== newToken?.$value) {
    oldValues.$value = oldToken?.$value ?? null;
    newValues.$value = newToken?.$value ?? null;
  }
  if (oldToken?.$type !== newToken?.$type) {
    oldValues.$type = oldToken?.$type ?? null;
    newValues.$type = newToken?.$type ?? null;
  }
  if (oldToken?.$description !== newToken?.$description) {
    oldValues.$description = oldToken?.$description ?? null;
    newValues.$description = newToken?.$description ?? null;
  }
  if (oldToken?.$deprecated !== newToken?.$deprecated) {
    oldValues.$deprecated = oldToken?.$deprecated ?? null;
    newValues.$deprecated = newToken?.$deprecated ?? null;
  }

  // TODO
  // all in extensions

  return { old: oldValues, new: newValues };
}

function computeDiffReport({
  uuid,
  oldToken,
  newToken,
}:
  | {
      uuid: string;
      oldToken: ListedTokenOnPlatform;
      newToken?: ListedTokenOnPlatform;
    }
  | {
      uuid: string;
      oldToken?: ListedTokenOnPlatform;
      newToken: ListedTokenOnPlatform;
    }) {
  const [name, platform, mode] = uuid.split('...');
  if (!name || !platform) {
    throw new Error(`Invalid token uuid: ${uuid}`);
  }
  const changeType: ChangeType = !newToken ? 'removed' : !oldToken ? 'added' : 'modified';
  const { old, new: newValues } = computeChanges(oldToken, newToken);

  return { changeType, uuid: uuid, name, platform, mode, old, new: newValues };
}

export function diff(oldListing: TokenListing, newListing: TokenListing): TokenListingDiff {
  const reports: TokenListingDiff = {
    meta: {
      version: 1,
    },
    data: [],
  };

  // 0. validate input
  validateListing(oldListing);
  validateListing(newListing);

  // 1. sort all tokens by unique identifier on both old and new sets
  const oldTokens = prepareAndSortListing(oldListing.data);
  const newTokens = prepareAndSortListing(newListing.data);

  // 2. browse both lists in parallel
  let o = 0;
  let n = 0;

  while (o < oldTokens.length || n < newTokens.length) {
    const oldToken = oldTokens[o];
    const newToken = newTokens[n];

    // The newTokens list is over. All remaining tokens are removed in the diff.
    if (!newToken && oldToken) {
      reports.data.push(computeDiffReport({ uuid: oldToken.uuid, oldToken }));
      o++;
      continue;
    }

    // The oldTokens list is over. All remaining tokens are added in the diff.
    if (!oldToken && newToken) {
      reports.data.push(computeDiffReport({ uuid: newToken.uuid, newToken }));
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
      reports.data.push(computeDiffReport({ uuid: oldToken.uuid, oldToken, newToken }));
      o++;
      n++;
      continue;
    }

    // Advance only the list that's lagging behind in both these branches.
    if (oldToken.$name < newToken.$name) {
      reports.data.push(computeDiffReport({ uuid: oldToken.uuid, oldToken }));
      o++;
    } else {
      reports.data.push(computeDiffReport({ uuid: newToken.uuid, newToken }));
      n++;
    }
  }

  return reports;
}

// TODO
// 4. provide helpers to get all additions/removals/changes/deprec. changes per mode/platform, etc
