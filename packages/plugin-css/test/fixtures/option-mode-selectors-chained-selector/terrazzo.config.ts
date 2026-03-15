import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      modeSelectors: [
        {
          mode: 'light',
          selectors: [
            '@media (prefers-color-scheme: light) and (prefers-contrast: high)',
            '[data-color-mode="light"][data-product="default"], [data-color-mode="light"] [data-product="default"]',
          ],
        },
        {
          mode: 'light-high-contrast',
          selectors: [
            '@media (prefers-color-scheme: light) and (prefers-contrast: high)',
            '[data-color-mode="light"][data-contrast="high"][data-product="default"], [data-color-mode="light"][data-contrast="high"] [data-product="default"]',
          ],
        },
        {
          mode: 'dark',
          selectors: [
            '@media (prefers-color-scheme: dark)',
            '[data-color-mode="dark"][data-product="default"], [data-color-mode="dark"] [data-product="default"]',
          ],
        },
        {
          mode: 'dark-high-contrast',
          selectors: [
            '@media (prefers-color-scheme: dark) and (prefers-contrast: high)',
            '[data-color-mode="dark"][data-contrast="high"][data-product="default"], [data-color-mode="dark"][data-contrast="high"] [data-product="default"]',
          ],
        },
      ],
    }),
  ]
});
