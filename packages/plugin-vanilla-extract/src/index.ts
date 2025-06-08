import type { Plugin } from '@terrazzo/parser';
import { FORMAT_ID as FORMAT_CSS } from '@terrazzo/plugin-css';
import { camelCase } from 'scule';
import {
  FORMAT_ID as FORMAT_VANILLA,
  VE,
  type VanillaExtractPluginOptions,
  generateTheme,
  generateThemeContract,
  isJSIdent,
} from './lib.js';

export * from './lib.js';

export default function vanillaExtractPlugin(options: VanillaExtractPluginOptions): Plugin {
  const filename = options.filename ?? 'theme.css.ts';
  const globalThemeContract = options.globalThemeContract ?? true;

  return {
    name: '@terrazzo/plugin-vanilla-extract',
    enforce: 'post', // ensure this comes after @terrazzo/plugin-css
    config(config) {
      if (!config.plugins.some((p) => p.name === '@terrazzo/plugin-css')) {
        throw new Error(
          '@terrazzo/plugin-css missing! Please install and add to the plugins array to use the Vanilla Extract plugin.',
        );
      }
      const allThemes = { ...options.themes, ...options.globalThemes };
      if (!Object.keys(allThemes).length) {
        throw new Error('Must generate at least one theme in "themes" or "globalThemes".');
      }
      for (const k of Object.keys(allThemes)) {
        if (!isJSIdent(k)) {
          throw new Error(
            `${JSON.stringify(k)} must be a valid JS identifier. Prefer camelCase so it may be used in JS.`,
          );
        }
      }
    },

    async transform({ getTransforms, setTransform }) {
      // vanilla-extract’s transform works a little-differently than other plugins.
      // First, the localID is the same as the source, only we camelCase it for
      // convenience.
      // Second, we’re borrowing the values from plugin-css, but also keeping
      // its localID, too, for later.
      for (const token of getTransforms({ format: FORMAT_CSS })) {
        const localID = token.id
          .split('.')
          .map((part) => camelCase(part))
          .join('.');
        const value = {
          ...(token.type === 'SINGLE_VALUE' ? { '.': token.value } : { ...token.value }),
          __cssName: token.localID!,
        };
        setTransform(token.id, {
          format: FORMAT_VANILLA,
          localID,
          value,
          mode: token.mode,
        });
      }
    },

    async build({ getTransforms, outputFile }) {
      const imports = new Set<string>();
      const output: string[] = [];

      // generate theme contract
      output.push(
        generateThemeContract({
          tokens: getTransforms({ format: FORMAT_VANILLA, mode: '.' }),
          globalThemeContract,
        }),
      );
      imports.add(globalThemeContract ? VE.createGlobalThemeContract : VE.createThemeContract);

      // generate themes/global themes
      const namingPattern = options?.themeVarNaming ?? ((n) => [`${n}Class`, n]);
      for (const [name, { mode }] of Object.entries(options.themes ?? {})) {
        const theme = generateTheme({ name, namingPattern, tokens: getTransforms({ format: FORMAT_VANILLA, mode }) });
        imports.add(VE.createTheme);
        output.push(theme);
      }
      for (const [name, { selector, mode }] of Object.entries(options.globalThemes ?? {})) {
        const theme = generateTheme({
          name,
          namingPattern,
          tokens: getTransforms({ format: FORMAT_VANILLA, mode }),
          selector,
          globalTheme: true,
        });
        imports.add(VE.createGlobalTheme);
        output.push(theme);
      }

      outputFile(
        filename,
        [`import { ${[...imports].sort().join(', ')} } from "@vanilla-extract/css";`, '', ...output].join('\n'),
      );
    },
  };
}
