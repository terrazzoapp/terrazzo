import wcmatch from 'wildcard-match';

const ALIAS_RE = /^\{([^}]+)\}$/;

/** Is this token an alias of another? */
export function isAlias(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  return ALIAS_RE.test(value);
}

/** Match token against globs */
export function isTokenMatch(tokenID: string, globPatterns: string[]): boolean {
  return wcmatch(globPatterns)(tokenID);
}

/** Same as isTokenMatch but returns the matching pattern */
export function getTokenMatch(tokenId: string, globPatterns: string[]): string | undefined {
  for (const pattern of globPatterns) {
    if (wcmatch(pattern)(tokenId)) {
      return pattern;
    }
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
  return { local: id.substring(lastSeparatorI + 1), group: id.substring(0, lastSeparatorI) };
}
