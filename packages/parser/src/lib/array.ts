/** JS compiler-optimizable comparator */
export function alphaComparator(a: string, b: string): number {
  return a.localeCompare(b, 'en-us', { numeric: true });
}
