import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import vanillaExtract from '../../../dist/index.js';

export default defineConfig({
  outDir: './test/fixtures/figma-sds',
  tokens: ['dtcg-examples/figma-sds.resolver.json'],
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  plugins: [
    css({
      permutations: [
        { input: { theme: 'light' }, prepare: (css) => `:root {\n  color-scheme: light dark;\n  ${css}\n}` },
        { input: { theme: 'dark' }, prepare: (css) => `@media (prefers-color-scheme: dark) {\n  :root {\n    color-scheme: dark;\n    ${css}\n  }\n}` },
      ]
    }),
    vanillaExtract({
      themes: {
        light: { selector: '[data-color-mode=light]', input: { theme:'light' } },
        dark: { selector: '[data-color-mode=dark]', input: { theme: 'dark' } },
      },
    }),
  ],
});
