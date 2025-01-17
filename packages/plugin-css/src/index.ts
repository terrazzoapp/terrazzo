import type { Plugin } from '@terrazzo/parser';
import { validateCustomTransform } from '@terrazzo/token-tools';
import { makeCSSVar, transformCSSValue } from '@terrazzo/token-tools/css';
import buildFormat from './build/index.js';
import { type CSSPluginOptions, FILE_PREFIX, FORMAT_ID } from './lib.js';

export * from './build/index.js';
export * from './lib.js';

export default function cssPlugin({
  filename = './index.css',
  exclude,
  variableName,
  modeSelectors,
  transform: customTransform,
  utility,
  legacyHex,
  skipBuild,
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

      for (const [id, token] of Object.entries(tokens)) {
        const localID = transformName(id);
        for (const mode of Object.keys(token.mode)) {
          if (customTransform) {
            const value = customTransform(token, mode);
            if (value !== undefined && value !== null) {
              validateCustomTransform(value, { $type: token.$type });
              setTransform(id, { format: FORMAT_ID, localID, value, mode });
              continue;
            }
          }

          const transformedValue = transformCSSValue(token, { mode, transformAlias, color: { legacyHex } });
          if (transformedValue !== undefined) {
            setTransform(id, { format: FORMAT_ID, localID, value: transformedValue, mode });
          }
        }
      }
    },
    async build({ getTransforms, outputFile }) {
      if (skipBuild === true) {
        return;
      }

      const output: string[] = [FILE_PREFIX, ''];
      output.push(
        buildFormat({ exclude, getTransforms, modeSelectors, utility }),
        '\n', // EOF newline
      );
      outputFile(filename, output.join('\n'));
    },
  };
}
