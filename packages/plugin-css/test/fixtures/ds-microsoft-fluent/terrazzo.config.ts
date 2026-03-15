import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/microsoft-fluent.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'fluent.css',
      permutations: [
        { prepare: (contents) => `:root {\n  ${contents}\n}`, input: { theme: 'default' } },
        { prepare: (contents) => `@media (prefers-color-scheme: dark) {\n  ${contents}\n}`, input: { theme: 'inverted' } },
      ],
    })
  ],
})
