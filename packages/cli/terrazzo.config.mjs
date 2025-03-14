import { defineConfig } from '@terrazzo/cli';

export default defineConfig({
  tokens: ['tokens-example.json'],
  outDir: './tokens/',
  plugins: [
    /** @see https://terrazzo.app/docs/cli/integrations */
  ],
  lint: {
    /** @see https://terrazzo.app/docs/cli/lint */
  },
});
