import type { BuildResult, GroupNode, Plugin } from '@cobalt-ui/core';

import { encode } from './util.js';

export interface Options {
  /** output file (default: "./tokens/index.sass") */
  filename?: string;
  /** use indented syntax (.sass)? (default: false) */
  indentedSyntax?: boolean;
  /** indentation character (default: 'space') */
  indentType?: 'space' | 'tab';
  /** number of spaces/tabs for indent (default: 2) */
  indentWidth?: number;
}

/** Generate JSON from  */
export default function sass(options?: Options): Plugin {
  let index = (options && options.filename) || '';
  return {
    name: '@cobalt-ui/plugin-sass',
    async build({ schema }): Promise<BuildResult[]> {
      const result: BuildResult[] = [];

      /** convert GroupToken into .scss file */
      function buildSass(fileName: string, group: GroupNode, isPartial = false): void {
        let code: string[] = [];
        if (group.name || group.description) code.push(`// -----------------`);
        if (group.name) code.push(`//  ${group.name}`);
        if (group.description) code.push(`//  ${group.description}`);
        if (group.name || group.description) code.push(`// -----------------`, '');

        // @use first
        for (const [k, v] of Object.entries(group.tokens)) {
          if (v.type !== 'group') continue;
          const next = fileName ? `${fileName}/${k}` : k;
          code.push(`@use "${next}";`);
          buildSass(`${next}`, v, true);
        }

        // $variables second
        for (const [k, v] of Object.entries(group.tokens)) {
          switch (v.type) {
            case 'token':
              code.push(`$${k}: ${v.value.default};`);
              break;
            case 'file':
              code.push(`$${k}: ${encode(v.value.default)};`);
              break;
            case 'url':
              code.push(`$${k}: url('${v.value.default}');`);
              break;
            case 'group':
              // no-op
              break;
          }
        }

        let finalName = fileName ? `${fileName}.scss` : 'index.scss';
        if (isPartial) {
          const parts = finalName.split('/');
          const basename = `_${parts.pop()}`;
          finalName = parts.concat(basename).join('/');
        }
        result.push({ fileName: finalName, contents: code.join('\n') });
      }

      buildSass(index, schema as any as GroupNode);

      return result;
    },
  };
}
