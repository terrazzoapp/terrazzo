import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    ignores: ['**/actual.*', '**/want.*', '**/test/types/*'],
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
