import type { Plugin } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import { FILE_PREFIX, FORMAT_ID, type CSSPluginOptions } from './lib.js';
import transformValue from './transform.js';
import buildFormat from './build.js';

export * from './lib.js';

export default function cssPlugin({
  filename = './index.css',
  exclude,
  variableName,
  modeSelectors,
  transform: customTransform,
}: CSSPluginOptions = {}): Plugin {
  const transformName = (id: string) => variableName?.(id) || makeCSSVar(id);
  const transformAlias = (id: string) => `var(${transformName(id)})`;

  return {
    name: '@terrazzo/plugin-css',
    async transform({ tokens, getTransforms, setTransform }) {
      // skip work if another .css plugin has already run
      const cssTokens = getTransforms({ format: FORMAT_ID, id: '*', mode: '*' });
      if (cssTokens.length) {
        return;
      }

      for (const id in tokens) {
        if (!Object.hasOwn(tokens, id)) {
          continue;
        }
        transformValue(tokens[id]!, {
          id,
          localID: transformName(id),
          setTransform,
          transformAlias,
          customTransform,
        });
      }
    },
    async build({ getTransforms, outputFile }) {
      const output: string[] = [FILE_PREFIX, ''];
      output.push(
        buildFormat({ exclude, getTransforms, modeSelectors }),
        '\n', // EOF newline
      );
      outputFile(filename, output.join('\n'));
    },
  };
}
