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

const NUMBER_WITH_UNIT_RE = /(-?\d*\.?\d+)(.*)/;

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
      if (typeof token.$value === 'string') {
        return parseColor(token.$value);
      }
      return 'alpha' in token.$value ? token.$value : { ...token.$value, alpha: 1 };
    }
    case 'cubicBezier': {
      return token.$value.map((value) =>
        typeof value === 'number' ? normalizeValue({ $type: 'number', $value: value }) : value,
      );
    }
    case 'dimension': {
      if (token.$value === 0) {
        return { value: 0, unit: 'px' };
      }
      // Backwards compat: handle string
      if (typeof token.$value === 'string') {
        const match = token.$value.match(NUMBER_WITH_UNIT_RE);
        return { value: Number.parseFloat(match?.[1] || token.$value), unit: match[2] || 'px' };
      }
      return token.$value;
    }
    case 'duration': {
      if (token.$value === 0) {
        return { value: 0, unit: 'ms' };
      }
      // Backwards compat: handle string
      if (typeof token.$value === 'string') {
        const match = token.$value.match(NUMBER_WITH_UNIT_RE);
        return { value: Number.parseFloat(match?.[1] || token.$value), unit: match[2] || 'ms' };
      }
      return token.$value;
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
        if (stop.position === undefined) {
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
      return (Array.isArray(token.$value) ? token.$value : [token.$value]).map((layer) => ({
        color: normalizeValue({ $type: 'color', $value: layer.color }),
        offsetX: normalizeValue({ $type: 'dimension', $value: layer.offsetX ?? 0 }),
        offsetY: normalizeValue({ $type: 'dimension', $value: layer.offsetY ?? 0 }),
        blur: normalizeValue({ $type: 'dimension', $value: layer.blur ?? 0 }),
        spread: normalizeValue({ $type: 'dimension', $value: layer.spread ?? 0 }),
        inset: layer.inset === true,
      }));
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
        switch (k) {
          case 'letterSpacing':
          case 'fontSize':
            output[k] = normalizeValue({ $type: 'dimension', $value: token.$value[k] });
            break;
          default:
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
