import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import css from '../src/index.js';

describe('Browser', () => {
  it('generates correct CSS', async () => {
    const cwd = new URL('file:///');
    const tokensJSON = new URL('./tokens.json', cwd);
    const primer = await import(`dtcg-examples/github-primer.json`).then((m) => m.default);
    const config = defineConfig(
      {
        lint: {
          rules: {
            'core/consistent-naming': 'off',
          },
        },
        plugins: [
          css({
            // Note: keep in sync with js.test.ts
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
    const { tokens, sources } = await parse({ filename: tokensJSON, src: primer }, { config });
    const result = await build(tokens, { sources, config });
    await expect(result.outputFiles.find((f) => f.filename === 'index.css')?.contents).toMatchSnapshot();
  });
});
