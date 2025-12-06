import type { Plugin } from '@terrazzo/parser';
import { buildDTS, buildJS } from './build.js';
import { DEFAULT_PROPERTIES, type JSPluginOptions } from './lib.js';

export * from './build.js';
export * from './lib.js';

export default function pluginJS(options?: JSPluginOptions): Plugin {
  const entry = { group: 'plugin' as const, label: '@terrazzo/plugin-js' };

  return {
    name: '@terrazzo/plugin-js',
    config(_, context) {
      if (Array.isArray(options?.properties) && !options.properties.length) {
        context.logger.error({ ...entry, message: 'properties option can’t be empty' });
      }
    },
    // As of 2.0, this plugin no longer pre-transforms values, because every instance
    // generates a unique output.
    async build({ resolver, outputFile, context }) {
      const js = buildJS({
        resolver,
        contexts: options?.contexts,
        properties: options?.properties ? new Set(options.properties) : DEFAULT_PROPERTIES,
        logger: context.logger,
      });
      const jsFilename = typeof options?.filename === 'string' ? options.filename : 'index.js';
      outputFile(jsFilename, js);

      const dts = buildDTS({ resolver, contexts: options?.contexts });
      const dtsFilename =
        typeof options?.filename === 'string' ? options.filename.replace(/\.(c|m)?js$/, '.d.$1ts') : 'index.d.ts';
      outputFile(dtsFilename, dts);
    },
  };
}
