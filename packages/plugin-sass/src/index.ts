import type { Plugin } from '@terrazzo/parser';
import { FORMAT_ID as CSS_FORMAT_ID } from '@terrazzo/plugin-css';
import build from './build.js';
import { FORMAT_ID, type SassPluginOptions } from './lib.js';

export * from './build.js';
export * from './lib.js';
export * from './node.js';

export default function pluginSass(options?: SassPluginOptions): Plugin {
  const filename = options?.filename ?? 'index.scss';

  return {
    name: '@terrazzo/plugin-sass',
    enforce: 'post',
    config(config) {
      // plugin-css is required for transforms. throw error
      if (!config.plugins.some((p) => p.name === '@terrazzo/plugin-css')) {
        throw new Error(
          `@terrazzo/plugin-sass relies on @terrazzo/plugin-css.
Please install @terrazzo/plugin-css and follow setup to add to your config.`,
        );
      }
    },

    async transform({ getTransforms, setTransform }) {
      const tokens = getTransforms({ format: CSS_FORMAT_ID });
      for (const token of tokens) {
        const value = `var(${token.localID})`;
        let listingName = `token("${token.token.id}")`;
        if (token.token.$type === 'typography') {
          listingName =
            token.mode !== '.' ? `typography("${token.token.id}", "${token.mode}")` : `typography("${token.token.id}")`;
        }
        setTransform(token.id, {
          format: FORMAT_ID,
          localID: token.id,
          value,
          mode: token.mode,
          meta: { 'token-listing': { name: listingName } },
        });
      }
    },

    async build({ getTransforms, outputFile }) {
      const output = await build({ getTransforms, options });
      outputFile(filename, output);
    },
  };
}
