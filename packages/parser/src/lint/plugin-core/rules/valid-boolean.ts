import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_BOOLEAN = 'core/valid-boolean';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR, {}> = {
  meta: {
    messages: {
      [ERROR]: 'Must be a boolean.',
    },
    docs: {
      description: 'Require boolean tokens to follow the Terrazzo extension.',
      url: docsLink(VALID_BOOLEAN),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue || t.$type !== 'boolean') {
        continue;
      }

      validateBoolean(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value'),
        filename: t.source.filename,
      });

      function validateBoolean(value: unknown, { node, filename }: { node?: momoa.AnyNode; filename?: string }) {
        if (typeof value !== 'boolean') {
          report({ messageId: ERROR, filename, node });
        }
      }
    }
  },
};

export default rule;
