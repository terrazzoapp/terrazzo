import type {BuildResult, ParsedToken, Plugin} from '@cobalt-ui/core';
import {Indenter, objKey} from '@cobalt-ui/utils';

export interface Options {
  /** output file (default: "./tokens/index.ts") */
  filename?: string;
  /** modify values */
  transform?: (token: ParsedToken, mode?: string) => string;
}

/** escape values with strings if necessary */
function esc(value: any): string {
  return String(Number(value)) === value ? value : `'${value}'`;
}

export default function ts(options?: Options): Plugin {
  let filename = options?.filename || './index.ts';

  function printTokensExport(schemaTokens: ParsedToken[]): string {
    let code = ['export const tokens = {'];
    const i = new Indenter();

    // reconstruct object
    const tokens: Record<string, any> = {};
    for (const token of schemaTokens) {
      const keys = token.id.split('.');
      let node = tokens;
      for (let n = 0; n < keys.length; n++) {
        if (n === keys.length - 1) {
          node[keys[n]] = (typeof options?.transform === 'function' && options?.transform(token)) || token.$value;
        } else {
          if (!node[keys[n]]) node[keys[n]] = {};
        }
        node = node[keys[n]];
      }
    }

    // print string from object
    function printObject(obj: any, lv = 1): void {
      if (!obj || typeof obj !== 'object') return;
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === 'object') {
          code.push(i.indent(`${objKey(k)}: {`, lv));
          printObject(v, lv + 1);
          code.push(i.indent('},', lv));
        } else {
          code.push(i.indent(`${objKey(k)}: ${esc(v)},`, lv));
        }
      }
    }
    printObject(tokens);

    code.push('};', '');
    return code.join('\n');
  }

  function printTokensFlatExport(schemaTokens: ParsedToken[]): string {
    let code = ['export const tokensFlat = {'];
    const i = new Indenter();
    for (const token of schemaTokens) {
      code.push(i.indent(`${objKey(token.id)}: ${esc((typeof options?.transform === 'function' && options?.transform(token)) || token.$value)},`, 1));
    }
    code.push('};', '');
    return code.join('\n');
  }

  function printModesExport(schemaTokens: ParsedToken[]): string {
    let code = ['export const modes = {'];

    for (const token of schemaTokens) {
      if (!token.$extensions || !token.$extensions.mode) continue;
      const i = new Indenter();
      code.push(i.indent(`${objKey(token.id)}: {`, 1));
      for (const [modeName, modeVal] of Object.entries(token.$extensions.mode)) {
        code.push(i.indent(`${objKey(modeName)}: ${esc((typeof options?.transform === 'function' && options?.transform(token, modeName)) || modeVal)},`, 2));
      }
      code.push(i.indent('},', 1));
    }

    code.push('};', '');
    return code.join('\n');
  }

  function printAltFunction(): string {
    return `/** Get mode value */
export function mode(tokenID: keyof typeof modes, modeName: keyof typeof modes[typeof tokenID]): typeof modes[typeof tokenID] {
  return modes[tokenID][modeName] as any;
}
`;
  }

  return {
    name: '@cobalt-ui/plugin-ts',
    async build({tokens}): Promise<BuildResult[]> {
      let code = [printTokensExport(tokens), printTokensFlatExport(tokens), printModesExport(tokens), printAltFunction()];
      return [
        {
          filename,
          contents: `${code.join('\n').trim()}\n`,
        },
      ];
    },
  };
}
