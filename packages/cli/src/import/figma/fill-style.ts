import type { Node } from '@figma/rest-api-spec';
import type { ColorValue, GradientValue } from '@terrazzo/token-tools';

/** Return a color or gradient token from a fill */
export function fillStyle(node: Node): ColorValue | GradientValue | undefined {
  if ('fills' in node) {
    for (const fill of node.fills) {
      switch (fill.type) {
        case 'SOLID': {
          return { colorSpace: 'srgb', components: [fill.color.r, fill.color.g, fill.color.b], alpha: fill.color.a };
        }
        case 'GRADIENT_LINEAR':
        case 'GRADIENT_RADIAL':
        case 'GRADIENT_ANGULAR':
        case 'GRADIENT_DIAMOND': {
          return fill.gradientStops.map((stop) => ({
            position: stop.position,
            color: { colorSpace: 'srgb', components: [stop.color.r, stop.color.g, stop.color.b], alpha: stop.color.a },
          }));
        }
      }
    }
  }
}
