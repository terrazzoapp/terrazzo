import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember, getObjMembers } from '@terrazzo/json-schema-tools';

import type { LintRule, LintRuleContext } from '../../../types.js';
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
            node: getObjMember(t.source.node, '$value') as momoa.ArrayNode,
            filename: t.source.filename,
            report,
          });
          break;
        }
        case 'typography': {
          if (typeof t.originalValue.$value === 'object' && t.originalValue.$value.fontFamily) {
            if (t.partialAliasOf?.fontFamily) {
              continue;
            }
            const $value = getObjMember(t.source.node, '$value');
            const properties = getObjMembers($value as momoa.ObjectNode);
            validateFontFamily(t.originalValue.$value.fontFamily, {
              node: properties.fontFamily as momoa.ArrayNode,
              filename: t.source.filename,
              report,
            });
          }
          break;
        }
      }
    }
  },
};

function validateFontFamily(
  value: unknown,
  {
    node,
    filename,
    report,
  }: { node: momoa.ArrayNode; filename?: string; report: LintRuleContext<typeof ERROR>['report'] },
) {
  if (typeof value === 'string') {
    if (!value) {
      report({ filename, messageId: ERROR, node });
    }
  } else if (Array.isArray(value)) {
    if (!value.every((element) => element && typeof element === 'string')) {
      report({ filename, messageId: ERROR, node });
    }
  } else {
    report({ filename, messageId: ERROR, node });
  }
}

export default rule;
