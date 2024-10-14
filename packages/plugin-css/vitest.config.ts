import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    mockReset: true,
    testTimeout: 20_000, // Only needed for Windows
  },
});
