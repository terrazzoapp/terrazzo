import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import { isAlias } from '@terrazzo/token-tools';

import type { LintRule, LintRuleContext } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_NUMBER = 'core/valid-number';

const ERROR_NAN = 'ERROR_NAN';

const rule: LintRule<typeof ERROR_NAN> = {
  meta: {
    messages: {
      [ERROR_NAN]: 'Must be a number.',
    },
    docs: {
      description: 'Require number tokens to follow the format.',
      url: docsLink(VALID_NUMBER),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const token of Object.values(tokens)) {
      if (token.aliasOf || !token.originalValue) {
        continue;
      }

      switch (token.$type) {
        case 'number': {
          validateNumber(token.originalValue.$value, {
            filename: token.source.filename,
            node: getObjMember(token.source.node, '$value') as momoa.NumberNode,
            report,
          });
          break;
        }
        // Note: gradient not needed, validated in gradient
        case 'typography': {
          const $valueNode = getObjMember(token.source.node, '$value') as momoa.ObjectNode;
          if (
            typeof token.originalValue.$value === 'object' &&
            token.originalValue.$value.lineHeight &&
            !isAlias(token.originalValue.$value.lineHeight as string) &&
            typeof token.originalValue.$value.lineHeight !== 'object'
          ) {
            validateNumber(token.originalValue.$value.lineHeight, {
              filename: token.source.filename,
              node: getObjMember($valueNode, 'lineHeight') as momoa.NumberNode,
              report,
            });
          }
        }
      }
    }
  },
};

function validateNumber(
  value: unknown,
  {
    node,
    filename,
    report,
  }: {
    node: momoa.NumberNode;
    filename?: string;
    report: LintRuleContext<typeof ERROR_NAN>['report'];
  },
) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    report({ filename, messageId: ERROR_NAN, node });
  }
}

export default rule;
