import { type Color, formatCss, clampChroma } from 'culori';
import { kebabCase } from 'scule';
import { CSS_TO_CULORI, parseColor } from '../color';
import { isAlias, parseAlias } from '../alias';

/** Function that generates a var(…) statement */
export type IDGenerator = (id: string) => string;

export type ColorValue = string | { colorSpace: string; channels: [number, number, number]; alpha: number };

export const defaultAliasTransform = (id: string) => `var(${makeCSSVar(id)})`;

/** Convert boolean value to CSS string */
export function transformBooleanValue(
  value: string | boolean,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  if (typeof value === 'string' && isAlias(value)) {
    return transformAlias(parseAlias(value).id);
  }
  if (typeof value !== 'boolean') {
    throw new Error(`Expected boolean, received ${typeof value} "${value}"`);
  }
  return value ? '1' : '0';
}

export interface BorderValue {
  width: string;
  color: string | ColorValue;
  style: string | StrokeStyleValue;
}

/** Convert border value to multiple CSS values */
export function transformBorderValue(
  value: string | BorderValue,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
):
  | string
  | {
      width: ReturnType<typeof transformDimensionValue>;
      color: ReturnType<typeof transformColorValue>;
      style: ReturnType<typeof transformStrokeStyleValue>;
      all: string;
    } {
  if (typeof value === 'string') {
    return isAlias(value) ? transformAlias(parseAlias(value).id) : value;
  }
  const width = transformDimensionValue(value.width, { transformAlias });
  const color = transformColorValue(value.color, { transformAlias });
  const style = transformStrokeStyleValue(value.style, { transformAlias });
  return {
    width,
    color,
    style,
    all: [width, style, color].join(' '),
  };
}

/** Convert color value to CSS string */
export function transformColorValue(
  value: ColorValue,
  /** (optional) Clamp gamut to `srgb` or `p3` gamut (default: don’t clamp) */
  {
    gamut,
    transformAlias = defaultAliasTransform,
  }: {
    gamut?: 'srgb' | 'p3';
    transformAlias?: IDGenerator;
  } = {},
): string {
  if (typeof value === 'string' && isAlias(value)) {
    return transformAlias(parseAlias(value).id);
  }

  const { colorSpace, channels, alpha } = typeof value === 'string' ? parseColor(value) : value;
  let color = { mode: CSS_TO_CULORI[colorSpace], alpha } as Color;
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
  if (gamut === 'srgb') {
    color = clampChroma(color, color.mode, 'rgb');
  } else if (gamut === 'p3') {
    color = clampChroma(color, color.mode, 'p3');
  }
  return formatCss(color);
}

export type CubicBézierValue = [string | number, string | number, string | number, string | number];

/** Convert cubicBezier value to CSS */
export function transformCubicBezierValue(
  value: CubicBézierValue,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  return `cubic-bezier(${value
    .map((v) => (typeof v === 'string' && isAlias(v) ? transformAlias(parseAlias(v).id) : v))
    .join(', ')})`;
}

export interface GradientStop {
  color: ColorValue;
  position: number;
}

export type DimensionValue = string;

/** Convert dimension value to CSS */
export function transformDimensionValue(
  value: number | string,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  if (typeof value === 'string' && isAlias(value)) {
    return transformAlias(parseAlias(value).id);
  }
  if (typeof value === 'number') {
    return value === 0 ? '0' : `${value}px`;
  }
  return value;
}

export type DurationValue = string;

/** Convert duration value to CSS */
export function transformDurationValue(
  value: number | string,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  if (typeof value === 'string' && isAlias(value)) {
    return transformAlias(parseAlias(value).id);
  }
  if (typeof value === 'number' || String(Number.parseFloat(value)) === value) {
    return `${value}ms`;
  }
  return value;
}

export const FONT_FAMILY_KEYWORDS = new Set([
  'sans-serif',
  'serif',
  'monospace',
  'system-ui',
  'ui-monospace',
  '-apple-system',
]);

export function transformFontFamilyValue(
  value: string | string[],
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  if (typeof value === 'string' && isAlias(value)) {
    return transformAlias(parseAlias(value).id);
  }
  return (typeof value === 'string' ? [value] : value)
    .map((fontName) => {
      if (isAlias(fontName)) {
        return transformAlias(parseAlias(fontName).id);
      }
      return FONT_FAMILY_KEYWORDS.has(fontName) ? fontName : `"${fontName}"`;
    })
    .join(', ');
}

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

/** Convert fontWeight value to CSS */
export function transformFontWeightValue(
  value: number | string,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  if (typeof value === 'string' && isAlias(value)) {
    return transformAlias(parseAlias(value).id);
  }
  return String((typeof value === 'string' && FONT_WEIGHT_MAP[value as keyof typeof FONT_WEIGHT_MAP]) || value);
}

/** Convert gradient value to CSS */
export function transformGradientValue(
  value: GradientStop[],
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  return value
    .map(({ color, position }) =>
      [
        typeof color === 'string' && isAlias(color) ? transformAlias(parseAlias(color).id) : transformColorValue(color),
        `${100 * position}%`,
      ].join(' '),
    )
    .join(', ');
}

export interface ShadowLayer {
  color: ColorValue;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
}

/** Convert link value to CSS */
export function transformLinkValue(
  value: string,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  if (isAlias(value)) {
    return transformAlias(parseAlias(value).id);
  }
  return `url("${value}")`;
}

/** Convert number value to CSS */
export function transformNumberValue(
  value: string | number,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  return typeof value === 'string' && isAlias(value) ? transformAlias(parseAlias(value).id) : String(value);
}

/** Convert shadow subvalue to CSS */
export function transformShadowLayer(
  value: ShadowLayer,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  return [
    transformDimensionValue(value.offsetX, { transformAlias }),
    transformDimensionValue(value.offsetY, { transformAlias }),
    transformDimensionValue(value.blur, { transformAlias }),
    transformDimensionValue(value.spread, { transformAlias }),
    transformColorValue(value.color, { transformAlias }),
  ].join(' ');
}

/** Convert shadow value to CSS */
export function transformShadowValue(
  value: ShadowLayer | ShadowLayer[],
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  return Array.isArray(value)
    ? value.map((v) => transformShadowLayer(v, { transformAlias })).join(', ')
    : transformShadowLayer(value, { transformAlias });
}

/** Convert string value to CSS */
export function transformStringValue(
  value: string | number | boolean,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  // this seems like a useless function—because it is—but this is a placeholder
  // that can handle unexpected values in the future should any arise
  return typeof value === 'string' && isAlias(value) ? transformAlias(parseAlias(value).id) : String(value);
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
export function transformStrokeStyleValue(
  value: string | StrokeStyleValue,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string {
  if (typeof value === 'string') {
    return isAlias(value) ? transformAlias(parseAlias(value).id) : value;
  }
  return 'dashed'; // CSS doesn’t have `dash-array`; it’s just "dashed"
}

export interface TransitionValue {
  duration: string;
  delay: string;
  timingFunction: CubicBézierValue;
}

/** Convert transition value to multiple CSS values */
export function transformTransitionValue(
  value: string | TransitionValue,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
):
  | string
  | {
      duration: ReturnType<typeof transformDurationValue>;
      delay: ReturnType<typeof transformDurationValue>;
      timingFunction: ReturnType<typeof transformCubicBezierValue>;
      all: string;
    } {
  if (typeof value === 'string') {
    return isAlias(value) ? transformAlias(parseAlias(value).id) : value;
  }
  const duration = transformDurationValue(value.duration, { transformAlias });
  const delay = transformDurationValue(value.delay, { transformAlias });
  const timingFunction = transformCubicBezierValue(value.timingFunction, { transformAlias });
  return {
    duration,
    delay,
    timingFunction,
    all: [duration, delay, timingFunction].join(' '),
  };
}

/** Convert typography value to multiple CSS values */
export function transformTypographyValue(
  value: string | Record<string, string | string[]>,
  { transformAlias = defaultAliasTransform }: { transformAlias?: IDGenerator } = {},
): string | Record<string, string> {
  if (typeof value === 'string') {
    return isAlias(value) ? transformAlias(parseAlias(value).id) : value;
  }
  const output: Record<string, string> = {};
  for (const [property, subvalue] of Object.entries(value)) {
    let transformedValue: string;
    switch (property) {
      case 'fontFamily': {
        transformedValue = transformFontFamilyValue(subvalue as string[], { transformAlias });
        break;
      }
      case 'fontSize':
      case 'lineHeight': {
        transformedValue = transformDimensionValue(subvalue as string, { transformAlias });
        break;
      }
      case 'fontWeight': {
        transformedValue = transformFontWeightValue(subvalue as string, { transformAlias });
        break;
      }
      default: {
        transformedValue = transformStringValue(subvalue as string, { transformAlias });
        break;
      }
    }
    output[kebabCase(property)] = transformedValue;
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
