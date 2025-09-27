import { fileURLToPath } from 'node:url';
import { defineConfig } from '../../../dist/index.js';

const MY_FORMAT = 'my-format'

export default defineConfig({
  outDir: '.',
  tokens: [fileURLToPath( new URL('tokens.json', import.meta.url))],
  plugins: [
    {
      name: 'test-transforms',
      async transform({ tokens, setTransform }) {
        // set transforms for a local format
        for (const token of Object.values(tokens)) {
          for (const [mode, modeValue] of Object.entries(token.mode)) {
            setTransform(token.id, {
              format: MY_FORMAT,
              mode,
              value: modeValue.$value.hex
            })
          }
        }
      },
      async build({ getTransforms, outputFile }) {
        const output = {};
        // test that pulling from multiple modes, one of which only has partial tokens (light),
        // returns everything expected
        for (const token of getTransforms({ format: MY_FORMAT, mode: ['.', 'light'] })) {
          output[token.id] = token.value;
        }
        outputFile('given.json', JSON.stringify(output, undefined, 2));
      }
    }
  ]
})
