import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';

import type { LintRule, LintRuleContext } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_BOOLEAN = 'core/valid-boolean';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR, Record<string, never>> = {
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
        filename: t.source.filename,
        node: getObjMember(t.source.node, '$value'),
        report,
      });
    }
  },
};

function validateBoolean(
  value: unknown,
  {
    node,
    filename,
    report,
  }: { node?: momoa.AnyNode; filename?: string; report: LintRuleContext<typeof ERROR>['report'] },
) {
  if (typeof value !== 'boolean') {
    report({ messageId: ERROR, node, filename });
  }
}

export default rule;
