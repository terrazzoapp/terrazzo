import type { Plugin } from '@terrazzo/parser';
import { type TokenNormalized, validateCustomTransform } from '@terrazzo/token-tools';
import { generateShorthand, makeCSSVar, transformCSSValue } from '@terrazzo/token-tools/css';
import buildFormat from './build/index.js';
import { type CSSPluginOptions, FILE_PREFIX, FORMAT_ID } from './lib.js';

export * from './build/index.js';
export * from './lib.js';

export default function cssPlugin(options?: CSSPluginOptions): Plugin {
  const {
    exclude,
    variableName,
    modeSelectors,
    transform: customTransform,
    utility,
    legacyHex,
    skipBuild,
  } = options ?? {};

  const filename = options?.filename ?? (options as any)?.fileName ?? 'index.css';
  const baseSelector = options?.baseSelector ?? ':root';

  function transformName(token: TokenNormalized) {
    const customName = variableName?.(token);
    if (customName !== undefined) {
      if (typeof customName !== 'string') {
        throw new Error(`variableName() must return a string; received ${customName}`);
      }
      return customName;
    }
    return makeCSSVar(token.id);
  }
  const transformAlias = (token: TokenNormalized) => `var(${transformName(token)})`;

  return {
    name: '@terrazzo/plugin-css',
    async transform({ tokens, getTransforms, setTransform }) {
      // skip work if another .css plugin has already run
      const cssTokens = getTransforms({ format: FORMAT_ID, id: '*', mode: '*' });
      if (cssTokens.length) {
        return;
      }

      for (const [id, token] of Object.entries(tokens)) {
        const localID = transformName(token);
        for (const mode of Object.keys(token.mode)) {
          if (customTransform) {
            const value = customTransform(token, mode);
            if (value !== undefined && value !== null) {
              validateCustomTransform(value, { $type: token.$type });
              setTransform(id, {
                format: FORMAT_ID,
                localID,
                value,
                mode,
                meta: { 'token-listing': { name: localID } },
              });
              continue;
            }
          }

          const transformedValue = transformCSSValue(token, {
            mode,
            tokensSet: tokens,
            transformAlias,
            color: { legacyHex },
          });
          if (transformedValue !== undefined) {
            let listingName: string | undefined = localID;

            // Composite tokens without a shorthand won't get generated in the output, so we don't list them.
            if (typeof transformedValue === 'object' && generateShorthand({ $type: token.$type, localID }) === undefined) {
              listingName = undefined;
            }

            setTransform(id, {
              format: FORMAT_ID,
              localID,
              value: transformedValue,
              mode,
              meta: { 'token-listing': { name: listingName } },
            });
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
        buildFormat({ exclude, getTransforms, modeSelectors, utility, baseSelector }),
        '\n', // EOF newline
      );
      outputFile(filename, output.join('\n'));
    },
  };
}
