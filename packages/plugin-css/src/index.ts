import type { Plugin } from '@terrazzo/parser';
import buildCSS from './build.js';
import { type CSSPluginOptions, FILE_PREFIX, PLUGIN_NAME } from './lib.js';
import transformCSS from './transform.js';

export * from './build.js';
export {
  type CSSDeclaration,
  type CSSPluginOptions,
  type CSSRule,
  FILE_PREFIX,
  FORMAT_ID,
  type ModeSelector,
  type Permutation,
  PLUGIN_NAME,
  printNode,
  printRules,
  type UtilityCSSGroup,
  type UtilityCSSPrefix,
} from './lib.js';
export * from './transform.js';
export * from './utility-css.js';

export default function cssPlugin(options?: CSSPluginOptions): Plugin {
  const { utility, skipBuild, baseScheme } = options ?? {};

  const filename = options?.filename ?? (options as any)?.fileName ?? 'index.css';
  const baseSelector = options?.baseSelector ?? ':root';

  return {
    name: PLUGIN_NAME,
    config(_config, context) {
      if (options?.permutations && (options?.modeSelectors || options?.baseSelector || options?.baseScheme)) {
        context.logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message: 'Permutations option is incompatible with modeSelectors, baseSelector, and baseScheme.',
        });
      }
    },
    async transform(transformOptions) {
      transformCSS({ transform: transformOptions, options: options ?? {} });
    },
    async build({ getTransforms, outputFile, context }) {
      if (skipBuild === true) {
        return;
      }

      let contents = `${FILE_PREFIX}\n\n`;
      contents += buildCSS({
        include: options?.include,
        exclude: options?.exclude,
        getTransforms,
        permutations: options?.permutations,
        modeSelectors: options?.modeSelectors,
        utility,
        baseSelector,
        baseScheme,
        logger: context.logger,
        omitTypographyShorthand: options?.omitTypographyShorthand,
      });
      outputFile(filename, contents.replace(/\n*$/, '\n'));
    },
  };
}
