import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import { BORDER_REQUIRED_PROPERTIES } from '@terrazzo/token-tools';

import type { LintRule, LintRuleContext } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_BORDER = 'core/valid-border';

const ERROR = 'ERROR';
const ERROR_INVALID_PROP = 'ERROR_INVALID_PROP';

const rule: LintRule<typeof ERROR | typeof ERROR_INVALID_PROP, Record<string, never>> = {
  meta: {
    messages: {
      [ERROR]: `Border token missing required properties: ${new Intl.ListFormat('en-us', { type: 'conjunction' }).format(BORDER_REQUIRED_PROPERTIES)}.`,
      [ERROR_INVALID_PROP]: 'Unknown property: {{ key }}.',
    },
    docs: {
      description: 'Require border tokens to follow the format.',
      url: docsLink(VALID_BORDER),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue || t.$type !== 'border') {
        continue;
      }

      validateBorder(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value'),
        filename: t.source.filename,
        report,
      });
    }
  },
};

// Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
// The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
function validateBorder(
  value: unknown,
  {
    node,
    filename,
    report,
  }: {
    node?: momoa.AnyNode;
    filename?: string;
    report: LintRuleContext<typeof ERROR | typeof ERROR_INVALID_PROP>['report'];
  },
) {
  if (
    !value ||
    typeof value !== 'object' ||
    !BORDER_REQUIRED_PROPERTIES.every((property) => property in value)
  ) {
    report({ filename, messageId: ERROR, node });
  } else {
    for (const key of Object.keys(value)) {
      if (
        !BORDER_REQUIRED_PROPERTIES.includes(key as (typeof BORDER_REQUIRED_PROPERTIES)[number])
      ) {
        report({
          messageId: ERROR_INVALID_PROP,
          data: { key: JSON.stringify(key) },
          node: getObjMember(node as momoa.ObjectNode, key) ?? node,
          filename,
        });
      }
    }
  }
}

export default rule;
