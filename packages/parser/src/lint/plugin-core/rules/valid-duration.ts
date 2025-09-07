import type { AnyNode, ObjectNode } from '@humanwhocodes/momoa';
import { isAlias } from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_DURATION = 'core/valid-duration';

const ERROR_FORMAT = 'ERROR_FORMAT';
const ERROR_LEGACY = 'ERROR_LEGACY';
const ERROR_UNIT = 'ERROR_UNIT';
const ERROR_VALUE = 'ERROR_VALUE';

export interface RuleValidDimension {
  /**
   * Allow the use of unknown "unit" values
   * @default false
   */
  legacyFormat?: boolean;
  /**
   * Allow the use of unknown "unit" values
   * @default false
   */
  unknownUnits?: boolean;
}

const rule: LintRule<
  typeof ERROR_FORMAT | typeof ERROR_LEGACY | typeof ERROR_UNIT | typeof ERROR_VALUE,
  RuleValidDimension
> = {
  meta: {
    messages: {
      [ERROR_FORMAT]: 'Migrate to the new object format: { "value": 2, "unit": "ms" }.',
      [ERROR_LEGACY]: 'Migrate to the new object format: { "value": 10, "unit": "px" }.',
      [ERROR_UNIT]: 'Unknown unit {{ unit }}. Expected "ms" or "s".',
      [ERROR_VALUE]: 'Expected number, received {{ value }}.',
    },
    docs: {
      description: 'Require duration tokens to follow the format',
      url: docsLink(VALID_DURATION),
    },
  },
  defaultOptions: {
    legacyFormat: false,
    unknownUnits: false,
  },
  create({ tokens, options, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue) {
        continue;
      }

      switch (t.$type) {
        case 'duration': {
          validateDuration(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value')!,
            filename: t.source.filename,
          });
          break;
        }
        case 'transition': {
          if (typeof t.originalValue.$value === 'object') {
            const $valueNode = getObjMember(t.source.node, '$value');
            for (const property of ['duration', 'delay'] as const) {
              if (t.originalValue.$value[property] && !isAlias(t.originalValue.$value[property] as string)) {
                validateDuration(t.originalValue.$value[property], {
                  node: getObjMember($valueNode as ObjectNode, property)!,
                  filename: t.source.filename,
                });
              }
            }
          }
          break;
        }
      }

      function validateDuration(value: unknown, { node, filename }: { node: AnyNode; filename?: string }) {
        if (value && typeof value === 'object') {
          const { unit, value: numValue } = value as Record<string, any>;
          if (!('value' in value || 'unit' in value)) {
            report({ messageId: ERROR_FORMAT, data: { value }, node, filename });
            return;
          }
          if (!options.unknownUnits && !['ms', 's'].includes(unit)) {
            report({
              messageId: ERROR_UNIT,
              data: { unit },
              node: getObjMember(node as ObjectNode, 'unit') ?? node,
              filename,
            });
          }
          if (!Number.isFinite(numValue)) {
            report({
              messageId: ERROR_VALUE,
              data: { value },
              node: getObjMember(node as ObjectNode, 'value') ?? node,
              filename,
            });
          }
        } else if (typeof value === 'string' && !options.legacyFormat) {
          report({ messageId: ERROR_FORMAT, node, filename });
        } else {
          report({ messageId: ERROR_FORMAT, data: { value }, node, filename });
        }
      }
    }
  },
};

export default rule;
