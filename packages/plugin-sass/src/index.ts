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

import { Indenter } from '@cobalt-ui/utils';
import { encode, formatFontNames } from './util.js';

const TOKEN_VALUES = '__token-values';

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
  /** output file (default: "./tokens/index.sass") */
  filename?: string;
  /** use indented syntax (.sass)? (default: false) */
  indentedSyntax?: boolean;
  /** embed files in CSS? */
  embedFiles?: boolean;
  /** handle different token types */
  transform?: Partial<TokenTransformer>;
}

export default function sass(options?: Options): Plugin {
  let config: ResolvedConfig;
  let ext = options?.indentedSyntax ? '.sass' : '.scss';
  let filename = `${options?.filename?.replace(/(\.(sass|scss))?$/, '') || 'index'}${ext}`;
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

  const semi = options?.indentedSyntax ? '' : ';';
  const cbOpen = options?.indentedSyntax ? '' : ' {';
  const cbClose = options?.indentedSyntax ? '' : '}';
  const i = new Indenter();

  function generateTokenFn(): string {
    const output: string[] = [];
    output.push(i.indent(`@function token($tokenName, $modeName: default)${cbOpen}`, 0));
    output.push(i.indent(`@if map.has-key($${TOKEN_VALUES}, $tokenName) == false${cbOpen}`, 1));
    output.push(i.indent(`@error "No token named \\"#{$tokenName}\\""${semi}`, 2));
    if (cbClose) output.push(i.indent(cbClose, 1));
    output.push(i.indent(`$_token: map.get($${TOKEN_VALUES}, $tokenName)${semi}`, 1));
    output.push(i.indent(`@if map.has-key($_token, $modeName)${cbOpen}`, 1));
    output.push(i.indent(`@return map.get($_token, $modeName)${semi}`, 2));
    output.push(i.indent(`${cbClose} @else${cbOpen}`, 1));
    output.push(i.indent(`@return map.get($_token, default)${semi}`, 2));
    if (cbClose) output.push(i.indent(cbClose, 1));
    if (cbClose) output.push(i.indent(cbClose, 0));
    return output.join('\n');
  }

  return {
    name: '@cobalt-ui/plugin-sass',
    config(c): void {
      config = c;
    },
    async build({ tokens }): Promise<BuildResult[]> {
      // 1. gather default values and modes
      let output: string[] = [];
      output.push('// This file was auto-generated from tokens.json.');
      output.push('// DO NOT EDIT!');
      output.push('');
      output.push(`@use "sass:map"${semi}`);
      output.push('');
      output.push(i.indent(`$${TOKEN_VALUES}: (`, 0));
      for (const token of tokens) {
        const transformer = transform[token.type];
        if (!transformer) throw new Error(`No transformer found for token type "${token.type}"`);
        output.push(i.indent(`"${token.id}": (`, 1));

        // default value
        let value = transformer(token.value as any, token as any);
        if (token.type === 'file' && options?.embedFiles) value = encode(value, config.outDir);
        output.push(i.indent(`default: (${value}),`, 2));

        // modes
        for (const [k, v] of Object.entries(token.mode || {})) {
          let modeValue = transformer(v, token as any);
          if (token.type === 'file' && options?.embedFiles) modeValue = encode(modeValue, config.outDir);
          output.push(i.indent(`"${k}": (${modeValue}),`, 2));
        }
        output.push(i.indent('),', 1));
      }
      output.push(`)${semi}`);
      output.push('');
      output.push(generateTokenFn());
      output.push('');

      // 4. finish
      return [{ filename, contents: output.join('\n') }];
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
  return [value['offset-x'], value['offset-y'], value.blur, value.spread, value.color].filter((v) => v !== undefined).join(', ');
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
