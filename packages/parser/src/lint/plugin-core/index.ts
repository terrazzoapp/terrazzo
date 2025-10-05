// Terrazzo internal plugin that powers lint rules. Always enabled.
import type { LintRuleLonghand, Plugin } from '../../types.js';

export * from './rules/a11y-min-contrast.js';
export * from './rules/a11y-min-font-size.js';
export * from './rules/colorspace.js';
export * from './rules/consistent-naming.js';
export * from './rules/descriptions.js';
export * from './rules/duplicate-values.js';
export * from './rules/max-gamut.js';
export * from './rules/no-type-on-alias.js';
export * from './rules/required-children.js';
export * from './rules/required-modes.js';
export * from './rules/required-typography-properties.js';

import a11yMinContrast, { A11Y_MIN_CONTRAST } from './rules/a11y-min-contrast.js';
import a11yMinFontSize, { A11Y_MIN_FONT_SIZE } from './rules/a11y-min-font-size.js';
import colorspace, { COLORSPACE } from './rules/colorspace.js';
import consistentNaming, { CONSISTENT_NAMING } from './rules/consistent-naming.js';
import descriptions, { DESCRIPTIONS } from './rules/descriptions.js';
import duplicateValues, { DUPLICATE_VALUES } from './rules/duplicate-values.js';
import maxGamut, { MAX_GAMUT } from './rules/max-gamut.js';
import noTypeOnAlias, { NO_TYPE_ON_ALIAS } from './rules/no-type-on-alias.js';
import requiredChildren, { REQUIRED_CHILDREN } from './rules/required-children.js';
import requiredModes, { REQUIRED_MODES } from './rules/required-modes.js';
import requiredTypographyProperties, {
  REQUIRED_TYPOGRAPHY_PROPERTIES,
} from './rules/required-typography-properties.js';
import validBoolean, { VALID_BOOLEAN } from './rules/valid-boolean.js';
import validBorder, { VALID_BORDER } from './rules/valid-border.js';
import validColor, { VALID_COLOR } from './rules/valid-color.js';
import validCubicBezier, { VALID_CUBIC_BEZIER } from './rules/valid-cubic-bezier.js';
import validDimension, { VALID_DIMENSION } from './rules/valid-dimension.js';
import validDuration, { VALID_DURATION } from './rules/valid-duration.js';
import validFontFamily, { VALID_FONT_FAMILY } from './rules/valid-font-family.js';
import validFontWeight, { VALID_FONT_WEIGHT } from './rules/valid-font-weight.js';
import validGradient, { VALID_GRADIENT } from './rules/valid-gradient.js';
import validLink, { VALID_LINK } from './rules/valid-link.js';
import validNumber, { VALID_NUMBER } from './rules/valid-number.js';
import validShadow, { VALID_SHADOW } from './rules/valid-shadow.js';
import validString, { VALID_STRING } from './rules/valid-string.js';
import validStrokeStyle, { VALID_STROKE_STYLE } from './rules/valid-stroke-style.js';
import validTransition, { VALID_TRANSITION } from './rules/valid-transition.js';
import validTypography, { VALID_TYPOGRAPHY } from './rules/valid-typography.js';

const ALL_RULES = {
  [VALID_COLOR]: validColor,
  [VALID_DIMENSION]: validDimension,
  [VALID_FONT_FAMILY]: validFontFamily,
  [VALID_FONT_WEIGHT]: validFontWeight,
  [VALID_DURATION]: validDuration,
  [VALID_CUBIC_BEZIER]: validCubicBezier,
  [VALID_NUMBER]: validNumber,
  [VALID_LINK]: validLink,
  [VALID_BOOLEAN]: validBoolean,
  [VALID_STRING]: validString,
  [VALID_STROKE_STYLE]: validStrokeStyle,
  [VALID_BORDER]: validBorder,
  [VALID_TRANSITION]: validTransition,
  [VALID_SHADOW]: validShadow,
  [VALID_GRADIENT]: validGradient,
  [VALID_TYPOGRAPHY]: validTypography,
  [COLORSPACE]: colorspace,
  [CONSISTENT_NAMING]: consistentNaming,
  [DESCRIPTIONS]: descriptions,
  [DUPLICATE_VALUES]: duplicateValues,
  [MAX_GAMUT]: maxGamut,
  [NO_TYPE_ON_ALIAS]: noTypeOnAlias,
  [REQUIRED_CHILDREN]: requiredChildren,
  [REQUIRED_MODES]: requiredModes,
  [REQUIRED_TYPOGRAPHY_PROPERTIES]: requiredTypographyProperties,
  [A11Y_MIN_CONTRAST]: a11yMinContrast,
  [A11Y_MIN_FONT_SIZE]: a11yMinFontSize,
};

export default function coreLintPlugin(): Plugin {
  return {
    name: '@terrazzo/plugin-lint-core',
    lint() {
      return ALL_RULES;
    },
  };
}

export const RECOMMENDED_CONFIG: Record<string, LintRuleLonghand> = {
  [VALID_COLOR]: ['error', {}],
  [VALID_DIMENSION]: ['error', {}],
  [VALID_FONT_FAMILY]: ['error', {}],
  [VALID_FONT_WEIGHT]: ['error', {}],
  [VALID_DURATION]: ['error', {}],
  [VALID_CUBIC_BEZIER]: ['error', {}],
  [VALID_NUMBER]: ['error', {}],
  [VALID_LINK]: ['error', {}],
  [VALID_BOOLEAN]: ['error', {}],
  [VALID_STRING]: ['error', {}],
  [VALID_STROKE_STYLE]: ['error', {}],
  [VALID_BORDER]: ['error', {}],
  [VALID_TRANSITION]: ['error', {}],
  [VALID_SHADOW]: ['error', {}],
  [VALID_GRADIENT]: ['error', {}],
  [VALID_TYPOGRAPHY]: ['error', {}],
  [CONSISTENT_NAMING]: ['warn', { format: 'kebab-case' }],
  [NO_TYPE_ON_ALIAS]: ['warn', {}],
};
