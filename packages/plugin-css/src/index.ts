import type { Plugin } from '@terrazzo/parser';
import { makeCSSVar, transformCSSValue } from '@terrazzo/token-tools/css';
import { FILE_PREFIX, FORMAT_ID, type CSSPluginOptions } from './lib.js';
import buildFormat from './build.js';
import { validateCustomTransform } from '@terrazzo/token-tools';

export * from './build.js';
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
        const token = tokens[id]!;
        const localID = transformName(id);
        for (const mode in token.mode) {
          if (customTransform) {
            const value = customTransform(token, mode);
            if (value !== undefined && value !== null) {
              validateCustomTransform(value, { $type: token.$type });
              setTransform(id, { format: FORMAT_ID, localID, value, mode });
              continue;
            }
          }

          const transformedValue = transformCSSValue(token, { mode, transformAlias });
          if (transformedValue !== undefined) {
            setTransform(id, { format: FORMAT_ID, localID, value: transformedValue, mode });
          }
        }
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
