import type {BuildResult, Plugin, Token} from '@cobalt-ui/core';

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
  transform?: (token: Token, mode?: string) => string;
}

export default function json(options?: Options): Plugin {
  let filename = options?.filename || './tokens.json';
  return {
    name: '@cobalt-ui/plugin-json',
    async build({tokens}): Promise<BuildResult[]> {
      const transformedTokens = tokens.map((token) => {
        if (typeof options?.transform === 'function') {
          token.$value = options.transform(token) || token.$value;
          const $extensions = token.$extensions;
          for (const mode of Object.keys(($extensions && $extensions.mode) || {})) {
            (token.$extensions as any).mode[mode] = options.transform(token, mode) || (token.$extensions as any).mode[mode];
          }
        }
        return token;
      });
      return [
        {
          filename,
          contents: JSON.stringify(transformedTokens, undefined, 2),
        },
      ];
    },
  };
}
