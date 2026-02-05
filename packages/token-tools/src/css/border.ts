import { inGamut, parse } from 'colorjs.io/fn';
import '../color.js'; // load Color.js side-effects
import type {
  BorderTokenNormalized,
  ColorTokenNormalized,
  DimensionTokenNormalized,
  StrokeStyleTokenNormalized,
} from '../types.js';
import { transformColor } from './color.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { transformDimension } from './dimension.js';
import { defaultAliasTransform } from './lib.js';
import { transformStrokeStyle } from './stroke-style.js';

/** Convert border value to multiple CSS values */
export function transformBorder(token: BorderTokenNormalized, options: TransformCSSValueOptions) {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }

  const width = token.partialAliasOf?.width
    ? transformAlias(tokensSet[token.partialAliasOf.width]!)
    : transformDimension({ $value: token.$value.width } as DimensionTokenNormalized, options);
  const color = token.partialAliasOf?.color
    ? transformAlias(tokensSet[token.partialAliasOf.color]!)
    : transformColor({ $value: token.$value.color } as ColorTokenNormalized, options);
  const style = token.partialAliasOf?.style
    ? transformAlias(tokensSet[token.partialAliasOf.style]!)
    : transformStrokeStyle({ $value: token.$value.style } as StrokeStyleTokenNormalized, options);

  const formatBorder = (colorKey: string) =>
    [width, style, typeof color === 'string' ? color : color[colorKey as keyof typeof color]].join(' ');

  // Note: ../color.js has already loaded color spaces as side effects so we don’t need to load those again
  return typeof color === 'string' || inGamut(parse(color.p3), 'display-p3')
    ? formatBorder('.')
    : {
        '.': formatBorder('.'),
        srgb: formatBorder('srgb'),
        p3: formatBorder('p3'),
        rec2020: formatBorder('rec2020'),
      };
}
