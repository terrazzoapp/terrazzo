import type { BuildResult, GradientStop, ParsedToken, ParsedTypographyValue, Plugin } from '@cobalt-ui/core';

import { Indenter } from '@cobalt-ui/utils';
import { encode, formatFontNames } from './util.js';

const MODE_MAP = '-cobalt_token_modes';
const ANY_DOT_RE = /\./g;

export interface Options {
  /** output file (default: "./tokens/index.sass") */
  fileName?: string;
  /** use indented syntax (.sass)? (default: false) */
  indentedSyntax?: boolean;
  /** modify values */
  transformValue?: (token: ParsedToken, mode?: string) => string;
  /** rename variables */
  transformVariables?: (id: string) => string;
}

export default function sass(options?: Options): Plugin {
  let ext = options?.indentedSyntax ? '.sass' : '.scss';
  let fileName = `${options?.fileName?.replace(/(\.(sass|scss))?$/, '') || 'index'}${ext}`;
  let transform = options?.transformValue || defaultTransformer;
  let namer = options?.transformVariables || defaultNamer;
  const semi = options?.indentedSyntax ? '' : ';';
  const cbOpen = options?.indentedSyntax ? '' : ' {';
  const cbClose = options?.indentedSyntax ? '' : '}';
  const i = new Indenter();

  function generateModeFn(): string {
    return `@function mode($token, $modeName) {
  $mode: map.get($${MODE_MAP}, $token)${semi}
  @return map.get($mode, $modeName)${semi}
}`;
  }

  function defaultTransformer(token: ParsedToken, mode?: string): string {
    switch (token.type) {
      case 'color':
      case 'dimension':
      case 'duration': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        return String(value);
      }
      case 'font': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        return formatFontNames(value);
      }
      case 'cubic-bezier': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        return `cubic-bezier(${value.join(', ')})`;
      }
      case 'file': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        return encode(value);
      }
      case 'url': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        return `url('${value}')`;
      }
      case 'shadow': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        return [value['offset-x'], value['offset-y'], value.blur, value.spread, value.color].filter((v) => v !== undefined).join(', ');
      }
      case 'gradient': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        return value.map(({ color, position }: GradientStop) => `${color}${position ? ` ${position * 100}%` : ''}`).join(', ');
      }
      case 'typography': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        const hasLineHeight = typeof value.lineHeight === 'number' || typeof value.lineHeight === 'string';
        let size = value.fontSize || hasLineHeight ? `${value.fontSize}${hasLineHeight ? `/${value.lineHeight}` : ''}` : '';
        return [value.fontStyle, value.fontWeight, size, formatFontNames((value.fontName as any) || [])].filter((v) => !!v).join(' ');
      }
      case 'transition': {
        const value = (mode && token.mode && token.mode[mode]) || token.value;
        const timingFunction = value['timing-function'] ? `cubic-bezier(${value['timing-function'].join(',')})` : undefined;
        return [value.duration, value.delay, timingFunction].filter((v) => v !== undefined).join(' ');
      }
      default: {
        const value = (mode && (token as any).mode && (token as any).mode[mode]) || (token as any).value;
        return `$${namer((token as any).id)}: ${value}${semi}`;
      }
    }
  }

  function typographyMixin(id: string, value: Partial<ParsedTypographyValue>): string {
    const output: string[] = [];
    output.push(`@mixin ${namer(id)}${cbOpen}`);
    if (value.fontName) output.push(i.indent(`font-family: ${formatFontNames(value.fontName)}${semi}`, 1));
    if (value.fontSize) output.push(i.indent(`font-size: ${value.fontSize}${semi}`, 1));
    if (value.fontStyle) output.push(i.indent(`font-style: ${value.fontStyle}${semi}`, 1));
    if (value.fontWeight) output.push(i.indent(`font-weight: ${value.fontWeight}${semi}`, 1));
    if (value.letterSpacing) output.push(i.indent(`letter-spacing: ${value.letterSpacing}${semi}`, 1));
    if (value.lineHeight) output.push(i.indent(`line-height: ${value.lineHeight}${semi}`, 1));
    if (cbClose) output.push(cbClose);
    return output.join('\n');
  }

  function defaultNamer(id: string): string {
    return id.replace(ANY_DOT_RE, '__');
  }

  return {
    name: '@cobalt-ui/plugin-sass',
    async build({ tokens }): Promise<BuildResult[]> {
      // 1. gather default values and modes
      let imports = [`@use "sass:map"${semi}`];
      let defaults: string[] = [];
      for (const token of tokens) {
        defaults.push(`$${namer(token.id)}: ${transform(token)}${semi}`);
      }

      // 2. render modes data
      let modeOutput: string[] = [`$${MODE_MAP}: (`];
      for (const token of tokens) {
        if (!token.mode || !Object.keys(token.mode).length) continue;

        modeOutput.push(i.indent(`$${namer(token.id)}: (`, 1));
        for (const mode of Object.keys(token.mode)) {
          modeOutput.push(i.indent(`${JSON.stringify(mode)}: ${transform(token, mode)},`, 2));
        }
        modeOutput.push(i.indent('),', 1));
      }
      modeOutput.push(`)${semi}`);

      // 3. composite type mixins
      const compositeOutput: string[] = [];
      for (const token of tokens) {
        switch (token.type) {
          case 'typography': {
            compositeOutput.push(typographyMixin(token.id, token.value));
            for (const modeID of Object.keys(token.mode || {})) {
              compositeOutput.push(typographyMixin(`${token.id}-${modeID}`, (token as any).mode[modeID]));
            }
          }
        }
      }

      // 4. finish
      let code = [...imports, '', ...defaults, ...modeOutput, ...compositeOutput, '', generateModeFn()].join('\n');
      return [{ fileName, contents: code }];
    },
  };
}
