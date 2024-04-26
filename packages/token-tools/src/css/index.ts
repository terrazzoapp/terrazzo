import { type Color, formatCss, clampChroma } from 'culori';
import { kebabCase } from 'scule';
import { CSS_TO_CULORI, parseColor } from '../color';

/** Function that generates a var(…) statement */
export type IDGenerator = (id: string) => string;

export type ColorValue = string | { colorSpace: string; channels: [number, number, number]; alpha: number };

export const defaultAliasTransform = (id: string) => `var(${makeCSSVar(id)})`;

/** Convert boolean value to CSS string */
export function transformBooleanValue(
  value: boolean,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
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
  value: BorderValue,

  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: Partial<Record<keyof typeof value, string>>;
    transformAlias?: IDGenerator;
  } = {},
): {
  width: ReturnType<typeof transformDimensionValue>;
  color: ReturnType<typeof transformColorValue>;
  style: ReturnType<typeof transformStrokeStyleValue>;
} {
  if (aliasOf) {
    return transformCompositeAlias(value, { aliasOf, transformAlias });
  }
  return {
    width: partialAliasOf?.width
      ? transformAlias(partialAliasOf.width)
      : transformDimensionValue(value.width, { transformAlias }),
    color: partialAliasOf?.color
      ? transformAlias(partialAliasOf.color)
      : transformColorValue(value.color, { transformAlias }),
    style: partialAliasOf?.style
      ? transformAlias(partialAliasOf.style)
      : transformStrokeStyleValue(value.style, { transformAlias }),
  };
}

/** Convert color value to CSS string */
export function transformColorValue(
  value: string | ColorValue,
  /** (optional) Clamp gamut to `srgb` or `p3` gamut (default: don’t clamp) */
  {
    aliasOf,
    gamut,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    gamut?: 'srgb' | 'p3';
    transformAlias?: IDGenerator;
  } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
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
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: [string | undefined, string | undefined, string | undefined, string | undefined];
    transformAlias?: IDGenerator;
  } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return `cubic-bezier(${value
    .map((v, i) => (partialAliasOf?.[i] ? transformAlias(partialAliasOf[i]!) : v))
    .join(', ')})`;
}

/** Build object of alias values */
export function transformCompositeAlias<T extends {}>(
  value: T,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf: string; transformAlias?: IDGenerator },
): Record<keyof T, string> {
  const output: Record<string, string> = {};
  for (const key in value) {
    output[kebabCase(key)] = transformAlias(`${aliasOf}-${key}`);
  }
  return output as Record<keyof T, string>;
}

export type DimensionValue = string;

/** Convert dimension value to CSS */
export function transformDimensionValue(
  value: number | string,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
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
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
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
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: { aliasOf?: string; partialAliasOf?: string[]; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return (typeof value === 'string' ? [value] : value)
    .map((fontName, i) =>
      partialAliasOf?.[i]
        ? transformAlias(partialAliasOf[i]!)
        : FONT_FAMILY_KEYWORDS.has(fontName)
          ? fontName
          : `"${fontName}"`,
    )
    .join(', ');
}

/** Convert fontWeight value to CSS */
export function transformFontWeightValue(
  value: number | string,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return String(value);
}

export interface GradientStop {
  color: ColorValue;
  position: number;
}

/** Convert gradient value to CSS */
export function transformGradientValue(
  value: GradientStop[],
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: Partial<Record<keyof GradientStop, string>>[];
    transformAlias?: IDGenerator;
  } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return value
    .map(({ color, position }, i) =>
      [
        partialAliasOf?.[i]?.color ? transformAlias(partialAliasOf[i]!.color as string) : transformColorValue(color),
        partialAliasOf?.[i]?.position ? transformAlias(String(partialAliasOf[i]!.position)) : `${100 * position}%`,
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
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return `url("${value}")`;
}

/** Convert number value to CSS */
export function transformNumberValue(
  value: number,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  return aliasOf ? transformAlias(aliasOf) : String(value);
}

/** Convert shadow subvalue to CSS */
export function transformShadowLayer(
  value: ShadowLayer,
  {
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: { partialAliasOf?: Partial<Record<keyof ShadowLayer, string>>; transformAlias?: IDGenerator } = {},
): string {
  return [
    partialAliasOf?.offsetX
      ? transformAlias(partialAliasOf.offsetX)
      : transformDimensionValue(value.offsetX, { transformAlias }),
    partialAliasOf?.offsetY
      ? transformAlias(partialAliasOf.offsetY)
      : transformDimensionValue(value.offsetY, { transformAlias }),
    partialAliasOf?.blur
      ? transformAlias(partialAliasOf.blur)
      : transformDimensionValue(value.blur, { transformAlias }),
    partialAliasOf?.spread
      ? transformAlias(partialAliasOf.spread)
      : transformDimensionValue(value.spread, { transformAlias }),
    partialAliasOf?.color ? transformAlias(partialAliasOf.color) : transformColorValue(value.color, { transformAlias }),
  ].join(' ');
}

/** Convert shadow value to CSS */
export function transformShadowValue(
  value: ShadowLayer[],
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: Partial<Record<keyof ShadowLayer, string>>[];
    transformAlias?: IDGenerator;
  } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return value
    .map((v, i) => transformShadowLayer(v, { partialAliasOf: partialAliasOf?.[i], transformAlias }))
    .join(', ');
}

/** Convert string value to CSS */
export function transformStringValue(
  value: string | number | boolean,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  // this seems like a useless function—because it is—but this is a placeholder
  // that can handle unexpected values in the future should any arise
  return aliasOf ? transformAlias(aliasOf) : String(value);
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
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }
  return typeof value === 'string' ? value : 'dashed'; // CSS doesn’t have `dash-array`; it’s just "dashed"
}

export interface TransitionValue {
  duration: string;
  delay: string;
  timingFunction: CubicBézierValue;
}

/** Convert transition value to multiple CSS values */
export function transformTransitionValue(
  value: TransitionValue,
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    aliasOf?: string;
    partialAliasOf?: Partial<Record<keyof typeof value, string>>;
    transformAlias?: IDGenerator;
  } = {},
): {
  duration: ReturnType<typeof transformDurationValue>;
  delay: ReturnType<typeof transformDurationValue>;
  timingFunction: ReturnType<typeof transformCubicBezierValue>;
} {
  if (aliasOf) {
    return transformCompositeAlias(value, { aliasOf, transformAlias });
  }
  return {
    duration: partialAliasOf?.duration
      ? transformAlias(partialAliasOf.duration)
      : transformDurationValue(value.duration, { transformAlias }),
    delay: partialAliasOf?.delay
      ? transformAlias(partialAliasOf.delay)
      : transformDurationValue(value.delay, { transformAlias }),
    timingFunction: partialAliasOf?.timingFunction
      ? transformAlias(partialAliasOf.timingFunction)
      : transformCubicBezierValue(value.timingFunction, { transformAlias }),
  };
}

/** Convert typography value to multiple CSS values */
export function transformTypographyValue(
  value: Record<string, string | string[]>,
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: { aliasOf?: string; partialAliasOf?: Record<keyof typeof value, string>; transformAlias?: IDGenerator } = {},
): Record<string, string> {
  const output: Record<string, string> = {};
  if (aliasOf) {
    return transformCompositeAlias(value, { aliasOf, transformAlias });
  }
  for (const [property, subvalue] of Object.entries(value)) {
    let transformedValue: string;
    if (partialAliasOf?.[property]) {
      transformedValue = transformAlias(partialAliasOf[property]!);
    } else {
      switch (property) {
        case 'fontFamily': {
          transformedValue = transformFontFamilyValue(subvalue as string[], { transformAlias });
          break;
        }
        case 'fontSize':
        case 'fontWeight': {
          transformedValue = transformFontWeightValue(subvalue as string, { transformAlias });
          break;
        }
        default: {
          transformedValue = transformStringValue(subvalue as string, { transformAlias });
          break;
        }
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
