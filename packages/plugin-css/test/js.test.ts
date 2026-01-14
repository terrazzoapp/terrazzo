import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import { describe, expect, it } from 'vitest';
import css, { type ContextSelector } from '../src/index.js';

const require = createRequire(import.meta.url);

describe('Node.js API', () => {
  describe('token types', () => {
    const MODE_LIGHT = { modifier: 'mode', context: 'light', selector: '[data-color-theme="light"]' };
    const MODE_DARK = { modifier: 'mode', context: 'dark', selector: '[data-color-theme="dark"]' };
    const MODE_LIGHT_COLORBLIND = {
      modifier: 'mode',
      context: 'light-colorblind',
      selector: '[data-color-theme="light-colorblind"]',
    };
    const MODE_LIGHT_HIGH_CONTRAST = {
      modifier: 'mode',
      context: 'light-high-contrast',
      selector: '[data-color-theme="light-high-contrast"]',
    };
    const MODE_DARK_DIMMED = { modifier: 'mode', context: 'dark-dimmed', selector: '[data-color-theme="dark-dimmed"]' };
    const MODE_DARK_HIGH_CONTRAST = {
      modifier: 'mode',
      context: 'dark-high-contrast',
      selector: '[data-color-theme="dark-high-contrast"]',
    };
    const MODE_DARK_COLORBLIND = {
      modifier: 'mode',
      context: 'dark-colorblind',
      selector: '[data-color-theme="dark-colorblind"]',
    };
    const SIZE_DESKTOP = { modifier: 'size', context: 'desktop', selector: '@media (width >= 600px)' };

    const tests: [string, { baseContext?: Record<string, string>; contextSelectors?: ContextSelector[] }][] = [
      ['boolean', {}],
      ['border', { baseContext: { mode: 'light' }, contextSelectors: [MODE_LIGHT, MODE_DARK] }],
      [
        'color',
        {
          baseContext: { mode: 'light' },
          contextSelectors: [
            MODE_LIGHT,
            MODE_LIGHT_COLORBLIND,
            MODE_LIGHT_HIGH_CONTRAST,
            MODE_DARK,
            MODE_DARK_DIMMED,
            MODE_DARK_COLORBLIND,
            MODE_DARK_HIGH_CONTRAST,
          ],
        },
      ],
      ['dimension', { baseContext: { size: 'mobile' }, contextSelectors: [SIZE_DESKTOP] }],
      ['gradient', { baseContext: { size: 'light' }, contextSelectors: [MODE_LIGHT, MODE_DARK] }],
      ['shadow', {}],
      ['string', {}],
      ['transition', {}],
      ['typography', { baseContext: { size: 'mobile' }, contextSelectors: [SIZE_DESKTOP] }],
    ];

    it.each(tests)('%s', async (name, { baseContext, contextSelectors }) => {
      const output = 'actual.css';
      const cwd = new URL(`./fixtures/type-${name}/`, import.meta.url);
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
              baseContext,
              contextSelectors,
            }),
          ],
        },
        { cwd },
      );
      const resolverJSON = new URL(`./${name}.resolver.json`, cwd);
      const { tokens, resolver, sources } = await parse(
        [{ filename: resolverJSON, src: await fs.readFile(resolverJSON, 'utf8') }],
        { config },
      );
      const result = await build(tokens, { resolver, sources, config });
      await expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
        fileURLToPath(new URL('./want.css', cwd)),
      );
    });
  });

  describe('legacy modeSelectors', () => {
    describe('token types', () => {
      it.each([
        'boolean',
        'border',
        'color',
        'dimension',
        'gradient',
        'shadow',
        'string',
        'typography',
        'transition',
      ])('%s', async (dir) => {
        const output = 'actual.css';
        const cwd = new URL(`./fixtures/mode-type-${dir}/`, import.meta.url);
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
        const { tokens, resolver, sources } = await parse(
          [{ filename: tokensJSON, src: await fs.readFile(tokensJSON, 'utf8') }],
          { config },
        );
        const result = await build(tokens, { resolver, sources, config });
        await expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
          fileURLToPath(new URL('./want.css', cwd)),
        );
      });
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
      const { tokens, resolver, sources } = await parse(
        [{ filename: tokensJSON, src: await fs.readFile(tokensJSON, 'utf8') }],
        {
          config,
        },
      );
      const result = await build(tokens, { resolver, sources, config });
      await expect(result.outputFiles[0]?.contents).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
    });
  });

  describe('external DSs', () => {
    it.each([
      'adobe-spectrum',
      // 'apple-hig',
      'figma-sds',
      'github-primer',
      'ibm-carbon',
      'microsoft-fluent',
      // 'radix',
      // 'salesforce-lightning',
      'shopify-polaris',
    ] as const)('%s', async (name) => {
      const cwd = new URL(`./fixtures/ds-${name}/`, import.meta.url);
      const src = `dtcg-examples/${name}.resolver.json`;
      const config = defineConfig(
        {
          tokens: [src],
          lint: {
            rules: {
              'core/consistent-naming': 'off',
            },
          },
          plugins: [
            css({
              baseContext: {
                mode: 'light',
              },
              contextSelectors: [
                {
                  modifier: 'mode',
                  context: 'light',
                  selector: '[data-color-theme="light"]',
                },
                {
                  modifier: 'mode',
                  context: 'dark',
                  selector: '[data-color-theme="dark"]',
                },
                {
                  modifier: 'mode',
                  context: 'dark',
                  selector: '@media (prefers-color-scheme: dark)',
                },
              ],
            }),
          ],
        },
        { cwd },
      );
      const filename = pathToFileURL(require.resolve(src));
      const { tokens, resolver, sources } = await parse([{ filename, src: await fs.readFile(filename, 'utf8') }], {
        config,
      });
      const result = await build(tokens, { resolver, sources, config });
      await expect(result.outputFiles[0]?.contents).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
    }, 30_000);
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
              baseContext: {
                mode: 'light',
                size: 'mobile',
              },
              contextSelectors: [
                {
                  modifier: 'mode',
                  context: 'light',
                  selector: '[data-color-theme="light"]',
                },
                {
                  modifier: 'mode',
                  context: 'dark',
                  selector: '@media (prefers-color-scheme: dark)',
                },
                {
                  modifier: 'mode',
                  context: 'dark',
                  selector: '[data-color-theme="dark"]',
                },
                {
                  modifier: 'mode',
                  context: 'light-colorblind',
                  selector: '[data-color-theme="light-colorblind"]',
                },
                {
                  modifier: 'mode',
                  context: 'light-high-contrast',
                  selector: '[data-color-theme="light-high-contrast"]',
                },
                {
                  modifier: 'mode',
                  context: 'dark-dimmed',
                  selector: '[data-color-theme="dark-dimmed"]',
                },
                {
                  modifier: 'mode',
                  context: 'dark-high-contrast',
                  selector: '[data-color-theme="dark-high-contrast"]',
                },
                {
                  modifier: 'mode',
                  context: 'dark-colorblind',
                  selector: '[data-color-theme="dark-colorblind"]',
                },
                {
                  modifier: 'size',
                  context: 'desktop',
                  selector: '@media (width >= 600px)',
                },
              ],
            }),
          ],
        },
        { cwd },
      );
      const resolverJSON = new URL('./resolver.json', cwd);
      const { tokens, resolver, sources } = await parse(
        [{ filename: resolverJSON, src: await fs.readFile(resolverJSON, 'utf8') }],
        { config },
      );
      const result = await build(tokens, { resolver, sources, config });
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
      const { tokens, resolver, sources } = await parse(
        [{ filename: tokensJSON, src: await fs.readFile(tokensJSON, 'utf8') }],
        { config },
      );
      const result = await build(tokens, { resolver, sources, config });
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
      const { tokens, resolver, sources } = await parse(
        [{ filename: tokensJSON, src: await fs.readFile(tokensJSON, 'utf8') }],
        { config },
      );
      const result = await build(tokens, { resolver, sources, config });
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
              baseColorScheme: 'light dark',
              contextSelectors: [
                {
                  modifier: 'mode',
                  context: 'light',
                  selector: '[data-color-theme="light"]',
                  colorScheme: 'light',
                },
                {
                  modifier: 'mode',
                  context: 'dark',
                  selector: '[data-color-theme="dark"]',
                  colorScheme: 'dark',
                },
              ],
            }),
          ],
        },
        { cwd },
      );
      const tokensJSON = new URL('./tokens.json', cwd);
      const { tokens, resolver, sources } = await parse(
        [{ filename: tokensJSON, src: await fs.readFile(tokensJSON, 'utf8') }],
        { config },
      );
      const result = await build(tokens, { resolver, sources, config });
      await expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
        fileURLToPath(new URL('./want.css', cwd)),
      );
    });
  });
});
