import type figma from 'figma-js';
import color from 'better-color-tools';
import NP from 'number-precision';

/** convert Figma Color to hex */
export function colorToHex({ r, g, b, a }: figma.Color): string {
  return color.from([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a]).hex;
}

/** convert Figma Gradient to CSS */
export function gradientToCSS(node: figma.Paint): string {
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

function angularGradient(node: figma.Paint): string {
  console.log(node);
  return 'linear-gradient()';
}

function diamondGradient(node: figma.Paint): string {
  console.log(node);
  return 'linear-gradient()';
}

function linearGradient(node: figma.Paint): string {
  let deg = 0;
  if (node.gradientHandlePositions) {
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = node.gradientHandlePositions;
    deg = NP.round(radToDeg(Math.atan2(x2 - x1, -(y2 - y1))), 2); // linear-gradient angles is so dumb :(
  }
  const colors = (node.gradientStops || []).map((stop) => `${colorToHex(stop.color)} ${NP.round(100 * stop.position, 2)}%`);
  return `linear-gradient(${deg}deg, ${colors.join(', ')})`;
}

function radialGradient(node: figma.Paint): string {
  console.log(node);
  return 'radial-gradient()';
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
