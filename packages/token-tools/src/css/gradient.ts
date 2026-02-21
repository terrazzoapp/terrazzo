import type { ColorTokenNormalized, GradientTokenNormalized, TokenTransformed } from '../types.js';
import { transformColor } from './color.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

/** Convert gradient value to CSS */
export function transformGradient(
  token: GradientTokenNormalized,
  options: TransformCSSValueOptions,
): TokenTransformed['value'] {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }

  let isHDR = false;

  const colors: TokenTransformed['value'][] = [];
  const positions: string[] = [];

  for (let i = 0; i < token.$value.length; i++) {
    const { color, position } = token.$value[i]!;
    const colorValue = token.partialAliasOf?.[i]?.color
      ? transformAlias(tokensSet[token.partialAliasOf[i]!.color!]!)
      : transformColor({ $value: color } as ColorTokenNormalized, options);
    if (typeof colorValue !== 'string') {
      isHDR = true;
    }
    colors.push(colorValue);
    positions.push(
      token.partialAliasOf?.[i]?.position
        ? transformAlias(tokensSet[token.partialAliasOf[i]!.position!]!)
        : `${100 * position}%`,
    );
  }

  function formatStop(i: number, colorKey = '.') {
    return `${typeof colors[i] === 'string' ? colors[i] : colors[i]![colorKey as keyof (typeof colors)[number]]} ${positions[i]}`;
  }

  return !isHDR
    ? token.$value.map((_, i) => formatStop(i, positions[i]!)).join(', ')
    : {
        '.': token.$value.map((_, i) => formatStop(i, '.')).join(', '),
        srgb: token.$value.map((_, i) => formatStop(i, 'srgb')).join(', '),
        p3: token.$value.map((_, i) => formatStop(i, 'p3')).join(', '),
        rec2020: token.$value.map((_, i) => formatStop(i, 'rec2020')).join(', '),
      };
}
