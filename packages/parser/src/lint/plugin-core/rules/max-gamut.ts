import { type ColorValueNormalized, isTokenMatch, tokenToCulori } from '@terrazzo/token-tools';
import { type Color, clampChroma } from 'culori';
import type { LintRule } from '../../../types.js';

export const MAX_GAMUT = 'core/max-gamut';

export interface RuleMaxGamutOptions {
  /** Gamut to constrain color tokens to. */
  gamut: 'srgb' | 'p3' | 'rec2020';
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

const TOLERANCE = 0.000001; // threshold above which it counts as an error (take rounding errors into account)

/** is a Culori-parseable color within the specified gamut? */
function isWithinGamut(color: ColorValueNormalized, gamut: RuleMaxGamutOptions['gamut']): boolean {
  const parsed = tokenToCulori(color);
  if (!parsed) {
    return false;
  }
  if (['rgb', 'hsl', 'hsv', 'hwb'].includes(parsed.mode)) {
    return true;
  }
  const clamped = clampChroma(parsed, parsed.mode, gamut === 'srgb' ? 'rgb' : gamut);
  return isWithinThreshold(parsed, clamped);
}

/** is Color A close enough to Color B? */
function isWithinThreshold(a: Color, b: Color, tolerance = TOLERANCE) {
  for (const k in a) {
    if (k === 'mode' || k === 'alpha') {
      continue;
    }
    if (!(k in b)) {
      throw new Error(`Can’t compare ${a.mode} to ${b.mode}`);
    }
    if (Math.abs((a as any)[k] - (b as any)[k]) > tolerance) {
      return false;
    }
  }
  return true;
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
  },
  defaultOptions: { gamut: 'rec2020' },
  create({ tokens, options, report }) {
    if (!options?.gamut) {
      return;
    }
    if (options.gamut !== 'srgb' && options.gamut !== 'p3' && options.gamut !== 'rec2020') {
      throw new Error(`Unknown gamut "${options.gamut}". Options are "srgb", "p3", or "rec2020"`);
    }

    for (const t of Object.values(tokens)) {
      // skip ignored tokens
      if (options.ignore && isTokenMatch(t.id, options.ignore)) {
        continue;
      }

      // skip aliases
      if (t.aliasOf) {
        continue;
      }

      switch (t.$type) {
        case 'color': {
          if (!isWithinGamut(t.$value, options.gamut)) {
            report({ messageId: ERROR_COLOR, data: { id: t.id, gamut: options.gamut }, node: t.source.node });
          }
          break;
        }
        case 'border': {
          if (!t.partialAliasOf?.color && !isWithinGamut(t.$value.color, options.gamut)) {
            report({ messageId: ERROR_BORDER, data: { id: t.id, gamut: options.gamut }, node: t.source.node });
          }
          break;
        }
        case 'gradient': {
          for (let stopI = 0; stopI < t.$value.length; stopI++) {
            if (!t.partialAliasOf?.[stopI]?.color && !isWithinGamut(t.$value[stopI]!.color, options.gamut)) {
              report({ messageId: ERROR_GRADIENT, data: { id: t.id, gamut: options.gamut }, node: t.source.node });
            }
          }
          break;
        }
        case 'shadow': {
          for (let shadowI = 0; shadowI < t.$value.length; shadowI++) {
            if (!t.partialAliasOf?.[shadowI]?.color && !isWithinGamut(t.$value[shadowI]!.color, options.gamut)) {
              report({ messageId: ERROR_SHADOW, data: { id: t.id, gamut: options.gamut }, node: t.source.node });
            }
          }
          break;
        }
      }
    }
  },
};

export default rule;
