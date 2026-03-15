import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/ibm-carbon.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'carbon.css',
      permutations: [
        { prepare: (contents) => `:root {\n  ${contents}\n}`, input: {} },
      ],
    })
  ],
})
