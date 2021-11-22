import type { BuildResult, Plugin } from '@cobalt-ui/core';

export interface JSONOutput {
  name?: string;
  tokens: JSONTokens;
  mode: JSONMode;
  groups: Record<string, JSONGroup>;
}

export type JSONTokens = Record<string, string | number>;

export type JSONMode = Record<string, JSONTokens>;

export interface JSONGroup {
  tokens: string[];
}

export interface Options {
  /** output file (default: "./tokens/tokens.json") */
  filename?: string;
}

/** Generate JSON from token manifest  */
export default function json(options?: Options): Plugin {
  let fileName = (options && options.filename) || './tokens.json';

  return {
    name: '@cobalt-ui/plugin-json',
    async build({ schema }): Promise<BuildResult[]> {
      return [
        {
          fileName,
          contents: JSON.stringify(
            schema,
            (_, v) => {
              if (v.group) delete v.group;
              return v;
            },
            2
          ),
        },
      ];
    },
  };
}
