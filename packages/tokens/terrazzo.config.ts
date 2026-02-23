import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import { makeCSSVar } from '@terrazzo/token-tools/css';

export default defineConfig({
  tokens: 'src/terrazzo.resolver.yml',
  outDir: 'dist',
  plugins: [
    css({
      variableName: (token) => makeCSSVar(token.id, { prefix: 'tz' }),
      permutations: [
        {
          prepare: (css) => `:root{\n  ${css}\n}`,
          input: { theme: 'light' },
        },
        {
          prepare: (css) => `@media (prefers-color-scheme: dark) {
  :root {
    ${css}
  }
}

[data-color-mode="dark"] {
  ${css}
}`,
          input: { theme: 'dark' },
        },
      ],
    }),
  ],
  lint: {
    rules: {
      'core/valid-color': ['error', { legacyFormat: true }],
      'core/consistent-naming': 'off',
    },
  },
});
