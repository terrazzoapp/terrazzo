import {
  type Color,
  displayable,
  formatCss,
  formatHex,
  formatHex8,
  modeA98,
  modeHsl,
  modeHsv,
  modeHwb,
  modeLab,
  modeLch,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeP3,
  modeProphoto,
  modeRec2020,
  modeRgb,
  modeXyz50,
  modeXyz65,
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

  return displayable(color) ? formatColor(color) : downsample({ colorSpace, components, alpha }, color);
}

const converters: Record<keyof typeof CULORI_TO_CSS, (color: Color) => Color> = {
  a98: useMode(modeA98),
  hsl: useMode(modeHsl),
  hsv: useMode(modeHsv),
  hwb: useMode(modeHwb),
  lab: useMode(modeLab),
  lch: useMode(modeLch),
  lrgb: useMode(modeLrgb),
  oklab: useMode(modeOklab),
  oklch: useMode(modeOklch),
  p3: useMode(modeP3),
  prophoto: useMode(modeProphoto),
  rec2020: useMode(modeRec2020),
  rgb: useMode(modeRgb),
  xyz50: useMode(modeXyz50),
  xyz65: useMode(modeXyz65),
};

/**
 * Downsample color to sRGB/Display P3/Rec2020 colorspaces.
 * Note: because Culori tends to convert to RGB color spaces to ensure the operation,
 * we have to do an additional step of converting back. So we’re not really converting;
 * we’re just preserving the original colorspace.
 */
function downsample($value: ColorTokenNormalized['$value'], culoriColor: Color) {
  const conversionSpace = CSS_TO_CULORI[$value.colorSpace] || 'oklab';
  const converter = converters[conversionSpace];
  return {
    '.': formatCss(culoriColor),
    srgb: formatCss(converter(toGamut('rgb', conversionSpace)(culoriColor))),
    p3: formatCss(converter(toGamut('p3', conversionSpace)(culoriColor))),
    rec2020: formatCss(converter(toGamut('rec2020', conversionSpace)(culoriColor))),
  };
}
