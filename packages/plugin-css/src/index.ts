import type {
  BuildResult,
  GradientStop,
  ParsedBorderToken,
  ParsedColorToken,
  ParsedCubicBezierToken,
  ParsedDimensionToken,
  ParsedDurationToken,
  ParsedFontFamilyToken,
  ParsedFontWeightToken,
  ParsedNumberToken,
  ParsedGradientToken,
  ParsedLinkToken,
  ParsedShadowToken,
  ParsedStrokeStyleToken,
  ParsedToken,
  ParsedTransitionToken,
  ParsedTypographyToken,
  Plugin,
  ResolvedConfig,
} from '@cobalt-ui/core';
import {converter, formatCss} from 'culori';
import {indent, isAlias, kebabinate, FG_YELLOW, RESET} from '@cobalt-ui/utils';
import {encode, formatFontNames} from './util.js';

const CSS_VAR_RE = /^var\(--[^)]+\)$/;
const DASH_PREFIX_RE = /^-+/;
const DASH_SUFFIX_RE = /-+$/;
const DOT_UNDER_GLOB_RE = /[._]/g;
const SELECTOR_BRACKET_RE = /\s*{/;
const HEX_RE = /#[0-9a-f]{3,8}/g;

export interface Options {
  /** output file (default: "./tokens/tokens.css") */
  filename?: string;
  /** embed files in CSS? */
  embedFiles?: boolean;
  /** generate wrapper selectors around token modes */
  modeSelectors?: Record<string, string | string[]>;
  /** handle different token types */
  transform?: (token: ParsedToken, mode?: string) => string;
  /** prefix variable names */
  prefix?: string;
  /** enable P3 color enhancement? (default: true) */
  p3?: boolean;
}

/** ⚠️ Important! We do NOT want to parse as P3. We want to parse as sRGB, then expand 1:1 to P3. @see https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/ */
const rgb = converter('rgb');

export default function pluginCSS(options?: Options): Plugin {
  let config: ResolvedConfig;
  let filename = options?.filename || './tokens.css';
  let prefix = options?.prefix || '';

  function makeVars({tokens, indentLv = 0, root = false}: {tokens: Record<string, string>; indentLv: number; root: boolean}): string[] {
    const output: string[] = [];
    if (root) output.push(indent(':root {', indentLv));
    const sortedTokens = Object.entries(tokens);
    sortedTokens.sort((a, b) => a[0].localeCompare(b[0], 'en-us', {numeric: true}));
    for (const [id, value] of sortedTokens) {
      output.push(indent(`${varName(id, {prefix})}: ${value};`, indentLv + (root ? 1 : 0)));
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
        const parsed = rgb(c);
        if (!parsed) throw new Error(`invalid color "${c}"`);
        newVal = newVal.replace(c, formatCss({...parsed, mode: 'p3'}));
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
      const tokenVals: {[id: string]: any} = {};
      const modeVals: {[selector: string]: {[id: string]: any}} = {};
      const selectors: string[] = [];
      const customTransform = typeof options?.transform === 'function' ? options.transform : undefined;
      for (const token of tokens) {
        let value = (customTransform && customTransform(token)) || defaultTransformer(token, {prefix});
        switch (token.$type) {
          case 'link': {
            if (options?.embedFiles) value = encode(value as string, config.outDir);
            tokenVals[token.id] = value;
            break;
          }
          case 'typography': {
            for (const [k, v] of Object.entries(value)) {
              tokenVals[`${token.id}-${k}`] = v;
            }
            break;
          }
          default: {
            tokenVals[token.id] = value;
            break;
          }
        }
        if (token.$extensions && token.$extensions.mode && options?.modeSelectors) {
          for (let [modeID, modeSelectors] of Object.entries(options.modeSelectors)) {
            const [groupRoot, modeName] = parseModeSelector(modeID);
            if ((groupRoot && !token.id.startsWith(groupRoot)) || !token.$extensions.mode[modeName]) continue;
            if (!Array.isArray(selectors)) modeSelectors = [selectors];
            for (const selector of modeSelectors) {
              if (!selectors.includes(selector)) selectors.push(selector);
              if (!modeVals[selector]) modeVals[selector] = {};
              let modeVal = (customTransform && customTransform(token, modeName)) || defaultTransformer(token, {prefix, mode: modeName});
              switch (token.$type) {
                case 'link': {
                  if (options?.embedFiles) modeVal = encode(modeVal as string, config.outDir);
                  modeVals[selector]![token.id] = modeVal;
                  break;
                }
                case 'typography': {
                  for (const [k, v] of Object.entries(modeVal)) {
                    modeVals[selector]![`${token.id}-${k}`] = v;
                  }
                  break;
                }
                default: {
                  modeVals[selector]![token.id] = modeVal;
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
      if (options?.p3 !== false && tokens.some((t) => t.$type === 'color' || t.$type === 'border' || t.$type === 'gradient' || t.$type === 'shadow')) {
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
export function transformColor(value: ParsedColorToken['$value']): string {
  return String(value);
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
  return String(value);
}
/** transform border */
export function transformBorder(value: ParsedBorderToken['$value']): string {
  return [transformDimension(value.width), transformStrokeStyle(value.style), transformColor(value.color)].join(' ');
}
/** transform shadow */
export function transformShadow(value: ParsedShadowToken['$value']): string {
  return [value.offsetX, value.offsetY, value.blur, value.spread, value.color].join(' ');
}
/** transform gradient */
export function transformGradient(value: ParsedGradientToken['$value']): string {
  return value.map((g: GradientStop) => `${g.color} ${g.position * 100}%`).join(', ');
}
/** transform transition */
export function transformTransition(value: ParsedTransitionToken['$value']): string {
  const timingFunction = Array.isArray(value.timingFunction) ? `cubic-bezier(${value.timingFunction.join(',')})` : value.timingFunction;
  return [value.duration, value.delay, timingFunction].filter((v) => v !== undefined).join(' ');
}
/** transform typography */
export function transformTypography(value: ParsedTypographyToken['$value']): Record<string, string | number | string[]> {
  const values: Record<string, string | number | string[]> = {};
  for (const [k, v] of Object.entries(value)) {
    values[kebabinate(k)] = Array.isArray(v) ? formatFontNames(v) : (v as any);
  }
  return values;
}

export function defaultTransformer(token: ParsedToken, options?: {mode?: string; prefix?: string}): string | number | ReturnType<typeof transformTypography> {
  let value = token.$value;
  let rawVal = token._original.$value;

  // handle modes
  if (options?.mode) {
    if (!token.$extensions?.mode || !token.$extensions.mode[options.mode]) throw new Error(`Token ${token.id} missing "$extensions.mode.${options.mode}"`);
    value = token.$extensions.mode[options.mode]!;
    rawVal = ((token._original.$extensions as typeof token.$extensions).mode as typeof token.$extensions.mode)[options?.mode]!; // very cool TS right here
  }

  // handle aliases (both full and partial aliasing within compound tokens)
  const refOptions = {prefix: options?.prefix, mode: options?.mode};
  if (typeof rawVal === 'string' && isAlias(rawVal)) {
    value = varRef(rawVal, refOptions);
  } else if (rawVal && !Array.isArray(rawVal) && typeof rawVal === 'object') {
    const resolvedVal: Record<string, string> = {...(value as any)};
    for (const [k, v] of Object.entries(rawVal)) {
      resolvedVal[k] = isAlias(v) ? varRef(v, refOptions) : (value as any)[k];
    }
    value = resolvedVal;
  }

  // if this is a flat CSS var, no need to transform
  if (typeof value === 'string' && CSS_VAR_RE.test(value)) {
    return value;
  }

  switch (token.$type) {
    case 'color': {
      return transformColor(value as typeof token.$value);
    }
    case 'dimension': {
      return transformDimension(value as typeof token.$value);
    }
    case 'duration': {
      return transformDuration(value as typeof token.$value);
    }
    case 'font' as 'fontFamily': // @deprecated (but keep support for now)
    case 'fontFamily': {
      return transformFontFamily(value as typeof token.$value);
    }
    case 'fontWeight': {
      return transformFontWeight(value as typeof token.$value);
    }
    case 'cubicBezier': {
      return transformCubicBezier(value as typeof token.$value);
    }
    case 'number': {
      return transformNumber(value as typeof token.$value);
    }
    case 'link': {
      return transformLink(value as typeof token.$value);
    }
    case 'strokeStyle': {
      return transformStrokeStyle(value as typeof token.$value);
    }
    case 'border': {
      return transformBorder(value as typeof token.$value);
    }
    case 'shadow': {
      return transformShadow(value as typeof token.$value);
    }
    case 'gradient': {
      return transformGradient(value as typeof token.$value);
    }
    case 'transition': {
      return transformTransition(value as typeof token.$value);
    }
    case 'typography': {
      return transformTypography(value as typeof token.$value);
    }
    default: {
      throw new Error(`No transformer defined for $type: ${(token as any).$type} tokens`);
    }
  }
}

/** convert token name to CSS variable */
export function varName(id: string, options?: {prefix?: string; suffix?: string}): string {
  return ['--', options?.prefix ? `${options.prefix.replace(DASH_PREFIX_RE, '').replace(DASH_SUFFIX_RE, '')}-` : '', id.replace(DOT_UNDER_GLOB_RE, '-'), options?.suffix ? `-${options.suffix.replace(DASH_PREFIX_RE, '')}` : ''].join('');
}

/** reference an existing CSS var */
export function varRef(id: string, options?: {prefix?: string; suffix?: string; fallbacks?: string[]; mode?: string}): string {
  let refID = id;
  if (isAlias(id)) {
    const [rootID, mode] = id.substring(1, id.length - 1).split('#');
    if (mode && options?.mode && mode !== options?.mode) console.warn(`⚠️  ${FG_YELLOW}"${id}" referenced from within mode "${options.mode}". This may produce unexpected values.${RESET}`); // eslint-disable-line no-console
    refID = rootID!;
  }
  return ['var(', varName(refID, {prefix: options?.prefix, suffix: options?.suffix}), Array.isArray(options?.fallbacks) && options?.fallbacks.length ? `, ${options.fallbacks.join(', ')}` : '', ')'].join('');
}

/** parse modeSelector */
function parseModeSelector(modeID: string): [string, string] {
  if (!modeID.includes('#')) throw new Error(`modeSelector key must have "#" character`);
  const parts = modeID.split('#').map((s) => s.trim());
  if (parts.length > 2) throw new Error(`modeSelector key must have only 1 "#" character`);
  return [parts[0]!, parts[1]!];
}
