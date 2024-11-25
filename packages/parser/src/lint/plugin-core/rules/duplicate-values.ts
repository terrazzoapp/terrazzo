import { isAlias, isTokenMatch } from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

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
  defaultOptions: {},
  create({ report, tokens, options }) {
    const values: Record<string, Set<any>> = {};

    for (const t of Object.values(tokens)) {
      // skip ignored tokens
      if (options.ignore && isTokenMatch(t.id, options.ignore)) {
        continue;
      }

      if (!values[t.$type]) {
        values[t.$type] = new Set();
      }

      // primitives: direct comparison is easy
      if (
        t.$type === 'boolean' ||
        t.$type === 'duration' ||
        t.$type === 'fontWeight' ||
        t.$type === 'link' ||
        t.$type === 'number' ||
        t.$type === 'string'
      ) {
        // skip aliases (note: $value will be resolved)
        if (isAlias(t.aliasOf)) {
          continue;
        }

        if (values[t.$type]?.has(t.$value)) {
          report({
            messageId: ERROR_DUPLICATE_VALUE,
            data: { id: t.id },
            node: t.source.node,
          });
        }

        values[t.$type]?.add(t.$value);
      } else {
        // everything else: use deepEqual
        for (const v of values[t.$type]!.values() ?? []) {
          // TODO: don’t JSON.stringify
          if (JSON.stringify(t.$value) === JSON.stringify(v)) {
            report({
              messageId: ERROR_DUPLICATE_VALUE,
              data: { id: t.id },
              node: t.source.node,
            });
            break;
          }
        }
        values[t.$type]!.add(t.$value);
      }
    }
  },
};

export default rule;
