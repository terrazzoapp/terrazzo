import { tokenToColor } from '@terrazzo/token-tools';
import { contrastWCAG21 } from 'colorjs.io/fn';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const A11Y_MIN_CONTRAST = 'a11y/min-contrast';

export interface RuleA11yMinContrastOptions {
  /**
   * Whether to adhere to AA (minimum) or AAA (enhanced) contrast levels.
   * @default "AA"
   */
  level?: 'AA' | 'AAA';
  /** Pairs of color tokens (and optionally typography) to test */
  pairs: ContrastPair[];
}

export interface ContrastPair {
  /** The foreground color token ID */
  foreground: string;
  /** The background color token ID */
  background: string;
  /**
   * Is this pair for large text? Large text allows a smaller contrast ratio.
   *
   * Note: while WCAG has _suggested_ sizes and weights, those are merely
   * suggestions. It’s always more reliable to determine what constitutes “large
   * text” for your designs yourself, based on your typographic stack.
   * @see https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum
   */
  largeText?: boolean;
}

export const WCAG2_MIN_CONTRAST = {
  AA: { default: 4.5, large: 3 },
  AAA: { default: 7, large: 4.5 },
};

export const ERROR_INSUFFICIENT_CONTRAST = 'INSUFFICIENT_CONTRAST';

const rule: LintRule<typeof ERROR_INSUFFICIENT_CONTRAST, RuleA11yMinContrastOptions> = {
  meta: {
    messages: {
      [ERROR_INSUFFICIENT_CONTRAST]: 'Pair {{ index }} failed; expected {{ expected }}, got {{ actual }} ({{ level }})',
    },
    docs: {
      description: 'Enforce colors meet minimum contrast checks for WCAG 2.',
      url: docsLink(A11Y_MIN_CONTRAST),
    },
  },
  defaultOptions: { level: 'AA', pairs: [] },
  create({ tokens, options, report }) {
    for (let i = 0; i < options.pairs.length; i++) {
      const { foreground, background, largeText } = options.pairs[i]!;
      if (!tokens[foreground]) {
        throw new Error(`Token ${foreground} does not exist`);
      }
      if (tokens[foreground].$type !== 'color') {
        throw new Error(`Token ${foreground} isn’t a color`);
      }
      if (!tokens[background]) {
        throw new Error(`Token ${background} does not exist`);
      }
      if (tokens[background].$type !== 'color') {
        throw new Error(`Token ${background} isn’t a color`);
      }

      // Note: if these culors were unparseable, they would have already thrown an error before the linter
      const a = tokenToColor(tokens[foreground].$value)!;
      const b = tokenToColor(tokens[background].$value)!;

      // Note: for the purposes of WCAG 2, foreground and background don’t
      // matter. But in other contrast algorithms, they do.
      const contrast = contrastWCAG21(a, b);
      const min = WCAG2_MIN_CONTRAST[options.level ?? 'AA'][largeText ? 'large' : 'default'];
      if (contrast < min) {
        report({
          messageId: ERROR_INSUFFICIENT_CONTRAST,
          data: {
            index: i + 1,
            expected: min,
            actual: Math.round(contrast * 100) / 100,
            level: options.level,
          },
        });
      }
    }
  },
};

export default rule;
