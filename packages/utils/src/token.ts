const ALIAS_RE = /^\{([^}]+)\}$/;

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
