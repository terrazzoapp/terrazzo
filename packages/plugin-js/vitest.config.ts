import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 15_000,
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
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
