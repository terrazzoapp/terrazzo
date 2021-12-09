import type Figma from 'figma-js';

export function svg(svgNode: Figma.Node): string {
  console.log(svgNode);
  return `<svg xmlns="http://www.w3.org/2000/svg"></svg>`;
}
