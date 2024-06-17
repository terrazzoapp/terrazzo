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

/** Zero-pad */
export function zeroPad(value: number, decimals: number): string {
  const output = String(snap(value, 1 / 10 ** decimals));
  const zeroI = output.indexOf('.');
  if (zeroI === -1) {
    return `${output}.${'0'.repeat(decimals)}`;
  }
  const zeroCount = decimals - (output.length - 1 - zeroI);
  return zeroCount >= 1 ? `${output}${'0'.repeat(zeroCount)}` : output;
}
