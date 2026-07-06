import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    correctness: 'error',
    pedantic: 'error',
    perf: 'error',
    // restriction: 'off', // don’t enable restrictions category, half of these are conditional on unique cases
    style: 'error',
    suspicious: 'error',
  },

  ignorePatterns: ['dist/**', 'test/fixtures/**'],

  jsPlugins: [
    { name: 'simple-import-sort', specifier: 'eslint-plugin-simple-import-sort' },
  ],

  overrides: [
    // test overrides
    {
      files: ['test/**', '*.test.*'],
      rules: {
        'no-empty-function': 'off', // common pattern in mocking
        'no-explicit-any': 'warn', // flag, but don’t ban
        'no-magic-numbers': 'off', // tests can assert random values inline
        'no-non-null-assertion': 'off', // tests can make unsafe assertions
        'no-unsafe-optional-chaining': 'off', // tests can make unsafe assertions
        'sort-keys': 'off', // too many existing inline fixtures
      },
    },
  ],

  options: {
    reportUnusedDisableDirectives: 'error'
  },

  rules: {
    'capitalized-comments': 'off',
    'consistent-type-imports': [
      'error', {
        fixStyle: 'inline-type-imports',
        prefer: 'type-imports',
      },

    ],
    'consistent-generic-constructors': 'off', // mostly noise
    'default-param-last': 'off',
    'func-style': ['error', 'declaration'],
    'id-length': 'off',
    'init-declarations': 'off',
    'max-classes-per-file': 'off',
    'max-depth': 'off',
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    'max-nested-callbacks': 'off',
    'max-nested-calls': 'off',
    'max-statements': 'off',
    'method-signature-style': 'off',
    'no-console': 'error',
    'no-continue': 'off',
    'no-cycle': 'error',
    'no-empty': 'error',
    'no-empty-function': 'error',
    'no-empty-object-type': 'error',
    'no-eq-null': 'error',
    'no-explicit-any': 'warn',
    'no-implicit-globals': 'error',
    'no-implicit-coercion': ['error', { boolean: true, number: false }],
    'no-import-type-side-effects': 'error',
    'no-inline-comments': 'off',
    'no-invalid-void-type': 'off',
    'no-magic-numbers': 'off', // good idea in theory, hard to enforce in practice
    'no-namespace': 'error',
    'no-non-null-assertion': 'warn',
    'no-null': 'off', // good idea in theory, hard to enforce in practice
    'no-param-reassign': 'error',
    'no-require-imports': 'error',
    'no-shadow': 'error',
    'no-ternary': 'off',
    'no-underscore-dangle': 'off',
    'no-var': 'error',
    'no-warning-comments': 'off', // I will die before I stop this
    'prefer-destructuring': 'off', // TODO: enable when "let" bug is fixed
    'prefer-for-of': 'off',
    'prefer-named-capture-group': 'off',
    'prefer-set-has': 'off',
    'require-unicode-regexp': 'off',
    'simple-import-sort/imports': 'error',
    'sort-imports': 'off', // handled by eslint-plugin-simple-import-sort
    'sort-keys': 'off', // nice idea, but impractical at this point
    'unicorn/relative-url-style': ['error', 'always'],
    'unicorn/no-array-callback-reference': 'off', // too opinionated
    'unicorn/no-unreadable-array-destructuring': 'off', // too opinionated
    'unicorn/numeric-separators-style': 'off', // bugs: applies for object keys (not desirable), groupLength doesn’t work as expected
    'unicorn/prefer-number-coercion': 'off', // this doesn’t make sense
    'unicorn/prefer-query-selector': 'off', // overreaching
    'unicorn/prefer-ternary': 'off', // too opinionated
    'unicorn/prefer-spread': 'off',
  },
})
