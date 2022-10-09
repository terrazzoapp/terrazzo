import type Figma from 'figma-api';
import color from 'better-color-tools';
import NP from 'number-precision';

export function colorToHex(c: Figma.Color): string {
  const {r, g, b, a} = c;
  return color.from([r, g, b, a]).hex;
}

export function linearGradient(node: Figma.Paint): string {
  let deg = 0;
  if (node.gradientHandlePositions) {
    const [{x: x1, y: y1}, {x: x2, y: y2}] = node.gradientHandlePositions;
    deg = NP.round(radToDeg(Math.atan2(x2 - x1, -(y2 - y1))), 2); // linear-gradient angles is so dumb :(
  }
  const colors = (node.gradientStops || []).map((stop) => `${color.from(colorToHex(stop.color))} ${NP.round(100 * stop.position, 2)}%`);
  return `linear-gradient(${deg}deg, ${colors.join(', ')})`;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
