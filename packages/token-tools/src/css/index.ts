import { type Color, formatCss } from 'culori';
import { kebabCase } from 'scule';
import { CSS_TO_CULORI, parseColor } from '../color';

export type ColorValue = string | { colorSpace: string; channels: [number, number, number]; alpha: number };

/** Convert boolean value to CSS string */
export function transformBooleanValue(value: boolean): string {
  if (typeof value !== 'boolean') {
    throw new Error(`Expected boolean, received ${typeof value} "${value}"`);
  }
  return value ? '1' : '0';
}

export type BorderValue = { color: ColorValue; width: DimensionValue; style: StrokeStyleValue };

/** Convert border value to CSS string */
export function transformBorderValue(value: BorderValue, expanded?: string) {
  const width = transformDimensionValue(value.width);
  const style = transformStrokeStyleValue(value.style);
  const color = transformColorValue(value.color);
  if (expanded) {
    return {
      [`${expanded}-color`]: color,
      [`${expanded}-style`]: style,
      [`${expanded}-width`]: width,
    };
  }
  return [width, style, color].join(' ');
}

/** Convert color value to CSS string */
export function transformColorValue(value: ColorValue): string {
  const { colorSpace, channels, alpha } = typeof value === 'string' ? parseColor(value) : value;
  const color = { mode: CSS_TO_CULORI[colorSpace], alpha } as Color;
  switch (color.mode) {
    case 'a98':
    case 'rec2020':
    case 'p3':
    case 'prophoto':
    case 'lrgb':
    case 'rgb': {
      color.r = channels[0];
      color.g = channels[1];
      color.b = channels[2];
      break;
    }
    case 'hsl': {
      color.h = channels[0];
      color.s = channels[1];
      color.l = channels[2];
      break;
    }
    case 'hsv': {
      color.h = channels[0];
      color.s = channels[1];
      color.v = channels[2];
      break;
    }
    case 'hwb': {
      color.h = channels[0];
      color.w = channels[1];
      color.b = channels[2];
      break;
    }
    case 'lab':
    case 'oklab': {
      color.l = channels[0];
      color.a = channels[1];
      color.b = channels[2];
      break;
    }
    case 'lch':
    case 'oklch': {
      color.l = channels[0];
      color.c = channels[1];
      color.h = channels[2];
      break;
    }
    case 'xyz50':
    case 'xyz65': {
      color.x = channels[0];
      color.y = channels[1];
      color.z = channels[2];
      break;
    }
  }
  return formatCss(color);
}

export type CubicBézierValue = [number, number, number, number];

/** Convert cubicBezier value to CSS */
export function transformCubicBezierValue(value: CubicBézierValue): string {
  return `cubic-bezier(${value.join(', ')})`;
}

export interface GradientStop {
  color: ColorValue;
  position: number;
}

export type DimensionValue = string;

/** Convert dimension value to CSS */
export function transformDimensionValue(value: number | string): string {
  if (typeof value === 'number') {
    return value === 0 ? '0' : `${value}px`;
  }
  return value;
}

export type DurationValue = string;

/** Convert duration value to CSS */
export function transformDurationValue(value: number | string): string {
  if (typeof value === 'number' || String(Number.parseFloat(value)) === value) {
    return `${value}ms`;
  }
  return value;
}

/** Convert gradient value to CSS */
export function transformGradientValue(value: GradientStop[]): string {
  return value.map((s) => [transformColorValue(s.color), `${100 * s.position}%`].join(' ')).join(', ');
}

export interface ShadowLayer {
  color: ColorValue;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
}

/** Convert number value to CSS */
export function transformNumberValue(value: number): string {
  return String(value);
}

/** Convert shadow subvalue to CSS */
export function transformShadowLayer(value: ShadowLayer): string {
  return [
    transformDimensionValue(value.offsetX),
    transformDimensionValue(value.offsetY),
    transformDimensionValue(value.blur),
    transformDimensionValue(value.spread),
    transformColorValue(value.color),
  ].join(' ');
}

/** Convert shadow value to CSS */
export function transformShadowValue(value: ShadowLayer | ShadowLayer[]): string {
  return Array.isArray(value) ? value.map((v) => transformShadowLayer(v)).join(', ') : transformShadowLayer(value);
}

/** Convert string value to CSS */
export function transformStringValue(value: string): string {
  // this seems like a useless function—because it is—but this is a placeholder
  // that can handle unexpected values in the future should any arise
  return String(value);
}

export type StrokeStyleValue =
  | 'dotted'
  | 'dashed'
  | 'solid'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset'
  | { dashArray: DimensionValue[]; lineCap: string };

/** Convert strokeStyle value to CSS */
export function transformStrokeStyleValue(value: StrokeStyleValue): string {
  if (typeof value === 'string') {
    return value;
  }
  return 'dashed'; // CSS doesn’t have `dash-array`; it’s just "dashed"
}

export interface TransitionValue {
  duration: DurationValue | number;
  delay: DurationValue | number;
  timingFunction: CubicBézierValue;
}

/** Convert transition value to CSS */
export function transformTransitionValue(value: TransitionValue, expanded?: string) {
  const duration = transformDurationValue(value.duration);
  const timingFunction = transformCubicBezierValue(value.timingFunction);
  const delay = transformDurationValue(value.delay);

  if (expanded) {
    return {
      [`${expanded}-duration`]: duration,
      [`${expanded}-delay`]: delay,
      [`${expanded}-timing-function`]: timingFunction,
    };
  }

  return [duration, delay, timingFunction].join(' ');
}

const FONT_FAMILY_KEYWORDS = new Set([
  'sans-serif',
  'serif',
  'monospace',
  'system-ui',
  'ui-monospace',
  '-apple-system',
]);

/** Convert typography tokens to CSS */
export function transformTypographyValue(value: Record<string, string | string[]>): Record<string, string> {
  const output: Record<string, string> = {};
  for (const k in value) {
    const property = value[k];
    output[kebabCase(k)] = Array.isArray(property)
      ? property.map((name) => (FONT_FAMILY_KEYWORDS.has(name) ? name : `"${name}"`)).join(', ')
      : property!;
  }
  return output;
}

const CSS_VAR_RE =
  /(?:(\p{Uppercase_Letter}?\p{Lowercase_Letter}+|\p{Uppercase_Letter}+|\p{Number}+|[\u{80}-\u{10FFFF}]+|_)|.)/u;

export interface MakeCSSVarOptions {
  /** Prefix with string */
  prefix?: string;
  /** Wrap with `var(…)` (default: false) */
  wrapVar?: boolean;
}

/**
 * Generate a valid CSS variable from any string
 * Code by @dfrankland
 */
export function makeCSSVar(name: string, { prefix, wrapVar = false }: MakeCSSVarOptions = {}): string {
  const property = [...(prefix ? [prefix] : []), ...name.split(CSS_VAR_RE).filter(Boolean)].join('-');
  const finalProperty = `--${property}`.toLocaleLowerCase();
  return wrapVar ? `var(${finalProperty})` : finalProperty;
}
