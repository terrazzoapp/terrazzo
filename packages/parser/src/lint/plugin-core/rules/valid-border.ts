import type { AnyNode } from '@humanwhocodes/momoa';
import { BORDER_REQUIRED_PROPERTIES } from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_BORDER = 'core/valid-border';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR, {}> = {
  meta: {
    messages: {
      [ERROR]: `Border token missing required properties: ${new Intl.ListFormat(undefined, { type: 'conjunction' }).format(BORDER_REQUIRED_PROPERTIES)}.`,
    },
    docs: {
      description: 'Require border tokens to follow the format.',
      url: docsLink(VALID_BORDER),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || t.$type !== 'border') {
        continue;
      }

      validateBorder(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value'),
        filename: t.source.filename,
      });

      // Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
      // The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
      function validateBorder(value: unknown, { node, filename }: { node?: AnyNode; filename?: string }) {
        if (!value || typeof value !== 'object' || BORDER_REQUIRED_PROPERTIES.every((property) => property in value)) {
          report({ messageId: ERROR, filename, node });
        }
      }
    }
  },
};

export default rule;
