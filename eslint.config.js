import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**/*', '**/test/**/*.js', '**/test/**/*.d.ts', './packages/utils/src/ansi.ts'] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.base.json', './docs/tsconfig.json', './packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // handled by TS
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/semi': 'error',
      curly: 'error',
      'no-console': 'error',
      'no-misleading-character-class': 'off',
      'no-shadow': 'off',
      'no-undef': 'off', // handled by TS
      'prefer-const': 'off',
      'prefer-template': 'error', // "+" is for math; templates are for strings
      semi: 'off',
    },
  },
  {
    files: ['*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
