import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/adobe-spectrum.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'spectrum.css',
      permutations: [
        {
          prepare: (contents) => `:root {\n  ${contents}\n}`,
          input: { theme: 'light', size: 'mobile' },
        },
        {
          prepare: (contents) => `[data-theme="dark"] {\n  ${contents}\n}`,
          input: { theme: 'dark', size: 'mobile' },
        },
        {
          prepare: (contents) => `@media (width >= 600px) {\n  :root {\n    ${contents}\n  }\n}`,
          input: { theme: 'light', size: 'desktop' },
        },
      ],
    })
  ],
})
