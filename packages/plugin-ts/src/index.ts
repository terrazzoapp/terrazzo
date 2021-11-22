import type { BuildResult, Plugin } from '@cobalt-ui/core';

export interface Options {
  /** output file (default: "./index.ts") */
  filename?: string;
}

/** Generate JSON from  */
export default function ts(options?: Options): Plugin {
  let fileName = './index.ts' || (options && options.filename);
  return {
    name: '@cobalt-ui/plugin-ts',
    async build(manifest): Promise<BuildResult[]> {
      return [{ fileName, contents: JSON.stringify(manifest) }];
    },
  };
}
