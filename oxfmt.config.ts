import { defineConfig } from 'oxfmt'

export default defineConfig({
  ignorePatterns: ['dist/**', 'test/fixtures/**'],

  overrides: [
    {
      files: ['*.md', '*.yml'],
      options: {
        singleQuote: false,
      },
    },
  ],

  semi: true,
  singleQuote: true,
  sortImports: true,
  sortPackageJson: false,
  tabWidth: 2,
})
