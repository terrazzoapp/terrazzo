import { defineConfig } from '@terrazo/cli';

export default defineConfig({
  tokens: ['tokens.json'],
  outDir: './tokens/',
  plugins: [
    /** @see https://terrazzo.app/docs/cli/integrations */
  ],
  lint: {
    /** @see https://terrazzo.app/docs/cli/linting */
  },
});
