import { isTokenMatch } from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

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
    for (const t of Object.values(tokens)) {
      if (options.ignore && isTokenMatch(t.id, options.ignore)) {
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