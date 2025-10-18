import type { TokenNormalized } from '@terrazzo/token-tools';

import type { DeepObject, DiffEntry, DiffListingEntry, FlattenedObject } from './types.js';

/**
 * Escapes dots in a key by replacing them with `\.`, but not already escaped dots
 * @param key The key to escape
 * @returns The escaped key
 */
function _escapeKey(key: string): string {
  return key.replace(/\./g, '\\.');
}

/**
 * Checks if a value should be treated as an object for flattening purposes
 */
function _isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Internal recursive object flattener that compares both old and new tokens side-by-side
 * to determine when to stop recursing based on type divergence.
 * @param oldCurrent The subtree of the old token currently being processed.
 * @param newCurrent The subtree of the new token currently being processed.
 * @param prefix The prefix to apply to the flattened keys.
 * @param oldOutput The output object for old token flattened keys and values.
 * @param newOutput The output object for new token flattened keys and values.
 */
function _flattenDiff(
  oldCurrent: DeepObject | null | undefined,
  newCurrent: DeepObject | null | undefined,
  prefix: string,
  oldOutput: FlattenedObject,
  newOutput: FlattenedObject,
): void {
  // Get all unique keys from both objects
  const oldKeys = _isObject(oldCurrent) ? Object.keys(oldCurrent) : [];
  const newKeys = _isObject(newCurrent) ? Object.keys(newCurrent) : [];
  const allKeys = new Set([...oldKeys, ...newKeys]);

  for (const key of allKeys) {
    const escapedKey = _escapeKey(key);
    const currentKey = prefix ? `${prefix}.${escapedKey}` : escapedKey;

    const oldValue = _isObject(oldCurrent) ? oldCurrent[key] : undefined;
    const newValue = _isObject(newCurrent) ? newCurrent[key] : undefined;

    const oldIsObject = _isObject(oldValue);
    const newIsObject = _isObject(newValue);

    // If both are objects, recurse deeper
    if (oldIsObject && newIsObject) {
      _flattenDiff(oldValue, newValue, currentKey, oldOutput, newOutput);
    }
    // If only one is missing, recurse into the existing object to flatten all its properties
    else if (oldIsObject && newValue === undefined) {
      _flattenDiff(oldValue, {}, currentKey, oldOutput, newOutput);
    } else if (newIsObject && oldValue === undefined) {
      _flattenDiff({}, newValue, currentKey, oldOutput, newOutput);
    }
    // If types diverge (one is object, one is primitive) or both are primitives, stop here
    else {
      oldOutput[currentKey] = oldValue ?? null;
      newOutput[currentKey] = newValue ?? null;
    }
  }
}

/**
 * Flattens a diff entry's old and new DTCG token partials into objects with flattened nested
 * properties using dot-notation. Compares both tokens side-by-side to determine when to stop
 * recursing based on type divergence, ensuring both old and new have the same set of keys.
 * @param entry The diff entry to flatten.
 * @returns The diff entry with flattened old and new properties.
 */
export function flattenDiffEntry<T extends DeepObject = TokenNormalized>(entry: DiffEntry<T>): DiffEntry<FlattenedObject>;
export function flattenDiffEntry<T extends DeepObject = TokenNormalized>(entry: DiffListingEntry<T>): DiffListingEntry<FlattenedObject>;
export function flattenDiffEntry<T extends DeepObject = TokenNormalized>(entry: DiffEntry<T> | DiffListingEntry<T>): DiffEntry<FlattenedObject> | DiffListingEntry<FlattenedObject> {
  // Handle the case where both are null
  if (entry.old === null && entry.new === null) {
    return {
      ...entry,
      old: null,
      new: null,
    };
  }

  const oldOutput: FlattenedObject = {};
  const newOutput: FlattenedObject = {};

  _flattenDiff(entry.old, entry.new, '', oldOutput, newOutput);

  return {
    ...entry,
    old: oldOutput,
    new: newOutput,
  };
}
