import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';
import { cachedLintMatcher } from '../lib/matchers.js';

export const DUPLICATE_VALUES = 'core/duplicate-values';

export interface RuleDuplicateValueOptions {
  /** Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

const ERROR_DUPLICATE_VALUE = 'ERROR_DUPLICATE_VALUE';

const rule: LintRule<typeof ERROR_DUPLICATE_VALUE, RuleDuplicateValueOptions> = {
  meta: {
    messages: {
      [ERROR_DUPLICATE_VALUE]: '{{ id }} declared a duplicate value',
    },
    docs: {
      description: 'Enforce tokens can’t redeclare the same value (excludes aliases).',
      url: docsLink(DUPLICATE_VALUES),
    },
  },
  defaultOptions: {
    ignore: [],
  },
  lint({ tokens, options, report }) {
    const isIgnored = cachedLintMatcher(options.ignore ?? []);
    const valueMap = new Map<string, string>();

    for (const [id, token] of Object.entries(tokens)) {
      if (isIgnored.match(id)) {
        continue;
      }

      for (const [mode, value] of Object.entries(token)) {
        // Skip aliases: if the token mode is an alias (e.g. { aliasOf: ... }),
        // it is an intentional reference rather than a duplicated literal value.
        if (value && typeof value === 'object' && 'aliasOf' in value && value.aliasOf) {
          continue;
        }

        const serialized = JSON.stringify(value?.$value);
        if (!serialized) {
          continue;
        }

        const key = `${mode}:${serialized}`;
        const existing = valueMap.get(key);
        if (existing && existing !== id) {
          report({
            messageId: ERROR_DUPLICATE_VALUE,
            node: token[mode]?.node,
            data: { id },
          });
        } else {
          valueMap.set(key, id);
        }
      }
    }
  },
};

export default rule;
