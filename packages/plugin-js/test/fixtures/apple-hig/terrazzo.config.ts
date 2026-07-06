import { defineConfig } from "@terrazzo/cli";
import js from '../../../dist/index.js'

export default defineConfig({
  tokens: 'dtcg-examples/apple-hig.resolver.json',
  plugins: [js({ filename: 'actual.js' })],
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  }
})
