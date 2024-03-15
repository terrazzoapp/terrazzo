export const isWCAG2LargeText = createXYInterpolator([ptToPx(18), 400], [ptToPx(14), 700]);

export function pxToPt(px: number) {
  return px * 0.75;
}

export function ptToPx(pt: number) {
  return pt / 0.75;
}

export function dimensionToPx(dimension: string | number) {
  if (typeof dimension === 'number') {
    return dimension;
  }
  if (dimension.endsWith('px')) {
    return parseFloat(dimension);
  }
  if (dimension.endsWith('em')) {
    return parseFloat(dimension) * 16;
  }
  if (dimension.endsWith('pt')) {
    return ptToPx(parseFloat(dimension));
  }
  throw new Error(`Can’t convert ${dimension} to px`);
}

export function round(n: number, decimals = 2): number {
  const precision = 10 ** decimals;
  return Math.round(n * precision) / precision;
}

/** Given 2 [x, y] coordinates, validate whether a 3rd [x, y] coordinate is on the line, or above it */
export function createXYInterpolator([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  return function (x: number, y: number) {
    const [lesserX, lesserY] = Math.min(x1, x2) === x1 ? [x1, y1] : [x2, y2];
    const [greaterX, greaterY] = lesserX === x1 ? [x2, y2] : [x1, y1];
    if (x < lesserX) {
      return false;
    }
    if (x >= greaterX && y >= greaterY) {
      return true;
    }
    const deltaX = Math.abs(greaterX - lesserX);
    const deltaY = Math.abs(greaterY - lesserY);
    return deltaY - ((x - lesserX) / deltaX) * deltaY > 0;
  };
}
