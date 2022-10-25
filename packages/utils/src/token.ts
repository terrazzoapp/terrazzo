const ALIAS_RE = /^{[^{}]+}$/;

/** is this token an alias of another? */
export function isAlias(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return ALIAS_RE.test(value);
}
