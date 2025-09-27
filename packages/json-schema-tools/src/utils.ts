/** Is this object a pure $ref? (no other properties) */
export function isPure$ref(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return '$ref' in value && Object.keys(value).length === 1;
}
