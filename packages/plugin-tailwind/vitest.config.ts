import os from 'node:os';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: os.platform() === 'win32' ? 10000 : 5000,
  },
});
