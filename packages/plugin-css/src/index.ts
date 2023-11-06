import type {
  BuildResult,
  ParsedColorToken,
  ParsedCubicBezierToken,
  ParsedDimensionToken,
  ParsedDurationToken,
  ParsedFontFamilyToken,
  ParsedFontWeightToken,
  ParsedNumberToken,
  ParsedLinkToken,
  ParsedStrokeStyleToken,
  ParsedToken,
  Plugin,
  ResolvedConfig,
} from '@cobalt-ui/core';
import {indent, isAlias, kebabinate, FG_YELLOW, RESET} from '@cobalt-ui/utils';
import {clampChroma, converter, formatCss, formatHex, formatHex8, formatHsl, formatRgb, parse as parseColor} from 'culori';
import {CustomNameGenerator, DASH_PREFIX_RE, defaultNameGenerator, makeNameGenerator} from './utils/generate-token-name.js';
import {encode} from './utils/encode.js';
import {formatFontNames} from './utils/format-font-names.js';
import {isTokenMatch} from './utils/is-token-match.js';

export {makeNameGenerator as _INTERNAL_makeNameGenerator, defaultNameGenerator} from './utils/generate-token-name.js';

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
  colorFormat?: 'none' | 'hex' | 'rgb' | 'hsl' | 'hwb' | 'srgb-linear' | 'p3' | 'lab' | 'lch' | 'oklab' | 'oklch' | 'xyz-d50' | 'xyz-d65';
  /** generate variable name  */
  generateName?: CustomNameGenerator;
}

/** ⚠️ Important! We do NOT want to parse as P3. We want to parse as sRGB, then expand 1:1 to P3. @see https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/ */
const toHSL = converter('hsl');
const toHWB = converter('hwb');
const toLab = converter('lab');
const toLch = converter('lch');
const toOklab = converter('oklab');
const toOklch = converter('oklch');
const toP3 = converter('p3');
const toRGB = converter('rgb');
const toRGBLinear = converter('lrgb');
const toXYZ50 = converter('xyz50');
const toXYZ65 = converter('xyz65');

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
      const tokenVals: {[variableName: string]: any} = {};
      const modeVals: {[selector: string]: {[variableName: string]: any}} = {};
      const selectors: string[] = [];
      const colorFormat = options?.colorFormat ?? 'hex';
      for (const token of tokens) {
        let value: ReturnType<typeof defaultTransformer> | undefined | null = await options?.transform?.(token);
        if (value === undefined || value === null) {
          value = defaultTransformer(token, {prefix, colorFormat, generateName, tokens});
        }
        switch (token.$type) {
          case 'link': {
            if (options?.embedFiles) value = encode(value as string, config.outDir);
            tokenVals[generateName(token.id, token)] = value;
            break;
          }
          case 'typography': {
            for (const [k, v] of Object.entries(value)) {
              tokenVals[generateName(`${token.id}-${k}`, token)] = v;
            }
            break;
          }
          default: {
            tokenVals[generateName(token.id, token)] = value;
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
export function transformColor(value: ParsedColorToken['$value'], colorFormat: NonNullable<Options['colorFormat']>): string {
  if (colorFormat === 'none') {
    return String(value);
  }
  const parsed = parseColor(value);
  if (!parsed) throw new Error(`invalid color "${value}"`);
  switch (colorFormat) {
    case 'rgb': {
      return formatRgb(clampChroma(toRGB(value)!, 'rgb'));
    }
    case 'hex': {
      const rgb = clampChroma(toRGB(value)!, 'rgb');
      return typeof parsed.alpha === 'number' && parsed.alpha < 1 ? formatHex8(rgb) : formatHex(rgb);
    }
    case 'hsl': {
      return formatHsl(clampChroma(toHSL(value)!, 'rgb'));
    }
    case 'hwb': {
      return formatCss(clampChroma(toHWB(value)!, 'rgb'));
    }
    case 'lab': {
      return formatCss(toLab(value)!);
    }
    case 'lch': {
      return formatCss(toLch(value)!);
    }
    case 'oklab': {
      return formatCss(toOklab(value)!);
    }
    case 'oklch': {
      return formatCss(toOklch(value)!);
    }
    case 'p3': {
      return formatCss(toP3(value)!);
    }
    case 'srgb-linear': {
      return formatCss(toRGBLinear(value)!);
    }
    case 'xyz-d50': {
      return formatCss(toXYZ50(value)!);
    }
    case 'xyz-d65': {
      return formatCss(toXYZ65(value)!);
    }
  }
}
/** transform dimension */
export function transformDimension(value: ParsedDimensionToken['$value']): string {
  return String(value);
}
/** transform duration */
export function transformDuration(value: ParsedDurationToken['$value']): string {
  return String(value);
}
/** transform font family */
export function transformFontFamily(value: ParsedFontFamilyToken['$value']): string {
  return formatFontNames(value);
}
/** transform font weight */
export function transformFontWeight(value: ParsedFontWeightToken['$value']): number {
  return Number(value);
}
/** transform cubic beziér */
export function transformCubicBezier(value: ParsedCubicBezierToken['$value']): string {
  return `cubic-bezier(${value.join(', ')})`;
}
/** transform number */
export function transformNumber(value: ParsedNumberToken['$value']): number {
  return Number(value);
}
/** transform file */
export function transformLink(value: ParsedLinkToken['$value']): string {
  return `url('${value}')`;
}
/** transform stroke style */
export function transformStrokeStyle(value: ParsedStrokeStyleToken['$value']): string {
  if (typeof value === 'string') {
    return value;
  }
  return 'dashed'; // CSS doesn’t support custom dashes or line caps, so just convert to `dashed`
}

export function defaultTransformer(
  token: ParsedToken,
  {
    colorFormat = 'hex',
    generateName,
    mode,
    prefix,
    tokens,
  }: {
    colorFormat: Options['colorFormat'];
    generateName?: ReturnType<typeof makeNameGenerator>;
    mode?: string;
    prefix?: string;
    tokens?: ParsedToken[];
  },
): string | number | Record<string, string> {
  switch (token.$type) {
    // base tokens
    case 'color': {
      const {originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      return transformColor(originalVal, colorFormat); // note: use original value because it may have been normalized to hex (which matters if it wasn’t in sRGB gamut to begin with)
    }
    case 'dimension': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformDimension(value);
    }
    case 'duration': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformDuration(value);
    }
    case 'font' as 'fontFamily': // @deprecated (but keep support for now)
    case 'fontFamily': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformFontFamily(value);
    }
    case 'fontWeight': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformFontWeight(value);
    }
    case 'cubicBezier': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformCubicBezier(value);
    }
    case 'number': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformNumber(value);
    }
    case 'link': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformLink(value);
    }
    case 'strokeStyle': {
      const {value, originalVal} = getMode(token, mode);
      if (isAlias(originalVal)) {
        return varRef(originalVal as string, {prefix, tokens, generateName});
      }
      return transformStrokeStyle(value);
    }
    // composite tokens
    case 'border': {
      const {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      const width = isAlias(originalVal.width) ? varRef(originalVal.width, {prefix, tokens, generateName}) : transformDimension(value.width);
      const color = isAlias(originalVal.color) ? varRef(originalVal.color, {prefix, tokens, generateName}) : transformColor(originalVal.color, colorFormat);
      const style = isAlias(originalVal.style) ? varRef(originalVal.style as string, {prefix, tokens, generateName}) : transformStrokeStyle(value.style);
      return `${width} ${style} ${color}`;
    }
    case 'shadow': {
      let {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }

      // handle backwards compat for previous versions that didn’t always return array
      if (!Array.isArray(value)) value = [value];
      if (!Array.isArray(originalVal)) originalVal = [originalVal];

      return value
        .map((shadow, i) => {
          const origShadow = originalVal[i]!;
          if (typeof origShadow === 'string') {
            return varRef(origShadow, {prefix, tokens, generateName});
          }
          const offsetX = isAlias(origShadow.offsetX) ? varRef(origShadow.offsetX, {prefix, tokens, generateName}) : transformDimension(shadow.offsetX);
          const offsetY = isAlias(origShadow.offsetY) ? varRef(origShadow.offsetY, {prefix, tokens, generateName}) : transformDimension(shadow.offsetY);
          const blur = isAlias(origShadow.blur) ? varRef(origShadow.blur, {prefix, tokens, generateName}) : transformDimension(shadow.blur);
          const spread = isAlias(origShadow.spread) ? varRef(origShadow.spread, {prefix, tokens, generateName}) : transformDimension(shadow.spread);
          const color = isAlias(origShadow.color) ? varRef(origShadow.color, {prefix, tokens, generateName}) : transformColor(origShadow.color, colorFormat);
          return `${shadow.inset ? 'inset ' : ''}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
        })
        .join(', ');
    }
    case 'gradient': {
      const {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      return value
        .map((gradient, i) => {
          const origGradient = originalVal[i]!;
          if (typeof origGradient === 'string') {
            return varRef(origGradient, {prefix, tokens, generateName});
          }
          const color = isAlias(origGradient.color) ? varRef(origGradient.color, {prefix, tokens, generateName}) : transformColor(origGradient.color, colorFormat);
          const stop = isAlias(origGradient.position) ? varRef(origGradient.position as any, {prefix, tokens, generateName}) : `${100 * gradient.position}%`;
          return `${color} ${stop}`;
        })
        .join(', ');
    }
    case 'transition': {
      const {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      const duration = isAlias(originalVal.duration) ? varRef(originalVal.duration, {prefix, tokens, generateName}) : transformDuration(value.duration);
      let delay: string | undefined = undefined;
      if (value.delay) {
        delay = isAlias(originalVal.delay) ? varRef(originalVal.delay, {prefix, tokens, generateName}) : transformDuration(value.delay);
      }
      const timingFunction = isAlias(originalVal.timingFunction) ? varRef(originalVal.timingFunction as any, {prefix, tokens, generateName}) : transformCubicBezier(value.timingFunction);
      return `${duration} ${delay ?? ''} ${timingFunction}`;
    }
    case 'typography': {
      const {value, originalVal} = getMode(token, mode);
      if (typeof originalVal === 'string') {
        return varRef(originalVal, {prefix, tokens, generateName});
      }
      const output: Record<string, string> = {};
      for (const [k, v] of Object.entries(value)) {
        const formatter = k === 'fontFamily' ? transformFontFamily : (val: any): string => String(val);
        output[kebabinate(k)] = isAlias((originalVal as any)[k] as any) ? varRef((originalVal as any)[k], {prefix, tokens, generateName}) : formatter(v as any);
      }
      return output;
    }
    default: {
      throw new Error(`No transformer defined for $type: ${(token as any).$type} tokens`);
    }
  }
}

function getMode<T extends {id: string; $value: any; $extensions?: any; _original: any}>(token: T, mode?: string): {value: T['$value']; originalVal: T['$value'] | string} {
  if (mode) {
    if (!token.$extensions?.mode || !token.$extensions.mode[mode]) throw new Error(`Token ${token.id} missing "$extensions.mode.${mode}"`);
    return {
      value: token.$extensions.mode[mode]!,
      originalVal: token._original.$extensions.mode[mode]!,
    };
  }
  return {value: token.$value, originalVal: token._original.$value};
}

/**
 * Reference an existing CSS var
 *
 */
export function varRef(
  id: string,
  options?: {
    prefix?: string;
    suffix?: string;
    // note: the following properties are optional to preserve backwards-compat without a breaking change
    tokens?: ParsedToken[];
    generateName?: ReturnType<typeof makeNameGenerator>;
  },
): string {
  let refID = id;
  if (isAlias(id)) {
    // unclear if mode is ever appended to id when passed here, but leaving for safety in case
    const [rootID, _mode] = id.substring(1, id.length - 1).split('#');
    refID = rootID!;
  }

  const token = options?.tokens?.find((t) => t.id === refID);

  if (!token) {
    console.warn(`Tried to reference variable with id: ${refID}, no token found`); // eslint-disable-line no-console
  }

  // suffix is only used internally (one place in plugin-sass), so handle it here rather than clutter the public API in defaultNameGenerator
  const normalizedSuffix = options?.suffix ? `-${options?.suffix.replace(DASH_PREFIX_RE, '')}` : '';
  const variableId = refID + normalizedSuffix;

  return `var(${options?.generateName?.(variableId, token) ?? defaultNameGenerator(variableId, options?.prefix)})`;
}

/** @deprecated parse legacy modeSelector */
function parseLegacyModeSelector(modeID: string): [string, string] {
  if (!modeID.includes('#')) throw new Error(`modeSelector key must have "#" character`);
  const parts = modeID.split('#').map((s) => s.trim());
  if (parts.length > 2) throw new Error(`modeSelector key must have only 1 "#" character`);
  return [parts[0]!, parts[1]!];
}
