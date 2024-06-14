import type { Plugin } from '@terrazzo/parser';
import build from './build.js';
import type { SassPluginOptions } from './lib.js';

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
    async build({ getTransforms, outputFile }) {
      const output = build({ getTransforms, options });
      outputFile(filename, output);
    },
  };
}
