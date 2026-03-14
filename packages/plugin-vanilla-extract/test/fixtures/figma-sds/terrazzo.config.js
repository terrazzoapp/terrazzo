import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import vanillaExtract from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  tokens: ['dtcg-examples/figma-sds.resolver.json'],
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  plugins: [
    css({
      permutations: [
        { input: { theme: 'light' }, prepare: (contents) => `:root {\n  color-scheme: light dark;\n  ${contents}\n}` },
        { input: { theme: 'dark' }, prepare: (contents) => `@media (prefers-color-scheme: dark) {\n  :root {\n    color-scheme: dark;\n    ${contents}\n  }\n}` },
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
