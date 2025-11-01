import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import { describe, expect, it } from 'vitest';
import css from '../src/index.js';
import { DS } from './lib.test.js';

// note: many colors’ hex fallbacks are intentionally different from what Culori
// clamps to. this is done intentionally to test the users’ fallbacks are
// respected

describe('Node.js API', () => {
  describe('token types', () => {
    it.each(['boolean', 'border', 'color', 'dimension', 'gradient', 'shadow', 'string', 'typography', 'transition'])(
      '%s',
      async (dir) => {
        const output = 'actual.css';
        const cwd = new URL(`./fixtures/type-${dir}/`, import.meta.url);
        const config = defineConfig(
          {
            lint: {
              rules: {
                'core/consistent-naming': 'off',
              },
            },
            plugins: [
              css({
                filename: output,
                variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
                modeSelectors: [
                  {
                    mode: 'light',
                    tokens: ['color.*', 'gradient.*'],
                    selectors: ['@media (prefers-color-scheme: light)', '[data-color-theme="light"]'],
                  },
                  {
                    mode: 'dark',
                    tokens: ['color.*', 'gradient.*'],
                    selectors: ['@media (prefers-color-scheme: dark)', '[data-color-theme="dark"]'],
                  },
                  {
                    mode: 'light-colorblind',
                    tokens: ['color.*'],
                    selectors: ['[data-color-theme="light-colorblind"]'],
                  },
                  {
                    mode: 'light-high-contrast',
                    tokens: ['color.*'],
                    selectors: ['[data-color-theme="light-high-contrast"]'],
                  },
                  { mode: 'dark-dimmed', tokens: ['color.*'], selectors: ['[data-color-theme="dark-dimmed"]'] },
                  {
                    mode: 'dark-high-contrast',
                    tokens: ['color.*'],
                    selectors: ['[data-color-theme="dark-high-contrast"]'],
                  },
                  { mode: 'dark-colorblind', tokens: ['color.*'], selectors: ['[data-color-theme="dark-colorblind"]'] },
                  { mode: 'desktop', selectors: ['@media (width >= 600px)'] },
                ],
              }),
            ],
          },
          { cwd },
        );
        const tokensJSON = new URL('./tokens.json', cwd);
        const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
          config,
        });
        const result = await build(tokens, { sources, config });
        await expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
          fileURLToPath(new URL('./want.css', cwd)),
        );
      },
    );
  });

  it('chained selector', async () => {
    const cwd = new URL('./fixtures/chained-selector/', import.meta.url);
    const tokensJSON = new URL('./tokens.json', cwd);
    const config = defineConfig(
      {
        lint: {
          rules: {
            'core/consistent-naming': 'off',
          },
        },
        plugins: [
          css({
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
        ],
      },
      { cwd },
    );
    const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
      config,
    });
    const result = await build(tokens, { sources, config });
    await expect(result.outputFiles[0]?.contents).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
  });

  describe('external DSs', () => {
    it.each([
      'adobe-spectrum',
      'apple-hig',
      'figma-sds',
      'github-primer',
      'ibm-carbon',
      'microsoft-fluent',
      'radix',
      'salesforce-lightning',
      'shopify-polaris',
    ] as const)(
      '%s',
      async (name) => {
        const src = DS[name];
        const cwd = new URL(`./fixtures/ds-${name}/`, import.meta.url);
        const config = defineConfig(
          {
            lint: {
              rules: {
                'core/consistent-naming': 'off',
              },
            },
            plugins: [
              css({
                modeSelectors: [
                  {
                    mode: 'light',
                    tokens: ['color.*', 'gradient.*'],
                    selectors: ['@media (prefers-color-scheme: light)', '[data-color-theme="light"]'],
                  },
                  {
                    mode: 'dark',
                    tokens: ['color.*', 'gradient.*'],
                    selectors: ['@media (prefers-color-scheme: dark)', '[data-color-theme="dark"]'],
                  },
                ],
              }),
            ],
          },
          { cwd },
        );
        const { tokens, sources } = await parse([{ filename: cwd, src }], { config });
        const result = await build(tokens, { sources, config });
        await expect(result.outputFiles[0]?.contents).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
      },
      30_000,
    );
  });

  describe('options', () => {
    it('legacyHex', async () => {
      const output = 'actual.css';
      const cwd = new URL('./fixtures/hex/', import.meta.url);
      const config = defineConfig(
        {
          lint: {
            rules: {
              'core/consistent-naming': 'off',
              'core/valid-color': ['error', { legacyFormat: true }],
            },
          },
          plugins: [
            css({
              filename: output,
              legacyHex: true,
              variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
              modeSelectors: [
                {
                  mode: 'light',
                  tokens: ['color.*', 'gradient.*'],
                  selectors: ['@media (prefers-color-scheme: light)', '[data-color-theme="light"]'],
                },
                {
                  mode: 'dark',
                  tokens: ['color.*', 'gradient.*'],
                  selectors: ['@media (prefers-color-scheme: dark)', '[data-color-theme="dark"]'],
                },
                {
                  mode: 'light-colorblind',
                  tokens: ['color.*'],
                  selectors: ['[data-color-theme="light-colorblind"]'],
                },
                {
                  mode: 'light-high-contrast',
                  tokens: ['color.*'],
                  selectors: ['[data-color-theme="light-high-contrast"]'],
                },
                { mode: 'dark-dimmed', tokens: ['color.*'], selectors: ['[data-color-theme="dark-dimmed"]'] },
                {
                  mode: 'dark-high-contrast',
                  tokens: ['color.*'],
                  selectors: ['[data-color-theme="dark-high-contrast"]'],
                },
                { mode: 'dark-colorblind', tokens: ['color.*'], selectors: ['[data-color-theme="dark-colorblind"]'] },
                { mode: 'desktop', selectors: ['@media (width >= 600px)'] },
              ],
            }),
          ],
        },
        { cwd },
      );
      const tokensJSON = new URL('./tokens.json', cwd);
      const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
        config,
      });
      const result = await build(tokens, { sources, config });
      await expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
        fileURLToPath(new URL('./want.css', cwd)),
      );
    });

    it('utility', async () => {
      const output = 'actual.css';
      const cwd = new URL('./fixtures/utility-css/', import.meta.url);
      const config = defineConfig(
        {
          lint: {
            rules: {
              'core/consistent-naming': 'off',
            },
          },
          plugins: [
            css({
              filename: output,
              variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
              utility: {
                bg: ['color.semantic.*', 'color.gradient.*'],
                border: ['border.*'],
                font: ['typography.*'],
                layout: ['space.*'],
                shadow: ['shadow.*'],
                text: ['color.semantic.*', 'color.gradient.*'],
              },
              modeSelectors: [{ mode: 'desktop', selectors: ['@media (width >= 600px)'] }],
            }),
          ],
        },
        { cwd },
      );
      const tokensJSON = new URL('./tokens.json', cwd);
      const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
        config,
      });
      const result = await build(tokens, { sources, config });
      await expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
        fileURLToPath(new URL('./want.css', cwd)),
      );
    });

    it('baseSelector', async () => {
      const output = 'actual.css';
      const cwd = new URL('./fixtures/base-selector/', import.meta.url);
      const config = defineConfig(
        {
          lint: {
            rules: {
              'core/consistent-naming': 'off',
            },
          },
          plugins: [
            css({
              filename: output,
              baseSelector: ':host',
            }),
          ],
        },
        { cwd },
      );
      const tokensJSON = new URL('./tokens.json', cwd);
      const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
        config,
      });
      const result = await build(tokens, { sources, config });
      await expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
        fileURLToPath(new URL('./want.css', cwd)),
      );
    });

    it('color-scheme properties', async () => {
      const output = 'actual.css';
      const cwd = new URL('./fixtures/color-scheme/', import.meta.url);
      const config = defineConfig(
        {
          lint: {
            rules: {
              'core/consistent-naming': 'off',
            },
          },
          plugins: [
            css({
              filename: output,
              baseScheme: 'light dark',
              modeSelectors: [
                {
                  mode: 'light',
                  tokens: ['color.*'],
                  selectors: ['@media (prefers-color-scheme: light)', '[data-color-theme="light"]'],
                  scheme: 'light',
                },
                {
                  mode: 'dark',
                  tokens: ['color.*'],
                  selectors: ['@media (prefers-color-scheme: dark)', '[data-color-theme="dark"]'],
                  scheme: 'dark',
                },
              ],
            }),
          ],
        },
        { cwd },
      );
      const tokensJSON = new URL('./tokens.json', cwd);
      const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
        config,
      });
      const result = await build(tokens, { sources, config });
      await expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
        fileURLToPath(new URL('./want.css', cwd)),
      );
    });
  });
});
