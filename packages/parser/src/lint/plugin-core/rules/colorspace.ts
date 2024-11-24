import { isTokenMatch, type ColorValueNormalized } from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const COLORSPACE = 'core/colorspace';

export interface RuleColorspaceOptions {
  colorSpace: ColorValueNormalized['colorSpace'];
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

const ERROR_COLOR = 'COLOR';
const ERROR_BORDER = 'BORDER';
const ERROR_GRADIENT = 'GRADIENT';
const ERROR_SHADOW = 'SHADOW';

const rule: LintRule<
  typeof ERROR_COLOR | typeof ERROR_BORDER | typeof ERROR_GRADIENT | typeof ERROR_SHADOW,
  RuleColorspaceOptions
> = {
  meta: {
    messages: {
      [ERROR_COLOR]: 'Color {{ id }} not in colorspace {{ colorSpace }}',
      [ERROR_BORDER]: 'Border {{ id }} not in colorspace {{ colorSpace }}',
      [ERROR_GRADIENT]: 'Gradient {{ id }} not in colorspace {{ colorSpace }}',
      [ERROR_SHADOW]: 'Shadow {{ id }} not in colorspace {{ colorSpace }}',
    },
    docs: {
      description: 'Enforce that all colors are in a specific colorspace.',
      url: docsLink(COLORSPACE),
    },
  },
  defaultOptions: { colorSpace: 'srgb' },
  create({ tokens, options, report }) {
    if (!options.colorSpace) {
      return;
    }

    for (const t of Object.values(tokens)) {
      // skip ignored tokens
      if (options?.ignore && isTokenMatch(t.id, options.ignore)) {
        continue;
      }

      // skip aliases
      if (t.aliasOf) {
        continue;
      }

      switch (t.$type) {
        case 'color': {
          if (t.$value.colorSpace !== options.colorSpace) {
            report({
              messageId: ERROR_COLOR,
              data: { id: t.id, colorSpace: options.colorSpace },
              node: t.source.node,
            });
          }
          break;
        }
        case 'border': {
          if (!t.partialAliasOf?.color && t.$value.color.colorSpace !== options.colorSpace) {
            report({
              messageId: ERROR_BORDER,
              data: { id: t.id, colorSpace: options.colorSpace },
              node: t.source.node,
            });
          }
          break;
        }
        case 'gradient': {
          for (let stopI = 0; stopI < t.$value.length; stopI++) {
            if (!t.partialAliasOf?.[stopI]?.color && t.$value[stopI]!.color.colorSpace !== options.colorSpace) {
              report({
                messageId: ERROR_GRADIENT,
                data: { id: t.id, colorSpace: options.colorSpace },
                node: t.source.node,
              });
            }
          }
          break;
        }
        case 'shadow': {
          for (let shadowI = 0; shadowI < t.$value.length; shadowI++) {
            if (!t.partialAliasOf?.[shadowI]?.color && t.$value[shadowI]!.color.colorSpace !== options.colorSpace) {
              report({
                messageId: ERROR_SHADOW,
                data: { id: t.id, colorSpace: options.colorSpace },
                node: t.source.node,
              });
            }
          }
          break;
        }
      }
    }
  },
};

export default rule;
