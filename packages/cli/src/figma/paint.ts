import type Figma from 'figma-js';
import color from 'better-color-tools';
import NP from 'number-precision';

/** convert Figma Color to hex */
export function colorToHex({ r, g, b, a }: Figma.Color): string {
  return color.from([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a]).hex;
}

/** convert Figma Gradient to CSS */
export function gradientToCSS(node: Figma.Paint): string {
  switch (node.type) {
    case 'GRADIENT_ANGULAR':
      return angularGradient(node);
    case 'GRADIENT_DIAMOND':
      return diamondGradient(node);
    case 'GRADIENT_LINEAR':
      return linearGradient(node);
    case 'GRADIENT_RADIAL':
      return radialGradient(node);
    default:
      throw new Error(`Cannot generate gradient from node type ${node.type}`);
  }
}

function angularGradient(node: Figma.Paint): string {
  console.log(node);
  return 'linear-gradient()';
}

function diamondGradient(node: Figma.Paint): string {
  console.log(node);
  return 'linear-gradient()';
}

function linearGradient(node: Figma.Paint): string {
  let deg: number | string = 0;
  if (node.gradientHandlePositions) {
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = node.gradientHandlePositions;
    // if x and y are close enough to corners, assume that intent
    if (x1 < 0.05 && y1 < 0.05 && x2 > 0.95 && y2 > 0.95) {
      deg = 'to right bottom';
    } else if (x1 > 0.95 && y1 < 0.05 && x2 < 0.05 && y2 > 0.95) {
      deg = 'to left bottom';
    } else if (x1 > 0.95 && y1 > 0.95 && x2 < 0.05 && y2 < 0.05) {
      deg = 'to left top';
    } else if (x1 < 0.05 && y1 > 0.95 && x2 > 0.95 && y2 < 0.05) {
      deg = 'to right top';
    }
    // otherwise, calculate degree (note: top, right, left, and bottom are equal to 0deg, 90deg, …)
    else {
      deg = NP.round(radToDeg(Math.atan2(x2 - x1, -(y2 - y1))), 2); // linear-gradient angles is so dumb :(
    }
  }
  const colors = (node.gradientStops || []).map((stop) => `${colorToHex(stop.color)} ${NP.round(100 * stop.position, 2)}%`);
  return `linear-gradient(${deg}deg, ${colors.join(', ')})`;
}

function radialGradient(node: Figma.Paint): string {
  console.log(node);
  return 'radial-gradient()';
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
