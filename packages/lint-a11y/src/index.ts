import { type Plugin, type ParsedToken, type LintNotice, type ParsedColorToken, type ParsedTypographyToken } from '@cobalt-ui/core';
import { type A98, type P3, type Rgb, rgb, wcagContrast } from 'culori';
import { APCAcontrast, adobeRGBtoY, alphaBlend, displayP3toY, sRGBtoY } from 'apca-w3';
import { isWCAG2LargeText, round } from './lib.js';
import { getMinimumSilverLc } from './apca.js';

export const RULES = {
  contrast: 'a11y/contrast',
};

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

function evaluateContrast(tokens: ParsedToken[], options: RuleContrastOptions): LintNotice[] {
  const notices: LintNotice[] = [];
  if (!Array.isArray(options.checks)) {
    throw new Error(`"checks" must be an array`);
  }
  for (const {
    wcag2 = 'AA',
    apca = false,
    tokens: { foreground: foregroundID, background: backgroundID, typography: typographyID, modes },
  } of (options ?? {}).checks) {
    // resolve tokens
    const foreground = tokens.find((token) => token.id === foregroundID) as ParsedColorToken | undefined;
    if (!foreground) {
      throw new Error(`Couldn’t find foreground color "${foregroundID}"`);
    }
    const background = tokens.find((token) => token.id === backgroundID) as ParsedColorToken | undefined;
    if (!background) {
      throw new Error(`Couldn’t find background color "${backgroundID}"`);
    }
    const typography = typographyID ? (tokens.find((token) => token.id === typographyID) as ParsedTypographyToken) : undefined;
    if (typographyID && !typography) {
      throw new Error(`Couldn’t find typography token "${typographyID}"`);
    }

    // WCAG 2
    if (wcag2 !== false || typeof wcag2 === 'string' || (typeof wcag2 === 'number' && wcag2 > 0)) {
      const colorPairs: { fg: typeof foreground.$value; bg: typeof background.$value; mode: string }[] = [{ fg: foreground.$value, bg: background.$value, mode: '.' }];
      if (modes?.length) {
        for (const mode of modes) {
          if (!foreground.$extensions?.mode?.[mode]) {
            throw new Error(`foreground ${foregroundID} doesn’t have mode "${mode}"`);
          }
          if (!background.$extensions?.mode?.[mode]) {
            throw new Error(`foreground ${backgroundID} doesn’t have mode "${mode}"`);
          }
          colorPairs.push({ fg: foreground.$extensions.mode[mode]!, bg: background.$extensions.mode[mode]!, mode });
        }
      }
      for (const { fg, bg, mode } of colorPairs) {
        const isLargeText =
          typography?.$value.fontSize && typography?.$value.fontWeight ? isWCAG2LargeText(parseFloat(typography.$value.fontSize), typography.$value.fontWeight) : false;
        const minContrast = typeof wcag2 === 'string' ? WCAG2_MIN_CONTRAST[wcag2][isLargeText ? 'large' : 'default'] : wcag2;
        const defaultResult = wcagContrast(fg, bg);
        if (round(defaultResult, WCAG2_PRECISION) < minContrast) {
          const modeText = mode === '.' ? '' : ` (mode: ${mode})`;
          const levelText = typeof wcag2 === 'string' ? ` ("${wcag2}")` : '';
          notices.push({
            id: RULES.contrast,
            message: `WCAG 2: Token pair ${fg}, ${bg}${modeText} failed contrast. Expected ${minContrast}:1${levelText}, received ${round(defaultResult, WCAG2_PRECISION)}:1`,
          });
        }
      }
    }

    // APCA
    if (typeof apca === 'string' || (typeof apca === 'number' && Math.abs(apca) > 0)) {
      if ((apca as string) === 'gold') {
        throw new Error(`APCA: "gold" not implemented; specify "silver", "silver-nonbody", Lc \`number\`, or \`false\`.`);
      }
      if ((apca as string) === 'bronze') {
        throw new Error(`APCA: "bronze" not supported; specify an Lc \`number\` manually.`);
      }
      if (typeof apca === 'string' && apca !== 'silver' && apca !== 'silver-nonbody') {
        throw new Error(`APCA: expected value "silver" or "silver-nonbody", received "${apca}"`);
      }

      const testSets: {
        fgRaw: typeof foreground.$value;
        bgRaw: typeof background.$value;
        fgY: number;
        bgY: number;
        fontSize?: string;
        fontWeight?: number;
        mode: string;
      }[] = [];
      for (const mode of ['.', ...(modes ?? [])]) {
        const fgRaw = foreground.$extensions?.mode?.[mode] ?? foreground.$value;
        const bgRaw = background.$extensions?.mode?.[mode] ?? background.$value;
        const typographyRaw = typography?.$extensions?.mode?.[mode] ?? typography?.$value;

        testSets.push({
          fgRaw,
          fgY: getY(rgb(fgRaw)!, rgb(bgRaw)),
          bgRaw,
          bgY: getY(rgb(bgRaw)!),
          fontSize: typographyRaw?.fontSize,
          fontWeight: typographyRaw?.fontWeight,
          mode,
        });
      }

      for (const { fgY, fgRaw, bgY, bgRaw, mode, fontSize, fontWeight } of testSets) {
        if ((apca === 'silver' || apca === 'silver-nonbody') && (!fontSize || !fontWeight)) {
          throw new Error(`APCA: "${apca}" compliance requires \`typography\` token. Use manual number if omitted.`);
        }
        const lc = APCAcontrast(
          fgY, // First color MUST be text
          bgY, // Second color MUST be the background.
        );
        if (typeof lc === 'string') {
          throw new Error(`Internal error: expected number, APCA returned "${lc}"`); // types are wrong?
        }
        const minContrast = typeof apca === 'number' ? apca : getMinimumSilverLc(fontSize!, fontWeight!, apca === 'silver');
        if (round(Math.abs(lc), APCA_PRECISION) < minContrast) {
          const modeText = mode === '.' ? '' : ` (mode: ${mode})`;
          const levelText = typeof apca === 'string' ? ` ("${apca}")` : '';
          notices.push({
            id: RULES.contrast,
            message: `APCA: Token pair ${fgRaw}, ${bgRaw}${modeText} failed contrast. Expected ${minContrast}${levelText}, received ${round(Math.abs(lc), APCA_PRECISION)}`,
          });
        }
      }
    }
  }

  return notices;
}

export default function PluginA11y(): Plugin {
  return {
    name: '@cobalt-ui/lint-a11y',
    registerRules() {
      return Object.values(RULES).map((id) => ({ id, severity: 'error' }));
    },
    async lint({ tokens, rules }) {
      const notices: LintNotice[] = [];
      for (const rule of rules) {
        if (rule.severity === 'off') {
          continue;
        }

        switch (rule.id) {
          case RULES.contrast: {
            if (!rule.options || !Array.isArray((rule.options as RuleContrastOptions)?.checks)) {
              throw new Error(`options.checks must be an array`);
            }

            const errorMessages = evaluateContrast(tokens, rule.options as RuleContrastOptions);
            if (errorMessages.length) {
              notices.push(...errorMessages);
            }
            break;
          }
        }
      }

      return notices;
    },
  };
}
