module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'],
  rules: {
    '@typescript-eslint/camelcase': 'off',
    'no-console': ['error'],
    'no-shadow': ['error'],
    'no-undef': 'off', // handled by TS
    'prefer-const': 'off',
    'prefer-template': ['error'], // "+" is for math; templates are for strings
    'prettier/prettier': ['error'],
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': ['error'],
      },
    },
  ],
};
