import { isTokenMatch } from '@cobalt-ui/utils';
import { parse } from 'culori';
import type { ParsedToken } from '../../../token.js';

export type ColorFormat =
  | 'a98-rgb'
  | 'display-p3'
  | 'hex'
  | 'hsl'
  | 'hsv'
  | 'hwb'
  | 'lab'
  | 'lch'
  | 'oklab'
  | 'oklch'
  | 'p3'
  | 'prophoto-rgb'
  | 'rec2020'
  | 'srgb-linear'
  | 'srgb'
  | 'xyz50'
  | 'xyz65';

export const CULORI_MODE_TO_COLOR_FORMAT: Record<
  'a98' | 'lrgb' | 'rgb' | 'p3' | 'prophoto' | 'xyz50' | 'xyz65',
  ColorFormat
> = {
  a98: 'a98-rgb',
  lrgb: 'srgb-linear',
  p3: 'display-p3',
  prophoto: 'prophoto-rgb',
  rgb: 'srgb',
  xyz50: 'xyz50',
  xyz65: 'xyz65',
};

export interface RuleColorFormatOptions {
  format: ColorFormat;
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

function getFormat(color: string) {
  if (color[0] === '#' && /^#[0-9abcdef]{3,8}/.test(color)) {
    return 'hex';
  }
  const parsed = parse(color);
  if (parsed) {
    return parsed.mode in CULORI_MODE_TO_COLOR_FORMAT ? [parsed.mode] : parsed.mode;
  }
  return undefined;
}

export default function ruleColorFormat(tokens: ParsedToken[], options?: RuleColorFormatOptions): string[] {
  const notices: string[] = [];

  if (!options?.format) {
    return notices;
  }

  for (const t of tokens) {
    // skip ignored tokens
    if (options?.ignore && isTokenMatch(t.id, options.ignore)) {
      continue;
    }

    switch (t.$type) {
      case 'color': {
        const format = getFormat(t.$value);
        if (format !== options.format) {
          notices.push(`Color ${t.id}: in ${format} (expected ${options.format})`);
        }
        break;
      }
      case 'border': {
        const format = getFormat(t.$value.color);
        if (format !== options.format) {
          notices.push(`Border ${t.id}: in ${format} (expected ${options.format})`);
        }
        break;
      }
      case 'gradient': {
        for (let stopI = 0; stopI < t.$value.length; stopI++) {
          const format = getFormat(t.$value[stopI]!.color);
          if (format !== options.format) {
            notices.push(`Gradient ${t.id} (stop ${stopI}): in ${format} (expected ${options.format})`);
          }
        }
        break;
      }
      case 'shadow': {
        for (let shadowI = 0; shadowI < t.$value.length; shadowI++) {
          const format = getFormat(t.$value[shadowI]!.color);
          if (format !== options.format) {
            notices.push(`Shadow ${t.id} (${shadowI}): in ${format} (expected ${options.format})`);
          }
        }
        break;
      }
    }
  }

  return notices;
}
