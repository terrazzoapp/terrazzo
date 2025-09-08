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
  { mode, ...options }: { mode: keyof T['mode'] } & TransformCSSValueOptions,
) {
  const selectedMode = token.mode[mode as keyof typeof token.mode];
  if (!selectedMode) {
    return;
  }
  const tokenWithModeValue: T = {
    id: token.id,
    $type: token.$type,
    // note: do NOT carry over aliasOf/partialAliasOf as that will result in incorrect values
    ...selectedMode,
  } as any;
  switch (tokenWithModeValue.$type) {
    case 'boolean': {
      return transformBoolean(tokenWithModeValue, options);
    }
    case 'border': {
      return transformBorder(tokenWithModeValue, options);
    }
    case 'color': {
      return transformColor(tokenWithModeValue, options);
    }
    case 'cubicBezier': {
      return transformCubicBezier(tokenWithModeValue, options);
    }
    case 'dimension': {
      return transformDimension(tokenWithModeValue, options);
    }
    case 'duration': {
      return transformDuration(tokenWithModeValue, options);
    }
    case 'fontFamily': {
      return transformFontFamily(tokenWithModeValue, options);
    }
    case 'fontWeight': {
      return transformFontWeight(tokenWithModeValue, options);
    }
    case 'gradient': {
      return transformGradient(tokenWithModeValue, options);
    }
    case 'link': {
      return transformLink(tokenWithModeValue, options);
    }
    case 'number': {
      return transformNumber(tokenWithModeValue, options);
    }
    case 'shadow': {
      return transformShadow(tokenWithModeValue, options);
    }
    case 'string': {
      return transformString(tokenWithModeValue, options);
    }
    case 'strokeStyle': {
      return transformStrokeStyle(tokenWithModeValue, options);
    }
    case 'transition': {
      return transformTransition(tokenWithModeValue, options);
    }
    case 'typography': {
      return transformTypography(tokenWithModeValue, options);
    }
  }
}
