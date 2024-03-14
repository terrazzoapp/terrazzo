import type { ParsedColorToken } from '@cobalt-ui/core';
import { formatCss, formatRgb, clampChroma, formatHex8, formatHex, formatHsl, converter, parse as parseColor } from 'culori';

/** normalize all color outputs to format (default: "hex") or specify "none" to keep as-is */
export type ColorFormat = 'none' | 'hex' | 'rgb' | 'hsl' | 'hwb' | 'srgb-linear' | 'p3' | 'lab' | 'lch' | 'oklab' | 'oklch' | 'xyz-d50' | 'xyz-d65';

/** ⚠️ Important! We do NOT want to parse as P3. We want to parse as sRGB, then expand 1:1 to P3. @see https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/ */
export const toHSL = converter('hsl');
export const toHWB = converter('hwb');
export const toLab = converter('lab');
export const toLch = converter('lch');
export const toOklab = converter('oklab');
export const toOklch = converter('oklch');
export const toP3 = converter('p3');
export const toRGB = converter('rgb');
export const toRGBLinear = converter('lrgb');
export const toXYZ50 = converter('xyz50');
export const toXYZ65 = converter('xyz65');

export default function transformColor(value: ParsedColorToken['$value'], colorFormat: ColorFormat): string {
  if (colorFormat === 'none') {
    return String(value);
  }
  const parsed = parseColor(value);
  if (!parsed) throw new Error(`invalid color "${value}"`);
  switch (colorFormat) {
    case 'rgb': {
      return formatRgb(clampChroma(toRGB(value)!, 'rgb'));
    }
    case 'hex': {
      const rgb = clampChroma(toRGB(value)!, 'rgb');
      return typeof parsed.alpha === 'number' && parsed.alpha < 1 ? formatHex8(rgb) : formatHex(rgb);
    }
    case 'hsl': {
      return formatHsl(clampChroma(toHSL(value)!, 'rgb'));
    }
    case 'hwb': {
      return formatCss(clampChroma(toHWB(value)!, 'rgb'));
    }
    case 'lab': {
      return formatCss(toLab(value)!);
    }
    case 'lch': {
      return formatCss(toLch(value)!);
    }
    case 'oklab': {
      return formatCss(toOklab(value)!);
    }
    case 'oklch': {
      return formatCss(toOklch(value)!);
    }
    case 'p3': {
      return formatCss(toP3(value)!);
    }
    case 'srgb-linear': {
      return formatCss(toRGBLinear(value)!);
    }
    case 'xyz-d50': {
      return formatCss(toXYZ50(value)!);
    }
    case 'xyz-d65': {
      return formatCss(toXYZ65(value)!);
    }
  }
}
