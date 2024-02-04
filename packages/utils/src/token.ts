import wcmatch from './lib/wildcard-match.js';

const ALIAS_RE = /^\{([^}]+)\}$/;
const LAST_PART_RE = /([^.]+)$/;

/** get the token ID of an alias */
export function getAliasID(input: string): string {
  const match = input.match(ALIAS_RE);
  if (!match) return input;
  return match[1] ?? match[0];
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
