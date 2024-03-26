import baseConfig from '../eslint.config.js';

export default [
  ...baseConfig,
  {
    ignores: ['.vitepress/cache'],
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
