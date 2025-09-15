import type { ListedExtension, ListedToken } from '@terrazzo/plugin-token-listing';

export type ListedTokenOnPlatform = ListedToken & { uuid: string };

export type ChangeType = 'added' | 'removed' | 'modified';

export type ListedTokenPartial = Partial<{
  [K in keyof ListedToken]: K extends '$extensions'
    ? // the top-level $extensions must not be null, and its contents follow ExtensionsPartial rules
      { 'app.terrazzo.listing': Partial<{ [P in keyof ListedExtension]: ListedExtension[P] | null }> }
    : // all other top-level properties can be the original type or null
      ListedToken[K] | null;
}>;

export interface TokenListingDiffEntry {
  changeType: ChangeType;
  uuid: string;
  name: string;
  platform: string;
  mode?: string;
  old: ListedTokenPartial | null;
  new: ListedTokenPartial | null;
}

export interface TokenListingDiff {
  meta: {
    version: 1;
  };
  data: TokenListingDiffEntry[];
}
