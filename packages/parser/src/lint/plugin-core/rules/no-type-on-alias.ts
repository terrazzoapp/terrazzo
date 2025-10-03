import { isAlias } from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const NO_TYPE_ON_ALIAS = 'core/no-type-on-alias';

export const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR> = {
  meta: {
    messages: {
      [ERROR]: 'Remove $type from aliased value.',
    },
    docs: {
      description: 'If a $value is aliased it already has a $type defined.',
      url: docsLink(NO_TYPE_ON_ALIAS),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (isAlias(t.originalValue!.$value as any) && t.originalValue?.$type) {
        report({ messageId: ERROR, node: t.source.node, filename: t.source.filename });
      }
    }
  },
};

export default rule;
