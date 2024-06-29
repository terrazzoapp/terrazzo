import { COLORSPACES, type Color, type ColorInput } from '@terrazzo/use-color';
import {
  // @ts-expect-error
  toGamut,
} from 'culori';

/** Calculate min, max, displayMin, and displayMax for a given color/colorspace/gamut */
export function calculateBounds(color: Color, channel: string, gamut: 'rgb' | 'p3' | 'rec2020' = 'rgb') {
  let min = 0;
  let max = 1;
  let displayMin: number | undefined;
  let displayMax: number | undefined;
  const clampGamut = toGamut(gamut);

  switch (color.mode) {
    case 'hsl':
    case 'hwb':
    case 'okhsl':
    case 'okhsv':
    case 'hsv': {
      switch (channel) {
        case 'h': {
          max = 360;
        }
      }
      break;
    }
    case 'lab': {
      switch (channel) {
        case 'l': {
          max = 100;
          displayMax = 100;
          break;
        }
        case 'a':
        case 'b': {
          displayMin = -125;
          displayMax = 125;
          // TODO: this is wrong
          const clampedMin = COLORSPACES[color.mode].converter(clampGamut({ ...color, [channel]: displayMin }));
          const clampedMax = COLORSPACES[color.mode].converter(clampGamut({ ...color, [channel]: displayMax }));
          min = clampedMin[channel];
          max = clampedMax[channel];
          break;
        }
      }
      break;
    }
    case 'lch': {
      switch (channel) {
        case 'l': {
          max = 100;
          break;
        }
        case 'c': {
          displayMax = 150;
          const clamped = COLORSPACES[color.mode].converter(clampGamut({ ...color, c: displayMax }));
          max = clamped.c;
          break;
        }
        case 'h': {
          max = 360;
          break;
        }
      }
      break;
    }
    case 'oklab': {
      if (channel === 'a' || channel === 'b') {
        displayMin = -0.4;
        displayMax = 0.4;
        const clampedMin = COLORSPACES[color.mode].converter(clampGamut({ ...color, [channel]: displayMin }));
        const clampedMax = COLORSPACES[color.mode].converter(clampGamut({ ...color, [channel]: displayMax }));
        min = clampedMin[channel];
        max = clampedMax[channel];
      }
      break;
    }
    case 'oklch': {
      switch (channel) {
        case 'h': {
          max = 360;
          break;
        }
        case 'c': {
          displayMax = 0.4;
          const clamped = COLORSPACES[color.mode].converter(clampGamut({ ...color, c: displayMax }));
          max = clamped.c;
          break;
        }
      }
      break;
    }
  }

  const result: {
    min: number;
    max: number;
    displayMin?: number;
    displayMax?: number;
    displayRange?: number;
  } = { min, max };
  if (typeof displayMin === 'number') {
    result.displayMin = displayMin;
  }
  if (typeof displayMax === 'number') {
    result.displayMax = displayMax;
    result.displayRange = displayMax - (displayMin ?? min);
  }

  return result;
}

/** Handle color gamut clamping */
export function updateColor(color: Color, gamut: 'rgb' | 'p3' | 'rec2020' = 'rgb'): ColorInput {
  switch (gamut) {
    // encompasses P3
    case 'rec2020': {
      // no clamping necessary
      if (color.mode === 'rgb' || color.mode === 'p3' || color.mode === 'hsl' || color.mode === 'hsv') {
        return COLORSPACES.rec2020.converter(color); // if this is in a non-Rec2020-compatible colorspace, convert it
      }
      break;
    }
    case 'p3': {
      const clamped = toGamut('p3')(color); // clamp color to P3 gamut
      if (color.mode === 'rec2020' || color.mode === 'rgb' || color.mode === 'hsl' || color.mode === 'hsv') {
        return COLORSPACES.p3.converter(clamped); // if this is in a non-P3-compatible colorspace, convert it
      }
      break;
    }
    default: {
      const clamped = toGamut('rgb')(color); // clamp to sRGB gamut
      if (color.mode === 'a98' || color.mode === 'rec2020' || color.mode === 'p3' || color.mode === 'prophoto') {
        return COLORSPACES.srgb.converter(clamped); // if this is in a non-sRGB-compatible colorspace, convert it
      }
      break;
    }
  }
  return color;
}

/** Order color channels in proper order */
export function channelOrder(color: Color): string[] {
  switch (color.mode) {
    case 'rgb':
    case 'rec2020':
    case 'lrgb':
    case 'a98':
    case 'prophoto': {
      return ['r', 'g', 'b', 'alpha'];
    }
    case 'hsl':
    case 'okhsl': {
      return ['h', 's', 'l', 'alpha'];
    }
    case 'hsv':
    case 'okhsv': {
      return ['h', 's', 'v', 'alpha'];
    }
    case 'hwb': {
      return ['h', 'w', 'b', 'alpha'];
    }
    case 'lab':
    case 'oklab': {
      return ['l', 'a', 'b', 'alpha'];
    }
    case 'lch':
    case 'oklch': {
      return ['l', 'c', 'h', 'alpha'];
    }
    case 'xyz50':
    case 'xyz65': {
      return ['x', 'y', 'z', 'alpha'];
    }
    default: {
      return Object.keys(color).filter((k) => k !== 'mode');
    }
  }
}
