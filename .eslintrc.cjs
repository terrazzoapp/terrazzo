module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/strict', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/no-dynamic-delete': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // handled by TS
    'no-console': ['error'],
    'no-misleading-character-class': 'off',
    'no-shadow': ['error'],
    'no-undef': 'off', // handled by TS
    'prefer-const': 'off',
    'prefer-template': ['error'], // "+" is for math; templates are for strings
    semi: 'error',
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': ['warn'],
        indent: 'off',
      },
    },
  ],
};
