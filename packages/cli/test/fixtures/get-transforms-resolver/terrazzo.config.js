import { fileURLToPath } from 'node:url';
import { defineConfig } from '../../../dist/index.js';

const MY_FORMAT = 'my-format'
const permutations = [{theme:'light'},{theme:'dark'}, {theme:'light-hc'}, {theme:'dark-hc'}]

export default defineConfig({
  tokens: [fileURLToPath(new URL('resolver.json', import.meta.url))],
  outDir: '.',
  plugins: [
    {
      name: 'test-transforms',
      async transform({ resolver, setTransform }) {
        // set transforms for a local format
        for (const input of permutations) {
          const tokens = resolver.apply(input)
          for (const token of Object.values(tokens)) {
            setTransform(token.id, { format: MY_FORMAT, value: token.$value.hex, input })
          }
        }
      },
      async build({ getTransforms, outputFile }) {
        const output = {};
        // test that pulling from multiple modes, one of which only has partial tokens (light),
        // returns everything expected
        for (const input of permutations) {
          for (const token of getTransforms({ format: MY_FORMAT, input })) {
            output[`${token.id}.${input.theme}`] = token.value;
          }
        }
        outputFile('actual.json', JSON.stringify(output, undefined, 2));
      }
    }
  ]
})
