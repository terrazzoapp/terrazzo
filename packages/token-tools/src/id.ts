import wcmatch from 'wildcard-match';

const ALIAS_RE = /^\{([^}]+)\}$/;

/** Is this token an alias of another? */
export function isAlias(value: string): boolean {
  return ALIAS_RE.test(value);
}

const _CATCHALL_MATCHER = wcmatch('.*');

/** Only create unique wcmatch instances, and cache across the lifespan of a run */
export class CachedWildcardMatcher {
  cachedMatchers: Record<string, ReturnType<typeof wcmatch>> = {};
  /** This is a separate cache because of the "." separator. */
  cachedTokenIDMatchers: Record<string, ReturnType<typeof wcmatch>> = {};

  constructor() {
    this.reset();
  }

  /** Generic wildcard matcher */
  match(...params: Parameters<typeof wcmatch>): ReturnType<typeof wcmatch> {
    const key = JSON.stringify(params[0]); // Note: believe-it-or-not, JSON.stringify() beats String() for coercion speed here
    if (!(key in this.cachedMatchers)) {
      this.cachedMatchers[key] = wcmatch(params[0], params[1] ?? false);
    }
    return this.cachedMatchers[key]!;
  }

  /** Wildcard matcher specifically for Token IDs (provides "." as separator). */
  tokenIDMatch(pattern: Parameters<typeof wcmatch>[0]): ReturnType<typeof wcmatch> {
    const key = JSON.stringify(pattern);
    if (!(key in this.cachedTokenIDMatchers)) {
      this.cachedTokenIDMatchers[key] = wcmatch(pattern, '.');
    }
    return this.cachedTokenIDMatchers[key]!;
  }

  /** Garbage collect all caches, reset to initial state */
  reset() {
    this.cachedMatchers = { '': _CATCHALL_MATCHER, '*': _CATCHALL_MATCHER, '**': _CATCHALL_MATCHER };
    this.cachedTokenIDMatchers = { '': _CATCHALL_MATCHER, '*': _CATCHALL_MATCHER, '**': _CATCHALL_MATCHER };
  }
}

/** Make an alias */
export function makeAlias(input: string): string {
  return input.replace(/^\{?([^}]+)\}?$/, '{$1}');
}

/** Parse an alias */
export function parseAlias(input: string): string {
  // TODO: deprecate in future
  if (input.includes('#')) {
    throw new Error(
      'Mode aliases (# character) are no longer supported as of v0.6.0. Alias the root token instead, and apply modes in plugins.',
    );
  }
  const match = input.match(ALIAS_RE);
  if (!match) {
    return input;
  }
  return match[1] ?? match[0];
}

/** split a token ID into a local ID and group ID */
export function splitID(id: string): { local: string; group?: string } {
  const lastSeparatorI = id.lastIndexOf('.');
  if (lastSeparatorI === -1) {
    return { local: id };
  }
  return {
    local: id.substring(lastSeparatorI + 1),
    group: id.substring(0, lastSeparatorI),
  };
}
