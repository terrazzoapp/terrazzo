import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    mockReset: true,
    testTimeout: 10_000,
  },
});
