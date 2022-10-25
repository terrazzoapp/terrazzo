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
