import type { Plugin } from '@terrazzo/parser';
import { transformJSValue } from '@terrazzo/token-tools/js';
import { FORMAT_DTS_ID, FORMAT_JS_ID, TYPE_MAP, type JSPluginOptions } from './lib.js';
import { buildDTS, buildJS } from './build.js';

export * from './build.js';
export * from './lib.js';

export default function pluginJS(options?: JSPluginOptions): Plugin {
  const customTransform = options?.transform;

  return {
    name: '@terrazzo/plugin-js',
    async transform({ tokens, getTransforms, setTransform }) {
      // skip work if another .js plugin has already run
      const jsTokens = getTransforms({ format: FORMAT_JS_ID, id: '*', mode: '.' });
      if (jsTokens.length) {
        return;
      }

      for (const id in tokens) {
        const token = tokens[id]!;

        // .d.ts (only default "." mode needed)
        setTransform(id, {
          format: FORMAT_DTS_ID,
          value: {
            description: token.$description,
            value: `Record<"${Object.keys(token.mode).join('" | "')}", ${TYPE_MAP[token.$type]}["$value"]>`,
          },
          mode: '.',
        });

        // .js (all modes)
        for (const mode in token.mode) {
          if (customTransform) {
            const transformedValue = customTransform(token, mode);
            if (transformedValue !== undefined && transformedValue !== null) {
              setTransform(id, { format: FORMAT_JS_ID, value: transformedValue, mode });
              continue;
            }
          }
          const transformedValue = transformJSValue(token, { mode, startingIndent: 4 });
          if (transformedValue !== undefined) {
            setTransform(id, { format: FORMAT_JS_ID, value: transformedValue, mode });
          }
        }
      }
    },
    async build({ getTransforms, outputFile }) {
      // if (options?.json) {
      //   const contents = buildJSON({ getTransforms });
      //   outputFile(typeof options?.json === 'string' ? options.json : 'index.json', contents);
      // }
      if (options?.js) {
        const js = buildJS({ getTransforms });
        const jsFilename = typeof options?.js === 'string' ? options.js : 'index.js';
        outputFile(jsFilename, js);

        const dts = buildDTS({ getTransforms });
        const dtsFilename = typeof options?.js === 'string' ? options.js.replace(/\.js$/, '.d.ts') : 'index.d.ts';
        outputFile(dtsFilename, dts);
      }
    },
  };
}
