import { camelCase, kebabCase, pascalCase, snakeCase } from 'scule';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const CONSISTENT_NAMING = 'core/consistent-naming';
export const ERROR_WRONG_FORMAT = 'ERROR_WRONG_FORMAT';

export interface RuleConsistentNamingOptions {
  /** Specify format, or custom naming validator */
  format:
    | 'kebab-case'
    | 'camelCase'
    | 'PascalCase'
    | 'snake_case'
    | 'SCREAMING_SNAKE_CASE'
    | ((tokenID: string) => string | undefined);
  /** Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

const rule: LintRule<typeof ERROR_WRONG_FORMAT, RuleConsistentNamingOptions> = {
  meta: {
    messages: {
      [ERROR_WRONG_FORMAT]: 'Token "{{ id }}" doesn’t match format {{ format }}',
    },
    docs: {
      description: 'Enforce consistent naming for tokens.',
      url: docsLink(CONSISTENT_NAMING),
    },
  },
  defaultOptions: { format: 'kebab-case' },
  create({ tokens, options, report }) {
    const basicFormatter = {
      'kebab-case': kebabCase,
      camelCase,
      PascalCase: pascalCase,
      snake_case: snakeCase,
      SCREAMING_SNAKE_CASE: (name: string) => snakeCase(name).toLocaleUpperCase(),
    }[String(options.format)];

    for (const t of Object.values(tokens)) {
      if (basicFormatter) {
        const parts = t.id.split('.');
        if (!parts.every((part) => basicFormatter(part) === part)) {
          report({
            messageId: ERROR_WRONG_FORMAT,
            data: { id: t.id, format: options.format },
            node: t.source.node,
          });
        }
      } else if (typeof options.format === 'function') {
        const result = options.format(t.id);
        if (result) {
          report({
            messageId: ERROR_WRONG_FORMAT,
            data: { id: t.id, format: '(custom)' },
            node: t.source.node,
          });
        }
      }
    }
  },
};

export default rule;
