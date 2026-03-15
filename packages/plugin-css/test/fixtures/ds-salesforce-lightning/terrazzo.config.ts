import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/salesforce-lightning.r.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'lightning.css',
      permutations: [
        { prepare: (contents) => `:root {\n  ${contents}\n}`, input: {} },
      ],
    })
  ],
})
