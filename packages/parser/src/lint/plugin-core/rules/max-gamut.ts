import { getTokenMatcher, tokenToColor } from '@terrazzo/token-tools';
import { inGamut } from 'colorjs.io/fn';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const MAX_GAMUT = 'core/max-gamut';

export interface RuleMaxGamutOptions {
  /** Gamut to constrain color tokens to. */
  gamut: 'srgb' | 'p3' | 'rec2020';
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

const ERROR_COLOR = 'COLOR';
const ERROR_BORDER = 'BORDER';
const ERROR_GRADIENT = 'GRADIENT';
const ERROR_SHADOW = 'SHADOW';

const rule: LintRule<
  typeof ERROR_COLOR | typeof ERROR_BORDER | typeof ERROR_GRADIENT | typeof ERROR_SHADOW,
  RuleMaxGamutOptions
> = {
  meta: {
    messages: {
      [ERROR_COLOR]: 'Color {{ id }} is outside {{ gamut }} gamut',
      [ERROR_BORDER]: 'Border {{ id }} is outside {{ gamut }} gamut',
      [ERROR_GRADIENT]: 'Gradient {{ id }} is outside {{ gamut }} gamut',
      [ERROR_SHADOW]: 'Shadow {{ id }} is outside {{ gamut }} gamut',
    },
    docs: {
      description: 'Enforce colors are within the specified gamut.',
      url: docsLink(MAX_GAMUT),
    },
  },
  defaultOptions: { gamut: 'rec2020' },
  create({ tokens, options, report }) {
    if (!options?.gamut) {
      return;
    }
    if (options.gamut !== 'srgb' && options.gamut !== 'p3' && options.gamut !== 'rec2020') {
      throw new Error(`Unknown gamut "${options.gamut}". Options are "srgb", "p3", or "rec2020"`);
    }

    const shouldIgnore = options.ignore ? getTokenMatcher(options.ignore) : null;

    for (const t of Object.values(tokens)) {
      // skip ignored tokens
      if (shouldIgnore?.(t.id)) {
        continue;
      }

      // skip aliases
      if (t.aliasOf) {
        continue;
      }

      switch (t.$type) {
        case 'color': {
          if (!inGamut(tokenToColor(t.$value), options.gamut)) {
            report({
              messageId: ERROR_COLOR,
              data: { id: t.id, gamut: options.gamut },
              node: t.source.node,
              filename: t.source.filename,
            });
          }
          break;
        }
        case 'border': {
          if (!t.partialAliasOf?.color && !inGamut(tokenToColor(t.$value.color), options.gamut)) {
            report({
              messageId: ERROR_BORDER,
              data: { id: t.id, gamut: options.gamut },
              node: t.source.node,
              filename: t.source.filename,
            });
          }
          break;
        }
        case 'gradient': {
          for (let stopI = 0; stopI < t.$value.length; stopI++) {
            if (!t.partialAliasOf?.[stopI]?.color && !inGamut(tokenToColor(t.$value[stopI]!.color), options.gamut)) {
              report({
                messageId: ERROR_GRADIENT,
                data: { id: t.id, gamut: options.gamut },
                node: t.source.node,
                filename: t.source.filename,
              });
            }
          }
          break;
        }
        case 'shadow': {
          for (let shadowI = 0; shadowI < t.$value.length; shadowI++) {
            if (
              !t.partialAliasOf?.[shadowI]?.color &&
              !inGamut(tokenToColor(t.$value[shadowI]!.color), options.gamut)
            ) {
              report({
                messageId: ERROR_SHADOW,
                data: { id: t.id, gamut: options.gamut },
                node: t.source.node,
                filename: t.source.filename,
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
