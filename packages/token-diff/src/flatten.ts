import type { ListedToken } from '@terrazzo/plugin-token-listing';
import type { DeepObject, DeepPartial, DiffEntry, FlattenedObject } from './lib.js';

/**
 * Escapes dots in a key by replacing them with `\.`, but not already escaped dots
 * @param key The key to escape
 * @returns The escaped key
 */
function _escapeKey(key: string): string {
  return key.replace(/\./g, '\\.');
}

/**
 * Internal recursive object flattener.
 * @param current The subtree of the object currently being processed.
 * @param prefix The prefix to apply to the flattened keys.
 * @param output The output object to populate with flattened keys and values.
 */
function _flatten(current: DeepObject & Record<string, unknown>, prefix: string, output: FlattenedObject): void {
  for (const [key, value] of Object.entries(current)) {
    // Escape dots in the key to prevent them from being treated as path separators
    const escapedKey = _escapeKey(key);
    const newKey = prefix ? `${prefix}.${escapedKey}` : escapedKey;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      _flatten(value, newKey, output);
    } else {
      output[newKey] = value;
    }
  }
}

/**
 * Flattens a design token inside a diff entry by converting nested props to dot-notation keys.
 * @param token The DTCG listed token to flatten.
 * @returns The flattened equivalent to the token.
 */
function _flattenDiffEntryToken(token: DeepPartial<ListedToken>): FlattenedObject {
  const result: FlattenedObject = {};
  _flatten(token, '', result);
  return result;
}

/**
 * Flattens a diff entry's old and new DTCG token partials into objects that flattened nested
 * properties using dot-notation.
 * @param entry The diff entry to flatten.
 * @returns The diff entry with flattened old and new properties.
 */
export function flattenDiffEntry(entry: DiffEntry<ListedToken>): DiffEntry<FlattenedObject> {
  return {
    ...entry,
    old: entry.old ? _flattenDiffEntryToken(entry.old) : null,
    new: entry.new ? _flattenDiffEntryToken(entry.new) : null,
  };
}

/**
 * Unescapes dots in a key by replacing `\.` with `.`
 * @param key The key to unescape.
 * @returns The unescaped key.
 */
function _unescapeKey(key: string): string {
  return key.replace(/\\./g, '.');
}

/**
 * Splits a flattened key into path segments, respecting escaped dots.
 * @param key The flattened key to split.
 * @returns Array of path segments with unescaped dots.
 */
function _splitFlattenedKey(key: string): string[] {
  const parts: string[] = [];
  let current = '';
  let i = 0;

  while (i < key.length) {
    if (key[i] === '\\' && i + 1 < key.length && key[i + 1] === '.') {
      // Escaped dot - add the dot to current part and skip the escape character
      current += '.';
      i += 2;
    } else if (key[i] === '.') {
      // Unescaped dot - end current part and start new one
      parts.push(current);
      current = '';
      i++;
    } else {
      // Regular character
      current += key[i];
      i++;
    }
  }

  // Add the last part
  if (current !== '') {
    parts.push(current);
  }

  return parts;
}

/**
 * Unflattens a flat object by converting dot-notation keys back to nested properties.
 * @param obj The flat object to unflatten.
 * @returns The unflattened equivalent to the object.
 */
function _unflattenDiffEntryToken(obj: DeepPartial<FlattenedObject>): DeepObject {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: DeepObject = {};

  for (const [key, value] of Object.entries(obj)) {
    const parts = _splitFlattenedKey(key);
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!part && part !== '') {
        continue;
      }
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart !== undefined) {
      current[lastPart] = value;
    }
  }

  return result;
}

/**
 * Unflattens a flat diff entry back to DTCG-compliant token partials.
 * @param entry The flat diff entry to unflatten.
 * @returns The diff entry with unflattened old and new properties.
 * @warning Arrays are not handled.
 * @warning Properties that originally contained dots in their names will be split into nested objects.
 */
export function unflattenDiffEntry(entry: DiffEntry<FlattenedObject>): DiffEntry<ListedToken> {
  return {
    changeType: entry.changeType,
    name: entry.name,
    platform: entry.platform,
    mode: entry.mode,
    old: entry.old ? (_unflattenDiffEntryToken(entry.old) as DeepPartial<ListedToken>) : null,
    new: entry.new ? (_unflattenDiffEntryToken(entry.new) as DeepPartial<ListedToken>) : null,
  };
}
