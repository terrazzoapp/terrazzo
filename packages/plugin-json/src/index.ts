import type { BuildResult, Plugin, SchemaNode } from '@cobalt-ui/core';

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
  transformValue?: (value: any, token: SchemaNode) => any;
}

export default function json(options?: Options): Plugin {
  let fileName = options?.filename || './tokens.json';
  let transform = options?.transformValue;

  return {
    name: '@cobalt-ui/plugin-json',
    async build({ schema }): Promise<BuildResult[]> {
      return [
        {
          fileName,
          contents: JSON.stringify(
            schema,
            (_, v) => {
              // prevent circular refs for JSON
              if (v.group) delete v.group;

              // apply transformValue()
              if (transform && (v.type === 'token' || v.type === 'url' || v.type === 'file') && typeof v.value === 'object') {
                if (Array.isArray(v.value)) {
                  for (let n = 0; n < v.value.length; n++) {
                    v.value[n] = transform(v.value[n], v);
                  }
                } else {
                  for (const k of Object.keys(v.value)) {
                    v.value[k] = transform(v.value[k], v);
                  }
                }
              }
              return v;
            },
            2
          ),
        },
      ];
    },
  };
}
