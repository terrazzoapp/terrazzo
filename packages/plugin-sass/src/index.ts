import type { BuildResult, FileOrURL, Group, Plugin, Token, TokenManifest, TokenType } from '@cobalt-ui/core';

import file from './file.js';
import group from './group.js';
import token from './token.js';
import url from './url.js';

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
  let index = './index.scss' || (options && options.filename);
  return {
    name: '@cobalt-ui/plugin-sass',
    async build(manifest: TokenManifest): Promise<BuildResult[]> {
      const output: Record<string, string> = { [index]: '' };
      JSON.stringify(manifest.tokens, (k, v) => {
        if (!v.type) return v;
        switch (v.type as TokenType) {
          case 'token': {
            output[index] += token(k, v as Token);
            break;
          }
          case 'group': {
            output[index] += group(k, v as Group);
            break;
          }
          case 'file': {
            output[index] += file(k, v as FileOrURL);
            break;
          }
          case 'url': {
            output[index] += url(k, v as FileOrURL);
            break;
          }
        }
        return v;
      });
      return Object.entries(output).map(([fileName, contents]) => [{ fileName, contents }]);
    },
  };
}
