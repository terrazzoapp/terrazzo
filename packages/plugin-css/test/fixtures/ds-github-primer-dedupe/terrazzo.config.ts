import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['dtcg-examples/github-primer.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'primer.css',
      exclude: ['control.minTarget.auto'],
      permutations: [
        {
          prepare: (contents) => `:root {\n  ${contents}\n}`,
          input: { size: 'default' },
        },
        {
          prepare: (contents) => `@media (pointer: coarse) {\n  ${contents}\n}`,
          input: { size: 'coarse' },
          only: { modifiers: ['size'], sets: ['base']  },
        },
        // Note: GitHub Primer is not set up in such a way where this generates
        // good output. GitHub Primer’s modifiers modify primitive tokens, which
        // means every permutation will be redeclaring its semantic tokens in
        // CSS. This test, however, incorrectly omits the semantic tokens, but
        // it’s meant to be more of a stress test.
        {
          prepare: (contents) => `[data-theme="light"] {\n  ${contents}\n}`,
          input: { theme: 'light' },
          only: { modifiers: ['theme'], sets: [] },
        },
        {
          prepare: (contents) => `[data-theme="light-hc"] {\n  ${contents}\n}`,
          input: { theme: 'light-hc' },
          only: { modifiers: ['theme'], sets: []  },
        },
        {
          prepare: (contents) => `[data-theme="dark"] {\n  ${contents}\n}`,
          input: { theme: 'dark' },
          only: { modifiers: ['theme'], sets: []  },
        },
        {
          prepare: (contents) => `[data-theme="dark-hc"] {\n  ${contents}\n}`,
          input: { theme: 'dark-hc' },
          only: { modifiers: ['theme'], sets: []  },
        },
      ],
    })
  ],
})
