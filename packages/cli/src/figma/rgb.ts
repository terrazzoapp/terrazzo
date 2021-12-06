import type figma from 'figma-js';
import color from 'better-color-tools';

/** convert Figma Color to hex */
export function colorToHex({ r, g, b, a }: figma.Color): string {
  return color.from([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a]).hex;
}
