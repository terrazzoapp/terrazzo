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

/**
 * Make a deterministic string from an object
 */
export function makeInputKey(input: Record<string, string | undefined>): string {
  return JSON.stringify(
    Object.fromEntries(Object.entries(input).sort((a, b) => a[0].localeCompare(b[0], 'en-us', { numeric: true }))),
  );
}
