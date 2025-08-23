import type { StringNode } from '@humanwhocodes/momoa';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_LINK = 'core/valid-link';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR, {}> = {
  meta: {
    messages: {
      [ERROR]: 'Must be a string.',
    },
    docs: {
      description: 'Require link tokens to follow the Terrazzo extension.',
      url: docsLink(VALID_LINK),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || t.$type !== 'link') {
        continue;
      }

      validateLink(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as StringNode,
        filename: t.source.filename,
      });

      function validateLink(value: unknown, { node, filename }: { node: StringNode; filename?: string }) {
        if (typeof value !== 'string') {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
