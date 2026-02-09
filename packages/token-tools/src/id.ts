import wcmatch from 'wildcard-match';

const ALIAS_RE = /^\{([^}]+)\}$/;

/** Is this token an alias of another? */
export function isAlias(value: string): boolean {
  return ALIAS_RE.test(value);
}

/** Create a token matcher function using . separated glob patterns */
export function getTokenMatcher(globPatterns: string | string[]): (tokenId: string) => boolean {
  return wcmatch(globPatterns, '.');
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
