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
  const variations = {
    [DEFAULT_THEME]: { selector: '', input: options.defaultTheme ?? { tzMode: '.' } },
    ...options?.customVariants,
  };
  let cwd: URL;
  const msg = { group: 'plugin' as const, label: PLUGIN_NAME };

  return {
    name: PLUGIN_NAME,
    enforce: 'post', // ensure this comes after @terrazzo/plugin-css
    config(config, { logger }) {
      if (!config.plugins.some((p) => p.name === '@terrazzo/plugin-css')) {
        logger.error({
          ...msg,
          message:
            '@terrazzo/plugin-css missing! Please install and add to the plugins array to use the Tailwind plugin.',
        });
      }

      if (!options || !options.theme) {
        logger.error({ ...msg, message: 'Missing Tailwind `theme` option.' });
      }

      if (options && 'modeVariants' in options) {
        logger.error({ ...msg, message: 'Migrate "modeVariants" to "variants" in config (see docs)' });
      }

      // store cwd for template resolution (parent of outDir)
      cwd = new URL('./', config.outDir);
      if (options?.template && !fsSync.existsSync(new URL(options.template, cwd))) {
        logger.error({
          ...msg,
          message: `Could not locate template ${fileURLToPath(new URL(options.template, cwd))}. Does the file exist?`,
        });
      }
    },
    async transform({ getTransforms, setTransform, context: { logger } }) {
      const flatTheme = flattenThemeObj(options.theme);

      for (const { input } of Object.values(variations)) {
        const query = getTokenQuery(input);
        // Note: it’s important to remember that under-the-hood, getting/setting modes is NOT the same as having an { tzMode: value } input.
        // The former allows glob searching across all modes, the latter does not. Especially in the Tailwind plugin, confusing the two
        // will result in many dropped tokens.
        for (const { path, value } of flatTheme) {
          const variantTokens = getTransforms({ ...query, format: FORMAT_CSS, id: value });
          // Warn the user if they are trying to generate an empty Tailwind variant
          if (!variantTokens.length) {
            logger.warn({ ...msg, message: `${value} matched 0 tokens` });
          }

          for (const token of variantTokens) {
            let relName = token.id.split('.').at(-1)!;
            for (const subgroup of [...(Array.isArray(value) ? value : [value])]) {
              const match = subgroup.replace(/\*.*/, '');
              relName = token.id.replace(match, '');
            }
            setTransform(token.id, {
              ...query,
              format: FORMAT_TAILWIND,
              localID: makeCSSVar(`${path.join('-')}-${relName.replace(/\./g, '-')}`),
              value: typeof token.value === 'object' ? token.value['.']! : token.value,
            });
          }
        }
      }
    },
    async build({ getTransforms, outputFile }) {
      let generatedTheme = '';
      for (const [variant, { input, selector }] of Object.entries(variations)) {
        if (generatedTheme) {
          generatedTheme += '\n'; // add extra line break if continuing
        }
        generatedTheme += `${variant === DEFAULT_THEME ? '@theme' : `@custom-variant ${variant} (${selector})`} {\n`;
        for (const token of getTransforms({ ...getTokenQuery(input), format: FORMAT_TAILWIND })) {
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

/** Convert modes to inputs */
function isLegacyModes(input: Record<string, string>): boolean {
  return Object.keys(input).length === 0 && 'tzMode' in input;
}

/** Build query for both resolvers and legacy modes */
function getTokenQuery(input: Record<string, string>) {
  return isLegacyModes(input) ? { mode: input.tzMode ?? '.' } : { input };
}
