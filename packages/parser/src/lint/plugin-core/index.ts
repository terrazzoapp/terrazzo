import type { Plugin } from '../../types.js';

export * from './rules/colorspace.js';
export * from './rules/consistent-naming.js';
export * from './rules/duplicate-values.js';
export * from './rules/max-gamut.js';
export * from './rules/required-children.js';
export * from './rules/required-modes.js';
export * from './rules/required-typography-properties.js';

import colorspace, { COLORSPACE } from './rules/colorspace.js';
import consistentNaming, { CONSISTENT_NAMING } from './rules/consistent-naming.js';
import duplicateValues, { DUPLICATE_VALUES } from './rules/duplicate-values.js';
import maxGamut, { MAX_GAMUT } from './rules/max-gamut.js';
import requiredChidlren, { REQUIRED_CHILDREN } from './rules/required-children.js';
import requiredModes, { REQUIRED_MODES } from './rules/required-modes.js';
import requiredTypographyProperties, {
  REQUIRED_TYPOGRAPHY_PROPERTIES,
} from './rules/required-typography-properties.js';

export default function coreLintPlugin(): Plugin {
  return {
    name: '@terrazzo/plugin-lint-core',
    lint() {
      return {
        [COLORSPACE]: colorspace,
        [CONSISTENT_NAMING]: consistentNaming,
        [DUPLICATE_VALUES]: duplicateValues,
        [MAX_GAMUT]: maxGamut,
        [REQUIRED_CHILDREN]: requiredChidlren,
        [REQUIRED_MODES]: requiredModes,
        [REQUIRED_TYPOGRAPHY_PROPERTIES]: requiredTypographyProperties,
      };
    },
  };
}
