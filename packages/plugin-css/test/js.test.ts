import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import { describe, expect, it } from 'vitest';
import css, { type Permutation } from '../src/index.js';

const require = createRequire(import.meta.url);

const MODE_LIGHT_ROOT: Permutation = {
  input: { mode: 'light' },
  prepare: (css) => `:root {
  ${css}
}`,
};
const MODE_LIGHT: Permutation = {
  input: { mode: 'light' },
  prepare: (css) => `[data-color-theme="light"] {
  ${css}
}`,
};
const MODE_DARK: Permutation = {
  input: { mode: 'dark' },
  prepare: (css) => `[data-color-theme="dark"] {
  ${css}
}`,
};
const MODE_DARK_MQ: Permutation = {
  input: { mode: 'dark' },
  prepare: (css) => `@media (prefers-color-scheme: dark) {
  :root {
    ${css}
  }
}`,
};
const MODE_LIGHT_COLORBLIND: Permutation = {
  input: { mode: 'light-colorblind' },
  prepare: (css) => `[data-color-theme="light-colorblind"] {
  ${css}
}`,
};
const MODE_LIGHT_HIGH_CONTRAST: Permutation = {
  input: { mode: 'light-high-contrast' },
  prepare: (css) => `[data-color-theme="light-high-contrast"] {
  ${css}
`,
};
const MODE_DARK_DIMMED: Permutation = {
  input: { mode: 'dark-dimmed' },
  prepare: (css) => `[data-color-theme="dark-dimmed"] {
  ${css}
}`,
};
const MODE_DARK_HIGH_CONTRAST: Permutation = {
  input: { mode: 'dark-high-contrast' },
  prepare: (css) => `[data-color-theme="dark-high-contrast"] {
  ${css}
}`,
};
const MODE_DARK_COLORBLIND: Permutation = {
  input: { mode: 'dark-colorblind' },
  prepare: (css) => `[data-color-theme="dark-colorblind"] {
  ${css}
}`,
};
const SIZE_MOBILE: Permutation = {
  input: { size: 'mobile' },
  prepare: (css) => `:root {
  ${css}
}`,
};
const SIZE_DESKTOP: Permutation = {
  input: { size: 'desktop' },
  prepare: (css) => `@media (width >= 600px) {
  ${css}
}`,
};

describe('Node.js API', () => {
  describe.only('token types', () => {
    const tests: [string, { permutations?: Permutation[] }][] = [
      ['boolean', {}],
      ['border', { permutations: [MODE_LIGHT_ROOT, MODE_LIGHT, MODE_DARK_MQ, MODE_DARK] }],
      [
        'color',
        {
          permutations: [
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
      ['dimension', { permutations: [SIZE_MOBILE, SIZE_DESKTOP] }],
      ['gradient', { permutations: [MODE_LIGHT, MODE_DARK] }],
      ['shadow', {}],
      ['string', {}],
      ['transition', {}],
      ['typography', { permutations: [SIZE_MOBILE, SIZE_DESKTOP] }],
    ];

    it.each(tests)('%s', async (name, { permutations }) => {
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
            css({ filename: output, variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }), permutations }),
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

  describe('modeSelectors (deprecated)', () => {
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
              permutations: [MODE_LIGHT_ROOT, MODE_DARK, MODE_DARK_MQ],
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
              permutations: [
                SIZE_MOBILE,
                MODE_LIGHT_ROOT,
                MODE_LIGHT,
                MODE_DARK_MQ,
                MODE_DARK,
                MODE_LIGHT_COLORBLIND,
                MODE_LIGHT_HIGH_CONTRAST,
                MODE_DARK_DIMMED,
                MODE_DARK_HIGH_CONTRAST,
                MODE_DARK_COLORBLIND,
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

    it('baseSelector (deprecated)', async () => {
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

    it('color-scheme (deprecated)', async () => {
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
                  selectors: ['[data-color-theme="light"]'],
                  mode: 'light',
                  scheme: 'light',
                },
                {
                  selectors: ['[data-color-theme="dark"]'],
                  mode: 'dark',
                  scheme: 'dark',
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
