import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const REQUIRED_TYPE = 'core/required-type';

export const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR> = {
  meta: {
    messages: {
      [ERROR]: 'Token missing $type.',
    },
    docs: {
      description: 'Requiring every token to have $type, even aliases, simplifies computation.',
      url: docsLink(REQUIRED_TYPE),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (!t.originalValue?.$type) {
        report({ messageId: ERROR, node: t.source.node, filename: t.source.filename });
      }
    }
  },
};

export default rule;
