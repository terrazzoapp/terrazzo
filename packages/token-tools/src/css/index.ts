import { clampChroma, type Color, formatCss, displayable } from 'culori';
import { kebabCase } from 'scule';
import { CSS_TO_CULORI, parseColor } from '../color.js';

/** Function that generates a var(…) statement */
export type IDGenerator = (id: string) => string;

// note: this is the lowest-level package, so this type has to be redeclared
// here rather than create a circular dep with @terrazzo/parser
export type ColorValue =
  | string
  | { colorSpace: string; channels: [number, number, number]; alpha: number; hex?: string };

export type WideGamutColorValue = { '.': string; srgb: string; p3: string; rec2020: string };

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

/** Generate shorthand CSS for select token types */
export function generateShorthand({ $type, localID }: { $type: string; localID: string }): string | undefined {
  switch ($type) {
    case 'transition': {
      return ['duration', 'delay', 'timing-function']
        .map((p) => makeCSSVar(`${localID}-${p}`, { wrapVar: true }))
        .join(' ');
    }
    // note: "typography" is not set in shorthand because it can often unset values unintentionally.
    // @see https://developer.mozilla.org/en-US/docs/Web/CSS/font
  }
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
    transformAlias: IDGenerator;
  },
) {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }

  const width = partialAliasOf?.width
    ? transformAlias(partialAliasOf.width)
    : transformDimensionValue(value.width, { transformAlias });
  const color = partialAliasOf?.color
    ? transformAlias(partialAliasOf.color)
    : transformColorValue(value.color, { transformAlias });
  const style = partialAliasOf?.style
    ? transformAlias(partialAliasOf.style)
    : transformStrokeStyleValue(value.style, { transformAlias });

  const formatBorder = (colorKey: string) =>
    [width, style, typeof color === 'string' ? color : color[colorKey as keyof typeof color]].join(' ');

  return typeof color === 'string' || displayable(color.p3)
    ? formatBorder('.')
    : {
        '.': formatBorder('.'),
        srgb: formatBorder('srgb'),
        p3: formatBorder('p3'),
        rec2020: formatBorder('rec2020'),
      };
}

/** Convert color value to CSS string */
export function transformColorValue(
  value: string | ColorValue,
  { aliasOf, transformAlias = defaultAliasTransform }: { aliasOf?: string; transformAlias?: IDGenerator } = {},
): string | WideGamutColorValue {
  if (aliasOf) {
    return transformAlias(aliasOf);
  }

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

  return displayable(color)
    ? formatCss(color)
    : {
        '.': formatCss(color),
        srgb: (typeof value === 'object' && value.hex) || formatCss(clampChroma(color, color.mode, 'rgb')),
        p3: formatCss(clampChroma(color, color.mode, 'p3')),
        rec2020: formatCss(clampChroma(color, color.mode, 'rec2020')),
      };
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
): Record<string, string> {
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
    color,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: {
    color: string;
    partialAliasOf?: Partial<Record<keyof ShadowLayer, string>>;
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
  'timing-function': ReturnType<typeof transformCubicBezierValue>;
} {
  if (aliasOf) {
    return transformCompositeAlias(value, { aliasOf, transformAlias }) as {
      duration: ReturnType<typeof transformDurationValue>;
      delay: ReturnType<typeof transformDurationValue>;
      'timing-function': ReturnType<typeof transformCubicBezierValue>;
    };
  }
  return {
    duration: partialAliasOf?.duration
      ? transformAlias(partialAliasOf.duration)
      : transformDurationValue(value.duration, { transformAlias }),
    delay: partialAliasOf?.delay
      ? transformAlias(partialAliasOf.delay)
      : transformDurationValue(value.delay, { transformAlias }),
    'timing-function': partialAliasOf?.timingFunction
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
  let property = name.split(CSS_VAR_RE).filter(Boolean).join('-');
  if (prefix && !property.startsWith(`${prefix}-`)) {
    property = `${prefix}-${property}`;
  }
  const finalProperty = `--${property}`.toLocaleLowerCase();
  return wrapVar ? `var(${finalProperty})` : finalProperty;
}
