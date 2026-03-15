import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/apple-hig.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'hig.css',
      permutations: [
        { prepare: (contents) => `:root {\n  ${contents}\n}`, input: {} },
      ],
    })
  ],
})
