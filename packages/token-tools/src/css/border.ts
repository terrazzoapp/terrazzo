import { displayable } from 'culori';
import type { BorderValue } from '../types.js';
import { transformColorValue } from './color.js';
import { transformDimensionValue } from './dimension.js';
import { type IDGenerator, defaultAliasTransform } from './lib.js';
import { transformStrokeStyleValue } from './stroke-style.js';

/** Convert border value to multiple CSS values */
export function transformBorderValue(
  value: BorderValue,
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
    color: colorOptions,
  }: {
    aliasOf?: string;
    partialAliasOf?: Partial<Record<keyof typeof value, string>>;
    transformAlias?: IDGenerator;
    color?: { legacyHex?: boolean };
  },
) {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }

  const width = partialAliasOf?.width
    ? transformAlias(partialAliasOf.width)
    : transformDimensionValue(value.width, { transformAlias });
  const color = partialAliasOf?.color
    ? transformAlias(partialAliasOf.color)
    : transformColorValue(value.color, { transformAlias, color: colorOptions });
  const style = partialAliasOf?.style
    ? transformAlias(partialAliasOf.style)
    : transformStrokeStyleValue(value.style, { transformAlias });

  const formatBorder = (colorKey: string) =>
    [width, style, typeof color === 'string' ? color : color[colorKey as keyof typeof color]].join(' ');

  return typeof color === 'string' || displayable(color.p3)
    ? formatBorder('.')
    : {
        '.': formatBorder('.'),
        srgb: formatBorder('srgb'),
        p3: formatBorder('p3'),
        rec2020: formatBorder('rec2020'),
      };
}
