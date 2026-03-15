import { defineConfig } from "@terrazzo/cli";
import { makeCSSVar } from "@terrazzo/token-tools/css";
import css from '../../../src/index.js'

export default defineConfig({
  tokens: ['transition.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
      permutations: [{ input: {}, prepare: (contents) => `:root {\n  ${contents}\n}` }],
    })
  ]
})
