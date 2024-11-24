import type { ParsedToken, ParsedColorToken, ParsedTypographyToken } from '@cobalt-ui/core';
import { BOLD, RESET, padStr } from '@cobalt-ui/utils';
import { wcagContrast } from 'culori';
import { isWCAG2LargeText, round } from '../lib/index.js';

export const WCAG2_MIN_CONTRAST = {
  AA: {
    default: 4.5,
    large: 3,
  },
  AAA: {
    default: 7,
    large: 4.5,
  },
};

export const WCAG2_PRECISION = 2; // 2 decimal places

export interface RuleContrastOptions {
  checks: RuleContrastCheck[];
}

export interface RuleContrastCheck {
  tokens: {
    foreground: string;
    background: string;
    typography?: string;
    modes?: string[];
  };
  /** Enforce WCAG 2 contrast checking? (default: 'AA') */
  wcag2?: 'AA' | 'AAA' | number | false;
}

export interface FormatContrastFailureOptions {
  foreground: { id: string; value: string };
  background: { id: string; value: string };
  method: 'WCAG2';
  threshold: number | string;
  thresholdName?: string;
  actual: number | string;
  mode?: string;
}

export function formatContrastFailure({
  foreground,
  background,
  method,
  threshold,
  thresholdName,
  actual,
  mode,
}: FormatContrastFailureOptions): string {
  const longerID = Math.max(foreground.id.length, background.id.length);
  const longerValue = Math.max(foreground.value.length, background.value.length);
  return `[${method}] Failed contrast${thresholdName ? ` (${thresholdName})` : ''}
      Foreground: ${padStr(foreground.id, longerID)}  →  ${padStr(foreground.value, longerValue)}${
        mode && mode !== '.' ? ` (mode: ${mode})` : ''
      }
      Background: ${padStr(background.id, longerID)}  →  ${padStr(background.value, longerValue)}${
        mode && mode !== '.' ? ` (mode: ${mode})` : ''
      }

      Wanted: ${threshold} / Actual: ${BOLD}${actual}${RESET}`;
}

export default function evaluateContrast(tokens: ParsedToken[], options: RuleContrastOptions): string[] {
  const notices: string[] = [];

  if (!Array.isArray(options.checks)) {
    throw new Error(`"checks" must be an array`);
  }

  for (const {
    wcag2 = 'AA',
    tokens: { foreground: foregroundID, background: backgroundID, typography: typographyID, modes },
  } of options?.checks ?? []) {
    // resolve tokens
    const foreground = tokens.find((token) => token.id === foregroundID) as ParsedColorToken | undefined;
    if (!foreground) {
      throw new Error(`Couldn’t find foreground color "${foregroundID}"`);
    }
    const background = tokens.find((token) => token.id === backgroundID) as ParsedColorToken | undefined;
    if (!background) {
      throw new Error(`Couldn’t find background color "${backgroundID}"`);
    }
    const typography = typographyID
      ? (tokens.find((token) => token.id === typographyID) as ParsedTypographyToken)
      : undefined;
    if (typographyID && !typography) {
      throw new Error(`Couldn’t find typography token "${typographyID}"`);
    }

    // WCAG 2
    if (wcag2 !== false || typeof wcag2 === 'string' || (typeof wcag2 === 'number' && wcag2 > 0)) {
      const colorPairs: {
        foreground: { id: string; value: string };
        background: { id: string; value: string };
        mode: string;
      }[] = [
        {
          foreground: { id: foreground.id, value: foreground.$value },
          background: { id: foreground.id, value: background.$value },
          mode: '.',
        },
      ];
      if (modes?.length) {
        for (const mode of modes) {
          if (!foreground.$extensions?.mode?.[mode]) {
            throw new Error(`foreground ${foregroundID} doesn’t have mode "${mode}"`);
          }
          if (!background.$extensions?.mode?.[mode]) {
            throw new Error(`foreground ${backgroundID} doesn’t have mode "${mode}"`);
          }
          colorPairs.push({
            foreground: { id: foreground.id, value: foreground.$extensions.mode[mode]! },
            background: { id: background.id, value: background.$extensions.mode[mode]! },
            mode,
          });
        }
      }
      for (const { foreground: fgMeasured, background: bgMeasured, mode } of colorPairs) {
        const isLargeText =
          typography?.$value.fontSize && typography?.$value.fontWeight
            ? isWCAG2LargeText(Number.parseFloat(typography.$value.fontSize), typography.$value.fontWeight)
            : false;
        const minContrast =
          typeof wcag2 === 'string' ? WCAG2_MIN_CONTRAST[wcag2][isLargeText ? 'large' : 'default'] : wcag2;
        const defaultResult = wcagContrast(fgMeasured.value, bgMeasured.value);
        if (round(defaultResult, WCAG2_PRECISION) < minContrast) {
          notices.push(
            formatContrastFailure({
              method: 'WCAG2',
              foreground: fgMeasured,
              background: bgMeasured,
              threshold: `${minContrast}:1`,
              thresholdName: typeof wcag2 === 'string' ? wcag2 : '',
              actual: `${round(defaultResult, WCAG2_PRECISION)}:1`,
              mode: mode === '.' ? undefined : mode,
            }),
          );
        }
      }
    }
  }

  return notices;
}
