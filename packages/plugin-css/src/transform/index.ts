import {ParsedToken} from '@cobalt-ui/core';
import {isAlias, kebabinate} from '@cobalt-ui/utils';
import transformColor, {type ColorFormat} from './color.js';
import transformDimension from './dimension.js';
import transformDuration from './duration.js';
import transformFontFamily from './font-family.js';
import transformFontWeight from './font-weight.js';
import transformCubicBezier from './cubic-bezier.js';
import transformNumber from './number.js';
import transformLink from './link.js';
import transformStrokeStyle from './stroke-style.js';
import {getMode, type makeNameGenerator, varRef} from '../utils/token.js';
import transformBorder from './border.js';

export * from './color.js';
export {transformColor, transformDimension, transformDuration, transformFontFamily, transformFontWeight, transformCubicBezier, transformNumber, transformLink, transformStrokeStyle};

export default function transform(
  token: ParsedToken,
  {
    colorFormat = 'hex',
    generateName,
    mode,
    prefix,
    tokens,
  }: {
    colorFormat: ColorFormat;
    generateName?: ReturnType<typeof makeNameGenerator>;
    mode?: string;
    prefix?: string;
    tokens?: ParsedToken[];
  },
): string | number | Record<string, string> {
  switch (token.$type) {
    // base tokens
    case 'color': {
      const {originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      return transformColor(originalVal, colorFormat); // note: use original value because it may have been normalized to hex (which matters if it wasn’t in sRGB gamut to begin with)
    }
    case 'dimension': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformDimension(value);
    }
    case 'duration': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformDuration(value);
    }
    case 'font' as 'fontFamily': // @deprecated (but keep support for now)
    case 'fontFamily': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformFontFamily(value);
    }
    case 'fontWeight': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformFontWeight(value);
    }
    case 'cubicBezier': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformCubicBezier(value);
    }
    case 'number': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformNumber(value);
    }
    case 'link': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformLink(value);
    }
    case 'strokeStyle': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformStrokeStyle(value);
    }
    // composite tokens
    case 'border': {
      return transformBorder(token, {mode, prefix, tokens, generateName, colorFormat});
    }
    case 'shadow': {
      let {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }

      // handle backwards compat for previous versions that didn’t always return array
      if (!Array.isArray(value)) value = [value];
      if (!Array.isArray(originalVal)) originalVal = [originalVal];

      return value
        .map((shadow, i) => {
          const origShadow = originalVal[i]!;
          if (typeof origShadow === 'string') {
            return varRef(origShadow, {prefix, tokens, generateName});
          }
          const offsetX = isAlias(origShadow.offsetX) ? varRef(origShadow.offsetX, {prefix, tokens, generateName}) : transformDimension(shadow.offsetX);
          const offsetY = isAlias(origShadow.offsetY) ? varRef(origShadow.offsetY, {prefix, tokens, generateName}) : transformDimension(shadow.offsetY);
          const blur = isAlias(origShadow.blur) ? varRef(origShadow.blur, {prefix, tokens, generateName}) : transformDimension(shadow.blur);
          const spread = isAlias(origShadow.spread) ? varRef(origShadow.spread, {prefix, tokens, generateName}) : transformDimension(shadow.spread);
          const color = isAlias(origShadow.color) ? varRef(origShadow.color, {prefix, tokens, generateName}) : transformColor(origShadow.color, colorFormat);
          return `${shadow.inset ? 'inset ' : ''}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
        })
        .join(', ');
    }
    case 'gradient': {
      const {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      return value
        .map((gradient, i) => {
          const origGradient = originalVal[i]!;
          if (typeof origGradient === 'string') {
            return varRef(origGradient, {prefix, tokens, generateName});
          }
          const color = isAlias(origGradient.color) ? varRef(origGradient.color, {prefix, tokens, generateName}) : transformColor(origGradient.color, colorFormat);
          const stop = isAlias(origGradient.position) ? varRef(origGradient.position as any, {prefix, tokens, generateName}) : `${100 * gradient.position}%`;
          return `${color} ${stop}`;
        })
        .join(', ');
    }
    case 'transition': {
      const {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      const duration = isAlias(originalVal.duration) ? varRef(originalVal.duration, {prefix, tokens, generateName}) : transformDuration(value.duration);
      let delay: string | undefined = undefined;
      if (value.delay) {
        delay = isAlias(originalVal.delay) ? varRef(originalVal.delay, {prefix, tokens, generateName}) : transformDuration(value.delay);
      }
      const timingFunction = isAlias(originalVal.timingFunction) ? varRef(originalVal.timingFunction as any, {prefix, tokens, generateName}) : transformCubicBezier(value.timingFunction);
      return `${duration} ${delay ?? ''} ${timingFunction}`;
    }
    case 'typography': {
      const {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      const output: Record<string, string> = {};
      for (const [k, v] of Object.entries(value)) {
        const formatter = k === 'fontFamily' ? transformFontFamily : (val: any): string => String(val);
        output[kebabinate(k)] = isAlias((originalVal as any)[k] as any) ? varRef((originalVal as any)[k], {prefix, tokens, generateName}) : formatter(v as any);
      }
      return output;
    }
    default: {
      throw new Error(`No transformer defined for $type: ${(token as any).$type} tokens`);
    }
  }
}
