import type { Plugin } from '@terrazzo/parser';
import { FORMAT_ID, type JSPluginOptions } from './lib.js';
import { buildDTS, buildJS, buildJSON } from './build.js';
import transformValue from './transform.js';

export * from './lib.js';

export default function pluginJS(options?: JSPluginOptions): Plugin {
  const customTransform = options?.transform;

  return {
    name: '@terrazzo/plugin-js',
    async transform({ tokens, getTransforms, setTransform }) {
      // skip work if another .js plugin has already run
      const jsTokens = getTransforms({ format: FORMAT_ID, id: '*', mode: '.' });
      if (jsTokens.length) {
        return;
      }

      for (const id in tokens) {
        if (!Object.hasOwn(tokens, id)) {
          continue;
        }
        transformValue(tokens[id]!, {
          id,
          setTransform,
          customTransform,
        });
      }
    },
    async build({ getTransforms, outputFile }) {
      if (options?.json) {
        const contents = buildJSON({ getTransforms });
        outputFile(typeof options?.json === 'string' ? options.json : 'index.json', contents);
      }
      if (options?.js) {
        const js = buildJS({ getTransforms });
        const jsFilename = typeof options?.js === 'string' ? options.js : 'index.js';
        outputFile(jsFilename, js);
        const dts = buildDTS({ getTransforms });
        const dtsFilename = typeof options?.js === 'string' ? options.js.replace(/\.js$/, '.dts') : 'index.d.ts';
        outputFile(dtsFilename, dts);
      }
    },
  };
}
