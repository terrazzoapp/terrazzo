import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import {
  type BorderValue,
  COLORSPACE,
  type ColorSpaceDefinition,
  type ColorValueNormalized,
  type GradientStopNormalized,
  type GradientValueNormalized,
  isAlias,
  parseColor,
  type ShadowValue,
} from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_COLOR = 'core/valid-color';

const ERROR_ALPHA = 'ERROR_ALPHA';
const ERROR_INVALID_COLOR = 'ERROR_INVALID_COLOR';
const ERROR_INVALID_COLOR_SPACE = 'ERROR_INVALID_COLOR_SPACE';
const ERROR_INVALID_COMPONENT_LENGTH = 'ERROR_INVALID_COMPONENT_LENGTH';
const ERROR_INVALID_HEX8 = 'ERROR_INVALID_HEX8';
const ERROR_INVALID_PROP = 'ERROR_INVALID_PROP';
const ERROR_MISSING_COMPONENTS = 'ERROR_MISSING_COMPONENTS';
const ERROR_OBJ_FORMAT = 'ERROR_OBJ_FORMAT';
const ERROR_OUT_OF_RANGE = 'ERROR_OUT_OF_RANGE';

export interface RuleValidColorOptions {
  /**
   * Allow the legacy format of only a string sRGB hex code
   * @default false
   */
  legacyFormat?: boolean;
  /**
   * Allow colors to be defined out of the expected ranges.
   * @default false
   */
  ignoreRanges?: boolean;
}

const rule: LintRule<
  | typeof ERROR_ALPHA
  | typeof ERROR_INVALID_COLOR
  | typeof ERROR_INVALID_COLOR_SPACE
  | typeof ERROR_INVALID_COMPONENT_LENGTH
  | typeof ERROR_INVALID_HEX8
  | typeof ERROR_INVALID_PROP
  | typeof ERROR_MISSING_COMPONENTS
  | typeof ERROR_OBJ_FORMAT
  | typeof ERROR_OUT_OF_RANGE,
  RuleValidColorOptions
> = {
  meta: {
    messages: {
      [ERROR_ALPHA]: `Alpha {{ alpha }} not in range 0 – 1.`,
      [ERROR_INVALID_COLOR_SPACE]: `Invalid color space: {{ colorSpace }}. Expected ${new Intl.ListFormat(undefined, { type: 'disjunction' }).format(Object.keys(COLORSPACE))}`,
      [ERROR_INVALID_COLOR]: `Could not parse color {{ color }}.`,
      [ERROR_INVALID_COMPONENT_LENGTH]: 'Expected {{ expected }} components, received {{ got }}.',
      [ERROR_INVALID_HEX8]: `Hex value can’t be semi-transparent.`,
      [ERROR_INVALID_PROP]: `Unknown property {{ key }}.`,
      [ERROR_MISSING_COMPONENTS]: 'Expected components to be array of numbers, received {{ got }}.',
      [ERROR_OBJ_FORMAT]:
        'Migrate to the new object format, e.g. "#ff0000" → { "colorSpace": "srgb", "components": [1, 0, 0] } }',
      [ERROR_OUT_OF_RANGE]: `Invalid range for color space {{ colorSpace }}. Expected {{ range }}.`,
    },
    docs: {
      description: 'Require color tokens to follow the format.',
      url: docsLink(VALID_COLOR),
    },
  },
  defaultOptions: {
    legacyFormat: false,
    ignoreRanges: false,
  },
  create({ tokens, options, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue) {
        continue;
      }

      switch (t.$type) {
        case 'color': {
          validateColor(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value'),
            filename: t.source.filename,
          });
          break;
        }
        case 'border': {
          if ((t.originalValue.$value as any).color && !isAlias((t.originalValue.$value as any).color)) {
            validateColor((t.originalValue.$value as BorderValue).color, {
              node: getObjMember(getObjMember(t.source.node, '$value') as momoa.ObjectNode, 'color'),
              filename: t.source.filename,
            });
          }
          break;
        }
        case 'gradient': {
          const $valueNode = getObjMember(t.source.node, '$value') as momoa.ArrayNode;
          for (let i = 0; i < (t.originalValue.$value as GradientValueNormalized).length; i++) {
            const stop = t.originalValue.$value[i] as GradientStopNormalized;
            if (!stop.color || isAlias(stop.color as any)) {
              continue;
            }
            validateColor(stop.color, {
              node: getObjMember($valueNode.elements[i]!.value as momoa.ObjectNode, 'color'),
              filename: t.source.filename,
            });
          }
          break;
        }
        case 'shadow': {
          const $value = (
            Array.isArray(t.originalValue.$value) ? t.originalValue.$value : [t.originalValue.$value]
          ) as ShadowValue[];
          const $valueNode = getObjMember(t.source.node, '$value') as momoa.ObjectNode | momoa.ArrayNode;
          for (let i = 0; i < $value.length; i++) {
            const layer = $value[i]!;
            if (!layer.color || isAlias(layer.color as any)) {
              continue;
            }
            validateColor(layer.color, {
              node:
                $valueNode.type === 'Object'
                  ? getObjMember($valueNode, 'color')
                  : getObjMember($valueNode.elements[i]!.value as momoa.ObjectNode, 'color'),
              filename: t.source.filename,
            });
          }
          break;
        }
      }

      function validateColor(value: unknown, { node, filename }: { node?: momoa.AnyNode; filename?: string }) {
        if (!value) {
          report({ messageId: ERROR_INVALID_COLOR, data: { color: JSON.stringify(value) }, node, filename });
        } else if (typeof value === 'object') {
          for (const key of Object.keys(value)) {
            if (!['colorSpace', 'components', 'channels' /* TODO: remove */, 'hex', 'alpha'].includes(key)) {
              report({
                messageId: ERROR_INVALID_PROP,
                data: { key: JSON.stringify(key) },
                node: getObjMember(node as momoa.ObjectNode, key) ?? node,
                filename,
              });
            }
          }

          // Color space
          const colorSpace =
            'colorSpace' in value && typeof value.colorSpace === 'string' ? value.colorSpace : undefined;
          const csData = (COLORSPACE as Record<string, ColorSpaceDefinition>)[colorSpace!] || undefined;
          if (!('colorSpace' in value) || !csData) {
            report({
              messageId: ERROR_INVALID_COLOR_SPACE,
              data: { colorSpace },
              node: getObjMember(node as momoa.ObjectNode, 'colorSpace') ?? node,
              filename,
            });
            return;
          }

          // Component ranges
          const components = 'components' in value ? value.components : undefined;
          if (Array.isArray(components)) {
            if (csData?.ranges && components?.length === csData.ranges.length) {
              for (let i = 0; i < components.length; i++) {
                if (
                  !Number.isFinite(components[i]) ||
                  components[i]! < csData.ranges[i]![0] ||
                  components[i]! > csData.ranges[i]![1]
                ) {
                  // special case for any hue-based components: allow null
                  if (
                    !(colorSpace === 'hsl' && components[0]! === null) &&
                    !(colorSpace === 'hwb' && components[0]! === null) &&
                    !(colorSpace === 'lch' && components[2]! === null) &&
                    !(colorSpace === 'oklch' && components[2]! === null)
                  ) {
                    report({
                      messageId: ERROR_OUT_OF_RANGE,
                      data: { colorSpace, range: `[${csData.ranges.map((r) => `${r[0]}–${r[1]}`).join(', ')}]` },
                      node: getObjMember(node as momoa.ObjectNode, 'components') ?? node,
                      filename,
                    });
                  }
                }
              }
            } else {
              report({
                messageId: ERROR_INVALID_COMPONENT_LENGTH,
                data: { expected: csData?.ranges.length, got: (components as number[] | undefined)?.length ?? 0 },
                node: getObjMember(node as momoa.ObjectNode, 'components') ?? node,
                filename,
              });
            }
          } else {
            report({
              messageId: ERROR_MISSING_COMPONENTS,
              data: { got: JSON.stringify(components) },
              node: getObjMember(node as momoa.ObjectNode, 'components') ?? node,
              filename,
            });
          }

          // Alpha
          const alpha = 'alpha' in value ? value.alpha : undefined;
          if (alpha !== undefined && (typeof alpha !== 'number' || alpha < 0 || alpha > 1)) {
            report({
              messageId: ERROR_ALPHA,
              data: { alpha },
              node: getObjMember(node as momoa.ObjectNode, 'alpha') ?? node,
              filename,
            });
          }

          // Hex
          const hex = 'hex' in value ? value.hex : undefined;
          if (hex) {
            let color: ColorValueNormalized;
            try {
              color = parseColor(hex as string);
            } catch {
              report({
                messageId: ERROR_INVALID_COLOR,
                data: { color: hex },
                node: getObjMember(node as momoa.ObjectNode, 'hex') ?? node,
                filename,
              });
              return;
            }
            // since we’re only parsing hex, this should always have alpha: 1
            if (color.alpha !== 1) {
              report({
                messageId: ERROR_INVALID_HEX8,
                data: { color: hex },
                node: getObjMember(node as momoa.ObjectNode, 'hex') ?? node,
                filename,
              });
            }
          }
        } else if (typeof value === 'string') {
          if (isAlias(value)) {
            return;
          }
          if (!options.legacyFormat) {
            report({ messageId: ERROR_OBJ_FORMAT, data: { color: JSON.stringify(value) }, node, filename });
          } else {
            // Legacy format
            try {
              parseColor(value as string);
            } catch {
              report({ messageId: ERROR_INVALID_COLOR, data: { color: JSON.stringify(value) }, node, filename });
            }
          }
        } else {
          report({ messageId: ERROR_INVALID_COLOR, node, filename });
        }
      }
    }
  },
};

export default rule;
