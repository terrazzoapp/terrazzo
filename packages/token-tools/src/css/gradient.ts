import type { GradientStopNormalized, GradientValueNormalized } from '../types.js';
import { type WideGamutColorValue, transformColorValue } from './color.js';
import { type IDGenerator, defaultAliasTransform } from './lib.js';

/** Convert gradient value to CSS */
export function transformGradientValue(
  value: GradientValueNormalized,
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: Partial<Record<keyof GradientStopNormalized, string>>[];
    transformAlias?: IDGenerator;
  } = {},
): string | WideGamutColorValue {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  const colors = value.map(({ color }, i) =>
    partialAliasOf?.[i]?.color ? transformAlias(partialAliasOf[i]!.color as string) : transformColorValue(color),
  );
  const positions = value.map(({ position }, i) =>
    partialAliasOf?.[i]?.position ? transformAlias(String(partialAliasOf[i]!.position)) : `${100 * position}%`,
  );
  const isHDR = colors.some((c) => typeof c === 'object');
  const formatStop = (index: number, colorKey = '.') =>
    [
      typeof colors[index] === 'string' ? colors[index] : colors[index]![colorKey as keyof (typeof colors)[number]],
      positions[index]!,
    ].join(' ');

  return !isHDR
    ? value.map((_, i) => formatStop(i, positions[i]!)).join(', ')
    : {
        '.': value.map((_, i) => formatStop(i, '.')).join(', '),
        srgb: value.map((_, i) => formatStop(i, 'srgb')).join(', '),
        p3: value.map((_, i) => formatStop(i, 'p3')).join(', '),
        rec2020: value.map((_, i) => formatStop(i, 'rec2020')).join(', '),
      };
}
