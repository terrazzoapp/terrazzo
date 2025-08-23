import type { ObjectNode } from '@humanwhocodes/momoa';
import { TRANSITION_REQUIRED_PROPERTIES } from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_TRANSITION = 'core/valid-transition';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR> = {
  meta: {
    messages: {
      [ERROR]: `Missing required properties: ${new Intl.ListFormat(undefined, { type: 'conjunction' }).format(TRANSITION_REQUIRED_PROPERTIES)}.`,
    },
    docs: {
      description: 'Require transition tokens to follow the format.',
      url: docsLink(VALID_TRANSITION),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || t.$type !== 'typography') {
        continue;
      }

      validateTransition(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as ObjectNode,
        filename: t.source.filename,
      });

      // Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
      // The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
      function validateTransition(value: unknown, { node, filename }: { node: ObjectNode; filename?: string }) {
        if (
          !value ||
          typeof value !== 'object' ||
          TRANSITION_REQUIRED_PROPERTIES.every((property) => property in value)
        ) {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
