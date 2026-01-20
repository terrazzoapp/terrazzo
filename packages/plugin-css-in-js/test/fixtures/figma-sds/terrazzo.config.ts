import { defineConfig } from "@terrazzo/cli";
import css from '@terrazzo/plugin-css'
import cssInJs from '../../../dist/index.js'

export default defineConfig({
  tokens: 'dtcg-examples/figma-sds.resolver.json',
  outDir: '.',
  plugins: [
    css({ skipBuild: true }),
    cssInJs({ filename: 'actual.js' }),
  ],
  lint: {
    rules: {},
  }
});
