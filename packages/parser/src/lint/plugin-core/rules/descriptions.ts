import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';
import { cachedLintMatcher } from '../lib/matchers.js';

export const DESCRIPTIONS = 'core/descriptions';

export interface RuleDescriptionsOptions {
  /** Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

const ERROR_MISSING_DESCRIPTION = 'MISSING_DESCRIPTION';

const rule: LintRule<typeof ERROR_MISSING_DESCRIPTION, RuleDescriptionsOptions> = {
  meta: {
    messages: {
      [ERROR_MISSING_DESCRIPTION]: '{{ id }} missing description',
    },
    docs: {
      description: 'Enforce tokens have descriptions.',
      url: docsLink(DESCRIPTIONS),
    },
  },
  defaultOptions: {},
  create({ tokens, options, report }) {
    const shouldIgnore = options.ignore ? cachedLintMatcher.tokenIDMatch(options.ignore) : null;

    for (const t of Object.values(tokens)) {
      if (shouldIgnore?.(t.id)) {
        continue;
      }
      if (!t.$description) {
        report({
          messageId: ERROR_MISSING_DESCRIPTION,
          data: { id: t.id },
          node: t.source.node,
        });
      }
    }
  },
};

export default rule;
