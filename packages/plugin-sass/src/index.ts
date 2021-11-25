import type { BuildResult, GroupNode, Plugin, SchemaNode, TokenSchema } from '@cobalt-ui/core';

import { encode } from './util.js';

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

  return {
    name: '@cobalt-ui/plugin-sass',
    async build({ schema }: { schema: TokenSchema }): Promise<BuildResult[]> {
      let code: string[] = [];

      function buildGroup(group: GroupNode): void {
        if (group.name || group.description) code.push(`// -----------------`);
        if (group.name) code.push(`//  ${group.name}`);
        if (group.description) code.push(`//  ${group.description}`);
        if (group.name || group.description) code.push(`// -----------------`, '');

        for (const v of Object.values(group.tokens)) {
          const id = namer(v.id.split('.'));
          switch (v.type) {
            case 'token':
              code.push(`$${id}: ${transform(v.value.default, v)};`);
              break;
            case 'file':
              code.push(`$${id}: ${encode(transform(v.value.default, v))};`);
              break;
            case 'url':
              code.push(`$${id}: url('${transform(v.value.default, v)}');`);
              break;
            case 'group':
              buildGroup(v);
              break;
          }
        }
      }

      buildGroup(schema as any as GroupNode);

      return [{ fileName, contents: code.join('\n') }];
    },
  };
}

function defaultTransformer(value: any): any {
  return value;
}

function defaultNamer(namespaces: string[]): string {
  return namespaces.join('__');
}
