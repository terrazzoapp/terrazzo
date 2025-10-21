import type { TokenNormalized } from '@terrazzo/token-tools';

import { flattenDiffEntry } from './flatten.js';
import type { ChangeType, DeepObject, DeepPartial, DiffEntry, DiffTokensOptions } from './types.js';

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
 * Computes the diff entry for a given token.
 * @returns The computed diff entry.
 */
export function computeDiffEntry<T = TokenNormalized>({
  oldToken,
  newToken,
}: {
    oldToken?: T;
    newToken?: T;
  }): DiffEntry<T> {
  const changeType: ChangeType = !newToken ? 'removed' : !oldToken ? 'added' : 'modified';
  const outcome = _recursiveComputeChanges({
    a: { ...oldToken },
    b: { ...newToken },
  });

  return outcome.hasChanges
    ? {
        changeType,
        old: (changeType !== 'added' ? outcome.a ?? {} : {}) as DeepPartial<T>,
        new: (changeType !== 'removed' ? outcome.b ?? {} : {}) as DeepPartial<T>,
      }
    : {
      changeType: 'none',
      old: {} as DeepPartial<T>,
      new: {} as DeepPartial<T>,
    };
}



/**
 * Computes a diff between two tokens.
 * @param oldToken The old token.
 * @param newToken The new token.
 * @param opts.flat Whether to return flattened tokens (`true`) or DTCG tokens (`false`) in diff entries.
 * @returns The computed token diff.
 */
export function diffTokens(
  oldToken: TokenNormalized | null,
  newToken: TokenNormalized | null,
  opts: DiffTokensOptions = {},
): DiffEntry<TokenNormalized> {
  const entry = computeDiffEntry({ oldToken, newToken });
  return (opts.flat ? flattenDiffEntry(entry) : entry);
}
