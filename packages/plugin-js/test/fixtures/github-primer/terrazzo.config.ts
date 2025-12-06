import { defineConfig } from "@terrazzo/cli";
import js from '../../../dist/index.js'

export default defineConfig({
  tokens: 'github-primer.resolver.json',
  outDir: '.',
  plugins: [js({ filename: 'actual.js' })],
  lint: {
    rules: {},
  }
})
