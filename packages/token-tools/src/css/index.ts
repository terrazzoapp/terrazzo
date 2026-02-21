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

const TRANSFORMS = {
  boolean: transformBoolean,
  border: transformBorder,
  color: transformColor,
  cubicBezier: transformCubicBezier,
  dimension: transformDimension,
  duration: transformDuration,
  fontFamily: transformFontFamily,
  fontWeight: transformFontWeight,
  gradient: transformGradient,
  link: transformLink,
  number: transformNumber,
  shadow: transformShadow,
  string: transformString,
  strokeStyle: transformStrokeStyle,
  transition: transformTransition,
  typography: transformTypography,
};

/** Main CSS Transform */
export function transformCSSValue<T extends TokenNormalized = TokenNormalized>(
  token: T,
  options: TransformCSSValueOptions,
) {
  return TRANSFORMS[token.$type]?.(token as any, options);
}
