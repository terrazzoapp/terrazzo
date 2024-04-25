import { isAlias, parseColor } from '@terrazzo/token-tools';

export const FONT_WEIGHT_MAP = {
  thin: 100,
  hairline: 100,
  'extra-light': 200,
  'ultra-light': 200,
  light: 300,
  normal: 400,
  regular: 400,
  book: 400,
  medium: 500,
  'semi-bold': 600,
  'demi-bold': 600,
  bold: 700,
  'extra-bold': 800,
  'ultra-bold': 800,
  black: 900,
  heavy: 900,
  'extra-black': 950,
  'ultra-black': 950,
};

export default function normalizeValue(token) {
  if (isAlias(token.$value)) {
    return token.$value;
  }
  switch (token.$type) {
    case 'boolean': {
      return !!token.$value;
    }
    case 'border': {
      return {
        color: normalizeValue({ $type: 'color', $value: token.$value.color ?? '#000000' }),
        style: normalizeValue({ $type: 'strokeStyle', $value: token.$value.style ?? 'solid' }),
        width: normalizeValue({ $type: 'dimension', $value: token.$value.width }),
      };
    }
    case 'color': {
      return typeof token.$value === 'string' ? parseColor(token.$value) : token.$value;
    }
    case 'cubicBezier': {
      return token.$value.map((value) =>
        typeof value === 'number' ? normalizeValue({ $type: 'number', $value: value }) : value,
      );
    }
    case 'dimension': {
      if (token.$value === 0) {
        return 0;
      }
      return typeof token.$value === 'number' ? `${token.$value}px` : token.$value;
    }
    case 'duration': {
      if (token.$value === 0) {
        return 0;
      }
      return typeof token.$value === 'number' ? `${token.$value}ms` : token.$value;
    }
    case 'fontFamily': {
      return Array.isArray(token.$value) ? token.$value : [token.$value];
    }
    case 'fontWeight': {
      if (typeof token.$value === 'string' && FONT_WEIGHT_MAP[token.$value]) {
        return FONT_WEIGHT_MAP[token.$value];
      }
      return Number.parseInt(token.$value);
    }
    case 'gradient': {
      const output = [];
      for (let i = 0; i < token.$value.length; i++) {
        const stop = { ...token.$value[i] };
        stop.color = normalizeValue({ $type: 'color', $value: stop.color });
        if (typeof stop.position !== 'number') {
          stop.position = i / (token.$value.length - 1);
        }
        output.push(stop);
      }
      return output;
    }
    case 'number': {
      return typeof token.$value === 'number' ? token.$value : Number.parseFloat(token.$value);
    }
    case 'shadow': {
      return Array.isArray(token.$value) ? token.$value : [token.$value];
    }
    case 'strokeStyle': {
      return token.$value;
    }
    case 'string': {
      return String(token.$value);
    }
    case 'transition': {
      return {
        duration: normalizeValue({ $type: 'duration', $value: token.$value.duration ?? 0 }),
        delay: normalizeValue({ $type: 'duration', $value: token.$value.delay ?? 0 }),
        timingFunction: normalizeValue({ $type: 'cubicBezier', $value: token.$value.timingFunction }),
      };
    }
    case 'typography': {
      const output = {};
      for (const k in token.$value) {
        if (k === 'fontSize') {
          output[k] = normalizeValue({ $type: 'dimension', $value: token.$value[k] });
        } else {
          output[k] = token.$value[k];
        }
      }
      return output;
    }
    default: {
      return token.$value;
    }
  }
}
