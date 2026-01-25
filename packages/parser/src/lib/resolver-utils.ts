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
  const keys = Object.keys(input).sort((a, b) => a.localeCompare(b, 'en-us', { numeric: true }));
  return JSON.stringify(Object.fromEntries(keys.map((k) => [k, input[k]])));
}
