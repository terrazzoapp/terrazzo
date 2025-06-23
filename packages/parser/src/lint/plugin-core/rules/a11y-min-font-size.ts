import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';
import wcmatch from 'wildcard-match';

export const A11Y_MIN_FONT_SIZE = 'a11y/min-font-size';

export interface RuleA11yMinFontSizeOptions {
  /** Minimum font size (pixels) */
  minSizePx?: number;
  /** Minimum font size (rems) */
  minSizeRem?: number;
  /** Token IDs to ignore. Accepts globs. */
  ignore?: string[];
}

export const ERROR_TOO_SMALL = 'TOO_SMALL';

const rule: LintRule<typeof ERROR_TOO_SMALL, RuleA11yMinFontSizeOptions> = {
  meta: {
    messages: {
      [ERROR_TOO_SMALL]: '{{ id }} font size too small. Expected minimum of {{ min }}',
    },
    docs: {
      description: 'Enforce font sizes are no smaller than the given value.',
      url: docsLink(A11Y_MIN_FONT_SIZE),
    },
  },
  defaultOptions: {},
  create({ tokens, options, report }) {
    if (!options.minSizePx && !options.minSizeRem) {
      throw new Error('Must specify at least one of minSizePx or minSizeRem');
    }

    const shouldIgnore = options.ignore ? wcmatch(options.ignore) : null;

    for (const t of Object.values(tokens)) {
      if (shouldIgnore?.(t.id)) {
        continue;
      }

      // skip aliases
      if (t.aliasOf) {
        continue;
      }

      if (t.$type === 'typography' && 'fontSize' in t.$value) {
        const fontSize = t.$value.fontSize!;

        if (
          (fontSize.unit === 'px' && options.minSizePx && fontSize.value < options.minSizePx) ||
          (fontSize.unit === 'rem' && options.minSizeRem && fontSize.value < options.minSizeRem)
        ) {
          report({
            messageId: ERROR_TOO_SMALL,
            data: {
              id: t.id,
              min: options.minSizePx ? `${options.minSizePx}px` : `${options.minSizeRem}rem`,
            },
          });
        }
      }
    }
  },
};

export default rule;
