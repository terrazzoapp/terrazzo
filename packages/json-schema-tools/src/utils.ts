/** Is this object a pure $ref? (no other properties) */
export function isPure$ref(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return '$ref' in value && Object.keys(value).length === 1;
}

/** Equivalent of relative() in node:url module */
export function relPath(a: URL, b: URL): string {
  if (a.protocol !== b.protocol || a.origin !== b.origin) {
    return b.href;
  }
  if (a.href === b.href) {
    return '.';
  }
  // Note: test if the last segment is likely an extension, if so take the
  // current directory, otherwise leave alone
  const aNormalized = /\/[^.]+\..*$/.test(a.href) ? new URL('.', a) : a;
  const aParts = aNormalized.pathname.split('/').filter(Boolean);
  const bParts = b.pathname.split('/').filter(Boolean);
  let diff = 0;
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    if (aParts[i] === bParts[i]) {
      aParts.splice(0, 1);
      bParts.splice(0, 1);
      i = -1; // will be set to 0 next loop
    } else if (i > aParts.length - 1) {
      break;
    } else {
      diff = Math.max(aParts.length, bParts.length - 1);
      break;
    }
  }
  return `${diff > 0 ? `${('../').repeat(diff)}` : './'}${bParts.join('/')}`;
}
