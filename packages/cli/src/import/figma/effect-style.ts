import type { DropShadowEffect, InnerShadowEffect, Node } from '@figma/rest-api-spec';
import type { ShadowValue } from '@terrazzo/token-tools';

/** Return a shadow token from an effect */
export function effectStyle(node: Node): ShadowValue[] | undefined {
  if ('effects' in node) {
    const shadows = node.effects.filter((e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') as (
      | DropShadowEffect
      | InnerShadowEffect
    )[];
    if (shadows.length) {
      return shadows.map((s) => ({
        inset: s.type === 'INNER_SHADOW',
        offsetX: { value: s.offset.x, unit: 'px' },
        offsetY: { value: s.offset.y, unit: 'px' },
        blur: { value: s.radius, unit: 'px' },
        spread: { value: s.spread ?? 0, unit: 'px' },
        color: { colorSpace: 'srgb', components: [s.color.r, s.color.g, s.color.b], alpha: s.color.a },
      }));
    }
  }
}
