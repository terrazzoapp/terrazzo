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

const VAR_TOKENS = '__token-values';
const VAR_TYPOGRAPHY = '__token-typography-mixins';
const VAR_ERROR = '__cobalt-error';
const TRAILING_WS_RE = /\s+$/gm;

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
  if (!transform.transition) transform.transition = transformTransition;

  const semi = options?.indentedSyntax ? '' : ';';
  const cbOpen = options?.indentedSyntax ? '' : ' {';
  const cbClose = options?.indentedSyntax ? '' : '} ';
  const i = new Indenter();

  const TOKEN_FN = `@function token($tokenName, $modeName: default)${cbOpen}
  @if map.has-key($${VAR_TOKENS}, $tokenName) == false${cbOpen}
    @error "No token named \\"#{$tokenName}\\""${semi}
  ${cbClose}
  $_token: map.get($${VAR_TOKENS}, $tokenName)${semi}
  @if map.has-key($_token, "__cobalt-error")${cbOpen}
    @error map.get($_token, "__cobalt-error")${semi}
  ${cbClose}
  @if map.has-key($_token, $modeName) {
    @return map.get($_token, $modeName)${semi}
  ${cbClose}@else${cbOpen}
    @return map.get($_token, default)${semi}
  ${cbClose}
${cbClose}`
    .trim()
    .replace(TRAILING_WS_RE, '');

  const TYPOGRAPHY_MIXIN = `@mixin typography($tokenName, $modeName: default)${cbOpen}
  @if map.has-key($${VAR_TYPOGRAPHY}, $tokenName) == false${cbOpen}
    @error "No typography mixin named \\"#{$tokenName}\\""${semi}
  ${cbClose}
  $_mixin: map.get($${VAR_TYPOGRAPHY}, $tokenName)${semi}
  $_properties: map.get($_token, default)${semi}
  @if map.has-key($_token, $modeName)${cbOpen}
    $_properties: map.get($_token, $modeName)${semi}
  ${cbClose}
  @each $_property, $_value in $_properties${cbOpen}
    #{$_property}: #{$_value}${semi}
  ${cbClose}
${cbClose}`
    .trim()
    .replace(TRAILING_WS_RE, '');

  return {
    name: '@cobalt-ui/plugin-sass',
    config(c): void {
      config = c;
    },
    async build({ tokens, metadata }): Promise<BuildResult[]> {
      let output: string[] = [];
      const typographyTokens: ParsedTypographyToken[] = [];

      // metadata
      if (metadata.name) output.push(`// ${metadata.name}`);
      output.push('// This file was auto-generated from tokens.json.');
      output.push('// DO NOT EDIT!');
      output.push('');

      // basic tokens
      output.push(`@use "sass:map"${semi}`);
      output.push('');
      output.push(i.indent(`$${VAR_TOKENS}: (`, 0));
      for (const token of tokens) {
        // special case: typography tokens needs @mixins, so bypass normal route
        if (token.type === 'typography') {
          typographyTokens.push(token);
          output.push(i.indent(`"${token.id}": (`, 1));
          output.push(i.indent(`"${VAR_ERROR}": "This is a typography mixin. Use \`@include typography(\\"${token.id}\\")\` instead.",`, 2));
          output.push(i.indent(`),`, 1));
          continue;
        }

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

      // typography tokens
      output.push(`$${VAR_TYPOGRAPHY}: (`);
      for (const token of typographyTokens) {
        output.push(i.indent(`"${token.id}": (`, 1));
        output.push(i.indent(`default: (`, 2));
        const defaultProperties = Object.entries(token.value); // legacy: support camelCase properties
        defaultProperties.sort(([a], [b]) => a.localeCompare(b));
        for (const [property, value] of defaultProperties) {
          output.push(i.indent(`"${property}": (${Array.isArray(value) ? formatFontNames(value) : value}),`, 3));
        }
        output.push(i.indent(`),`, 2));
        for (const [mode, modeValue] of Object.entries(token.mode || {})) {
          output.push(i.indent(`"${mode}": (`, 2));
          const modeProperties = Object.entries(modeValue);
          modeProperties.sort(([a], [b]) => a.localeCompare(b));
          for (const [property, value] of modeProperties) {
            output.push(i.indent(`"${property}": (${Array.isArray(value) ? formatFontNames(value) : value}),`, 3));
          }
          output.push(i.indent(`),`, 2));
        }
        output.push(i.indent(`),`, 1));
      }
      output.push(`)${semi}`);
      output.push('');

      // utilities
      output.push(TOKEN_FN);
      output.push('');
      output.push(TYPOGRAPHY_MIXIN);
      output.push('');

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
  return [value['offset-x'], value['offset-y'], value.blur, value.spread, value.color].join(' ');
}
/** transform gradient */
function transformGradient(value: ParsedGradientToken['value']): string {
  return value.map((g: GradientStop) => `${g.color} ${g.position * 100}%`).join(', ');
}
/** transform transition */
function transformTransition(value: ParsedTransitionToken['value']): string {
  const timingFunction = value['timing-function'] ? `cubic-bezier(${value['timing-function'].join(',')})` : undefined;
  return [value.duration, value.delay, timingFunction].filter((v) => v !== undefined).join(' ');
}
