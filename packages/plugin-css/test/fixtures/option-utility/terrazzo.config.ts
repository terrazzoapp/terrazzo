import { defineConfig } from '@terrazzo/cli';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['ds.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'utility.css',
      variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
      utility: {
        bg: ['color.semantic.**', 'color.gradient.**'],
        border: ['border.**'],
        font: ['typography.**'],
        layout: ['space.**'],
        shadow: ['shadow.**'],
        text: ['color.semantic.**', 'color.gradient.**'],
      },
      permutations: [
        { prepare: (contents) => `:root {\n  ${contents}\n}`, input: { theme: 'light' } },
        {
          prepare: (contents) => `@media (prefers-color-theme: dark) {\n  :root {\n    ${contents}\n  }\n}`,
          input: { theme: 'dark' },
        },
        {
          prepare: (contents) => `@media (width < 600px) {\n  :root {\n    ${contents}\n  }\n}`,
          input: { size: 'mobile' },
        },
      ],
    }),
  ],
});
