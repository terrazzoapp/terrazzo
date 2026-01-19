import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import css from '../src/index.js';

describe('Browser', () => {
  it('generates correct CSS ', async () => {
    const config = defineConfig(
      {
        lint: {
          rules: {
            'core/consistent-naming': 'off',
          },
        },
        plugins: [
          css({
            permutations: [
              {
                prepare: (css) => `[data-color-theme="light"] {${css}}`,
                input: { mode: 'light' },
              },
              {
                prepare: (css) => `@media (prefers-color-scheme: dark) { :root {${css} } }`,
                input: { mode: 'dark' },
              },
              {
                prepare: (css) => `[data-color-theme="dark"] {${css}}`,
                input: { mode: 'dark' },
              },
            ],
          }),
        ],
      },
      { cwd: new URL('http://localhost:8080') },
    );

    const src = 'dtcg-examples/github-primer.resolver.json';
    const { tokens, resolver, sources } = await parse(
      { filename: new URL(`fs://${src}`), src: await import(src, { with: { type: 'json' } }) },
      { config },
    );
    const result = await build(tokens, { resolver, sources, config });
    await expect(result.outputFiles.find((f) => f.filename === 'index.css')?.contents).toMatchSnapshot();
  });
});
