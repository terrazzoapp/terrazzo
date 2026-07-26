import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 10_000, // CI sometimes gets close to 5s
  },
});
