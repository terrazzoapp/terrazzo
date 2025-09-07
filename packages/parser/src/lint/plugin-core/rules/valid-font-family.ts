import type { ArrayNode, ObjectNode } from '@humanwhocodes/momoa';
import { getObjMember, getObjMembers } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_FONT_FAMILY = 'core/valid-font-family';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR> = {
  meta: {
    messages: {
      [ERROR]: 'Must be a string, or array of strings.',
    },
    docs: {
      description: 'Require fontFamily tokens to follow the format.',
      url: docsLink(VALID_FONT_FAMILY),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue) {
        continue;
      }

      switch (t.$type) {
        case 'fontFamily': {
          validateFontFamily(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value') as ArrayNode,
            filename: t.source.filename,
          });
          break;
        }
        case 'typography': {
          if (typeof t.originalValue.$value === 'object' && t.originalValue.$value.fontFamily) {
            if (t.partialAliasOf?.fontFamily) {
              continue;
            }
            const $value = getObjMember(t.source.node, '$value');
            const properties = getObjMembers($value as ObjectNode);
            validateFontFamily(t.originalValue.$value.fontFamily, {
              node: properties.fontFamily as ArrayNode,
              filename: t.source.filename,
            });
          }
          break;
        }
      }

      function validateFontFamily(value: unknown, { node, filename }: { node: ArrayNode; filename?: string }) {
        if (typeof value === 'string') {
          if (!value) {
            report({ messageId: ERROR, node, filename });
          }
        } else if (Array.isArray(value)) {
          if (!value.every((v) => v && typeof v === 'string')) {
            report({ messageId: ERROR, node, filename });
          }
        } else {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
