import type { TokenNormalized } from '@terrazzo/token-tools';
import type { ListedToken } from '@terrazzo/token-tools/listing';

export type ListedTokenWithUUID = ListedToken & { uuid: string };

export type ChangeType = 'added' | 'removed' | 'modified' | 'none';

export type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T | null;

export interface DiffEntry<T = TokenNormalized> {
  changeType: ChangeType;
  old: DeepPartial<T> | null;
  new: DeepPartial<T> | null;
}

export interface DiffListingEntry<T = ListedToken> extends DiffEntry<T> {
  name: string;
  platform: string;
  mode: string | null;
}

export interface TokenListingDiff {
  meta: {
    version: 1;
  };
  data: DiffListingEntry<ListedToken>[];
}

export type DeepObject =
  // biome-ignore lint/suspicious/noExplicitAny: can't map token types and deep objects if using anything other than any
  | Record<string | number | symbol, any>
  | string
  | number
  | boolean
  | null
  | {
      [K in PropertyKey]?: string | number | boolean | null | DeepObject;
    };

export type FlattenedObject = Record<string, string | number | boolean | null>;

export interface DiffTokensOptions {
  /** Whether to return flattened tokens (`true`) or DTCG tokens (`false`) in diff entries. */
  flat?: boolean;
}

export interface DiffTokenListingsOptions {
  /** Whether to return flattened tokens (`true`) or DTCG tokens (`false`) in diff entries. */
  flat?: boolean;

  /** Modes to include in the diff (pass '.' for tokens without a mode). */
  modes?: (string | '.')[];

  /** Platforms to include in the diff (matches the token listing names). */
  platforms?: string[];
}
