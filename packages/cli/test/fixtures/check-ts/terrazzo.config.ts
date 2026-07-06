import type { Plugin } from '@terrazzo/parser';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  tokens: [fileURLToPath(new URL('colors.tokens.json', import.meta.url))],
  plugins: [
    myPlugin(),
  ],
  lint: {
    build: { enabled: true },
    rules: {
      'core/valid-color': 'error',
      'core/valid-dimension': 'error',
      'core/valid-font-family': 'error',
      'core/valid-font-weight': 'error',
      'core/valid-duration': 'error',
      'core/valid-cubic-bezier': 'error',
      'core/valid-number': 'error',
      'core/valid-link': 'error',
      'core/valid-boolean': 'error',
      'core/valid-string': 'error',
      'core/valid-stroke-style': 'error',
      'core/valid-border': 'error',
      'core/valid-transition': 'error',
      'core/valid-shadow': 'error',
      'core/valid-gradient': 'error',
      'core/valid-typography': 'error',
      'core/consistent-naming': 'warn',
    }
  },
})

export function myPlugin(): Plugin {
  return {
    name: 'Test plugin',
  }
}
