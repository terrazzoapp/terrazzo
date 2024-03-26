import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    ignores: ['**/test/fixtures/**/*'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
