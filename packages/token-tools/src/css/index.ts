import type { TokenNormalized } from '../types.js';
import { transformBooleanValue } from './boolean.js';
import { transformBorderValue } from './border.js';
import { transformColorValue } from './color.js';
import { transformCubicBezierValue } from './cubic-bezier.js';
import { transformDimensionValue } from './dimension.js';
import { transformDurationValue } from './duration.js';
import { transformFontFamilyValue } from './font-family.js';
import { transformFontWeightValue } from './font-weight.js';
import { transformGradientValue } from './gradient.js';
import type { IDGenerator } from './lib.js';
import { transformLinkValue } from './link.js';
import { transformNumberValue } from './number.js';
import { transformShadowValue } from './shadow.js';
import { transformStringValue } from './string.js';
import { transformStrokeStyleValue } from './stroke-style.js';
import { transformTransitionValue } from './transition.js';
import { transformTypographyValue } from './typography.js';

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
  transformAlias?: IDGenerator;
  /** Color options */
  color?: {
    /** Output legacy hex-6 and hex-8 */
    legacyHex?: boolean;
  };
}

/** Main CSS Transform */
export function transformCSSValue<T extends TokenNormalized>(
  token: T,
  { mode, transformAlias, color }: TransformCSSValueOptions,
) {
  if (!(mode in token.mode)) {
    return;
  }
  const { $type, $value, aliasChain, partialAliasOf } = token.mode[mode]!;

  // important: CSS wants to have the shallow alias (this will always exist if `aliasOf` does)
  const aliasOf = aliasChain?.[0];

  switch ($type) {
    case 'boolean':
      return transformBooleanValue($value, { aliasOf, transformAlias });
    case 'border':
      return transformBorderValue($value, { aliasOf, partialAliasOf, transformAlias, color });
    case 'color':
      return transformColorValue($value, { aliasOf, transformAlias, color });
    case 'cubicBezier':
      return transformCubicBezierValue($value, { aliasOf, partialAliasOf, transformAlias });
    case 'dimension':
      return transformDimensionValue($value, { aliasOf, transformAlias });
    case 'duration':
      return transformDurationValue($value, { aliasOf, transformAlias });
    case 'fontFamily':
      return transformFontFamilyValue($value, { aliasOf, partialAliasOf, transformAlias });
    case 'fontWeight':
      return transformFontWeightValue($value, { aliasOf, transformAlias });
    case 'gradient':
      return transformGradientValue($value, { aliasOf, partialAliasOf, transformAlias, color });
    case 'link':
      return transformLinkValue($value, { aliasOf, transformAlias });
    case 'number':
      return transformNumberValue($value, { aliasOf, transformAlias });
    case 'shadow':
      return transformShadowValue($value, { aliasOf, partialAliasOf, transformAlias });
    case 'string':
      return transformStringValue($value, { aliasOf, transformAlias });
    case 'strokeStyle':
      return transformStrokeStyleValue($value, { aliasOf, transformAlias });
    case 'transition':
      return transformTransitionValue($value, { aliasOf, partialAliasOf, transformAlias });
    case 'typography':
      return transformTypographyValue($value as Record<string, string>, { aliasOf, partialAliasOf, transformAlias });
  }
}
