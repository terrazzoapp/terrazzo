import { defineConfig } from "@terrazzo/cli";
import { makeCSSVar } from "@terrazzo/token-tools/css";
import css from '../../../src/index.js'

export default defineConfig({
  tokens: ['dimension.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
      permutations: [
        {
          input: { size: 'mobile' },
          prepare: (contents) => `:root {\n  ${contents}\n}`,
        },
        {
          input: { size: 'desktop' },
          prepare: (contents) => `@media (width >= 600px) {\n  :root {\n    ${contents}\n  }\n}`,
        }
      ],
    })
  ]
})
