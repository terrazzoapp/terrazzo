import wcmatch from './lib/wildcard-match.js';

const ALIAS_RE = /^\{([^}]+)\}$/;
const LAST_PART_RE = /([^.]+)$/;

/** parse an alias */
export function parseAlias(input: string): { id: string; mode?: string } {
  const match = input.match(ALIAS_RE);
  if (!match) return { id: input };
  const rawID = match[1] ?? match[0];
  const hashI = rawID.indexOf('#');
  return hashI === -1 ? { id: rawID } : { id: rawID.substring(0, hashI), mode: rawID.substring(hashI + 1) };
}

/** @deprecated use getAliasValue instead */
export const getAliasID = getAliasValue;

/** Unwrap an alias value */
export function getAliasValue(input: string): string {
  const { id, mode } = parseAlias(input);
  return mode ? `${id}#${mode}` : id;
}

/** is this token an alias of another? */
export function isAlias(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return ALIAS_RE.test(value);
}

/** match token against globs */
export function isTokenMatch(tokenID: string, globPatterns: string[]): string | undefined {
  for (const glob of globPatterns) {
    if (wcmatch(glob)(tokenID)) {
      return glob;
    }
  }
}

/** get last segment of a token ID */
export function getLocalID(id: string): string {
  if (!id.includes('.')) {
    return id;
  }
  const matches = id.match(LAST_PART_RE);
  return (matches && matches[1]) || id;
}

/** validate token ID */
export function invalidTokenIDError(id: string): string | undefined {
  if (typeof id !== 'string') {
    return 'Token ID must be a string';
  }
  if (!id) {
    return 'Token ID can’t be empty';
  }
  if (id.includes('{') || id.includes('}') || id.includes('#') || id.includes('..')) {
    return `Token IDs can’t contain {, }, or #, or multiple dots in a row`;
  }
}
