import type { ObjectNode } from '@humanwhocodes/momoa';
import {
  type BooleanTokenNormalized,
  type BooleanValue,
  type BorderTokenNormalized,
  type BorderValue,
  type ColorTokenNormalized,
  type ColorValue,
  type CubicBezierTokenNormalized,
  type CubicBezierValue,
  FONT_WEIGHTS,
  type FontFamilyTokenNormalized,
  type FontFamilyValue,
  type FontWeightTokenNormalized,
  type FontWeightValue,
  type GradientTokenNormalized,
  type GradientValue,
  isAlias,
  parseAlias,
  parseColor,
  type ShadowTokenNormalized,
  type ShadowValue,
  type ShadowValueNormalized,
  type StrokeStyleTokenNormalized,
  type StrokeStyleValue,
  type TokenNormalized,
  type TokenNormalizedSet,
  type TransitionTokenNormalized,
  type TransitionValue,
  type TypographyTokenNormalized,
  type TypographyValue,
} from '@terrazzo/token-tools';
import { getCode } from '../lib/code-frame.js';
import type Logger from '../logger.js';
import type { InputSource } from '../types.js';
import { getObjMember } from './json.js';
import type { IntermediaryToken } from './load.js';

export interface NormalizeOptions {
  logger: Logger;
  continueOnError?: boolean;
  sources: InputSource[];
}

/** Fill in optional properties of tokens, and perform minor standardizations */
export function normalize(
  tokens: Record<string, IntermediaryToken>,
  { logger, sources, continueOnError }: NormalizeOptions,
): TokenNormalizedSet {
  const normalized: TokenNormalizedSet = {};

  // first pass: these aren’t normalized yet, they’ll be squared up in the next step
  for (const [id, t] of Object.entries(tokens)) {
    normalized[id] = {
      id,
      $description: t.$description,
      $deprecated: t.$deprecated,
      $type: t.$type as any,
      $value: t.$value as any,
      originalValue: {
        $deprecated: t.$deprecated as any,
        $description: t.$description as any,
        $type: t.$type as any,
        $value: t.$value as any,
        $extensions: t.$extensions,
      },
      aliasOf: t.aliasOf,
      partialAliasOf: t.partialAliasOf as any,
      group: t.group as any,
      mode: t.mode as any,
      source: {
        /** @deprecated */
        loc: t.source.filename?.href,
        filename: t.source.filename?.href,
        node: t.source.node,
      },
      $extensions: t.$extensions,
    };

    const options: FormatterOptions = { source: normalized[id].source, logger, continueOnError, sources };

    for (const mode of Object.keys(t.mode)) {
      if (t.mode[mode]!.aliasOf) {
        if (mode === '.') {
          t.aliasOf = t.mode[mode]!.aliasOf;
        }
        continue;
      }

      let next: FormattedValue<TokenNormalized> = { $value: t.mode[mode]!.$value as any, partialAliasOf: undefined };

      switch (t.$type) {
        // basic values
        case 'color': {
          next = formatColorValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'fontFamily': {
          next = formatFontFamilyValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'fontWeight': {
          next = formatFontWeightValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'boolean': {
          next = formatBooleanValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'cubicBezier': {
          next = formatCubicBezierValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'dimension':
        case 'duration':
        case 'number':
        case 'string': {
          // noop
          break;
        }

        // composite tokens
        case 'strokeStyle': {
          next = formatStrokeStyleValue(normalized[id].$value as StrokeStyleValue, options);
          break;
        }
        case 'border': {
          next = formatBorderValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'transition': {
          next = formatTransitionValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'shadow': {
          next = formatShadowValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'gradient': {
          next = formatGradientValue(t.mode[mode]!.$value as any, options);
          break;
        }
        case 'typography': {
          next = formatTypographyValue(t.mode[mode]!.$value as any, options);
          break;
        }
      }

      // update token with formatted values
      t.mode[mode]!.$value = next.$value;
      if (next.partialAliasOf) {
        t.mode[mode]!.partialAliasOf = next.partialAliasOf;
      }

      // default mode: copy to $value
      if (mode === '.') {
        t.$value = t.mode[mode]!.$value;
      }
    }
  }

  return normalized;
}

type FormatterOptions = NormalizeOptions & { source: NonNullable<TokenNormalized['source']> };
type FormattedValue<T extends TokenNormalized> = {
  $value: T['$value'];
  partialAliasOf: T['partialAliasOf'] | undefined;
};

function formatColorValue(
  $value: ColorValue,
  { source, logger, continueOnError, sources }: FormatterOptions,
): FormattedValue<ColorTokenNormalized> {
  let hasPartialAlias = false;
  const final: FormattedValue<ColorTokenNormalized> = {
    $value: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1, hex: undefined },
    partialAliasOf: undefined,
  };
  const partialAliasOf: ColorTokenNormalized['partialAliasOf'] = {
    colorSpace: undefined,
    components: [],
    alpha: undefined,
    hex: undefined,
  };

  // Upconvert CSS strings to object notation
  if ($value && typeof $value === 'string') {
    try {
      final.$value = parseColor($value);
    } catch (err) {
      logger.error({
        group: 'parser',
        label: 'core',
        message: (err as Error).message,
        continueOnError,
        src: getCode(sources, source.filename),
        node: source.node,
      });
    }
  }

  // If this already is object notation, clean it up
  else if (typeof $value === 'object') {
    final.$value = {
      colorSpace: $value.colorSpace ?? 'srgb',
      components: ($value.components ?? $value.channels ?? [0, 0, 0]) as (number | null)[],
      alpha: ($value.alpha ?? 1) as number,
      hex: $value.hex,
    };
    if (typeof final.$value.colorSpace === 'string' && isAlias(final.$value.colorSpace)) {
      partialAliasOf.colorSpace = parseAlias(final.$value.colorSpace);
      hasPartialAlias = true;
    }
    if (Array.isArray(final.$value.components)) {
      for (let i = 0; i < final.$value.components.length; i++) {
        if (typeof final.$value.components[i]! === 'string' && isAlias(final.$value.components[i] as any)) {
          partialAliasOf.components[i] = parseAlias(final.$value.components[i] as any);
          hasPartialAlias = true;
        }
      }
    }
    if (Array.isArray($value.channels)) {
      logger.warn({
        group: 'parser',
        label: 'core',
        message: '"channels" is deprecated, update to "components"',
        continueOnError,
        src: getCode(sources, source.filename),
        node: getObjMember(getObjMember(source.node, '$value') as ObjectNode, 'channels'),
      });
    }
    if (typeof final.$value.alpha === 'string' && isAlias(final.$value.alpha)) {
      partialAliasOf.alpha = parseAlias(final.$value.alpha);
      hasPartialAlias = true;
    }
    if (typeof final.$value.hex === 'string' && isAlias(final.$value.hex)) {
      partialAliasOf.hex = parseAlias(final.$value.hex);
      hasPartialAlias = true;
    }
  }
  if (hasPartialAlias) {
    final.partialAliasOf = partialAliasOf;
  }
  return final;
}

function formatFontFamilyValue(
  $value: FontFamilyValue,
  _options: FormatterOptions,
): FormattedValue<FontFamilyTokenNormalized> {
  return {
    $value: typeof $value === 'string' ? [$value] : $value,
    partialAliasOf: undefined,
  };
}

function formatBooleanValue($value: BooleanValue, _options: FormatterOptions): FormattedValue<BooleanTokenNormalized> {
  return {
    $value: !!$value,
    partialAliasOf: undefined,
  };
}

function formatFontWeightValue(
  $value: FontWeightValue,
  _options: FormatterOptions,
): FormattedValue<FontWeightTokenNormalized> {
  return {
    $value: (typeof $value === 'string' && FONT_WEIGHTS[$value]) || ($value as number),
    partialAliasOf: undefined,
  };
}

function formatCubicBezierValue(
  $value: CubicBezierValue,
  _options: FormatterOptions,
): FormattedValue<CubicBezierTokenNormalized> {
  let hasPartialAlias = false;
  const partialAliasOf: NonNullable<CubicBezierTokenNormalized['partialAliasOf']> = [
    undefined,
    undefined,
    undefined,
    undefined,
  ];
  const final: FormattedValue<CubicBezierTokenNormalized> = { $value: $value as any, partialAliasOf: undefined };
  for (let i = 0; i < final.$value.length; i++) {
    if (typeof final.$value[i] === 'string' && isAlias(final.$value[i]! as string)) {
      partialAliasOf[i] = parseAlias(final.$value[i]! as string);
      hasPartialAlias = true;
    }
  }
  if (hasPartialAlias) {
    final.partialAliasOf = partialAliasOf;
  }
  return final;
}

function formatStrokeStyleValue(
  $value: StrokeStyleValue,
  _options: FormatterOptions,
): FormattedValue<StrokeStyleTokenNormalized> {
  const final: FormattedValue<StrokeStyleTokenNormalized> = { $value: $value as any, partialAliasOf: undefined };
  if (typeof $value === 'object') {
    let hasPartialAlias = false;
    const partialAliasOf: StrokeStyleTokenNormalized['partialAliasOf'] = { dashArray: [] };
    if (Array.isArray($value.dashArray)) {
      const len = $value.dashArray.length;
      for (let i = 0; i < len; i++) {
        const dashArray = final.$value.dashArray[i];
        if (typeof dashArray === 'string' && isAlias(dashArray)) {
          partialAliasOf.dashArray[i]! = parseAlias(dashArray);
          hasPartialAlias = true;
        } else {
          partialAliasOf.dashArray[i] = undefined;
        }
      }
    }
    if (hasPartialAlias) {
      final.partialAliasOf = partialAliasOf;
    }
  }
  return final;
}

function formatBorderValue($value: BorderValue, _options: FormatterOptions): FormattedValue<BorderTokenNormalized> {
  let hasPartialAlias = false;
  const final: FormattedValue<BorderTokenNormalized> = { $value: $value as any, partialAliasOf: undefined };
  const partialAliasOf: NonNullable<BorderTokenNormalized['partialAliasOf']> = {
    color: undefined,
    width: undefined,
    style: undefined,
  };
  if ($value && typeof $value === 'object') {
    if (typeof final.$value.color === 'string' && isAlias(final.$value.color)) {
      partialAliasOf.color = parseAlias(final.$value.color);
      hasPartialAlias = true;
    } else {
      final.$value.color = formatColorValue(final.$value.color, _options).$value;
    }
    if (typeof final.$value.width === 'string' && isAlias(final.$value.width)) {
      partialAliasOf.width = parseAlias(final.$value.width);
      hasPartialAlias = true;
    } else {
      // noop
    }
    if (typeof final.$value.style === 'string' && isAlias(final.$value.style)) {
      partialAliasOf.style = parseAlias(final.$value.style);
      hasPartialAlias = true;
    } else {
      // noop
    }
  }
  if (hasPartialAlias) {
    final.partialAliasOf = partialAliasOf;
  }
  return final;
}

function formatTransitionValue(
  $value: TransitionValue,
  _options: FormatterOptions,
): FormattedValue<TransitionTokenNormalized> {
  let hasPartialAlias = false;
  const final: FormattedValue<TransitionTokenNormalized> = { $value: $value as any, partialAliasOf: undefined };
  const partialAliasOf: TransitionTokenNormalized['partialAliasOf'] = {
    delay: undefined,
    duration: undefined,
    timingFunction: undefined,
  };
  if ($value && typeof $value === 'object') {
    for (const k of Object.keys($value) as (keyof typeof $value)[]) {
      if (typeof $value[k] === 'string' && isAlias($value[k])) {
        partialAliasOf[k] = parseAlias($value[k]);
        hasPartialAlias = true;
      }
      if (k === 'timingFunction') {
        final.$value[k] === formatCubicBezierValue(final.$value[k], _options).$value;
      } else {
        // noop
      }
    }
  }
  if (hasPartialAlias) {
    final.partialAliasOf = partialAliasOf;
  }
  return final;
}

function formatShadowValue($value: ShadowValue, _options: FormatterOptions): FormattedValue<ShadowTokenNormalized> {
  let hasPartialAlias = false;
  const final: FormattedValue<ShadowTokenNormalized> = {
    $value:
      $value && typeof $value === 'object' && !Array.isArray($value) ? ([$value] as ShadowValueNormalized[]) : $value,
    partialAliasOf: undefined,
  };
  const partialAliasOf: ShadowTokenNormalized['partialAliasOf'] = [];
  const len = final.$value.length;
  for (let i = 0; i < len; i++) {
    if (!partialAliasOf[i]) {
      partialAliasOf[i] = {
        color: undefined,
        offsetX: undefined,
        offsetY: undefined,
        blur: undefined,
        spread: undefined,
        inset: undefined,
      };
    }
    const shadow = final.$value[i]!;
    if (shadow.color) {
      if (typeof shadow.color === 'string' && isAlias(shadow.color)) {
        partialAliasOf[i]!.color = parseAlias(shadow.color);
        hasPartialAlias = true;
      } else {
        shadow.color = formatColorValue(shadow.color, _options).$value;
      }
    }
    for (const k of ['offsetX', 'offsetY', 'blur', 'spread'] as const) {
      if (typeof shadow[k] === 'string' && isAlias(shadow[k])) {
        partialAliasOf[i]![k] = parseAlias(shadow[k]);
        hasPartialAlias = true;
      } else {
        // normalizeDimensionValue()
      }
    }
    if (shadow.inset) {
      if (typeof shadow.inset === 'string' && isAlias(shadow.inset)) {
        partialAliasOf[i]!.inset = parseAlias(shadow.inset);
        hasPartialAlias = true;
      } else {
        shadow.inset = formatBooleanValue(shadow.inset, _options).$value;
      }
    }
  }
  if (hasPartialAlias) {
    final.partialAliasOf = partialAliasOf;
  }
  return final;
}

function formatGradientValue(
  $value: GradientValue,
  _options: FormatterOptions,
): FormattedValue<GradientTokenNormalized> {
  let hasPartialAlias = false;
  const partialAliasOf: NonNullable<GradientTokenNormalized['partialAliasOf']> = [];
  const final: FormattedValue<GradientTokenNormalized> = { $value: $value as any, partialAliasOf: undefined };
  for (let i = 0; i < $value.length; i++) {
    partialAliasOf[i] = { position: undefined, color: undefined };
    const stop = final.$value[i]!;
    if (typeof stop.position === 'string' && isAlias(stop.position)) {
      partialAliasOf[i]!.position = parseAlias(stop.position);
      hasPartialAlias = true;
    } else if (typeof stop.position === 'number') {
      if (!Number.isFinite(stop.position)) {
        stop.position = i / Math.max($value.length - 1, 1);
      } else {
        // Note: for gradient stops, values outside of [0-1] aren’t an error, they just get clamped
        stop.position = Math.max(Math.min(stop.position, 1), 0);
      }
    }

    if (typeof stop.color === 'string' && isAlias(stop.color)) {
      partialAliasOf[i]!.color = parseAlias(stop.color);
      hasPartialAlias = true;
    } else {
      stop.color = formatColorValue(stop.color, _options).$value;
    }
  }
  if (hasPartialAlias) {
    final.partialAliasOf = partialAliasOf;
  }
  return final;
}

function formatTypographyValue(
  $value: TypographyValue,
  options: FormatterOptions,
): FormattedValue<TypographyTokenNormalized> {
  let hasPartialAlias = false;
  const final: FormattedValue<TypographyTokenNormalized> = { $value: $value as any, partialAliasOf: undefined };
  const partialAliasOf: TypographyTokenNormalized['partialAliasOf'] = {
    fontFamily: undefined,
    fontSize: undefined,
    fontWeight: undefined,
    lineHeight: undefined,
    letterSpacing: undefined,
  };
  if ($value && typeof $value === 'object') {
    for (const k of Object.keys($value) as (keyof typeof $value)[]) {
      if (typeof $value[k] === 'string' && isAlias($value[k])) {
        partialAliasOf[k] = parseAlias($value[k]);
        hasPartialAlias = true;
        continue;
      }
      const formatter = {
        fontFamily: formatFontFamilyValue,
        fontWeight: formatFontWeightValue,
      }[k];
      if (formatter) {
        $value[k] = formatter(($value as any)[k], options);
      }
    }
    if (hasPartialAlias) {
      final.partialAliasOf = partialAliasOf;
    }
  }
  return final;
}
