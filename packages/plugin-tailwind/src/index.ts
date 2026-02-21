import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import type { Plugin } from '@terrazzo/parser';
import { FORMAT_ID as FORMAT_CSS } from '@terrazzo/plugin-css';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import {
  buildFileHeader,
  FORMAT_ID as FORMAT_TAILWIND,
  flattenThemeObj,
  PLUGIN_NAME,
  parseTzAtRules,
  type TailwindPluginOptions,
  type TzAtRule,
} from './lib.js';

export * from './lib.js';

export default function pluginTailwind(options: TailwindPluginOptions): Plugin {
  const filename = options?.filename ?? 'tailwind-theme.css';
  let cwd: URL;
  let template: string;
  const tzAtRules: TzAtRule[] = [];
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
      if (!fsSync.existsSync(new URL(options.template, cwd))) {
        logger.error({ ...msg, message: `Could not locate template "${options.template}". Does the file exist?` });
      }
    },
    async transform({ getTransforms, setTransform, context: { logger } }) {
      // First, validate template, and parse the locations of all @tz at-rules.
      template = await fs.readFile(options.template, 'utf8');
      if (!template.includes('@tz')) {
        logger.error({
          ...msg,
          message: `${options.template}: missing @tz helper! Terrazzo won’t generate any output for Tailwind. See https://terrazzo.app/docs/integrations/tailwind.`,
        });
      }
      tzAtRules.push(...parseTzAtRules(template));

      // Next, iterate over the occurrences of @tz and generate the appropriate token values.
      const flatTheme = flattenThemeObj(options.theme);
      for (const { input } of tzAtRules) {
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
      // Classic replacement hack: If we replace back-to-front, rather than
      // front-to-back, all our start/end locations will still be valid and we
      // won’t have to reparse the template every time.
      const reversedAtRules = [...tzAtRules].reverse();
      let generatedTemplate = template;
      for (const { start, end, input } of reversedAtRules) {
        const tokens = getTransforms({ ...getTokenQuery(input), format: FORMAT_TAILWIND });
        const indent = getIndentAtPos(template, start);
        generatedTemplate = `${generatedTemplate.slice(0, start)}${tokens.map((t) => `${t.localID}: ${t.value};`).join(`\n${indent}`)}${generatedTemplate.slice(end)}`;
      }
      // Note: don’t append the header till the end, otherwise start/end will all be wrong
      outputFile(filename, `${buildFileHeader(options.template)}\n\n${generatedTemplate}`);
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

/** Get the current indent based on the previous line break from char */
function getIndentAtPos(text: string, pos: number) {
  return text.slice(0, pos).match(/\n(( |\t)+)$/)?.[1] || '';
}
