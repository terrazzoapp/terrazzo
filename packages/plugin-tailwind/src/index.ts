import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Plugin } from '@terrazzo/parser';
import { FORMAT_ID as FORMAT_CSS } from '@terrazzo/plugin-css';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import {
  applyTemplate,
  buildFileHeader,
  FORMAT_ID as FORMAT_TAILWIND,
  flattenThemeObj,
  PLUGIN_NAME,
  type TailwindPluginOptions,
} from './lib.js';

export * from './lib.js';

const DEFAULT_THEME = '.';

export default function pluginTailwind(options: TailwindPluginOptions): Plugin {
  const filename = options?.filename ?? 'tailwind-theme.css';
  const variations: Record<string, Record<string, string> | undefined> = {
    [DEFAULT_THEME]: options.defaultPermutation,
    ...options?.variants,
  };
  let cwd: URL;

  return {
    name: PLUGIN_NAME,
    enforce: 'post', // ensure this comes after @terrazzo/plugin-css
    config(config, { logger }) {
      if (!config.plugins.some((p) => p.name === '@terrazzo/plugin-css')) {
        logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message:
            '@terrazzo/plugin-css missing! Please install and add to the plugins array to use the Tailwind plugin.',
        });
      }

      if (!options || !options.theme) {
        logger.error({ group: 'plugin', label: PLUGIN_NAME, message: 'Missing Tailwind `theme` option.' });
      }

      if (options && 'modeVariants' in options) {
        logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message: 'Migrate "modeVariants" to "variants" in config (see docs)',
        });
      }

      // store cwd for template resolution (parent of outDir)
      cwd = new URL('./', config.outDir);
      if (options?.template && !fsSync.existsSync(new URL(options.template, cwd))) {
        logger.error({
          group: 'plugin',
          label: PLUGIN_NAME,
          message: `Could not locate template ${fileURLToPath(new URL(options.template, cwd))}. Does the file exist?`,
        });
      }
    },
    async transform({ getTransforms, setTransform, context: { logger } }) {
      const flatTheme = flattenThemeObj(options.theme);

      for (const input of Object.values(variations)) {
        // Note: it’s important to remember that under-the-hood, getting/setting modes is NOT the same as having an { tzMode: value } input.
        // The former allows glob searching across all modes, the latter does not. Especially in the Tailwind plugin, confusing the two
        // will result in many dropped tokens.
        //
        // This is all behavior that will go away in 3.0, but for 2.0 this needs to be backwards-compatible with 0.x, hence the complexity.
        const transformContext = input && isLegacyModes(input) ? { mode: input.tzMode } : { input };

        for (const { path, value } of flatTheme) {
          const variantTokens = getTransforms({ format: FORMAT_CSS, id: value, ...transformContext });
          // Warn the user if they are trying to generate an empty Tailwind variant
          if (!variantTokens.length) {
            logger.warn({ group: 'plugin', label: PLUGIN_NAME, message: `${value} matched 0 tokens` });
          }

          for (const token of variantTokens) {
            let relName = token.id.split('.').at(-1)!;
            for (const subgroup of [...(Array.isArray(value) ? value : [value])]) {
              const match = subgroup.replace(/\*.*/, '');
              relName = token.id.replace(match, '');
            }
            setTransform(token.id, {
              format: FORMAT_TAILWIND,
              localID: makeCSSVar(`${path.join('-')}-${relName.replace(/\./g, '-')}`),
              value: typeof token.value === 'object' ? token.value['.']! : token.value,
              ...transformContext,
            });
          }
        }
      }
    },
    async build({ getTransforms, outputFile }) {
      let generatedTheme = '';
      for (const [variant, input] of Object.entries(variations)) {
        const transformContext = input && isLegacyModes(input) ? { mode: input.tzMode } : { input };

        if (generatedTheme) {
          generatedTheme += '\n'; // add extra line break if continuing
        }
        generatedTheme += `${variant === DEFAULT_THEME ? '@theme' : `@variant ${variant}`} {\n`;
        for (const token of getTransforms({ format: FORMAT_TAILWIND, ...transformContext })) {
          generatedTheme += `  ${token.localID}: ${token.value};\n`;
        }
        generatedTheme += '}\n';
      }

      // build the output combining theme and template
      let finalOutput = '';
      if (options.template) {
        const templateUrl = new URL(options.template, cwd);
        const templateContent = await fs.readFile(fileURLToPath(templateUrl), 'utf8');
        finalOutput += applyTemplate(templateContent, generatedTheme);
      } else {
        finalOutput += '@import "tailwindcss";\n\n';
        finalOutput += generatedTheme;
      }

      const header = buildFileHeader(options.template);
      outputFile(filename, [header, '', finalOutput].join('\n'));
    },
  };
}

/** This is a backwards-compat way for someone  */
function isLegacyModes(input: Record<string, string>): boolean {
  return Object.keys(input).length === 0 && 'tzMode' in input;
}
