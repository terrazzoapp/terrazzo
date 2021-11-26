import type { BuildResult, FileNode, GroupNode, Plugin, SchemaNode, TokenNode, TokenSchema, URLNode } from '@cobalt-ui/core';

import { Indenter } from '@cobalt-ui/utils';
import { encode } from './util.js';

const MODE_MAP = '-cobalt_token_modes';

export interface Options {
  /** output file (default: "./tokens/index.sass") */
  filename?: string;
  /** use indented syntax (.sass)? (default: false) */
  indentedSyntax?: boolean;
  /** modify values */
  transformValue?: (value: any, token: SchemaNode) => any;
  /** rename variables */
  transformVariables?: (namespaces: string[]) => string;
}

export default function sass(options?: Options): Plugin {
  let ext = options?.indentedSyntax ? '.sass' : '.scss';
  let fileName = `${options?.filename?.replace(/(\.(sass|scss))?$/, '') || 'index'}${ext}`;
  let transform = options?.transformValue || defaultTransformer;
  let namer = options?.transformVariables || defaultNamer;
  const semi = options?.indentedSyntax ? '' : ';';
  const i = new Indenter();

  function generateModeFn(): string {
    return `@function mode($token, $modeName) {
  $mode: map.get($${MODE_MAP}, $token)${semi}
  @return map.get($mode, $modeName)${semi}
}`;
  }

  function getVal(token: TokenNode<string> | FileNode | URLNode, mode?: string): string {
    const value = mode ? token.value[mode] : token.value.default;
    switch (token.type) {
      case 'file':
        return encode(transform(value, token));
      case 'url':
        return `url('${transform(value, token)}')`;
      case 'token':
        return transform(value, token);
    }
  }

  return {
    name: '@cobalt-ui/plugin-sass',
    async build({ schema }: { schema: TokenSchema }): Promise<BuildResult[]> {
      function buildGroup(group: GroupNode, modes?: GroupNode['modes']): void {
        if (group.name || group.description) defaults.push(`// -----------------`);
        if (group.name) defaults.push(`//  ${group.name}`);
        if (group.description) defaults.push(`//  ${group.description}`);
        if (group.name || group.description) defaults.push(`// -----------------`, '');

        for (const token of Object.values(group.tokens)) {
          const id = namer(token.id.split('.'));
          switch (token.type) {
            case 'token':
            case 'file':
            case 'url': {
              if (modes && modes.length) {
                for (const modeName of modes) {
                  if (!modeVals[id]) modeVals[id] = {};
                  modeVals[id][modeName] = getVal(token, modeName);
                }
              }
              defaults.push(`$${id}: ${getVal(token)}${semi}`);
              break;
            }
            case 'group': {
              buildGroup(token, token.modes || modes); // important: make sure "modes" cascades through groups until overwritten
              break;
            }
          }
        }
      }

      // 1. gather default values and modes
      let imports = [`@use "sass:map"${semi}`];
      let defaults: string[] = [];
      let modeVals: Record<string, Record<string, any>> = {};
      buildGroup(schema as any as GroupNode);

      // 2. render modes data
      let modeOutput: string[] = [`$${MODE_MAP}: (`];
      for (const [id, modes] of Object.entries(modeVals)) {
        modeOutput.push(i.indent(`$${id}: (`, 1));
        for (const [name, val] of Object.entries(modes)) {
          modeOutput.push(i.indent(`${name}: ${val},`, 2));
        }
        modeOutput.push(i.indent('),', 1));
      }
      modeOutput.push(`)${semi}`);

      // 3. finish
      let code = [...imports, '', ...defaults, ...modeOutput, '', generateModeFn()].join('\n');
      return [{ fileName, contents: code }];
    },
  };
}

function defaultTransformer(value: any): any {
  return value;
}

function defaultNamer(namespaces: string[]): string {
  return namespaces.join('__');
}
