// @ts-check
import { type ColorValue, type ColorValueNormalized, tokenToColor } from '@terrazzo/token-tools';
import {
  type ColorConstructor,
  ColorSpace,
  type ColorTypes,
  to as convert,
  getColor,
  HSV,
  Okhsl,
  Okhsv,
  type PlainColorObject,
  serialize,
} from 'colorjs.io/fn';
import { useCallback, useRef, useState } from 'react';

ColorSpace.register(HSV);
ColorSpace.register(Okhsl);
ColorSpace.register(Okhsv);

export type ColorInput = string | ColorValue | ColorTypes;

export interface ColorOutput {
  a98: PlainColorObject;
  css: string;
  hsl: PlainColorObject;
  hsv: PlainColorObject;
  hwb: PlainColorObject;
  lab: PlainColorObject;
  labd65: PlainColorObject;
  lch: PlainColorObject;
  okhsl: PlainColorObject;
  okhsv: PlainColorObject;
  oklab: PlainColorObject;
  oklch: PlainColorObject;
  original: PlainColorObject;
  p3: PlainColorObject;
  prophoto: PlainColorObject;
  rec2020: PlainColorObject;
  srgb: PlainColorObject;
  srgbLinear: PlainColorObject;
  xyzd50: PlainColorObject;
  xyzd65: PlainColorObject;
}

/**
 * Primary parse logic
 */
export function parse(color: ColorInput): ColorOutput {
  let result: PlainColorObject;
  if (color && typeof color === 'object' && 'colorSpace' in color) {
    // DTCG tokens: convert to Color.js format
    result = tokenToColor(color as ColorValueNormalized);
  } else {
    result = getColor(color);
  }

  return {
    // See link for why we’re doing this:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#smart_self-overwriting_lazy_getters
    get a98() {
      // @ts-expect-error
      delete this.a98;
      this.a98 = convert(result, 'a98rgb', { inGamut: true });
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
      this.hsl = convert(result, 'hsl', { inGamut: true });
      return this.hsl;
    },
    get hsv() {
      // @ts-expect-error
      delete this.hsv;
      this.hsv = convert(result, 'hsv', { inGamut: true });
      return this.hsv;
    },
    get hwb() {
      // @ts-expect-error
      delete this.hwb;
      this.hwb = convert(result, 'hwb');
      return this.hwb;
    },
    get lab() {
      // @ts-expect-error
      delete this.lab;
      this.lab = convert(result, 'lab');
      return this.lab;
    },
    get labd65() {
      // @ts-expect-error
      delete this.labd65;
      this.labd65 = convert(result, 'lab-d65');
      return this.labd65;
    },
    get lch() {
      // @ts-expect-error
      delete this.lch;
      this.lch = convert(result, 'lch');
      return this.lch;
    },
    get oklab() {
      // @ts-expect-error
      delete this.oklab;
      this.oklab = convert(result, 'oklab');
      return this.oklab;
    },
    get oklch() {
      // @ts-expect-error
      delete this.oklch;
      this.oklch = convert(result, 'oklch');
      return this.oklch;
    },
    get okhsl() {
      // @ts-expect-error
      delete this.okhsl;
      this.okhsl = convert(result, 'okhsl');
      return this.okhsl;
    },
    get okhsv() {
      // @ts-expect-error
      delete this.okhsv;
      this.okhsv = convert(result, 'okhsv');
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
      this.p3 = convert(result, 'p3');
      return this.p3;
    },
    get prophoto() {
      // @ts-expect-error
      delete this.prophoto;
      this.prophoto = convert(result, 'prophoto');
      return this.prophoto;
    },
    get rec2020() {
      // @ts-expect-error
      delete this.rec2020;
      this.rec2020 = convert(result, 'rec2020');
      return this.rec2020;
    },
    get srgb() {
      // @ts-expect-error
      delete this.srgb;
      this.srgb = convert(result, 'srgb');
      return this.srgb;
    },
    get srgbLinear() {
      // @ts-expect-error
      delete this.srgbLinear;
      this.srgbLinear = convert(result, 'srgb-linear');
      return this.srgbLinear;
    },
    get xyzd50() {
      // @ts-expect-error
      delete this.xyzd50;
      this.xyzd50 = convert(result, 'xyz-d50');
      return this.xyzd50;
    },
    get xyzd65() {
      // @ts-expect-error
      delete this.xyzd65;
      this.xyzd65 = convert(result, 'xyz-d65');
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
