/**
 * mapValues - apply a mapping function to each value of an object while
 * preserving the original keys.
 */
export function mapValues<T, U>(obj: Record<string, T>, fn: (value: T, key: string) => U): Record<string, U> {
  const out: Record<string, U> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = fn(value as T, key);
  }
  return out;
}

export default mapValues;
