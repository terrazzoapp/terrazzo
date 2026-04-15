import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  plugins: [
    css({ skipBuild: true }),
    tailwind({
      template: 'tailwind.template.css',
      filename: 'actual.css',
      variableName: (defaultName, { path, relName }) => {
        // Preserve underscores: build the name without makeCSSVar's normalization
        return `--${path.join('-')}-${relName.replace(/\./g, '-')}`;
      },
      theme: {
        color: ['color.**'],
      },
    }),
  ],
});
