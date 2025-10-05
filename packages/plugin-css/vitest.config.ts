import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    mockReset: true,
    testTimeout: 30_000, // Only needed for Windows
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/**/*.test.ts'],
          exclude: ['**/*.browser.{test,spec}.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['test/**/*.browser.{test,spec}.ts'],
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
