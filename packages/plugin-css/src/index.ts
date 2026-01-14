import type { Plugin } from '@terrazzo/parser';
import buildCSS from './build/index.js';
import { type CSSPluginOptions, FILE_PREFIX, FORMAT_ID } from './lib.js';
import transformCSS from './transform.js';

export * from './build/index.js';
export * from './lib.js';
export * from './transform.js';

export default function cssPlugin(options?: CSSPluginOptions): Plugin {
  const { utility, skipBuild, baseColorScheme } = options ?? {};

  const filename = options?.filename ?? (options as any)?.fileName ?? 'index.css';
  const baseSelector = options?.baseSelector ?? ':root';

  return {
    name: '@terrazzo/plugin-css',
    config(_config, context) {
      if (options?.contextSelectors && options?.modeSelectors) {
        context.logger.error({
          group: 'plugin',
          label: '@terrazzo/plugin-css',
          message: 'Must provide either contextSelectors or modeSelectors, not both.',
        });
      }
    },
    async transform(transformOptions) {
      // skip work if another .css plugin has already run
      const cssTokens = transformOptions.getTransforms({ format: FORMAT_ID, id: '*' });
      if (cssTokens.length) {
        return;
      }
      transformCSS({ transform: transformOptions, options: options ?? {} });
    },
    async build({ getTransforms, outputFile }) {
      if (skipBuild === true) {
        return;
      }

      let contents = `${FILE_PREFIX}\n\n`;
      contents += buildCSS({
        exclude: options?.exclude,
        getTransforms,
        contextSelectors: options?.contextSelectors,
        modeSelectors: options?.modeSelectors,
        utility,
        baseSelector,
        baseColorScheme,
      });
      outputFile(filename, contents.replace(/\n*$/, '\n'));
    },
  };
}
