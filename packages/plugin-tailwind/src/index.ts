import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from '@terrazzo/parser';
import { FORMAT_ID as FORMAT_CSS } from '@terrazzo/plugin-css';
import { applyTemplate, buildFileHeader, flattenThemeObj, type TailwindPluginOptions } from './lib.js';

export const FORMAT_ID = 'tailwind';

export * from './lib.js';

export default function pluginTailwind(options: TailwindPluginOptions): Plugin {
  const filename = options?.filename ?? (options as any)?.fileName ?? 'tailwind-theme.css';
  let cwd: URL;

  return {
    name: '@terrazzo/plugin-tailwind',
    enforce: 'post', // ensure this comes after @terrazzo/plugin-css
    config(config) {
      if (!config.plugins.some((p) => p.name === '@terrazzo/plugin-css')) {
        throw new Error(
          '@terrazzo/plugin-css missing! Please install and add to the plugins array to use the Tailwind plugin.',
        );
      }

      if (!options || !options.theme) {
        throw new Error('Missing Tailwind `theme` option.');
      }

      // Store cwd for template resolution (parent of outDir)
      cwd = new URL('./', config.outDir);
    },
    async transform({ getTransforms, setTransform }) {
      const variants = [{ variant: '.', mode: '.' }, ...(options?.modeVariants ?? [])];
      for (const { variant, mode } of variants) {
        const flatTheme = flattenThemeObj(options.theme);
        for (const { path, value } of flatTheme) {
          const tokens = getTransforms({
            format: FORMAT_CSS,
            id: value,
            mode,
          });
          for (const token of tokens) {
            let relName = token.id.split('.').at(-1)!;
            for (const subgroup of [...(Array.isArray(value) ? value : [value])]) {
              const match = subgroup.replace(/\*.*/, '');
              relName = token.id.replace(match, '');
            }
            setTransform(token.id, {
              format: FORMAT_ID,
              localID: `--${path.join('-')}-${relName.replace(/\./g, '-')}`,
              value: typeof token.value === 'object' ? token.value['.']! : token.value,
              mode: variant, // ! <- not the original mode!
            });
          }
        }
      }
    },
    async build({ getTransforms, outputFile }) {
      // Build theme blocks (@theme and @variant)
      const themeOutput: string[] = [];
      const variants: Record<string, string[]> = { '.': [] };
      for (const token of getTransforms({ format: FORMAT_ID })) {
        const { localID, value, mode } = token;
        if (!variants[mode]) {
          variants[mode] = [];
        }
        variants[mode].push(`${localID}: ${value};`);
      }
      for (const [variant, values] of Object.entries(variants)) {
        themeOutput.push(variant === '.' ? '@theme {' : `@variant ${variant} {`);
        for (const value of values) {
          themeOutput.push(`  ${value}`);
        }
        themeOutput.push('}', '');
      }
      const generatedTheme = themeOutput.join('\n');

      // Build final output
      let finalOutput: string;
      if (options.template) {
        const templateUrl = new URL(options.template, cwd);
        const templateContent = fs.readFileSync(fileURLToPath(templateUrl), 'utf8');
        finalOutput = applyTemplate(templateContent, generatedTheme);
      } else {
        finalOutput = ['@import "tailwindcss";', '', generatedTheme].join('\n');
      }

      // Add header and output
      const header = buildFileHeader(options.template);
      outputFile(filename, [header, '', finalOutput].join('\n'));
    },
  };
}
