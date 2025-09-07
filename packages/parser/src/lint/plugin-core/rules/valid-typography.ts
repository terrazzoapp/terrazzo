import type { ObjectNode } from '@humanwhocodes/momoa';
import { TYPOGRAPHY_REQUIRED_PROPERTIES } from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_TYPOGRAPHY = 'core/valid-typography';

const ERROR = 'ERROR';
const ERROR_MISSING = 'ERROR_MISSING';

const rule: LintRule<typeof ERROR | typeof ERROR_MISSING> = {
  meta: {
    messages: {
      [ERROR]: `Must be an object with the properties ${TYPOGRAPHY_REQUIRED_PROPERTIES.join(', ')}.`,
      [ERROR_MISSING]: `Missing required property "{{ property }}".`,
    },
    docs: {
      description: 'Require typography tokens to follow the format.',
      url: docsLink(VALID_TYPOGRAPHY),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue || t.$type !== 'typography') {
        continue;
      }

      validateTypography(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as ObjectNode,
        filename: t.source.filename,
      });

      // Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
      // The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
      function validateTypography(value: unknown, { node, filename }: { node: ObjectNode; filename?: string }) {
        if (value && typeof value === 'object') {
          for (const property of TYPOGRAPHY_REQUIRED_PROPERTIES) {
            if (!(property in value)) {
              report({ messageId: ERROR_MISSING, data: { property }, node, filename });
            }
          }
        } else {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
