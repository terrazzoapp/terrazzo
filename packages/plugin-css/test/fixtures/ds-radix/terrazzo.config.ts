import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/radix.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'radix.css',
      permutations: [
        { prepare: (contents) => `:root {\n  ${contents}\n}`, input: { size: 'default' } },
        { prepare: (contents) => `[data-theme="light"] {\n  ${contents}\n}`, input: { theme: 'light' } },
        { prepare: (contents) => `[data-theme="light-hc"] {\n  ${contents}\n}`, input: { theme: 'light-hc' } },
        { prepare: (contents) => `[data-theme="dark"] {\n  ${contents}\n}`, input: { theme: 'dark' } },
        { prepare: (contents) => `[data-theme="dark-hc"] {\n  ${contents}\n}`, input: { theme: 'dark-hc' } },
      ],
    })
  ],
})
