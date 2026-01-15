import type {
  ColorTokenNormalized,
  DimensionTokenNormalized,
  ShadowTokenNormalized,
  ShadowValueNormalized,
} from '../types.js';
import { transformColor } from './color.js';
import type { StrictTransformCSSValueOptions } from './css-types.js';
import { transformDimension } from './dimension.js';
import { defaultAliasTransform } from './lib.js';

/** Convert shadow subvalue to CSS */
export function transformShadowLayer(
  value: ShadowValueNormalized,
  options: StrictTransformCSSValueOptions & {
    colorValue: string;
    partialAliasOf?: Partial<Record<keyof typeof value, string>>;
  },
): string | Record<string, string> {
  const { tokensSet, colorValue, partialAliasOf, transformAlias = defaultAliasTransform } = options;
  const offsetX = partialAliasOf?.offsetX
    ? transformAlias(tokensSet[partialAliasOf.offsetX])
    : transformDimension({ $value: value.offsetX } as DimensionTokenNormalized, options);
  const offsetY = partialAliasOf?.offsetY
    ? transformAlias(tokensSet[partialAliasOf.offsetY])
    : transformDimension({ $value: value.offsetY } as DimensionTokenNormalized, options);
  const blur = partialAliasOf?.blur
    ? transformAlias(tokensSet[partialAliasOf.blur])
    : transformDimension({ $value: value.blur } as DimensionTokenNormalized, options);
  const spread = partialAliasOf?.spread
    ? transformAlias(tokensSet[partialAliasOf.spread])
    : transformDimension({ $value: value.spread } as DimensionTokenNormalized, options);
  const inset = value?.inset === true ? 'inset' : undefined;

  return [inset, offsetX, offsetY, blur, spread, colorValue].filter(Boolean).join(' ');
}

/** Convert shadow value to CSS */
export function transformShadow(
  token: ShadowTokenNormalized,
  options: StrictTransformCSSValueOptions,
): string | Record<string, string> {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]);
  }
  const colors = token.$value.map((v, i) =>
    token.partialAliasOf?.[i]?.color
      ? transformAlias(tokensSet[token.partialAliasOf[i]!.color!])
      : transformColor({ $value: v.color } as ColorTokenNormalized, options),
  );
  const isHDR = colors.some((c) => typeof c === 'object');

  const formatShadow = (colorKey: string) =>
    token.$value
      .map((v, i) =>
        transformShadowLayer(v, {
          tokensSet,
          colorValue:
            typeof colors[i] === 'string'
              ? (colors[i] as string)
              : colors[i]![colorKey as keyof (typeof colors)[number]]!,
          partialAliasOf: token.partialAliasOf?.[i],
          transformAlias,
        }),
      )
      .join(', ');

  return !isHDR
    ? formatShadow('.')
    : {
        '.': formatShadow('.'),
        srgb: formatShadow('srgb'),
        p3: formatShadow('p3'),
        rec2020: formatShadow('rec2020'),
      };
}
