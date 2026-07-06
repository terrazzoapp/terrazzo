import { defineConfig } from "@terrazzo/cli";
import js from '../../../dist/index.js'

export default defineConfig({
  tokens: 'dtcg-examples/github-primer.resolver.json',
  outDir: '.',
  plugins: [js({ filename: 'actual.js' })],
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  }
})
