import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/shopify-polaris.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'polaris.css',
      permutations: [{ input: {}, prepare: (contents) => `:root {\n  ${contents}\n}` }]
    })
  ],
})
