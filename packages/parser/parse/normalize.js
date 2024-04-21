import { parseColor } from '@terrazzo/token-tools';

export default function normalizeValue(token) {
  switch (token.$type) {
    case 'boolean': {
      return !!token.$value;
    }
    case 'border': {
      return {
        color: normalizeValue({ $type: 'color', $value: token.$value.color ?? '#000000' }),
        style: normalizeValue({ $type: 'strokeStyle', $value: token.$value.style ?? 'solid' }),
        width: normalizeValue({ $type: 'dimension', $value: token.$value.dimension }),
      };
    }
    case 'color': {
      return parseColor(token.$value);
    }
    case 'cubicBezier': {
      return token.$value.map((value) => normalizeValue({ $type: 'number', $value: value }));
    }
    case 'dimension': {
      if (token.$value === 0) {
        return '0';
      }
      return typeof token.$value === 'number' ? `${token.$value}px` : token.$value;
    }
    case 'duration': {
      if (token.$value === 0) {
        return '0';
      }
      return typeof token.$value === 'number' ? `${token.$value}ms` : token.$value;
    }
    case 'gradient': {
      const output = [];
      for (let i = 0; i < token.$value.length; i++) {
        const stop = { ...token.$value[i] };
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
