import type { Plugin } from '@terrazzo/parser';
import { FORMAT_ID as FORMAT_CSS } from '@terrazzo/plugin-css';
import { camelCase } from 'scule';
import {
  FORMAT_ID as FORMAT_VANILLA,
  generateTheme,
  generateThemeContract,
  isJSIdent,
  type VanillaExtractPluginOptions,
  VE,
} from './lib.js';

export * from './lib.js';

const PLUGIN_NAME = '@terrazzo/plugin-vanilla-extract';

export default function vanillaExtractPlugin(options: VanillaExtractPluginOptions): Plugin {
  const filename = options.filename ?? 'theme.css.ts';
  const globalThemeContract = options.globalThemeContract ?? true;
  let isResolver = false;

  return {
    name: PLUGIN_NAME,
    enforce: 'post', // ensure this comes after @terrazzo/plugin-css
    config(config, { logger }) {
      if (!config.plugins.some((p) => p.name === '@terrazzo/plugin-css')) {
        logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message:
            '@terrazzo/plugin-css missing! Please install and add to the plugins array to use the Vanilla Extract plugin.',
        });
      }
      const allThemes = { ...options.themes, ...options.globalThemes };
      isResolver = Object.values(allThemes).every((t) => t.input);

      if (!Object.keys(allThemes).length) {
        logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message: 'Must generate at least one theme in "themes" or "globalThemes".',
        });
      }
      for (const k of Object.keys(allThemes)) {
        if (!isJSIdent(k)) {
          logger.error({
            group: 'plugin',
            label: PLUGIN_NAME,
            message: `${JSON.stringify(k)} must be a valid JS identifier. Prefer camelCase so it may be used in JS.`,
          });
        }
        if (isResolver && allThemes[k]!.mode) {
          logger.error({
            group: 'plugin',
            label: PLUGIN_NAME,
            message: `${k}: Can’t use "mode" while other themes use "input". Use either "mode" or "input" globally.`,
          });
        }
      }
    },

    async transform({ getTransforms, setTransform }) {
      if (isResolver) {
        for (const { input } of Object.values(options.themes ?? options.globalThemes ?? {})) {
          for (const token of getTransforms({ format: FORMAT_CSS, input })) {
            const localID = token.token.jsonID // use jsonID to account for $root tokens
              .slice(2)
              .split('/')
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
              input,
              meta: { 'token-listing': { name: `vars.${localID}` } },
            });
          }
        }
        return;
      }

      // legacy modes
      // deprecate in 3.0
      for (const token of getTransforms({ format: FORMAT_CSS })) {
        const localID = token.token.jsonID // use jsonID to account for $root tokens
          .slice(2)
          .split('/')
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
          meta: { 'token-listing': { name: `vars.${localID}` } },
        });
      }
    },

    async build({ getTransforms, outputFile }) {
      const imports = new Set<string>();
      const output: string[] = [];

      // generate theme contract
      const firstInput = Object.values(options.globalThemes ?? options.themes ?? {})[0]?.input ?? {};
      output.push(
        generateThemeContract({
          tokens: getTransforms({
            format: FORMAT_VANILLA,
            ...(isResolver ? { input: firstInput } : { mode: '.' }),
          }),
          globalThemeContract,
        }),
      );
      imports.add(globalThemeContract ? VE.createGlobalThemeContract : VE.createThemeContract);

      // generate themes/global themes
      const namingPattern = options?.themeVarNaming ?? ((n) => [`${n}Class`, n]);
      for (const [name, { mode, input }] of Object.entries(options.themes ?? {})) {
        const theme = generateTheme({
          name,
          namingPattern,
          tokens: getTransforms({
            format: FORMAT_VANILLA,
            ...(mode ? { mode } : { input }),
          }),
        });
        imports.add(VE.createTheme);
        output.push(theme);
      }
      for (const [name, { selector, mode, input }] of Object.entries(options.globalThemes ?? {})) {
        const theme = generateTheme({
          name,
          namingPattern,
          tokens: getTransforms({
            format: FORMAT_VANILLA,
            ...(mode ? { mode } : { input }),
          }),
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
