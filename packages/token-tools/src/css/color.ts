import {
  type Color,
  displayable,
  formatCss,
  formatHex,
  formatHex8,
  modeA98,
  modeHsl,
  modeHwb,
  modeLab,
  modeLab65,
  modeLch,
  modeLrgb,
  modeOkhsv,
  modeOklab,
  modeOklch,
  modeP3,
  modeProphoto,
  modeRec2020,
  modeRgb,
  modeXyz50,
  modeXyz65,
  round,
  toGamut,
  useMode,
} from 'culori/fn';
import { CSS_TO_CULORI, type CULORI_TO_CSS, parseColor, tokenToCulori } from '../color.js';
import type { ColorTokenNormalized } from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { defaultAliasTransform } from './lib.js';

export type WideGamutColorValue = {
  '.': string;
  srgb: string;
  p3: string;
  rec2020: string;
};

/** Convert color value to CSS string */
export function transformColor(
  token: ColorTokenNormalized,
  options: TransformCSSValueOptions,
): string | WideGamutColorValue {
  const { transformAlias = defaultAliasTransform, tokensSet } = options;
  if (token.aliasChain?.[0]) {
    return transformAlias(tokensSet[token.aliasChain[0]]!);
  }

  const {
    colorSpace,
    components,
    alpha = 1,
  } = typeof token.$value === 'string' ? parseColor(token.$value) : token.$value;
  const color = tokenToCulori({ colorSpace, components, alpha });

  if (!color) {
    throw new Error(`Can’t convert color ${JSON.stringify(token.$value)} to Culori color`);
  }

  let formatColor: (color: Color) => string = formatCss;
  if (options.color?.legacyHex) {
    formatColor = color.alpha !== 1 ? formatHex8 : formatHex;
  }

  return displayable(color)
    ? formatColor(color)
    : downsample({ colorSpace, components, alpha }, { culoriColor: color, depth: options.color?.depth });
}

const converters: Record<keyof typeof CULORI_TO_CSS, (color: Color) => Color> = {
  a98: useMode(modeA98),
  hsl: useMode(modeHsl),
  hwb: useMode(modeHwb),
  lab: useMode(modeLab),
  lab65: useMode(modeLab65),
  lch: useMode(modeLch),
  lrgb: useMode(modeLrgb),
  oklab: useMode(modeOklab),
  oklch: useMode(modeOklch),
  okhsv: useMode(modeOkhsv),
  p3: useMode(modeP3),
  prophoto: useMode(modeProphoto),
  rec2020: useMode(modeRec2020),
  rgb: useMode(modeRgb),
  xyz50: useMode(modeXyz50),
  xyz65: useMode(modeXyz65),
};

export const DEPTH_ROUNDING = {
  24: round(4), // 24-bit almost fits into 3 decimal places, but not quite
  30: round(4),
  36: round(5),
  48: round(6),
};

export type Depth = keyof typeof DEPTH_ROUNDING | 'unlimited';

export interface DownsampleOptions {
  /** Color depth, in bits, for 3 channels (24 = 8 bits per channel) @default 30 */
  depth?: Depth;
  /** Save work re-parsing color if it’s parsed already */
  culoriColor?: Color;
}

/**
 * Downsample color to sRGB/Display P3/Rec2020 colorspaces.
 * Note: because Culori tends to convert to RGB color spaces to ensure the operation,
 * we have to do an additional step of converting back. So we’re not really converting;
 * we’re just preserving the original colorspace.
 */
function downsample(
  $value: ColorTokenNormalized['$value'],
  { culoriColor: inputCuloriColor, depth = 30 }: DownsampleOptions,
) {
  const culoriColor = inputCuloriColor ?? tokenToCulori($value)!;
  if (!($value.colorSpace in CSS_TO_CULORI)) {
    throw new Error(
      `Invalid colorSpace "${$value.colorSpace}". Expected one of: ${Object.keys(CSS_TO_CULORI).join(', ')}`,
    );
  }
  const conversionSpace = CSS_TO_CULORI[$value.colorSpace] || 'oklab';
  let gamutSpace = conversionSpace;
  // bugfix. "lab" and "oklab" have a bug in Culori
  // https://github.com/Evercoder/culori/issues/261
  if (gamutSpace === 'lab' || gamutSpace === 'lab65') {
    gamutSpace = 'lch';
  } else if (gamutSpace === 'oklab') {
    gamutSpace = 'oklch';
  }
  let srgb = converters[conversionSpace](toGamut('rgb', gamutSpace)(culoriColor));
  let p3 = converters[conversionSpace](toGamut('p3', gamutSpace)(culoriColor));
  let rec2020 = converters[conversionSpace](toGamut('rec2020', gamutSpace)(culoriColor));
  if (typeof depth === 'number') {
    if (!DEPTH_ROUNDING[depth]) {
      throw new Error(`Invalid bit depth: ${depth}. Supported values: ${Object.keys(DEPTH_ROUNDING).join(', ')}`);
    }
    srgb = roundColor(srgb, depth);
    p3 = roundColor(p3, depth);
    rec2020 = roundColor(rec2020, depth);
  }
  return {
    '.': formatCss(culoriColor),
    srgb: $value.hex ?? formatCss(srgb),
    p3: formatCss(p3),
    rec2020: formatCss(rec2020),
  };
}

/** Round color to certain depth. */
export function roundColor<T extends Color = Color>(color: T, depth: Depth = 30): T {
  if (depth === 'unlimited') {
    return color;
  }
  const newColor = { ...color };
  for (const [k, v] of Object.entries(color)) {
    if (typeof v !== 'number' || k === 'mode') {
      continue;
    }
    newColor[k as keyof T] = DEPTH_ROUNDING[depth](v) as T[keyof T];
  }
  return newColor;
}
