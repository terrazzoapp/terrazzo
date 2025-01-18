import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    mockReset: true,
    testTimeout: 30_000, // Only needed for Windows
  },
});
