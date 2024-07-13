/** Clamp a number between 2 values */
export function clamp(value: number, min: number, max: number) {
  if (typeof value !== 'number') {
    return value;
  }
  return Math.min(Math.max(value, min), max);
}

/** Snap a number to n decimal places */
export function snap(value: number, precision: number) {
  if (typeof value !== 'number' || precision <= 0 || precision > 1 || value % 1 === 0) {
    return value;
  }
  const p = 1 / precision;
  return Math.round(value * p) / p;
}
