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
      variableName: (defaultName, { token, path, relName }) => {
        if (token.id.includes('_') || token.id.includes('--')) {
          return `--${path.join('-')}-${relName.replace(/\./g, '-')}`;
        }
        return defaultName;
      },
      theme: {
        color: ['color.**'],
        text: ['typography.**'],
      },
    }),
  ],
});
