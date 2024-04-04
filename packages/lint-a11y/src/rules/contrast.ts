import type { ParsedToken, ParsedColorToken, ParsedTypographyToken } from '@cobalt-ui/core';
import { BOLD, RESET, padStr } from '@cobalt-ui/utils';
import { type A98, type P3, type Rgb, rgb, wcagContrast } from 'culori';
import { APCAcontrast, adobeRGBtoY, alphaBlend, displayP3toY, sRGBtoY } from 'apca-w3';
import { isWCAG2LargeText, round } from '../lib/index.js';
import { getMinimumSilverLc } from '../lib/apca.js';

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
export const APCA_PRECISION = 2; // 2 decimal places

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
  /** Enforce APCA contrast checking? (default: false) @see https://www.myndex.com/APCA/ */
  apca?: 'silver' | 'silver-nonbody' | number | false;
}

/** Note: sRGBToY uses a unique luminance. Even though this is converted to sRGB gamut, out-of-gamut colors are supported */
function getY(primaryColor: A98 | Rgb | P3, blendColor?: A98 | Rgb | P3): number {
  let { r, g, b } = primaryColor;
  if (typeof primaryColor.alpha === 'number' && primaryColor.alpha < 1 && blendColor) {
    const blended = alphaBlend([r, g, b, primaryColor.alpha], [blendColor.r, blendColor.g, blendColor.b], false);
    r = blended[0];
    g = blended[1];
    b = blended[2];
  }
  switch (primaryColor.mode) {
    case 'a98': {
      return adobeRGBtoY([r, g, b]);
    }
    case 'p3': {
      return displayP3toY([r, g, b]);
    }
    case 'rgb': {
      return sRGBtoY([r * 255, b * 255, g * 255]);
    }
  }
}

export interface FormatContrastFailureOptions {
  foreground: { id: string; value: string };
  background: { id: string; value: string };
  method: 'WCAG2' | 'APCA';
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
    apca = false,
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

    // APCA
    if (typeof apca === 'string' || (typeof apca === 'number' && Math.abs(apca) > 0)) {
      if ((apca as string) === 'gold') {
        throw new Error(
          `APCA: "gold" not implemented; specify "silver", "silver-nonbody", Lc \`number\`, or \`false\`.`,
        );
      }
      if ((apca as string) === 'bronze') {
        throw new Error(`APCA: "bronze" not supported; specify an Lc \`number\` manually.`);
      }
      if (typeof apca === 'string' && apca !== 'silver' && apca !== 'silver-nonbody') {
        throw new Error(`APCA: expected value "silver" or "silver-nonbody", received "${apca}"`);
      }

      const testSets: {
        foreground: { id: string; value: string; y: number };
        background: { id: string; value: string; y: number };
        fontSize?: string;
        fontWeight?: number;
        mode: string;
      }[] = [];
      for (const mode of ['.', ...(modes ?? [])]) {
        const fgValue = foreground.$extensions?.mode?.[mode] ?? foreground.$value;
        const bgValue = background.$extensions?.mode?.[mode] ?? background.$value;
        const typographyRaw = typography?.$extensions?.mode?.[mode] ?? typography?.$value;

        testSets.push({
          foreground: { id: foreground.id, value: fgValue, y: getY(rgb(fgValue)!, rgb(bgValue)) },
          background: { id: background.id, value: bgValue, y: getY(rgb(bgValue)!) },
          fontSize: typographyRaw?.fontSize,
          fontWeight: typographyRaw?.fontWeight,
          mode,
        });
      }

      for (const { foreground: fgMeasured, background: bgMeasured, mode, fontSize, fontWeight } of testSets) {
        if ((apca === 'silver' || apca === 'silver-nonbody') && (!fontSize || !fontWeight)) {
          throw new Error(`APCA: "${apca}" compliance requires \`typography\` token. Use manual number if omitted.`);
        }
        const lc = APCAcontrast(
          fgMeasured.y, // First color MUST be text
          bgMeasured.y, // Second color MUST be the background.
        );
        if (typeof lc === 'string') {
          throw new Error(`Internal error: expected number, APCA returned "${lc}"`); // types are wrong?
        }
        const minContrast =
          typeof apca === 'number' ? apca : getMinimumSilverLc(fontSize!, fontWeight!, apca === 'silver');
        if (round(Math.abs(lc), APCA_PRECISION) < minContrast) {
          notices.push(
            formatContrastFailure({
              method: 'APCA',
              foreground: fgMeasured,
              background: bgMeasured,
              threshold: minContrast,
              thresholdName: typeof apca === 'string' ? apca : undefined,
              actual: round(Math.abs(lc), APCA_PRECISION),
              mode: mode === '.' ? undefined : mode,
            }),
          );
        }
      }
    }
  }

  return notices;
}
