import type {BuildResult, ParsedToken, Plugin, ResolvedConfig} from '@cobalt-ui/core';
import {indent, isTokenMatch, FG_YELLOW, RESET} from '@cobalt-ui/utils';
import {formatCss} from 'culori';
import defaultTransformer, {type ColorFormat, toRGB} from './transform/index.js';
import {CustomNameGenerator, makeNameGenerator} from './utils/token.js';
import {encode} from './utils/encode.js';
import generateUtilityCSS, {type UtilityCSSGroup} from './utils/utility-css.js';

export {makeNameGenerator as _INTERNAL_makeNameGenerator, defaultTransformer};
export * from './utils/utility-css.js';
export * from './utils/token.js';
export * from './transform/index.js';

const SELECTOR_BRACKET_RE = /\s*{/;
const HEX_RE = /#[0-9a-f]{3,8}/g;

/** @deprecated */
export type LegacyModeSelectors = Record<string, string | string[]>;

export interface ModeSelector {
  /** The name of the mode to match */
  mode: string;
  /** (optional) Provide token IDs to match. Globs are allowed (e.g: `["color.*", "shadow.dark"]`) */
  tokens?: string[];
  /** Provide CSS selectors to generate. (e.g.: `["@media (prefers-color-scheme: dark)", "[data-color-theme='dark']"]` ) */
  selectors: string[];
}

export interface Options {
  /** output file (default: "./tokens/tokens.css") */
  filename?: string;
  /** embed files in CSS? */
  embedFiles?: boolean;
  /** generate wrapper selectors around token modes */
  modeSelectors?: ModeSelector[] | LegacyModeSelectors;
  /** handle different token types */
  transform?: <T extends ParsedToken>(token: T, mode?: string) => string | undefined | null;
  /** @deprecated prefix variable names */
  prefix?: string;
  /** enable P3 color enhancement? (default: true) */
  p3?: boolean;
  /** normalize all color outputs to format (default: "hex") or specify "none" to keep as-is */
  colorFormat?: ColorFormat;
  /** generate variable name  */
  generateName?: CustomNameGenerator;
  /** generate utility CSS? */
  utility?: Record<UtilityCSSGroup, string[]>;
}

export default function pluginCSS(options?: Options): Plugin {
  let config: ResolvedConfig;
  let filename = options?.filename || './tokens.css';
  const prefix = options?.prefix || '';
  const generateName = makeNameGenerator(options?.generateName, prefix);

  function makeVars({tokens, indentLv = 0, root = false}: {tokens: Record<string, string>; indentLv: number; root: boolean}): string[] {
    const output: string[] = [];
    if (root) output.push(indent(':root {', indentLv));
    const sortedTokens = Object.entries(tokens).sort((a, b) => a[0].localeCompare(b[0], 'en-us', {numeric: true}));
    for (const [variableName, value] of sortedTokens) {
      output.push(indent(`${variableName}: ${value};`, indentLv + (root ? 1 : 0)));
    }
    if (root) output.push(indent('}', indentLv));
    return output;
  }

  function makeP3(input: string[]): string[] {
    const output: string[] = [];
    let hasValidColors = false;
    for (const line of input) {
      if (line.includes('{') || line.includes('}')) {
        output.push(line);
        continue;
      }
      const matches = line.match(HEX_RE);
      if (!matches || !matches.length) continue;
      let newVal = line;
      for (const c of matches) {
        const rgb = toRGB(c);
        if (!rgb) throw new Error(`invalid color "${c}"`);
        newVal = newVal.replace(c, formatCss({...rgb, mode: 'p3'}));
        hasValidColors = true; // keep track of whether or not actual colors have been generated (we also generate non-color output, so checking for output.length won’t work)
      }
      output.push(newVal);
    }
    // only return output if real colors were generated
    if (hasValidColors) {
      return output;
    }
    return [];
  }

  return {
    name: '@cobalt-ui/plugin-css',
    config(c): void {
      config = c;
    },
    async build({tokens, metadata}): Promise<BuildResult[]> {
      const tokenIdToRefs: Record<string, string> = {};
      const tokenVals: {[variableName: string]: any} = {};
      const modeVals: {[selector: string]: {[variableName: string]: any}} = {};
      const selectors: string[] = [];
      const colorFormat = options?.colorFormat ?? 'hex';
      for (const token of tokens) {
        let value: ReturnType<typeof defaultTransformer> | undefined | null = await options?.transform?.(token);
        if (value === undefined || value === null) {
          value = defaultTransformer(token, {prefix, colorFormat, generateName, tokens});
        }

        const ref = generateName(token.id, token);
        tokenIdToRefs[token.id] = ref;

        switch (token.$type) {
          case 'link': {
            if (options?.embedFiles) value = encode(value as string, config.outDir);
            tokenVals[ref] = value;
            break;
          }
          case 'typography': {
            for (const [k, v] of Object.entries(value)) {
              tokenVals[generateName(`${token.id}-${k}`, token)] = v;
            }
            break;
          }
          default: {
            tokenVals[ref] = value;
            break;
          }
        }
        if (token.$extensions && token.$extensions.mode && options?.modeSelectors) {
          const modeSelectors: ModeSelector[] = [];

          if (Array.isArray(options.modeSelectors)) {
            // validate
            for (let i = 0; i < options.modeSelectors.length; i++) {
              const modeSelector = options.modeSelectors[i]!;
              if (!modeSelector || typeof modeSelector !== 'object') {
                continue;
              }
              if (!modeSelector.mode) {
                throw new Error(`modeSelectors[${i}] missing required "mode"}`);
              }
              if (modeSelector.tokens && (!Array.isArray(modeSelector.tokens) || modeSelector.tokens.some((s) => typeof s !== 'string'))) {
                throw new Error(`modeSelectors[${i}] tokens must be an array of strings`);
              }
              if (!Array.isArray(modeSelector.selectors) || modeSelector.selectors.some((s) => typeof s !== 'string')) {
                throw new Error(`modeSelectors[${i}] selectors must be an array of strings`);
              }
              modeSelectors.push(modeSelector);
            }
          }
          // normalize legacy mode selectors
          else if (typeof options.modeSelectors === 'object') {
            for (const [modeID, selector] of Object.entries(options.modeSelectors)) {
              const [groupRoot, modeName] = parseLegacyModeSelector(modeID);
              modeSelectors.push({mode: modeName, tokens: groupRoot ? [`${groupRoot}*`] : undefined, selectors: Array.isArray(selector) ? selector : [selector]});
            }
          }

          for (const modeSelector of modeSelectors) {
            if (!token.$extensions.mode[modeSelector.mode] || (modeSelector.tokens && !isTokenMatch(token.id, modeSelector.tokens))) {
              continue;
            }

            for (const selector of modeSelector.selectors) {
              if (!selectors.includes(selector)) selectors.push(selector);
              if (!modeVals[selector]) modeVals[selector] = {};
              let modeVal: ReturnType<typeof defaultTransformer> | undefined | null = await options?.transform?.(token, modeSelector.mode);
              if (modeVal === undefined || modeVal === null) {
                modeVal = defaultTransformer(token, {colorFormat, generateName, mode: modeSelector.mode, prefix, tokens});
              }
              switch (token.$type) {
                case 'link': {
                  if (options?.embedFiles) modeVal = encode(modeVal as string, config.outDir);
                  modeVals[selector]![generateName(token.id, token)] = modeVal;
                  break;
                }
                case 'typography': {
                  for (const [k, v] of Object.entries(modeVal)) {
                    modeVals[selector]![generateName(`${token.id}-${k}`, token)] = v;
                  }
                  break;
                }
                default: {
                  modeVals[selector]![generateName(token.id, token)] = modeVal;
                  break;
                }
              }
            }
          }
        }
      }

      // :root vars
      let code: string[] = [];
      code.push('/**');
      code.push(` * ${metadata.name || 'Design Tokens'}`);
      code.push(' * Autogenerated from tokens.json.');
      code.push(' * DO NOT EDIT!');
      code.push(' */');
      code.push('');
      code.push(...makeVars({tokens: tokenVals, indentLv: 0, root: true}));

      // modes
      for (const selector of selectors) {
        code.push('');
        if (!Object.keys(modeVals[selector]!).length) {
          // eslint-disable-next-line no-console
          console.warn(`${FG_YELLOW}@cobalt-ui/plugin-css${RESET} can’t find any tokens for "${selector}"`);
          continue;
        }
        const wrapper = selector.trim().replace(SELECTOR_BRACKET_RE, '');
        if (modeVals[selector]) {
          const vars = makeVars({tokens: modeVals[selector]!, indentLv: 1, root: wrapper.startsWith('@')});
          // don’t output empty selectors
          if (vars.length) {
            code.push(`${wrapper} {`, ...vars, '}');
          }
        }
      }

      // P3
      if (
        options?.p3 !== false &&
        (colorFormat === 'hex' || colorFormat === 'rgb' || colorFormat === 'hsl' || colorFormat === 'hwb') && // only transform for the smaller gamuts
        tokens.some((t) => t.$type === 'color' || t.$type === 'border' || t.$type === 'gradient' || t.$type === 'shadow')
      ) {
        code.push('');
        code.push(indent(`@supports (color: color(display-p3 1 1 1)) {`, 0)); // note: @media (color-gamut: p3) is problematic in most browsers
        code.push(...makeP3(makeVars({tokens: tokenVals, indentLv: 1, root: true})));
        for (const selector of selectors) {
          const wrapper = selector.trim().replace(SELECTOR_BRACKET_RE, '');
          const vars = makeVars({tokens: modeVals[selector]!, indentLv: 2, root: wrapper.startsWith('@')});
          const p3colors = makeP3(vars);
          // don’t output empty selectors
          if (p3colors.length) {
            code.push('', indent(`${wrapper} {`, 1), ...p3colors, indent('}', 1));
          }
        }
        code.push(indent('}', 0));
      }

      code.push('');

      // Utility CSS
      if (options?.utility && Object.keys(options.utility).length) {
        code.push(generateUtilityCSS(options.utility, {refs: tokenIdToRefs, tokens}));
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

/** @deprecated parse legacy modeSelector */
function parseLegacyModeSelector(modeID: string): [string, string] {
  if (!modeID.includes('#')) throw new Error(`modeSelector key must have "#" character`);
  const parts = modeID.split('#').map((s) => s.trim());
  if (parts.length > 2) throw new Error(`modeSelector key must have only 1 "#" character`);
  return [parts[0]!, parts[1]!];
}
