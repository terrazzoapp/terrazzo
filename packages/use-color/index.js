// @ts-check
import { tokenToColor } from '@terrazzo/token-tools';
import { to as convert, parse as parseColor, serialize } from 'colorjs.io/fn';
import { useCallback, useState } from 'react';

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
export function parse(/** @type {import("./index.d.ts").ColorInput} */ color) {
  if (color && typeof color === 'object') {
    // DTCG tokens: convert to Color.js format
    if (color.colorSpace && Array.isArray(color.components)) {
      return tokenToColor(color);
    }
    return color;
  }
  if (typeof color === 'string') {
    return parseColor(color);
  }
  throw new Error(`Expected string or color object, received ${typeof color}`);
}

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
      this.a98 = convert(color, 'a98rgb');
      return this.a98;
    },
    get css() {
      delete this.css;
      this.css = serialize(color);
      return this.css;
    },
    get hsl() {
      delete this.hsl;
      this.hsl = convert(color, 'hsl', { inGamut: true });
      return this.hsl;
    },
    get hwb() {
      delete this.hwb;
      this.hwb = convert(color, 'hwb', { inGamut: true });
      return this.hwb;
    },
    get lab() {
      delete this.lab;
      this.lab = convert(color, 'lab');
      return this.lab;
    },
    get lch() {
      delete this.lch;
      this.lch = convert(color, 'lch');
      return this.lch;
    },
    get okhsl() {
      delete this.okhsl;
      this.okhsl = convert(color, 'okhsl');
      return this.okhsl;
    },
    get okhsv() {
      delete this.okhsv;
      this.okhsv = convert(color, 'okhsv');
      return this.okhsv;
    },
    get oklab() {
      delete this.oklab;
      this.oklab = convert(color, 'oklab');
      return this.oklab;
    },
    get oklch() {
      delete this.oklch;
      this.oklch = convert(color, 'oklch');
      return this.oklch;
    },
    get original() {
      delete this.original;
      this.original = parse(color);
      return this.original;
    },
    get p3() {
      delete this.p3;
      this.p3 = convert(color, 'p3', { inGamut: true });
      return this.p3;
    },
    get prophoto() {
      delete this.prophoto;
      this.prophoto = convert(color, 'prophoto');
      return this.prophoto;
    },
    get rec2020() {
      delete this.rec2020;
      this.rec2020 = convert(color, 'rec2020');
      return this.rec2020;
    },
    get srgb() {
      delete this.srgb;
      this.srgb = convert(color, 'srgb', { inGamut: true });
      return this.srgb;
    },
    get srgbLinear() {
      delete this.srgbLinear;
      this.srgbLinear = convert(color, 'srgb-linear');
      return this.srgbLinear;
    },
    get xyzd50() {
      delete this.xyzd50;
      this.xyzd50 = convert(color, 'xyz-d50');
      return this.xyzd50;
    },
    get xyzd65() {
      delete this.xyzd65;
      this.xyzd65 = convert(color, 'xyz-d65');
      return this.xyzd65;
    },
  };
}

/** memoize Color.js colors and reduce unnecessary updates */
export default function useColor(/** @type {import("./index.d.ts").ColorInput} */ color) {
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
