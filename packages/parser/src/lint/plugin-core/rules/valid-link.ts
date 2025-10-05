import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
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
      if (t.aliasOf || !t.originalValue || t.$type !== 'link') {
        continue;
      }

      validateLink(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as momoa.StringNode,
        filename: t.source.filename,
      });

      function validateLink(value: unknown, { node, filename }: { node: momoa.StringNode; filename?: string }) {
        if (!value || typeof value !== 'string') {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
