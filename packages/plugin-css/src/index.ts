import type { BuildResult, ParsedToken, Plugin, ResolvedConfig } from '@cobalt-ui/core';
import { Indenter, FG_YELLOW, RESET } from '@cobalt-ui/utils';
import color from 'better-color-tools';
import { fileURLToPath } from 'url';
import { encode } from './util.js';

const DASH_PREFIX_RE = /^(-*)?/;
const DOT_UNDER_GLOB_RE = /[._]/g;
const SELECTOR_BRACKET_RE = /\s*{/;
const HEX_RE = /#[0-9a-f]{3,8}/g;
const LEADING_SLASH_RE = /^\//;

export interface Options {
  /** set the filename inside outDir */
  filename?: string;
  /** Generate wrapper selectors around token modes */
  modeSelectors?: Record<string, Record<string, string | string[]>>;
  /** Modify values */
  transformValue(token: ParsedToken, mode?: string): any;
  /** Don’t like CSS variable names? Change it! */
  transformVariableNames?(id: string): string;
}

export default function css(options: Options): Plugin {
  let filename = options?.filename || './tokens.css';
  let format = options?.transformVariableNames || defaultFormatter;
  let transform = options?.transformValue || defaultTransformer;
  let config: ResolvedConfig;

  const i = new Indenter();

  function defaultTransformer(token: ParsedToken, mode?: string): string {
    switch (token.type) {
      case 'color':
      case 'dimension':
      case 'duration': {
        return String((mode && token.mode && token.mode[mode]) || token.value);
      }
      case 'font': {
        let value = (mode && token.mode && token.mode[mode]) || token.value;
        return value.map((fontName) => (fontName.includes(' ') ? `"${fontName}"` : fontName)).join(',');
      }
      case 'cubic-bezier': {
        let value = (mode && token.mode && token.mode[mode]) || token.value;
        return `cubic-bezier(${value.join(',')})`;
      }
      case 'file': {
        let value = (mode && token.mode && token.mode[mode]) || token.value;
        return encode(fileURLToPath(new URL(value.replace(LEADING_SLASH_RE, ''), config.outDir)));
      }
      case 'url': {
        let value = (mode && token.mode && token.mode[mode]) || token.value;
        return `url('${value}')`;
      }
      case 'gradient': {
        let value = (mode && token.mode && token.mode[mode]) || token.value;
        return value.map((v) => `${v.color}${v.position ? ` ${v.position * 100}%` : ''}`).join(',');
      }
      case 'shadow': {
        let value = (mode && token.mode && token.mode[mode]) || token.value;
        return [value['offset-x'], value['offset-y'], value.blur, value.spread, value.color].filter((v) => v !== undefined).join(',');
      }
      case 'typography': {
        let value = (mode && token.mode && token.mode[mode]) || token.value;
        const hasLineHeight = typeof value.lineHeight === 'number' || typeof value.lineHeight === 'string';
        let size = value.fontSize || hasLineHeight ? `${value.fontSize}${hasLineHeight ? `/${value.lineHeight}` : ''}` : '';
        return [value.fontStyle, value.fontWeight, size, value.fontName].filter((v) => !!v).join(' ');
      }
      case 'transition': {
        let value = (mode && token.mode && token.mode[mode]) || token.value;
        return [value.duration, value.delay, value['timing-function']].filter((v) => !!v).join(' ');
      }
      default: {
        return (mode && (token as any).mode && (token as any).mode[mode]) || (token as any).value;
      }
    }
  }

  function defaultFormatter(id: string): string {
    return `--${id.replace(DOT_UNDER_GLOB_RE, '-')}`;
  }

  return {
    name: '@cobalt-ui/plugin-css',
    config(c): void {
      config = c;
    },
    async build({ tokens, metadata }): Promise<BuildResult[]> {
      function makeVars(t: ParsedToken[], mode?: string): string {
        let code = '';
        for (const token of t) {
          const varName = format(token.id).replace(DASH_PREFIX_RE, '--');
          const value = transform(token, mode);
          code += `\n${varName}: ${value};`;

          // generate P3 color for color & gradient
          if (token.type === 'color') {
            code += `\n${varName}-p3: ${color.from(value).p3};`;
          } else if (token.type === 'gradient') {
            code += `\n${varName}-p3: ${(value as string).replace(HEX_RE, (substr) => color.from(substr).p3)};`;
          }
        }
        return code.trim();
      }

      // :root vars
      let code: string[] = [];
      if (metadata.name) code.push('/**', ` * ${metadata.name}`, ' */', '');
      code.push(':root {');
      code.push(i.indent(makeVars(tokens, undefined), 1));
      code.push('}\n');

      // modes
      if (options.modeSelectors) {
        for (const [k, modes] of Object.entries(options.modeSelectors)) {
          const group = tokens.filter((t) => t.id.startsWith(k));
          if (!group.length) {
            // eslint-disable-next-line no-console
            console.warn(`${FG_YELLOW}@cobalt-ui/plugin-css${RESET} can’t find any tokens in group "${k}"`);
            continue;
          }

          for (const [mode, sel] of Object.entries(modes)) {
            const selectors = typeof sel === 'string' ? [sel] : sel;
            for (const selector of selectors) {
              let indentLv = 0;
              code.push(`${selector.trim().replace(SELECTOR_BRACKET_RE, '')} {`);
              if (selector.startsWith('@media')) {
                indentLv++;
                code.push(i.indent(':root {', indentLv));
              }
              code.push(i.indent(makeVars(group, mode), indentLv + 1));
              if (selector.startsWith('@media')) code.push(i.indent('}', indentLv));
              code.push('}\n');
            }
          }
        }
      }

      return [
        {
          filename,
          contents: code.join('\n'),
        },
      ];
    },
  };
}
