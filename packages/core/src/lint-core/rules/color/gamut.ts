import { type Color, clampChroma, parse } from 'culori';
import { type ParsedToken } from '../../../token.js';

export interface RuleColorGamutOptions {
  /** Gamut to constrain color tokens to */
  gamut: 'srgb' | 'p3' | 'rec2020';
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

const TOLERANCE = 0.000001; // threshold above which it counts as an error (take rounding errors into account)

/** is a Culori-parseable color within the specified gamut? */
function isWithinGamut(color: string, gamut: RuleColorGamutOptions['gamut']): boolean {
  const parsed = parse(color);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (Math.abs((a as any)[k] - (b as any)[k]) > tolerance) {
      return false;
    }
  }
  return true;
}

export default function ruleColorGamut(tokens: ParsedToken[], options?: RuleColorGamutOptions): string[] {
  const notices: string[] = [];

  if (!options?.gamut) {
    return notices;
  }
  if (options.gamut !== 'srgb' && options.gamut !== 'p3' && options.gamut !== 'rec2020') {
    throw new Error(`Unknown gamut "${options.gamut}". Options are "srgb", "p3", or "rec2020"`);
  }

  for (const t of tokens) {
    switch (t.$type) {
      case 'color': {
        if (!isWithinGamut(t.$value, options.gamut)) {
          notices.push(`Color ${t.id} outside ${options.gamut} gamut`);
        }
        break;
      }
      case 'gradient': {
        for (let stopI = 0; stopI < t.$value.length; stopI++) {
          if (!isWithinGamut(t.$value[stopI]!.color, options.gamut)) {
            notices.push(`Gradient ${t.id} (stop ${stopI}) outside ${options.gamut} gamut`);
          }
        }
        break;
      }
      case 'border': {
        if (!isWithinGamut(t.$value.color, options.gamut)) {
          notices.push(`Border ${t.id} outside ${options.gamut} gamut`);
        }
        break;
      }
      case 'shadow': {
        for (let shadowI = 0; shadowI < t.$value.length; shadowI++) {
          if (!isWithinGamut(t.$value[shadowI]!.color, options.gamut)) {
            notices.push(`Shadow ${t.id} (${shadowI}) outside ${options.gamut} gamut`);
          }
        }
        break;
      }
    }
  }

  return notices;
}
