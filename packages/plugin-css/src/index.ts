import type {
  BuildResult,
  GradientStop,
  ParsedColorToken,
  ParsedCubicBezierToken,
  ParsedDimensionToken,
  ParsedDurationToken,
  ParsedFileToken,
  ParsedFontToken,
  ParsedGradientToken,
  ParsedShadowToken,
  ParsedTransitionToken,
  ParsedTypographyToken,
  ParsedURLToken,
  Plugin,
  ResolvedConfig,
} from '@cobalt-ui/core';
import color from 'better-color-tools';
import { Indenter, FG_YELLOW, RESET } from '@cobalt-ui/utils';
import { encode, formatFontNames } from './util.js';

const DASH_PREFIX_RE = /^(-*)?/;
const DOT_UNDER_GLOB_RE = /[._]/g;
const SELECTOR_BRACKET_RE = /\s*{/;
const HEX_RE = /#[0-9a-f]{3,8}/g;

type TokenTransformer = {
  color: (value: ParsedColorToken['value'], token: ParsedColorToken) => string;
  dimension: (value: ParsedDimensionToken['value'], token: ParsedDimensionToken) => string;
  duration: (value: ParsedDurationToken['value'], token: ParsedDurationToken) => string;
  font: (value: ParsedFontToken['value'], token: ParsedFontToken) => string;
  'cubic-bezier': (value: ParsedCubicBezierToken['value'], token: ParsedCubicBezierToken) => string;
  file: (value: ParsedFileToken['value'], token: ParsedFileToken) => string;
  url: (value: ParsedURLToken['value'], token: ParsedURLToken) => string;
  shadow: (value: ParsedShadowToken['value'], token: ParsedShadowToken) => string;
  gradient: (value: ParsedGradientToken['value'], token: ParsedGradientToken) => string;
  typography: (value: ParsedTypographyToken['value'], token: ParsedTypographyToken) => string;
  transition: (value: ParsedTransitionToken['value'], token: ParsedTransitionToken) => string;
} & { [key: string]: (value: any, token: any) => string };

export interface Options {
  /** set the filename inside outDir */
  filename?: string;
  /** embed files? */
  embedFiles?: boolean;
  /** generate wrapper selectors around token modes */
  modeSelectors?: Record<string, string | string[]>;
  /** handle different token types */
  transform?: Partial<TokenTransformer>;
  /** don’t like CSS variable names? Change it! */
  transformVariableNames?(id: string): string;
}

export default function css(options?: Options): Plugin {
  let config: ResolvedConfig;
  let filename = options?.filename || './tokens.css';
  let format = options?.transformVariableNames || defaultFormatter;
  let transform = {
    ...(options?.transform || {}),
  } as TokenTransformer;
  if (!transform.color) transform.color = transformColor;
  if (!transform.dimension) transform.dimension = transformDimension;
  if (!transform.duration) transform.duration = transformDuration;
  if (!transform.font) transform.font = transformFont;
  if (!transform['cubic-bezier']) transform['cubic-bezier'] = transformCubicBezier;
  if (!transform.file) transform.file = transformFile;
  if (!transform.url) transform.url = transformURL;
  if (!transform.shadow) transform.shadow = transformShadow;
  if (!transform.gradient) transform.gradient = transformGradient;
  if (!transform.typography) transform.typography = transformTypography;
  if (!transform.transition) transform.transition = transformTransition;

  const i = new Indenter();

  function defaultFormatter(id: string): string {
    return id.replace(DOT_UNDER_GLOB_RE, '-');
  }

  function makeVars(tokens: Record<string, any>, wrapper = ':root', indentLv = 0): string[] {
    const output: string[] = [];
    output.push(i.indent(`${wrapper} {`, indentLv));
    for (const [id, value] of Object.entries(tokens)) {
      output.push(i.indent(`${format(id).replace(DASH_PREFIX_RE, '--')}: ${value};`, indentLv + 1));
    }
    output.push(i.indent('}', indentLv));
    return output;
  }

  function makeP3(input: string[]): string[] {
    return input.map((value) => {
      const matches = value.match(HEX_RE);
      if (!matches || !matches.length) return value;
      let newVal = value;
      for (const c of matches) {
        newVal = newVal.replace(c, color.from(c).p3);
      }
      return newVal;
    });
  }

  return {
    name: '@cobalt-ui/plugin-css',
    config(c): void {
      config = c;
    },
    async build({ tokens, metadata }): Promise<BuildResult[]> {
      const tokenVals: { [id: string]: any } = {};
      const modeVals: { [selector: string]: { [id: string]: any } } = {};
      const selectors: string[] = [];

      // transformation (1 pass through all tokens + modes)
      for (const token of tokens) {
        const transformer = transform[token.type];
        if (!transformer) throw new Error(`No transformer found for token type "${token.type}"`);

        tokenVals[token.id] = {};
        let value = transformer(token.value as any, token as any);
        if (token.type === 'file' && options?.embedFiles) value = encode(value, config.outDir);
        tokenVals[token.id] = value;

        if (token.mode && options?.modeSelectors) {
          for (let [modeID, modeSelectors] of Object.entries(options.modeSelectors)) {
            const [groupRoot, modeName] = parseModeSelector(modeID);
            if ((groupRoot && !token.id.startsWith(groupRoot)) || !token.mode[modeName]) continue;

            if (!Array.isArray(selectors)) modeSelectors = [selectors];
            for (const selector of modeSelectors) {
              if (!selectors.includes(selector)) selectors.push(selector);
              if (!modeVals[selector]) modeVals[selector] = {};
              let modeVal = transformer(token.mode[modeName] as any, token as any);
              if (token.type === 'file' && options?.embedFiles) modeVal = encode(modeVal, config.outDir);
              modeVals[selector][token.id] = modeVal;
            }
          }
        }
      }

      // :root vars
      let code: string[] = [];
      code.push('/**');
      if (metadata.name) code.push(` * ${metadata.name}`);
      code.push(' * This file was auto-generated from tokens.json.');
      code.push(' * DO NOT EDIT!');
      code.push(' */');
      code.push('');
      code.push(...makeVars(tokenVals));
      code.push('');

      // modes
      for (const selector of selectors) {
        if (!Object.keys(modeVals[selector]).length) {
          // eslint-disable-next-line no-console
          console.warn(`${FG_YELLOW}@cobalt-ui/plugin-css${RESET} can’t find any tokens for "${selector}"`);
          continue;
        }
        const wrapper = selector.trim().replace(SELECTOR_BRACKET_RE, '');
        if (selector.startsWith('@')) {
          code.push(i.indent(`${wrapper} {`, 0));
          code.push(...makeVars(modeVals[selector], ':root', 1));
          code.push(i.indent('}', 0));
        } else {
          code.push(...makeVars(modeVals[selector], wrapper));
        }
      }

      // P3
      code.push('');
      code.push(i.indent(`@media (color-gamut: p3) {`, 0));
      code.push(...makeP3(makeVars(tokenVals, ':root', 1)));
      code.push('');
      for (const selector of selectors) {
        const wrapper = selector.trim().replace(SELECTOR_BRACKET_RE, '');
        if (selector.startsWith('@')) {
          code.push(i.indent(`${wrapper} {`, 1));
          code.push(...makeP3(makeVars(modeVals[selector], ':root', 2)));
          code.push(i.indent('}', 1));
        } else {
          code.push(...makeP3(makeVars(modeVals[selector], wrapper, 1)));
        }
      }
      code.push(i.indent('}', 0));
      code.push('');

      return [
        {
          filename,
          contents: code.join('\n'),
        },
      ];
    },
  };
}

/** transform color */
function transformColor(value: ParsedColorToken['value']): string {
  return String(value);
}
/** transform dimension */
function transformDimension(value: ParsedDimensionToken['value']): string {
  return String(value);
}
/** transform duration */
function transformDuration(value: ParsedDurationToken['value']): string {
  return String(value);
}
/** transform font */
function transformFont(value: ParsedFontToken['value']): string {
  return formatFontNames(value);
}
/** transform cubic beziér */
function transformCubicBezier(value: ParsedCubicBezierToken['value']): string {
  return `cubic-bezier(${value.join(', ')})`;
}
/** transform file */
function transformFile(value: ParsedFileToken['value']): string {
  return `url('${value}')`;
}
/** transform file */
function transformURL(value: ParsedURLToken['value']): string {
  return `url('${value}')`;
}
/** transform shadow */
function transformShadow(value: ParsedShadowToken['value']): string {
  return [value['offset-x'], value['offset-y'], value.blur, value.spread, value.color].join(' ');
}
/** transform gradient */
function transformGradient(value: ParsedGradientToken['value']): string {
  return value.map(({ color, position }: GradientStop) => `${color}${position ? ` ${position * 100}%` : ''}`).join(', ');
}
/** transform typography */
function transformTypography(value: ParsedTypographyToken['value']): string {
  const hasLineHeight = typeof value.lineHeight === 'number' || typeof value.lineHeight === 'string';
  let size = value.fontSize || hasLineHeight ? `${value.fontSize}${hasLineHeight ? `/${value.lineHeight}` : ''}` : '';
  return [value.fontStyle, value.fontWeight, size, formatFontNames((value.fontName as any) || [])].filter((v) => !!v).join(' ');
}
/** transform transition */
function transformTransition(value: ParsedTransitionToken['value']): string {
  const timingFunction = value['timing-function'] ? `cubic-bezier(${value['timing-function'].join(',')})` : undefined;
  return [value.duration, value.delay, timingFunction].filter((v) => v !== undefined).join(' ');
}

/** parse modeSelector */
function parseModeSelector(modeID: string): [string, string] {
  if (!modeID.includes('#')) throw new Error(`modeSelector key must have "#" character`);
  const parts = modeID.split('#').map((s) => s.trim());
  if (parts.length > 2) throw new Error(`modeSelector key must have only 1 "#" character`);
  return [parts[0], parts[1]];
}
