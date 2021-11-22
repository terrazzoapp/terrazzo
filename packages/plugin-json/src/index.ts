import type { BuildResult, Plugin } from '@cobalt-ui/core';

export interface Options {
  /** output file (default: "./tokens/tokens.json") */
  filename?: string;
  /** JSON.stringify replacer (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter) */
  replacer?: ((this: any, key: string, value: any) => any) | undefined;
  /** JSON.stringify space (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_space_argument) */
  space?: string | number;
}

/** Generate JSON from token manifest  */
export default function json(options?: Options): Plugin {
  let fileName = (options && options.filename) || './tokens.json';
  let replacer = (options && options.replacer) || undefined;
  let space = options && options.space !== undefined ? options.space : 2;
  return {
    name: '@cobalt-ui/plugin-json',
    async build(manifest): Promise<BuildResult[]> {
      return [{ fileName, contents: JSON.stringify(manifest, replacer, space) }];
    },
  };
}
