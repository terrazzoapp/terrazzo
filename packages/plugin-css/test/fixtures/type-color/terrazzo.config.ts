import { defineConfig } from '@terrazzo/cli';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['color.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
      permutations: [
        {
          input: { mode: 'light' },
          prepare: (contents) => `[data-color-theme="light"] {\n  color-scheme: light;\n  ${contents}\n}`,
          exclude: ['gradient.**'],
        },
        {
          input: { mode: 'light-colorblind' },
          prepare: (contents) => `[data-color-theme="light-colorblind"] {\n  ${contents}\n}`,
          exclude: ['gradient.**'],
        },
        {
          input: { mode: 'light-high-contrast' },
          prepare: (contents) => `[data-color-theme="light-high-contrast"] {\n  ${contents}\n}`,
          exclude: ['gradient.**'],
        },
        {
          input: { mode: 'dark' },
          prepare: (contents) => `[data-color-theme="dark"] {\n  color-scheme: dark;\n  ${contents}\n}`,
          exclude: ['gradient.**'],
        },
        {
          input: { mode: 'dark-dimmed' },
          prepare: (contents) => `[data-color-theme="dark-dimmed"] {\n  color-scheme: dark;\n  ${contents}\n}`,
          exclude: ['gradient.**'],
        },
        {
          input: { mode: 'dark-high-contrast' },
          prepare: (contents) => `[data-color-theme="dark-high-contrast"] {\n  color-scheme: dark;\n  ${contents}\n}`,
          exclude: ['gradient.**'],
        },
        {
          input: { mode: 'dark-colorblind' },
          prepare: (contents) => `[data-color-theme="dark-colorblind"] {\n  color-scheme: dark;\n  ${contents}\n}`,
          exclude: ['gradient.**'],
        },
      ],
    })
  ],
})
