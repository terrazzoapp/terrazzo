import type { StringNode } from '@humanwhocodes/momoa';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_STRING = 'core/valid-string';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR> = {
  meta: {
    messages: {
      [ERROR]: 'Must be a string.',
    },
    docs: {
      description: 'Require string tokens to follow the Terrazzo extension.',
      url: docsLink(VALID_STRING),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue || t.$type !== 'string') {
        continue;
      }

      validateString(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as StringNode,
        filename: t.source.filename,
      });

      function validateString(value: unknown, { node, filename }: { node: StringNode; filename?: string }) {
        if (typeof value !== 'string') {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
