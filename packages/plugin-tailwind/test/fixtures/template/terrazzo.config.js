import { defineConfig } from '@terrazzo/cli';
import css from '../../../../plugin-css/dist/index.js';
import tailwind from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  plugins: [
    css({
      legacyHex: true,
      skipBuild: true,
    }),
    tailwind({
      filename: 'actual.css',
      template: './template.tz.css',
      theme: {
        color: ['color.*'],
      },
    }),
  ],
});
