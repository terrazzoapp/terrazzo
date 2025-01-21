import {
  type CubicBezierValue,
  type DimensionValue,
  type FontFamilyValue,
  type GradientStopNormalized,
  type GradientValueNormalized,
  type ShadowValueNormalized,
  type Token,
  type TransitionValue,
  type TypographyValueNormalized,
  isAlias,
  parseColor,
} from '@terrazzo/token-tools';

export const FONT_WEIGHT_MAP = {
  thin: 100,
  hairline: 100,
  'extra-light': 200,
  'ultra-light': 200,
  light: 300,
  normal: 400,
  regular: 400,
  book: 400,
  medium: 500,
  'semi-bold': 600,
  'demi-bold': 600,
  bold: 700,
  'extra-bold': 800,
  'ultra-bold': 800,
  black: 900,
  heavy: 900,
  'extra-black': 950,
  'ultra-black': 950,
};

// Note: because we’re handling a lot of input values, the type inference gets lost.
// This file is expected to have a lot of `@ts-ignore` comments.

const NUMBER_WITH_UNIT_RE = /(-?\d*\.?\d+)(.*)/;

/** Fill in defaults, and return predictable shapes for tokens */
export default function normalizeValue<T extends Token>(token: T): T['$value'] {
  if (typeof token.$value === 'string' && isAlias(token.$value)) {
    return token.$value;
  }
  switch (token.$type) {
    case 'boolean': {
      return !!token.$value;
    }
    case 'border': {
      if (typeof token.$value === 'string') {
        return token.$value;
      }
      return {
        color: normalizeValue({ $type: 'color', $value: token.$value.color ?? '#000000' }),
        style: normalizeValue({ $type: 'strokeStyle', $value: token.$value.style ?? 'solid' }),
        width: normalizeValue({ $type: 'dimension', $value: token.$value.width }),
      };
    }
    case 'color': {
      if (typeof token.$value === 'string') {
        return parseColor(token.$value);
      }
      return 'alpha' in token.$value ? token.$value : { ...token.$value, alpha: 1 };
    }
    case 'cubicBezier': {
      if (typeof token.$value === 'string') {
        return token.$value;
      }
      return token.$value.map((value) =>
        typeof value === 'number' ? normalizeValue({ $type: 'number', $value: value }) : value,
      ) as CubicBezierValue;
    }
    case 'dimension': {
      if ((token as any).$value === 0) {
        return { value: 0, unit: 'px' };
      }
      // Backwards compat: handle string
      if (typeof token.$value === 'string') {
        const match = token.$value.match(NUMBER_WITH_UNIT_RE);
        return { value: Number.parseFloat(match?.[1] || token.$value), unit: match?.[2] || 'px' };
      }
      return token.$value;
    }
    case 'duration': {
      if ((token as any).$value === 0) {
        return { value: 0, unit: 'ms' };
      }
      // Backwards compat: handle string
      if (typeof token.$value === 'string') {
        const match = token.$value.match(NUMBER_WITH_UNIT_RE);
        return { value: Number.parseFloat(match?.[1] || token.$value), unit: match?.[2] || 'ms' };
      }
      return token.$value;
    }
    case 'fontFamily': {
      return Array.isArray(token.$value) ? token.$value : [token.$value];
    }
    case 'fontWeight': {
      if (typeof token.$value === 'string' && FONT_WEIGHT_MAP[token.$value as keyof typeof FONT_WEIGHT_MAP]) {
        return FONT_WEIGHT_MAP[token.$value as keyof typeof FONT_WEIGHT_MAP];
      }
      return Math.min(
        999,
        Math.max(1, typeof token.$value === 'string' ? Number.parseInt(token.$value) : token.$value),
      );
    }
    case 'gradient': {
      if (typeof token.$value === 'string') {
        return token.$value;
      }
      const output: GradientValueNormalized = [];
      for (let i = 0; i < token.$value.length; i++) {
        const stop = structuredClone(token.$value[i] as GradientStopNormalized);
        stop.color = normalizeValue({ $type: 'color', $value: stop.color! });
        if (stop.position === undefined) {
          stop.position = i / (token.$value.length - 1);
        }
        output.push(stop);
      }
      return output;
    }
    case 'number': {
      return typeof token.$value === 'number' ? token.$value : Number.parseFloat(token.$value);
    }
    case 'shadow': {
      if (typeof token.$value === 'string') {
        return token.$value;
      }
      return (Array.isArray(token.$value) ? token.$value : [token.$value]).map(
        (layer) =>
          ({
            color: normalizeValue({ $type: 'color', $value: layer.color }),
            // @ts-ignore
            offsetX: normalizeValue({ $type: 'dimension', $value: layer.offsetX ?? 0 }),
            // @ts-ignore
            offsetY: normalizeValue({ $type: 'dimension', $value: layer.offsetY ?? 0 }),
            // @ts-ignore
            blur: normalizeValue({ $type: 'dimension', $value: layer.blur ?? 0 }),
            // @ts-ignore
            spread: normalizeValue({ $type: 'dimension', $value: layer.spread ?? 0 }),
            inset: layer.inset === true,
          }) as ShadowValueNormalized,
      );
    }
    case 'strokeStyle': {
      return token.$value;
    }
    case 'string': {
      return String(token.$value);
    }
    case 'transition': {
      if (typeof token.$value === 'string') {
        return token.$value;
      }
      return {
        // @ts-ignore
        duration: normalizeValue({ $type: 'duration', $value: token.$value.duration ?? 0 }),
        // @ts-ignore
        delay: normalizeValue({ $type: 'duration', $value: token.$value.delay ?? 0 }),
        // @ts-ignore
        timingFunction: normalizeValue({ $type: 'cubicBezier', $value: token.$value.timingFunction }),
      } as TransitionValue;
    }
    case 'typography': {
      if (typeof token.$value === 'string') {
        return token.$value;
      }
      const output: TypographyValueNormalized = {};
      for (const [k, $value] of Object.entries(token.$value)) {
        switch (k) {
          case 'fontFamily': {
            output[k] = normalizeValue({ $type: 'fontFamily', $value: $value as FontFamilyValue });
            break;
          }
          case 'fontSize':
          case 'letterSpacing': {
            output[k] = normalizeValue({ $type: 'dimension', $value: $value as DimensionValue });
            break;
          }
          case 'lineHeight': {
            output[k] = normalizeValue({
              $type: typeof token.$value === 'number' ? 'number' : 'dimension',
              $value: $value as any,
            });
            break;
          }
          default: {
            output[k] = $value;
            break;
          }
        }
      }
      return output;
    }
    default: {
      return token.$value;
    }
  }
}
