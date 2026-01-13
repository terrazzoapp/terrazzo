import type { Plugin } from '@terrazzo/parser';
import buildFormat from './build/index.js';
import { type CSSPluginOptions, FILE_PREFIX, FORMAT_ID, legacyTransform } from './lib.js';

export * from './build/index.js';
export * from './lib.js';

export default function cssPlugin(options?: CSSPluginOptions): Plugin {
  const { exclude, contextSelectors, modeSelectors, utility, skipBuild, baseColorScheme, baseContext } = options ?? {};

  const filename = options?.filename ?? (options as any)?.fileName ?? 'index.css';
  const baseSelector = options?.baseSelector ?? ':root';

  return {
    name: '@terrazzo/plugin-css',
    config(_config, context) {
      if (contextSelectors && modeSelectors) {
        context.logger.error({
          group: 'plugin',
          label: '@terrazzo/plugin-css',
          message: 'Must provide either contextSelectors or modeSelectors, not both.',
        });
      }
    },
    async transform(ctx) {
      // skip work if another .css plugin has already run
      const cssTokens = ctx.getTransforms({ format: FORMAT_ID, id: '*', mode: '*' });
      if (cssTokens.length) {
        return;
      }

      // handle legacy behavior
      if (modeSelectors) {
        legacyTransform(ctx, options);
        return;
      }

      // Resolvers
      if (contextSelectors) {
        return;
      }

      // Basic output
    },
    async build({ getTransforms, outputFile }) {
      if (skipBuild === true) {
        return;
      }

      const output: string[] = [FILE_PREFIX, ''];
      output.push(
        buildFormat({
          exclude,
          getTransforms,
          contextSelectors,
          modeSelectors,
          utility,
          baseSelector,
          baseColorScheme,
        }),
        '\n', // EOF newline
      );
      outputFile(filename, output.join('\n'));
    },
  };
}
