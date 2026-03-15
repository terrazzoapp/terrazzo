import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/figma-sds.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'sds.css',
      permutations: [
        { prepare: (contents) => `[data-theme="light"] {\n  ${contents}\n}`, input: { theme: 'light' } },
        { prepare: (contents) => `[data-theme="dark"] {\n  ${contents}\n}`, input: { theme: 'dark' } },
      ],
    }),
  ],
})
