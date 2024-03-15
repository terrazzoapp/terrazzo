import { type Plugin, type ParsedToken, type LintNotice, type ParsedColorToken, type ParsedTypographyToken } from '@cobalt-ui/core';
import { blend, modeRgb, modeHsl, modeHsv, modeP3, modeOkhsl, modeOklch, modeOklab, modeXyz50, modeXyz65, modeLrgb, useMode, wcagContrast } from 'culori/fn';
import { APCAcontrast } from 'apca-w3';
import { isWCAG2LargeText, round } from './lib.js';
import { getMinimumLc } from './apca.js';

// register colorspaces for Culori to parse (these are side-effect-y)
useMode(modeHsl);
useMode(modeHsv);
useMode(modeLrgb);
useMode(modeOkhsl);
useMode(modeOklab);
useMode(modeOklch);
useMode(modeP3);
useMode(modeRgb);
useMode(modeXyz50);
const toXyz = useMode(modeXyz65);

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
  apca?: 'bronze' | 'bronze-body' | number | false;
}

function evaluateContrast(tokens: ParsedToken[], options: RuleContrastOptions): LintNotice[] {
  const notices: LintNotice[] = [];
  if (!Array.isArray(options.checks)) {
    throw new Error(`"checks" must be an array`);
  }
  for (const {
    wcag2 = 'AA',
    apca = 'off',
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
        if (defaultResult < minContrast) {
          notices.push({
            id: RULES.contrast,
            message: `WCAG 2: Token pair ${fg}, ${bg}${mode === '.' ? '' : ` (mode: ${mode})`} failed contrast. Expected ${minContrast}:1, received ${round(defaultResult)}:1`,
          });
        }
      }
    }

    // APCA
    if (typeof apca === 'string' || (typeof apca === 'number' && Math.abs(apca) > 0)) {
      if (typeof apca === 'string' && apca !== 'bronze' && apca !== 'bronze-body') {
        throw new Error(`APCA: expected value \`'bronze'\` or \`'bronze-body'\`, received ${apca}`);
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

        // note: because modes can apply to color AND/OR typography, ignore mismatches (unlike WCAG2)
        let { y: fgY = 0, alpha: falpha = 1 } = toXyz(fgRaw) ?? {};
        // if foreground is slightly-transparent, calculate the displayed value
        if (falpha < 1) {
          const newFG = toXyz(blend([foreground.$value, background.$value], 'normal', 'lrgb'));
          fgY = newFG.y;
        }
        const { y: bgY = 0 } = toXyz(bgRaw) ?? {};

        testSets.push({ fgRaw, fgY, bgRaw, bgY, fontSize: typographyRaw?.fontSize, fontWeight: typographyRaw?.fontWeight, mode });
      }

      for (const { fgY, fgRaw, bgY, bgRaw, mode, fontSize, fontWeight } of testSets) {
        const lc = APCAcontrast(fgY, bgY);
        if (typeof lc === 'string') {
          throw new Error(`Internal error: expected number, APCA returned "${lc}"`); // types are wrong?
        }
        let minContrast = 60;
        if (typeof apca === 'number') {
          minContrast = apca;
        } else if (fontSize && fontWeight) {
          minContrast = getMinimumLc(fontSize, fontWeight, apca === 'bronze-body');
        }
        if (Math.abs(lc) < minContrast) {
          notices.push({
            id: RULES.contrast,
            message: `APCA: Token pair ${fgRaw}, ${bgRaw}${mode === '.' ? '' : ` (mode: ${mode})`} failed contrast. Expected ${minContrast}, received ${round(Math.abs(lc))}.`,
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
