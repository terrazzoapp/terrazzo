import type { BuildResult, Plugin, Token } from '@cobalt-ui/core';

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
  /** modify values */
  transformValue?: (token: Token, mode?: string) => any;
}

export default function json(options?: Options): Plugin {
  let filename = options?.filename || './tokens.json';
  let transform = options?.transformValue;

  return {
    name: '@cobalt-ui/plugin-json',
    async build({ tokens }): Promise<BuildResult[]> {
      return [
        {
          filename,
          contents: JSON.stringify(
            tokens,
            (_, token) => {
              // apply transformValue()
              if (transform && typeof token.$type == 'string') {
                token.$value = transform(token);
                for (const mode of Object.keys((token.$extensions && token.$extensions.mode) || {})) {
                  token.$extensions.mode[mode] = transform(token, mode);
                }
              }
              return token;
            },
            2
          ),
        },
      ];
    },
  };
}
