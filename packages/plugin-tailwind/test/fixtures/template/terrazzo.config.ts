import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  plugins: [
    css({
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
