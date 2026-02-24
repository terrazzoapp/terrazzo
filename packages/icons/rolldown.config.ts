import { defineConfig } from '../../rolldown.js';

/** @type {import("rollup").InputOptions} */
export default defineConfig({
  input: 'src/index.tsx',
  platform: 'browser',
});
