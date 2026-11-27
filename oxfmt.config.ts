import { defineConfig } from 'oxfmt';

export default defineConfig({
  ignorePatterns: ['**/dist/**', '**/test/fixtures/**'],

  overrides: [
    {
      files: ['*.css', '*.md', '*.yml'],
      options: {
        singleQuote: false,
      },
    },
  ],

  semi: true,
  singleQuote: true,
  sortImports: {
    "groups": [
      "builtin",
      "external",
      "parent",
      "sibling",
      "index",
      "style",
      "unknown",
    ],
    newlinesBetween: false,
  },
  sortPackageJson: false,
  tabWidth: 2,
});
