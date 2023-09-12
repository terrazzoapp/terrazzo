/** deeply-duplicate an object */
export function cloneDeep<T = unknown>(item: T): T {
  if (!item || typeof item === 'string' || typeof item === 'boolean' || typeof item === 'number') return item;
  if (Array.isArray(item)) {
    const newArr: unknown[] = [];
    for (const i of item) {
      newArr.push(cloneDeep(i));
    }
    return newArr as T;
  }
  const newObj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item)) {
    newObj[k] = cloneDeep(v);
  }
  return newObj as T;
}

/** set a nested value within an object safely
 * We can assume that all token ids will be dot-notation, so we don't need to handle
 * array accessors or string accessors.
 */
export function set<T extends Record<string, any>>(obj: T, key: keyof T, value: any): T {
  const rest = String(key).split('.');
  const root = rest.shift()! as keyof T;
  if (root === '') {
    return obj;
  }

  if (rest.length === 0) {
    obj[root!] = value;
    return obj;
  }

  obj[root] = (obj[root] as any) ?? ({} as any);

  return set(obj[root], rest.join('.'), value);
}
