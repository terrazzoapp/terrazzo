import type { TokenNormalized } from '../types.js';
import { transformBoolean } from './boolean.js';
import { transformBorder } from './border.js';
import { transformColor } from './color.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { transformCubicBezier } from './cubic-bezier.js';
import { transformDimension } from './dimension.js';
import { transformDuration } from './duration.js';
import { transformFontFamily } from './font-family.js';
import { transformFontWeight } from './font-weight.js';
import { transformGradient } from './gradient.js';
import { transformLink } from './link.js';
import { transformNumber } from './number.js';
import { transformShadow } from './shadow.js';
import { transformString } from './string.js';
import { transformStrokeStyle } from './stroke-style.js';
import { transformTransition } from './transition.js';
import { transformTypography } from './typography.js';

export * from './boolean.js';
export * from './border.js';
export * from './color.js';
export * from './css-types.js';
export * from './cubic-bezier.js';
export * from './dimension.js';
export * from './duration.js';
export * from './font-family.js';
export * from './font-weight.js';
export * from './gradient.js';
export * from './lib.js';
export * from './link.js';
export * from './number.js';
export * from './shadow.js';
export * from './string.js';
export * from './stroke-style.js';
export * from './transition.js';
export * from './typography.js';

/** Main CSS Transform */
export function transformCSSValue<T extends TokenNormalized = TokenNormalized>(
  token: T,
  options: TransformCSSValueOptions,
) {
  switch (token.$type) {
    case 'boolean': {
      return transformBoolean(token, options);
    }
    case 'border': {
      return transformBorder(token, options);
    }
    case 'color': {
      return transformColor(token, options);
    }
    case 'cubicBezier': {
      return transformCubicBezier(token, options);
    }
    case 'dimension': {
      return transformDimension(token, options);
    }
    case 'duration': {
      return transformDuration(token, options);
    }
    case 'fontFamily': {
      return transformFontFamily(token, options);
    }
    case 'fontWeight': {
      return transformFontWeight(token, options);
    }
    case 'gradient': {
      return transformGradient(token, options);
    }
    case 'link': {
      return transformLink(token, options);
    }
    case 'number': {
      return transformNumber(token, options);
    }
    case 'shadow': {
      return transformShadow(token, options);
    }
    case 'string': {
      return transformString(token, options);
    }
    case 'strokeStyle': {
      return transformStrokeStyle(token, options);
    }
    case 'transition': {
      return transformTransition(token, options);
    }
    case 'typography': {
      return transformTypography(token, options);
    }
  }
}
