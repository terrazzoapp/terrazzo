import type { ArrayNode, ObjectNode } from '@humanwhocodes/momoa';
import { SHADOW_REQUIRED_PROPERTIES } from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_SHADOW = 'core/valid-shadow';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR> = {
  meta: {
    messages: {
      [ERROR]: `Missing required properties: ${new Intl.ListFormat(undefined, { type: 'conjunction' }).format(SHADOW_REQUIRED_PROPERTIES)}.`,
    },
    docs: {
      description: 'Require shadow tokens to follow the format.',
      url: docsLink(VALID_SHADOW),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || t.$type !== 'shadow') {
        continue;
      }

      validateShadow(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as ObjectNode,
        filename: t.source.filename,
      });

      // Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
      // The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
      function validateShadow(value: unknown, { node, filename }: { node: ObjectNode | ArrayNode; filename?: string }) {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            if (typeof value[i] !== 'object' || !SHADOW_REQUIRED_PROPERTIES.every((property) => property in value[i])) {
              report({ messageId: ERROR, node: (node as ArrayNode).elements[i], filename });
            }
          }
        } else if (
          !value ||
          typeof value !== 'object' ||
          !SHADOW_REQUIRED_PROPERTIES.every((property) => property in value)
        ) {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
