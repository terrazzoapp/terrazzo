import type { Plugin } from '@terrazzo/parser';

import { buildDTS, buildJS } from './build.js';
import { DEFAULT_PROPERTIES, FORMAT_ID, type JSPluginOptions } from './lib.js';

export * from './build.js';
export * from './lib.js';

/* oxlint-disable require-await */

export default function pluginJS({
  filename = 'index.js',
  properties: userProperties,
  contexts,
}: JSPluginOptions = {}): Plugin {
  const entry = { group: 'plugin' as const, label: '@terrazzo/plugin-js' };

  return {
    name: '@terrazzo/plugin-js',
    config(_, context) {
      if (Array.isArray(userProperties) && userProperties.length === 0) {
        context.logger.error({ ...entry, message: 'properties option can’t be empty' });
      }
    },

    // Register a JS-access-expression transform for each token so consumers
    // (notably plugin-token-listing) can look up the identifier a token has
    // in the generated JS module. plugin-js doesn't pre-transform values
    // (see `build` below), so the `value` field mirrors the access expression
    // rather than carrying a separately-resolved literal.
    async transform({ tokens, setTransform }) {
      for (const id of Object.keys(tokens)) {
        const accessor = `tokens[${JSON.stringify(id)}]`;
        setTransform(id, {
          format: FORMAT_ID,
          localID: id,
          value: accessor,
          meta: { 'token-listing': { name: accessor } },
        });
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
      const dtsFilename =
        typeof filename === 'string' ? filename.replace(/\.(c|m)?js$/, '.d.$1ts') : 'index.d.ts';
      outputFile(dtsFilename, dts);
    },
  };
}
