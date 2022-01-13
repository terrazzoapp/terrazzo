import type { BuildResult, Token, ParsedToken, Plugin } from '@cobalt-ui/core';
import { Indenter, FG_YELLOW, RESET } from '@cobalt-ui/utils';
import { encode } from './util.js';

const DASH_PREFIX_RE = /^(-*)?/;
const DOT_UNDER_GLOB_RE = /[._]/g;
const SELECTOR_BRACKET_RE = /\s*{/;

export interface Options {
  /** Generate wrapper selectors around token modes */
  modeSelectors?: Record<string, Record<string, string | string[]>>;
  /** Modify values */
  transformValue(token: ParsedToken, mode?: string): any;
  /** Don’t like CSS variable names? Change it! */
  transformVariableNames?(id: string): string;
}

export default function css(options: Options): Plugin {
  let format = options?.transformVariableNames || defaultFormatter;
  let transform = options?.transformValue || defaultTransformer;

  const i = new Indenter(); // TODO: allow config?

  return {
    name: '@cobalt-ui/plugin-css',
    async build({ schema }): Promise<BuildResult[]> {
      function makeVars(tokens: ParsedToken[], mode?: string): string {
        let code = '';
        for (const token of tokens) {
          const varName = format(token.id).trim().replace(DASH_PREFIX_RE, '--');
          code += `\n${varName}: ${transform(token, mode)};`;
        }
        return code.trim();
      }

      // :root vars
      let code: string[] = [];
      if (schema.metadata.name) code.push('/**', ` * ${schema.metadata.name}`, ' */', '');
      code.push(':root {');
      code.push(i.indent(makeVars(schema.tokens, undefined), 1));
      code.push('}\n');

      // modes
      if (options.modeSelectors) {
        for (const [k, modes] of Object.entries(options.modeSelectors)) {
          const group = schema.tokens.filter((t) => t.id.startsWith(k));
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
          fileName: 'tokens.css',
          contents: code.join('\n'),
        },
      ];
    },
  };
}

function defaultTransformer(token: Token, mode?: string): string {
  switch (token.type) {
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
      return encode(value);
    }
    case 'url': {
      let value = (mode && token.mode && token.mode[mode]) || token.value;
      return `url('${value}')`;
    }
    case 'shadow': {
      let value = (mode && token.mode && token.mode[mode]) || token.value;
      return value.join(',');
    }
    case 'dimension':
    case 'linear-gradient':
    case 'radial-gradient':
    case 'conic-gradient':
    default: {
      return (mode && token.mode && token.mode[mode]) || token.value;
    }
  }
}

function defaultFormatter(id: string): string {
  return `--${id.replace(DOT_UNDER_GLOB_RE, '-')}`;
}
