import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // We’re running the Tailwind CLI in addition to Terrazzo, so give these tests lots of time
    testTimeout: 120_000,
  },
});
