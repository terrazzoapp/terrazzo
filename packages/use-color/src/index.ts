// @ts-check
import { type ColorValue, type ColorValueNormalized, tokenToColor } from '@terrazzo/token-tools';
import {
  type ColorConstructor,
  ColorSpace,
  type ColorTypes,
  to as convert,
  HSV,
  Okhsl,
  Okhsv,
  type PlainColorObject,
  parse as parseColor,
  serialize,
} from 'colorjs.io/fn';
import { useCallback, useRef, useState } from 'react';

ColorSpace.register(HSV);
ColorSpace.register(Okhsl);
ColorSpace.register(Okhsv);

export type ColorInput = string | ColorValue | ColorTypes;

export interface ColorOutput {
  a98: ColorConstructor & PlainColorObject;
  css: string;
  hsl: ColorConstructor & PlainColorObject;
  hsv: ColorConstructor & PlainColorObject;
  hwb: ColorConstructor & PlainColorObject;
  lab: ColorConstructor & PlainColorObject;
  labd65: ColorConstructor & PlainColorObject;
  lch: ColorConstructor & PlainColorObject;
  okhsl: ColorConstructor & PlainColorObject;
  okhsv: ColorConstructor & PlainColorObject;
  oklab: ColorConstructor & PlainColorObject;
  oklch: ColorConstructor & PlainColorObject;
  original: ColorConstructor & PlainColorObject;
  p3: ColorConstructor & PlainColorObject;
  prophoto: ColorConstructor & PlainColorObject;
  rec2020: ColorConstructor & PlainColorObject;
  srgb: ColorConstructor & PlainColorObject;
  srgbLinear: ColorConstructor & PlainColorObject;
  xyzd50: ColorConstructor & PlainColorObject;
  xyzd65: ColorConstructor & PlainColorObject;
}

/**
 * Primary parse logic
 */
export function parse(color: ColorInput): ColorOutput {
  let result: ColorConstructor & PlainColorObject;
  if (color && typeof color === 'object') {
    // DTCG tokens: convert to Color.js format
    if ('colorSpace' in color) {
      result = tokenToColor(color as ColorValueNormalized);
    } else {
      // fill in spaceID or space
      result = { ...color } as ColorConstructor & PlainColorObject;
      if (!result.spaceId) {
        result.spaceId = result.space.id;
      }
      if (!result.space) {
        result.space = ColorSpace.get(result.spaceId);
      }
    }
  } else if (typeof color === 'string') {
    result = parseColor(color) as any;
  } else {
    throw new Error(`Expected string or color object, received ${typeof color}`);
  }
  if (!result.space) {
    result.space = ColorSpace.get(result.spaceId);
  }

  return {
    // See link for why we’re doing this:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#smart_self-overwriting_lazy_getters
    get a98() {
      // @ts-expect-error
      delete this.a98;
      this.a98 = { ...convert(result, 'a98rgb', { inGamut: true }), spaceId: 'a98' };
      return this.a98;
    },
    get css() {
      // @ts-expect-error
      delete this.css;
      this.css = serialize(result);
      return this.css;
    },
    get hsl() {
      // @ts-expect-error
      delete this.hsl;
      this.hsl = { ...convert(result, 'hsl', { inGamut: true }), spaceId: 'hsl' };
      return this.hsl;
    },
    get hsv() {
      // @ts-expect-error
      delete this.hsv;
      this.hsv = { ...convert(result, 'hsv', { inGamut: true }), spaceId: 'hsv' };
      return this.hsv;
    },
    get hwb() {
      // @ts-expect-error
      delete this.hwb;
      this.hwb = { ...convert(result, 'hwb', { inGamut: true }), spaceId: 'hwb' };
      return this.hwb;
    },
    get lab() {
      // @ts-expect-error
      delete this.lab;
      this.lab = { ...convert(result, 'lab'), spaceId: 'lab' };
      return this.lab;
    },
    get labd65() {
      // @ts-expect-error
      delete this.labd65;
      this.labd65 = { ...convert(result, 'lab-d65'), spaceId: 'lab-d65' };
      return this.labd65;
    },
    get lch() {
      // @ts-expect-error
      delete this.lch;
      this.lch = { ...convert(result, 'lch'), spaceId: 'lch' };
      return this.lch;
    },
    get oklab() {
      // @ts-expect-error
      delete this.oklab;
      this.oklab = { ...convert(result, 'oklab'), spaceId: 'oklab' };
      return this.oklab;
    },
    get oklch() {
      // @ts-expect-error
      delete this.oklch;
      this.oklch = { ...convert(result, 'oklch'), spaceId: 'oklch' };
      return this.oklch;
    },
    get okhsl() {
      // @ts-expect-error
      delete this.okhsl;
      this.okhsl = { ...convert(result, 'okhsl'), spaceId: 'okhsl' };
      return this.okhsl;
    },
    get okhsv() {
      // @ts-expect-error
      delete this.okhsv;
      this.okhsv = { ...convert(result, 'okhsv'), spaceId: 'okhsv' };
      return this.okhsv;
    },
    get original() {
      // @ts-expect-error
      delete this.original;
      this.original = result;
      return this.original;
    },
    get p3() {
      // @ts-expect-error
      delete this.p3;
      this.p3 = { ...convert(result, 'p3', { inGamut: true }), spaceId: 'p3' };
      return this.p3;
    },
    get prophoto() {
      // @ts-expect-error
      delete this.prophoto;
      this.prophoto = { ...convert(result, 'prophoto', { inGamut: true }), spaceId: 'prophoto' };
      return this.prophoto;
    },
    get rec2020() {
      // @ts-expect-error
      delete this.rec2020;
      this.rec2020 = { ...convert(result, 'rec2020', { inGamut: true }), spaceId: 'rec2020' };
      return this.rec2020;
    },
    get srgb() {
      // @ts-expect-error
      delete this.srgb;
      this.srgb = { ...convert(result, 'srgb', { inGamut: true }), spaceId: 'srgb' };
      return this.srgb;
    },
    get srgbLinear() {
      // @ts-expect-error
      delete this.srgbLinear;
      this.srgbLinear = { ...convert(result, 'srgb-linear'), spaceId: 'srgb-linear' };
      return this.srgbLinear;
    },
    get xyzd50() {
      // @ts-expect-error
      delete this.xyzd50;
      this.xyzd50 = { ...convert(result, 'xyz-d50'), spaceId: 'xyz-d50' };
      return this.xyzd50;
    },
    get xyzd65() {
      // @ts-expect-error
      delete this.xyzd65;
      this.xyzd65 = { ...convert(result, 'xyz-d65'), spaceId: 'xyz-d65' };
      return this.xyzd65;
    },
  };
}

/** This does more intelligent diffing on a color than a simple useEffect would */
function isDifferent(a: ColorInput, b: ColorInput) {
  if (!a && !b) {
    return false; // both are undefined or unset
  }
  if (!a || !b) {
    return true; // otherwise, we are setting up or tearing down
  }
  if (typeof a === 'string') {
    return a !== b;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    if ('spaceId' in a && 'spaceId' in b) {
      return a.spaceId === b.spaceId && a.coords.every((v, i) => b.coords[i] === v) && a.alpha === b.alpha;
    }
    if ('colorSpace' in a && 'colorSpace' in b) {
      return (
        a.colorSpace === b.colorSpace && a.components.every((v, i) => b.components[i] === v) && a.alpha === b.alpha
      );
    }
  }
  return true;
}

/**
 * memoize Color.js colors and reduce unnecessary updates
 */
export default function useColor(color: ColorInput): [ColorOutput, (color: ColorInput) => void] {
  const lastColor = useRef(color);
  const [innerColor, setInnerColor] = useState(() => parse(color));

  if (isDifferent(lastColor.current, color)) {
    setInnerColor(parse(color));
    lastColor.current = color;
  }

  const setColorOutput = useCallback((newColor: React.SetStateAction<ColorInput>) => {
    if (typeof newColor === 'function') {
      newColor((value) => {
        const next = parse(value);
        setInnerColor(next);
        return next.original;
      });
    } else if (newColor) {
      setInnerColor(parse(newColor));
    }
  }, []);

  return [innerColor, setColorOutput];
}
