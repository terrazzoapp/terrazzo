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
export function isTokenMatch(tokenID: string, globPatterns: string[]): string | undefined {
  for (const glob of globPatterns) {
    if (wcmatch(glob)(tokenID)) {
      return glob;
    }
  }
}

/** Parse an alias */
export function parseAlias(input: string): { id: string; mode?: string } {
  const match = input.match(ALIAS_RE);
  if (!match) {
    return { id: input };
  }
  const rawID = match[1] ?? match[0];
  const hashI = rawID.indexOf('#');
  return hashI === -1 ? { id: rawID } : { id: rawID.substring(0, hashI), mode: rawID.substring(hashI + 1) };
}
