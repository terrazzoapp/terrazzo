export function addToSet<T>(newValue: T) {
  return (current: Set<T>) => new Set([...current, newValue]);
}

export function removeFromSet<T>(oldValue: T) {
  return (current: Set<T>) => new Set([...current].filter((v) => v !== oldValue));
}
