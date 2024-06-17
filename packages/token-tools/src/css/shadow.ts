import type { ShadowTokenNormalized, ShadowValueNormalized } from '../types';
import { transformColorValue } from './color.js';
import { transformDimensionValue } from './dimension.js';
import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert shadow subvalue to CSS */
export function transformShadowLayer(
  value: ShadowValueNormalized,
  {
    color,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    color: string;
    partialAliasOf?: Partial<Record<keyof ShadowValueNormalized, string>>;
    transformAlias?: IDGenerator;
  },
): string | Record<string, string> {
  const offsetX = partialAliasOf?.offsetX
    ? transformAlias(partialAliasOf.offsetX)
    : transformDimensionValue(value.offsetX, { transformAlias });
  const offsetY = partialAliasOf?.offsetY
    ? transformAlias(partialAliasOf.offsetY)
    : transformDimensionValue(value.offsetY, { transformAlias });
  const blur = partialAliasOf?.blur
    ? transformAlias(partialAliasOf.blur)
    : transformDimensionValue(value.blur, { transformAlias });
  const spread = partialAliasOf?.spread
    ? transformAlias(partialAliasOf.spread)
    : transformDimensionValue(value.spread, { transformAlias });

  return [offsetX, offsetY, blur, spread, color].join(' ');
}

/** Convert shadow value to CSS */
export function transformShadowValue(
  value: ShadowTokenNormalized['$value'],
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: Partial<Record<keyof ShadowValueNormalized, string>>[];
    transformAlias?: IDGenerator;
  } = {},
): string | Record<string, string> {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  const colors = value.map(({ color }, i) =>
    partialAliasOf?.[i]?.color
      ? transformAlias(partialAliasOf[i]!.color!)
      : transformColorValue(color, { transformAlias }),
  );
  const isHDR = colors.some((c) => typeof c === 'object');

  const formatShadow = (colorKey: string) =>
    value
      .map((v, i) =>
        transformShadowLayer(v, {
          color:
            typeof colors[i] === 'string'
              ? (colors[i] as string)
              : colors[i]![colorKey as keyof (typeof colors)[number]]!,
          partialAliasOf: partialAliasOf?.[i],
          transformAlias,
        }),
      )
      .join(', ');

  return !isHDR
    ? formatShadow('.')
    : { '.': formatShadow('.'), srgb: formatShadow('srgb'), p3: formatShadow('p3'), rec2020: formatShadow('rec2020') };
}
