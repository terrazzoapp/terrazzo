// @ts-check
import { tokenToCulori } from '@terrazzo/token-tools';
import {
  inGamut,
  modeA98,
  modeHsl,
  modeHsv,
  modeHwb,
  modeLab,
  modeLch,
  modeLrgb,
  modeOkhsl,
  modeOkhsv,
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
import { useCallback, useState } from 'react';

/** Culori omits alpha if 1; this adds it */
export function withAlpha(color) {
  if (color && typeof color.alpha !== 'number') {
    color.alpha = 1;
  }
  for (const channel in color) {
    if (Number.isNaN(color[channel])) {
      color[channel] = 0;
    }
  }
  return color;
}

/**
 * Clean decimal value by clamping to a certain number of digits, while also
 * avoiding the dreaded JS floating point bug. Also avoids heavy/slow-ish
 * packages like number-precision by just using Number.toFixed() / Number.toPrecision().
 *
 * We don’t want to _just_ use Number.toFixed() because some colorspaces normalize values
 * too 100 or more (LAB/LCH for lightness, or any hue degree). Likewise, we don’t want to
 * just use Number.toPrecision() because for values < 0.01 it just adds inconsistent
 * precision. This method uses a balance of both such that you’ll get equal `precision`
 * depending on the value type.
 *
 * @param {number} value
 * @param {number} precision - number of significant digits
 * @param {boolean} normalized - is this value normalized to 1? (`false` for hue and LAB/LCH values)
 */
export function cleanValue(value, precision = 5, normalized = true) {
  if (typeof value !== 'number') {
    return value;
  }
  return normalized ? value.toFixed(precision) : value.toFixed(Math.max(precision - 3, 0));
}

/** Primary parse logic */
export function parse(color) {
  if (color && typeof color === 'object') {
    let normalizedColor = color;

    // DTCG tokens: convert to Culori format
    if (color.colorSpace && Array.isArray(color.channels)) {
      normalizedColor = tokenToCulori(color);
    }
    if (!normalizedColor.mode) {
      throw new Error(`Invalid Culori color: ${JSON.stringify(normalizedColor)}`);
    }
    if (!COLORSPACES[normalizedColor.mode]) {
      throw new Error(`Unsupported color mode "${normalizedColor.mode}"`);
    }
    return withAlpha(normalizedColor);
  }
  if (typeof color === 'string') {
    const colorLC = color.toLowerCase();
    if (colorLC.startsWith('color(')) {
      const colorspaceMatches = color.match(/^[^(]+\(-?-?([A-Za-z0-9-]+)/);
      const colorspaceMatch = (colorspaceMatches?.[1] ?? '').toLowerCase();
      const result = COLORSPACES[colorspaceMatch]?.converter(color);
      if (result) {
        return withAlpha(result);
      }
      throw new Error(`Unsupported color format "${color}"`);
    }
    const fnMatches = colorLC.match(/^[^(]+/);
    const fnMatch = (fnMatches?.[0] ?? '').toLowerCase();
    const result = COLORSPACES[fnMatch]?.converter(color);
    if (result) {
      return withAlpha(result);
    }
    return withAlpha(COLORSPACES.rgb.converter(color));
  }
  throw new Error(`Expected string or color object, received ${typeof color}`);
}

// re-export a lighterweight version of Culori tools with all the proper colorspaces loaded
export { inGamut };

const toA98 = useMode(modeA98);
const toHsl = useMode(modeHsl);
const toHsv = useMode(modeHsv);
const toHwb = useMode(modeHwb);
const toLab = useMode(modeLab);
const toLch = useMode(modeLch);
const toLrgb = useMode(modeLrgb);
const toOkhsl = useMode(modeOkhsl);
const toOkhsv = useMode(modeOkhsv);
const toOklab = useMode(modeOklab);
const toOklch = useMode(modeOklch);
useMode(modeP3);
const toProphoto = useMode(modeProphoto);
const toRec2020 = useMode(modeRec2020);
useMode(modeRgb);
const toXyz50 = useMode(modeXyz50);
const toXyz65 = useMode(modeXyz65);

export const COLORSPACES = {
  a98: { converter: (color) => withAlpha(toA98(color)) },
  hsl: { converter: (color) => withAlpha(toHsl(color)) },
  hsv: { converter: (color) => withAlpha(toHsv(color)) },
  hwb: { converter: (color) => withAlpha(toHwb(color)) },
  lab: { converter: (color) => withAlpha(toLab(color)) },
  lch: { converter: (color) => withAlpha(toLch(color)) },
  lrgb: { converter: (color) => withAlpha(toLrgb(color)) },
  okhsl: { converter: (color) => withAlpha(toOkhsl(color)) },
  okhsv: { converter: (color) => withAlpha(toOkhsv(color)) },
  oklab: { converter: (color) => withAlpha(toOklab(color)) },
  oklch: { converter: (color) => withAlpha(toOklch(color)) },
  p3: { converter: (color) => withAlpha(toGamut('p3')(color)) },
  prophoto: { converter: (color) => withAlpha(toProphoto(color)) },
  rec2020: { converter: (color) => withAlpha(toRec2020(color)) },
  srgb: { converter: (color) => withAlpha(toGamut('rgb')(color)) },
  xyz: { converter: (color) => withAlpha(toXyz65(color)) },
  xyz50: { converter: (color) => withAlpha(toXyz50(color)) },
  xyz65: { converter: (color) => withAlpha(toXyz65(color)) },
};
COLORSPACES['a98-rgb'] = COLORSPACES.a98;
COLORSPACES['display-p3'] = COLORSPACES.p3;
COLORSPACES['srgb-linear'] = COLORSPACES.lrgb;
COLORSPACES['prophoto-rgb'] = COLORSPACES.prophoto;
COLORSPACES.rgb = COLORSPACES.srgb;
COLORSPACES['xyz-d50'] = COLORSPACES.xyz50;
COLORSPACES['xyz-d65'] = COLORSPACES.xyz65;

/** Format a Color as a CSS string */
export function formatCss(color, { precision: p = 5 } = {}) {
  const alpha = color.alpha < 1 ? ` / ${cleanValue(color.alpha, p)}` : '';
  switch (color.mode) {
    // rgb
    case 'a98':
    case 'lrgb':
    case 'p3':
    case 'prophoto':
    case 'rgb':
    case 'rec2020':
    case 'srgb': {
      const colorSpace =
        {
          a98: 'a98-rgb',
          lrgb: 'srgb-linear',
          p3: 'display-p3',
          prophoto: 'prophoto-rgb',
          rgb: 'srgb',
          srgb: 'srgb',
        }[color.mode] || color.mode;
      return `color(${colorSpace} ${cleanValue(color.r, p)} ${cleanValue(color.g, p)} ${cleanValue(color.b, p)}${alpha})`;
    }
    case 'hsl': {
      return `hsl(${cleanValue(color.h, p, false)} ${cleanValue(100 * color.s, p, false)}% ${cleanValue(100 * color.l, p, false)}%${alpha})`;
    }
    case 'hsv': {
      return `color(--hsv ${cleanValue(color.h, p, false)} ${cleanValue(color.s, p)} ${cleanValue(color.v, p)}${alpha})`;
    }
    case 'hwb': {
      return `hwb(${cleanValue(color.h, p, false)} ${cleanValue(100 * color.w, p, false)}% ${cleanValue(100 * color.b, p, false)}%${alpha})`;
    }
    case 'lab': {
      // note: LAB isn’t normalized to `1` like OKLAB is
      return `${color.mode}(${cleanValue(color.l, p, false)} ${cleanValue(color.a, p, false)} ${cleanValue(color.b, p, false)}${alpha})`;
    }
    case 'lch': {
      // note: LCH isn’t normalized to `1` like OKLCH is
      return `${color.mode}(${cleanValue(color.l, p, false)} ${cleanValue(color.c, p, false)} ${cleanValue(color.h, p, false)}${alpha})`;
    }
    case 'okhsl': {
      return `color(--okhsl ${cleanValue(color.h, p, false)} ${cleanValue(color.s, p)} ${cleanValue(color.l, p)}${alpha})`;
    }
    case 'okhsv': {
      return `color(--okhsv ${cleanValue(color.h, p, false)} ${cleanValue(color.s, p)} ${cleanValue(color.v, p)}${alpha})`;
    }
    case 'oklab': {
      return `${color.mode}(${cleanValue(color.l, p)} ${cleanValue(color.a, p)} ${cleanValue(color.b, p)}${alpha})`;
    }
    case 'oklch': {
      return `${color.mode}(${cleanValue(color.l, p)} ${cleanValue(color.c, p)} ${cleanValue(color.h, p, false)}${alpha})`;
    }
    case 'xyz':
    case 'xyz50':
    case 'xyz65': {
      return `color(${color.mode === 'xyz50' ? 'xyz-d50' : 'xyz-d65'} ${cleanValue(color.x, p)} ${cleanValue(color.y, p)} ${cleanValue(color.z, p)}${alpha})`;
    }
  }
}

const p3Clamper = toGamut('p3');
const srgbClamper = toGamut('rgb');

/**
 * Given a color string, create a Proxy that converts colors to any desired
 * format once, and only once. Also, yes! You can use this outside of React
 * context.
 */
export function createMemoizedColor(color) {
  // “lazy getter” pattern. looks dumb, but it’s fast!
  // (@see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#smart_self-overwriting_lazy_getters)
  return {
    get a98() {
      delete this.a98;
      this.a98 = COLORSPACES.a98.converter(color);
      return this.a98;
    },
    get css() {
      delete this.css;
      this.css = formatCss(color);
      return this.css;
    },
    get hsl() {
      delete this.hsl;
      this.hsl = COLORSPACES.hsl.converter(srgbClamper(color));
      return this.hsl;
    },
    get hsv() {
      delete this.hsv;
      this.hsv = COLORSPACES.hsv.converter(srgbClamper(color));
      return this.hsv;
    },
    get hwb() {
      delete this.hwb;
      this.hwb = COLORSPACES.hwb.converter(srgbClamper(color));
      return this.hwb;
    },
    get lab() {
      delete this.lab;
      this.lab = COLORSPACES.lab.converter(color);
      return this.lab;
    },
    get lrgb() {
      delete this.lrgb;
      this.lrgb = COLORSPACES.lrgb.converter(color);
      return this.lrgb;
    },
    get okhsl() {
      delete this.okhsl;
      this.okhsl = COLORSPACES.okhsl.converter(color);
      return this.okhsl;
    },
    get okhsv() {
      delete this.okhsv;
      this.okhsv = COLORSPACES.okhsv.converter(color);
      return this.okhsv;
    },
    get oklab() {
      delete this.oklab;
      this.oklab = COLORSPACES.oklab.converter(color);
      return this.oklab;
    },
    get oklch() {
      delete this.oklch;
      this.oklch = COLORSPACES.oklch.converter(color);
      return this.oklch;
    },
    get original() {
      delete this.original;
      const parsed = parse(color);
      this.original = parsed;
      return this.original;
    },
    get p3() {
      delete this.p3;
      this.p3 = COLORSPACES.p3.converter(p3Clamper(color));
      return this.p3;
    },
    get prophoto() {
      delete this.prophoto;
      this.prophoto = COLORSPACES.prophoto.converter(color);
      return this.prophoto;
    },
    get rec2020() {
      delete this.rec2020;
      this.rec2020 = COLORSPACES.rec2020.converter(color);
      return this.rec2020;
    },
    get rgb() {
      delete this.rgb;
      this.rgb = COLORSPACES.rgb.converter(color);
      return this.rgb;
    },
    get srgb() {
      delete this.srgb;
      this.srgb = COLORSPACES.srgb.converter(srgbClamper(color));
      return this.srgb;
    },
    get xyz50() {
      delete this.xyz50;
      this.xyz50 = COLORSPACES.xyz50.converter(color);
      return this.xyz50;
    },
    get xyz65() {
      delete this.xyz65;
      this.xyz65 = COLORSPACES.xyz65.converter(color);
      return this.xyz65;
    },
  };
}

/** memoize Culori colors and reduce unnecessary updates */
export default function useColor(color) {
  const [innerColor, setInnerColor] = useState(createMemoizedColor(parse(color)));
  const setColorOutput = useCallback((newColor) => {
    if (newColor) {
      if (typeof newColor === 'function') {
        setInnerColor((value) => createMemoizedColor(parse(newColor(value))));
      } else {
        setInnerColor(createMemoizedColor(parse(newColor)));
      }
    }
  }, []);

  return [innerColor, setColorOutput];
}
