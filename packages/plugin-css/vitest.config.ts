import { defineConfig } from 'vitest/config';
import os from 'node:os';

export default defineConfig({
  test: {
    testTimeout: os.platform() === 'win32' ? 10000 : 5000,
  },
});
