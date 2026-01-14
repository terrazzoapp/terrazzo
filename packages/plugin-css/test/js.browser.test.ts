import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import css from '../src/index.js';
import { DS } from './lib.test.js';

describe('Browser', () => {
  it('generates correct CSS ', async () => {
    const cwd = new URL('file:///');
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
            baseColorScheme: 'light dark',
            contextSelectors: [
              {
                selector: '[data-color-theme="light"]',
                modifier: 'mode',
                context: 'light',
                colorScheme: 'light',
              },
              {
                selector: '@media (prefers-color-scheme: dark)',
                modifier: 'mode',
                context: 'dark',
                colorScheme: 'dark',
              },
              {
                selector: '[data-color-theme="dark"]',
                modifier: 'mode',
                context: 'dark',
                colorScheme: 'dark',
              },
            ],
          }),
        ],
      },
      { cwd },
    );
    const { tokens, resolver, sources } = await parse({ filename: tokensJSON, src: DS['github-primer'] }, { config });
    const result = await build(tokens, { resolver, sources, config });
    await expect(result.outputFiles.find((f) => f.filename === 'index.css')?.contents).toMatchSnapshot();
  });

  it('generates correct CSS (legacy modeSelectors)', async () => {
    const cwd = new URL('file:///');
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
    const { tokens, resolver, sources } = await parse({ filename: tokensJSON, src: DS['github-primer'] }, { config });
    const result = await build(tokens, { resolver, sources, config });
    await expect(result.outputFiles.find((f) => f.filename === 'index.css')?.contents).toMatchSnapshot();
  });
});
