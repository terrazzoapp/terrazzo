import type { ColorConstructor } from 'colorjs.io/fn';

/** Calculate min, max, displayMin, and displayMax for a given color/colorspace/gamut */
export function calculateBounds(color: ColorConstructor, channel: string) {
  let min = 0;
  let max = 1;

  switch (color.spaceId) {
    case 'hsl':
    case 'hwb':
    case 'okhsl':
    case 'okhsv': {
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
          break;
        }
        case 'a':
        case 'b': {
          min = -125;
          max = 125;
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
          max = 150;
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
        min = -0.4;
        max = 0.4;
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
          max = 0.4;
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

  return result;
}

/** Order color components in proper order */
export function channelOrder(color: ColorConstructor): string[] {
  switch (color.spaceId) {
    case 'srgb':
    case 'srgb-linear':
    case 'rec2020':
    case 'a98rgb':
    case 'prophoto': {
      return ['r', 'g', 'b', 'alpha'];
    }
    case 'hsl':
    case 'okhsl': {
      return ['h', 's', 'l', 'alpha'];
    }
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
    case 'xyz-d50':
    case 'xyz-d65': {
      return ['x', 'y', 'z', 'alpha'];
    }
    default: {
      return Object.keys(color).filter((k) => k !== 'mode');
    }
  }
}
