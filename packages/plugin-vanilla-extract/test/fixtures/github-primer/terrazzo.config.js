import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import vanillaExtract from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  tokens: ['dtcg-examples/github-primer.resolver.json'],
  lint: {
    rules: {
      'core/consistent-naming': 'off',
      'core/valid-typography': ['error', { requiredProperties: ['fontFamily', 'fontSize'] }]
    }
  },
  plugins: [
    css({
      permutations: [
        { input: { theme: 'light' }, prepare: (contents) => `:root{\n  color-scheme: light dark;\n  ${contents}\n}` },
        { input: { theme: 'light-hc' }, prepare: (contents) => `[data-theme="light-hc"] {\n  ${contents}\n}` },
        { input: { theme: 'dark' }, prepare: (contents) => `@media (prefers-color-scheme: dark) {\n  :root {\n    color-scheme: dark;\n    ${contents}\n  }\n}` },
        { input: { theme: 'dark-hc' }, prepare: (contents) => `[data-theme="dark-hc"] {\n  ${contents}\n}` },
      ]
    }),
    vanillaExtract({
      globalThemeContract: false,
      themes: {
        light: { selector: '[data-color-mode=light]', input: { theme: 'light' } },
        lightHC: { selector: '[data-color-mode=light-hc]', input: { theme: 'light-hc'  } },
        dark: { selector: '[data-color-mode=dark]', input: { theme: 'dark' } },
        darkHC: { selector: '[data-color-mode=dark-hc]', input: { theme: 'dark-hc' } },
      },
    }),
  ],
});
