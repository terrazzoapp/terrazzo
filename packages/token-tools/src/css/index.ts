import type { TokenNormalized } from '../types.js';
import { transformBooleanValue } from './boolean.js';
import type { IDGenerator } from './lib.js';
import { transformBorderValue } from './border.js';
import { transformColorValue } from './color.js';
import { transformCubicBezierValue } from './cubic-bezier.js';
import { transformDimensionValue } from './dimension.js';
import { transformDurationValue } from './duration.js';
import { transformFontFamilyValue } from './font-family.js';
import { transformFontWeightValue } from './font-weight.js';
import { transformGradientValue } from './gradient.js';
import { transformNumberValue } from './number.js';
import { transformLinkValue } from './link.js';
import { transformShadowValue } from './shadow.js';
import { transformStringValue } from './string.js';
import { transformTypographyValue } from './typography.js';
import { transformTransitionValue } from './transition.js';
import { transformStrokeStyleValue } from './stroke-style.js';

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

export interface TransformCSSValueOptions {
  mode: string;
  transformAlias: IDGenerator;
}

/** Main CSS Transform */
export function transformCSSValue<T extends TokenNormalized>(
  token: T,
  { mode, transformAlias }: TransformCSSValueOptions,
) {
  if (!token.mode[mode]) {
    return;
  }
  switch (token.$type) {
    case 'boolean': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformBooleanValue($value, { aliasOf, transformAlias });
    }
    case 'border': {
      const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
      return transformBorderValue($value, { aliasOf, partialAliasOf, transformAlias });
    }
    case 'color': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformColorValue($value, { aliasOf, transformAlias });
    }
    case 'cubicBezier': {
      const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
      return transformCubicBezierValue($value, { aliasOf, partialAliasOf, transformAlias });
    }
    case 'dimension': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformDimensionValue($value, { aliasOf, transformAlias });
    }
    case 'duration': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformDurationValue($value, { aliasOf, transformAlias });
    }
    case 'fontFamily': {
      const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
      return transformFontFamilyValue($value, { aliasOf, partialAliasOf, transformAlias });
    }
    case 'fontWeight': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformFontWeightValue($value, { aliasOf, transformAlias });
    }
    case 'gradient': {
      const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
      return transformGradientValue($value, { aliasOf, partialAliasOf, transformAlias });
    }
    case 'link': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformLinkValue($value, { aliasOf, transformAlias });
    }
    case 'number': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformNumberValue($value, { aliasOf, transformAlias });
    }
    case 'shadow': {
      const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
      return transformShadowValue($value, { aliasOf, partialAliasOf, transformAlias });
    }
    case 'string': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformStringValue($value, { aliasOf, transformAlias });
    }
    case 'strokeStyle': {
      const { $value, aliasOf } = token.mode[mode]!;
      return transformStrokeStyleValue($value, { aliasOf, transformAlias });
    }
    case 'transition': {
      const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
      return transformTransitionValue($value, { aliasOf, partialAliasOf, transformAlias });
    }
    case 'typography': {
      const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
      return transformTypographyValue($value, { aliasOf, partialAliasOf, transformAlias });
    }
  }
}
