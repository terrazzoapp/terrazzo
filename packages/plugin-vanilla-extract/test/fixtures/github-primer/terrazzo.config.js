import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import vanillaExtract from '../../../dist/index.js';

export default defineConfig({
  outDir: './test/fixtures/github-primer',
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
        { input: { theme: 'light' }, prepare: (css) => `:root{\n  color-scheme: light dark;\n  ${css}\n}` },
        { input: { theme: 'light-hc' }, prepare: (css) => `[data-theme="light-hc"] {\n  ${css}\n}` },
        { input: { theme: 'dark' }, prepare: (css) => `@media (prefers-color-scheme: dark) {\n  :root {\n    color-scheme: dark;\n    ${css}\n  }\n}` },
        { input: { theme: 'dark-hc' }, prepare: (css) => `[data-theme="dark-hc"] {\n  ${css}\n}` },
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
