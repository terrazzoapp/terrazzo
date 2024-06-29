import {
  inGamut,
  toGamut,
  useMode,
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
} from 'culori/fn';
import { useCallback, useState } from 'react';

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

/** Snap a number to n decimal places */
function snap(value, precision) {
  if (typeof value !== 'number' || precision <= 0 || precision > 1 || value % 1 === 0) {
    return value;
  }
  const p = 1 / precision;
  return Math.round(value * p) / p;
}

export function parse(color) {
  if (color && typeof color === 'object') {
    if (!color.mode) {
      throw new Error(`Invalid Culori color: ${JSON.stringify(color)}`);
    }
    if (!COLORSPACES[color.mode]) {
      throw new Error(`Unsupported color mode "${color.mode}"`);
    }
    return withAlpha(color);
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
const toP3 = useMode(modeP3);
const toProphoto = useMode(modeProphoto);
const toRec2020 = useMode(modeRec2020);
const toRgb = useMode(modeRgb);
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
  p3: { converter: (color) => withAlpha(toP3(color)) },
  prophoto: { converter: (color) => withAlpha(toProphoto(color)) },
  rec2020: { converter: (color) => withAlpha(toRec2020(color)) },
  srgb: { converter: (color) => withAlpha(toRgb(color)) },
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

export function formatCss(color, { precision = 0.0001 } = {}) {
  const alpha = color.alpha < 1 ? ` / ${color.alpha}` : '';
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
      return `color(${colorSpace} ${[snap(color.r, precision), snap(color.g, precision), snap(color.b, precision)].join(
        ' ',
      )}${alpha})`;
    }
    case 'hsl': {
      return `hsl(${snap(color.h, precision)} ${100 * snap(color.s, precision)}% ${
        100 * snap(color.l, precision)
      }%${alpha})`;
    }
    case 'hsv': {
      return `color(--hsv ${[snap(color.h, precision), snap(color.s, precision), snap(color.v, precision)].join(
        ' ',
      )}${alpha})`;
    }
    case 'hwb': {
      return `hwb(${snap(color.h, precision)} ${100 * snap(color.w, precision)}% ${
        100 * snap(color.b, precision)
      }%${alpha})`;
    }
    case 'okhsl': {
      return `color(--okhsl ${[snap(color.h, precision), snap(color.s, precision), snap(color.l, precision)].join(
        ' ',
      )}${alpha})`;
    }
    case 'okhsv': {
      return `color(--okhsv ${[snap(color.h, precision), snap(color.s, precision), snap(color.v, precision)].join(
        ' ',
      )}${alpha})`;
    }
    case 'lab':
    case 'oklab': {
      return `${color.mode}(${[snap(color.l, precision), snap(color.a, precision), snap(color.b, precision)].join(
        ' ',
      )}${alpha})`;
    }
    case 'lch':
    case 'oklch': {
      return `${color.mode}(${[snap(color.l, precision), snap(color.c, precision), snap(color.h, precision)].join(
        ' ',
      )}${alpha})`;
    }
    case 'xyz':
    case 'xyz50':
    case 'xyz65': {
      return `color(${color.mode === 'xyz50' ? 'xyz-d50' : 'xyz-d65'} ${[
        snap(color.x, precision),
        snap(color.y, precision),
        snap(color.z, precision),
      ].join(' ')}${alpha})`;
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
  const setColorOutput = useCallback(
    (newColor) => {
      if (newColor) {
        if (typeof newColor === 'function') {
          setInnerColor((value) => createMemoizedColor(parse(newColor(value))));
        } else {
          setInnerColor(createMemoizedColor(parse(newColor)));
        }
      }
    },
    [setInnerColor],
  );

  return [innerColor, setColorOutput];
}
