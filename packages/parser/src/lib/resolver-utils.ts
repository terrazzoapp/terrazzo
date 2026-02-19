import { alphaComparator } from './array.js';

/**
 * If tokens are found inside a resolver, strip out the resolver paths (don’t
 * include "sets"/"modifiers" in the token ID etc.)
 */
export function filterResolverPaths(path: string[]): string[] {
  switch (path[0]) {
    case 'sets': {
      return path.slice(4);
    }
    case 'modifiers': {
      return path.slice(5);
    }
    case 'resolutionOrder': {
      switch (path[2]) {
        case 'sources': {
          return path.slice(4);
        }
        case 'contexts': {
          return path.slice(5);
        }
      }
      break;
    }
  }
  return path;
}

/** Make a deterministic string from an object */
export function getPermutationID(input: Record<string, string | undefined>): string {
  const keys = Object.keys(input).sort(alphaComparator);
  const sortedInput = {} as typeof input;
  for (const k of keys) {
    sortedInput[k] = input[k];
  }
  return JSON.stringify(sortedInput);
}

/**
 * Destructively merge B into A, with B overwriting A
 *
 * This is needed for resolvers because we need a really performant way to merge
 * token sets. merge-anything is a package we use for merging more complex
 * configurations like terrazzo.config.ts files, but that’s too slow for tokens.
 */
export function destructiveMerge(a: object, b: object): void {
  if (!a || !b || typeof b !== 'object') {
    return;
  }
  for (const k in b) {
    if (!Object.hasOwn(b, k)) {
      continue;
    }
    const b2 = (b as any)[k];
    if (b2 != null && typeof b2 === 'object') {
      if (Array.isArray(b2)) {
        (a as any)[k] = []; // arrays are overwritten; always make an empty one
        destructiveMerge((a as any)[k], [...b2]); // shallow copy
      } else {
        if (!(k in a)) {
          (a as any)[k] = {}; // objects are merged; create empty one if none exists
        }
        destructiveMerge((a as any)[k], { ...b2 }); // shallow copy
      }
    } else {
      (a as any)[k] = b2;
    }
  }
}
