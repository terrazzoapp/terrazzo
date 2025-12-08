import type { Plugin } from '@terrazzo/parser';
import { buildDTS, buildJS } from './build.js';
import { DEFAULT_PROPERTIES, type JSPluginOptions } from './lib.js';

export * from './build.js';
export * from './lib.js';

export default function pluginJS({
  filename = 'index.js',
  properties: userProperties,
  contexts,
}: JSPluginOptions = {}): Plugin {
  const entry = { group: 'plugin' as const, label: '@terrazzo/plugin-js' };

  return {
    name: '@terrazzo/plugin-js',
    config(_, context) {
      if (Array.isArray(userProperties) && !userProperties.length) {
        context.logger.error({ ...entry, message: 'properties option can’t be empty' });
      }
    },

    // As of 2.0, this plugin no longer pre-transforms values, because every instance
    // generates a unique output.
    async build({ resolver, outputFile, context }) {
      const properties = userProperties ? new Set(userProperties) : DEFAULT_PROPERTIES;
      const { code: js, typeMap } = buildJS({
        resolver,
        contexts,
        properties,
        logger: context.logger,
      });
      outputFile(filename, js);

      const dts = buildDTS({ resolver, contexts, properties, typeMap });
      const dtsFilename = typeof filename === 'string' ? filename.replace(/\.(c|m)?js$/, '.d.$1ts') : 'index.d.ts';
      outputFile(dtsFilename, dts);
    },
  };
}
