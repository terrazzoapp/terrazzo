import type { Plugin } from '@terrazzo/parser';
import buildCSS from './build/index.js';
import { type CSSPluginOptions, FILE_PREFIX, FORMAT_ID } from './lib.js';
import transformCSS from './transform.js';

export * from './build/index.js';
export * from './lib.js';
export * from './transform.js';

export default function cssPlugin(options?: CSSPluginOptions): Plugin {
  const { utility, skipBuild, baseScheme } = options ?? {};

  const filename = options?.filename ?? (options as any)?.fileName ?? 'index.css';
  const baseSelector = options?.baseSelector ?? ':root';

  return {
    name: '@terrazzo/plugin-css',
    config(_config, context) {
      if (options?.permutations && (options?.modeSelectors || options?.baseSelector || options?.baseScheme)) {
        context.logger.error({
          group: 'plugin',
          label: '@terrazzo/plugin-css',
          message: 'Permutations option is incompatible with modeSelectors, baseSelector, and baseScheme.',
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
    async build({ getTransforms, outputFile, context }) {
      if (skipBuild === true) {
        return;
      }

      let contents = `${FILE_PREFIX}\n\n`;
      contents += buildCSS({
        exclude: options?.exclude,
        getTransforms,
        permutations: options?.permutations,
        modeSelectors: options?.modeSelectors,
        utility,
        baseSelector,
        baseScheme,
        logger: context.logger,
      });
      outputFile(filename, contents.replace(/\n*$/, '\n'));
    },
  };
}
