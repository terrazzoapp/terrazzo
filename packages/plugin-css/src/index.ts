import * as color from 'kleur/colors';
import { BuildResult, GroupNode, Plugin, SchemaNode, TokenSchema } from '@cobalt-ui/core';
import { encode, indent } from './util.js';

export interface Options {
  /** Generate wrapper selectors around token modes */
  modeSelectors?: Record<string, Record<string, string | string[]>>;
  /** Modify values */
  transformValue(value: any, token: SchemaNode): any;
  /** Don’t like CSS variable names? Change it! */
  transformVariableNames?(id: string, group?: GroupNode): string;
}

export default function css(options: Options): Plugin {
  let format = options?.transformVariableNames || defaultFormatter;
  let transform = options?.transformValue || defaultTransformer;

  return {
    name: '@cobalt-ui/plugin-css',
    async build({ schema }: { schema: TokenSchema }): Promise<BuildResult[]> {
      const groups = new Map<string, GroupNode>();

      function makeVars(tokens: Record<string, SchemaNode>, mode?: string): string {
        let code = '';
        for (const v of Object.values(tokens)) {
          const varName = format(v.id, v.group)
            .trim()
            .replace(/^(-*)?/, '--');
          switch (v.type) {
            case 'group': {
              if (!groups.has(v.id)) groups.set(v.id, v);
              if (v.name) code += `\n/* ${v.name} */\n`;
              code += `\n${makeVars(v.tokens, mode)}`;
              break;
            }
            case 'token': {
              code += `\n${varName}: ${transform(mode ? v.value[mode] : v.value.default, v)};`;
              break;
            }
            case 'url': {
              code += `\n${varName}: url('${transform(mode ? v.value[mode] : v.value.default, v)}');`;
              break;
            }
            case 'file': {
              code += `\n${varName}: ${encode(transform(mode ? v.value[mode] : v.value.default, v))};`;
              break;
            }
          }
        }
        return code.trim();
      }

      // :root vars
      let code: string[] = [];
      if (schema.name) code.push('/**', ` * ${schema.name}`, ' */', '');
      code.push(':root {');
      code.push(indent(makeVars(schema.tokens, undefined), 1));
      code.push('}\n');

      // modes
      if (options.modeSelectors) {
        for (const [k, modes] of Object.entries(options.modeSelectors)) {
          const group = groups.get(k);
          if (!group) {
            // eslint-disable-next-line no-console
            console.warn(`${color.yellow('@cobalt-ui/plugin-css')} can’t find group "${k}" in modeSelectors`);
            continue;
          }

          for (const [mode, sel] of Object.entries(modes)) {
            const selectors = typeof sel === 'string' ? [sel] : sel;
            for (const selector of selectors) {
              let indentLv = 0;
              code.push(`${selector.trim().replace(/\s*{/, '')} {`);
              if (selector.startsWith(`@media`)) {
                indentLv++;
                code.push(indent(':root {', indentLv));
              }
              code.push(indent(makeVars(group.tokens, mode), indentLv + 1));
              if (selector.startsWith('@media')) code.push(indent('}', indentLv));
              code.push('}\n');
            }
          }
        }
      }

      return [{ fileName: 'tokens.css', contents: code.join('\n') }];
    },
  };
}

function defaultTransformer(value: any): any {
  return value;
}

function defaultFormatter(id: string): string {
  return `--${id.replace(/[._]/g, '-')}`;
}
