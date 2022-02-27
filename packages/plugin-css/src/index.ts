import type {
  BuildResult,
  GradientStop,
  ParsedColorToken,
  ParsedCubicBezierToken,
  ParsedBorderToken,
  ParsedDimensionToken,
  ParsedDurationToken,
  ParsedFontToken,
  ParsedGradientToken,
  ParsedLinkToken,
  ParsedShadowToken,
  ParsedStrokeStyleToken,
  ParsedTransitionToken,
  ParsedTypographyToken,
  ParsedTypographyValue,
  Plugin,
  ResolvedConfig,
} from '@cobalt-ui/core';
import color from 'better-color-tools';
import { Indenter, FG_YELLOW, RESET } from '@cobalt-ui/utils';
import { encode, formatFontNames } from './util.js';

const DASH_PREFIX_RE = /^(-*)?/;
const CAMELCASE_RE = /([^A-Z])([A-Z])/g;
const DOT_UNDER_GLOB_RE = /[._]/g;
const SELECTOR_BRACKET_RE = /\s*{/;
const HEX_RE = /#[0-9a-f]{3,8}/g;

type TokenTransformer = {
  color: (value: ParsedColorToken['$value'], token: ParsedColorToken) => string;
  dimension: (value: ParsedDimensionToken['$value'], token: ParsedDimensionToken) => string;
  duration: (value: ParsedDurationToken['$value'], token: ParsedDurationToken) => string;
  font: (value: ParsedFontToken['$value'], token: ParsedFontToken) => string;
  cubicBezier: (value: ParsedCubicBezierToken['$value'], token: ParsedCubicBezierToken) => string;
  link: (value: ParsedLinkToken['$value'], token: ParsedLinkToken) => string;
  strokeStyle: (value: ParsedStrokeStyleToken['$value'], token: ParsedStrokeStyleToken) => string;
  border: (value: ParsedBorderToken['$value'], token: ParsedBorderToken) => string;
  transition: (value: ParsedTransitionToken['$value'], token: ParsedTransitionToken) => string;
  shadow: (value: ParsedShadowToken['$value'], token: ParsedShadowToken) => string;
  gradient: (value: ParsedGradientToken['$value'], token: ParsedGradientToken) => string;
  typography: (value: ParsedTypographyToken['$value'], token: ParsedTypographyToken) => string;
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
  /** prefix variable names */
  prefix?: string;
}

export default function css(options?: Options): Plugin {
  let config: ResolvedConfig;
  let filename = options?.filename || './tokens.css';
  let prefix = options?.prefix || '';
  let transform = {
    ...(options?.transform || {}),
  } as TokenTransformer;
  if (!transform.color) transform.color = transformColor;
  if (!transform.dimension) transform.dimension = transformDimension;
  if (!transform.duration) transform.duration = transformDuration;
  if (!transform.font) transform.font = transformFont;
  if (!transform.cubicBezier) transform.cubicBezier = transformCubicBezier;
  if (!transform.link) transform.link = transformLink;
  if (!transform.shadow) transform.shadow = transformShadow;
  if (!transform.gradient) transform.gradient = transformGradient;
  if (!transform.transition) transform.transition = transformTransition;

  const i = new Indenter();

  function makeVars(tokens: Record<string, any>, indentLv = 0, generateRoot = false): string[] {
    const output: string[] = [];
    if (generateRoot) output.push(i.indent(':root {', indentLv));
    for (const [id, value] of Object.entries(tokens)) {
      output.push(i.indent(`${id.replace(DASH_PREFIX_RE, `--${prefix}`).replace(DOT_UNDER_GLOB_RE, '-')}: ${value};`, indentLv + (generateRoot ? 1 : 0)));
    }
    if (generateRoot) output.push(i.indent('}', indentLv));
    return output;
  }

  function makeTypography(tokens: Record<string, ParsedTypographyValue>, indentLv = 0): string[] {
    const output: string[] = [];
    for (const [id, properties] of Object.entries(tokens)) {
      output.push('');
      output.push(i.indent(`.${id.replace(DOT_UNDER_GLOB_RE, '-')} {`, indentLv));
      for (const [k, value] of Object.entries(properties)) {
        const property = k.replace(CAMELCASE_RE, '$1-$2').toLowerCase();
        output.push(i.indent(`${property}: ${Array.isArray(value) ? formatFontNames(value) : value};`, indentLv + 1));
      }
      output.push(i.indent('}', indentLv));
    }
    return output;
  }

  function makeP3(input: string[]): string[] {
    const output: string[] = [];
    for (const line of input) {
      if (line.includes('{') || line.includes('}')) {
        output.push(line);
        continue;
      }
      const matches = line.match(HEX_RE);
      if (!matches || !matches.length) continue;
      let newVal = line;
      for (const c of matches) {
        newVal = newVal.replace(c, color.from(c).p3);
      }
      output.push(newVal);
    }
    return output;
  }

  return {
    name: '@cobalt-ui/plugin-css',
    config(c): void {
      config = c;
    },
    async build({ tokens, metadata }): Promise<BuildResult[]> {
      const tokenVals: { [id: string]: any } = {};
      const typographyVals: { [id: string]: ParsedTypographyValue } = {};
      const modeVals: { [selector: string]: { [id: string]: any } } = {};
      const typographyModeVals: { [selector: string]: { [id: string]: ParsedTypographyValue } } = {};
      const selectors: string[] = [];

      // transformation (1 pass through all tokens + modes)
      for (const token of tokens) {
        // exception: typography tokens require CSS classes
        if (token.$type === 'typography') {
          typographyVals[token.id] = token.$value as ParsedTypographyValue;
          if (token.$extensions && token.$extensions.mode && options?.modeSelectors) {
            for (let [modeID, modeSelectors] of Object.entries(options.modeSelectors)) {
              const [groupRoot, modeName] = parseModeSelector(modeID);
              if ((groupRoot && !token.id.startsWith(groupRoot)) || !token.$extensions.mode[modeName]) continue;

              if (!Array.isArray(selectors)) modeSelectors = [selectors];
              for (const selector of modeSelectors) {
                if (!selectors.includes(selector)) selectors.push(selector);
                if (!modeVals[selector]) modeVals[selector] = {};
                typographyModeVals[selector][token.id] = token.$extensions.mode[modeName] as ParsedTypographyValue;
              }
            }
          }
          continue;
        }

        const transformer = transform[token.$type];
        if (!transformer) throw new Error(`No transformer found for token type "${token.$type}"`);

        tokenVals[token.id] = {};
        let value = transformer(token.$value as any, token as any);
        if (token.$type === 'link' && options?.embedFiles) value = encode(value, config.outDir);
        tokenVals[token.id] = value;

        if (token.$extensions && token.$extensions.mode && options?.modeSelectors) {
          for (let [modeID, modeSelectors] of Object.entries(options.modeSelectors)) {
            const [groupRoot, modeName] = parseModeSelector(modeID);
            if ((groupRoot && !token.id.startsWith(groupRoot)) || !token.$extensions.mode[modeName]) continue;

            if (!Array.isArray(selectors)) modeSelectors = [selectors];
            for (const selector of modeSelectors) {
              if (!selectors.includes(selector)) selectors.push(selector);
              if (!modeVals[selector]) modeVals[selector] = {};
              let modeVal = transformer(token.$extensions.mode[modeName] as any, token as any);
              if (token.$type === 'link' && options?.embedFiles) modeVal = encode(modeVal, config.outDir);
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
      code.push(...makeVars(tokenVals, 0, true));
      code.push(...makeTypography(typographyVals));

      // modes
      for (const selector of selectors) {
        code.push('');
        if (!Object.keys(modeVals[selector]).length && !Object.keys(typographyModeVals[selector]).length) {
          // eslint-disable-next-line no-console
          console.warn(`${FG_YELLOW}@cobalt-ui/plugin-css${RESET} can’t find any tokens for "${selector}"`);
          continue;
        }
        const wrapper = selector.trim().replace(SELECTOR_BRACKET_RE, '');
        code.push(`${wrapper} {`);
        if (modeVals[selector]) code.push(...makeVars(modeVals[selector], 1, wrapper.startsWith('@')));
        if (typographyModeVals[selector]) code.push(...makeTypography(typographyModeVals[selector], 1));
        code.push('}');
      }

      // P3
      if (tokens.some((t) => t.$type === 'color' || t.$type === 'gradient' || t.$type === 'shadow')) {
        code.push('');
        code.push(i.indent(`@supports (color: color(display-p3 1 1 1)) {`, 0)); // note: @media (color-gamut: p3) is problematic in most browsers
        code.push(...makeP3(makeVars(tokenVals, 1, true)));
        for (const selector of selectors) {
          code.push('');
          const wrapper = selector.trim().replace(SELECTOR_BRACKET_RE, '');
          code.push(i.indent(`${wrapper} {`, 1));
          code.push(...makeP3(makeVars(modeVals[selector], 2, wrapper.startsWith('@'))));
          code.push(i.indent('}', 1));
        }
        code.push(i.indent('}', 0));
      }

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
function transformColor(value: ParsedColorToken['$value']): string {
  return String(value);
}
/** transform dimension */
function transformDimension(value: ParsedDimensionToken['$value']): string {
  return String(value);
}
/** transform duration */
function transformDuration(value: ParsedDurationToken['$value']): string {
  return String(value);
}
/** transform font */
function transformFont(value: ParsedFontToken['$value']): string {
  return formatFontNames(value);
}
/** transform cubic beziér */
function transformCubicBezier(value: ParsedCubicBezierToken['$value']): string {
  return `cubic-bezier(${value.join(', ')})`;
}
/** transform file */
function transformLink(value: ParsedLinkToken['$value']): string {
  return `url('${value}')`;
}
/** transform shadow */
function transformShadow(value: ParsedShadowToken['$value']): string {
  return [value.offsetX, value.offsetY, value.blur, value.spread, value.color].join(' ');
}
/** transform gradient */
function transformGradient(value: ParsedGradientToken['$value']): string {
  return value.map((g: GradientStop) => `${g.color} ${g.position * 100}%`).join(', ');
}
/** transform transition */
function transformTransition(value: ParsedTransitionToken['$value']): string {
  const timingFunction = value.timingFunction ? `cubic-bezier(${value.timingFunction.join(',')})` : undefined;
  return [value.duration, value.delay, timingFunction].filter((v) => v !== undefined).join(' ');
}

/** parse modeSelector */
function parseModeSelector(modeID: string): [string, string] {
  if (!modeID.includes('#')) throw new Error(`modeSelector key must have "#" character`);
  const parts = modeID.split('#').map((s) => s.trim());
  if (parts.length > 2) throw new Error(`modeSelector key must have only 1 "#" character`);
  return [parts[0], parts[1]];
}
