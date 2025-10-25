import { build, defineConfig, parse } from '@terrazzo/parser';
import githubPrimer from 'dtcg-examples/github-primer.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import js from '../src/index.js';

describe('Browser', () => {
  it('generates correct JS + DTS', async () => {
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
          js({
            js: 'want.js',
          }),
        ],
      },
      { cwd },
    );
    const { tokens, sources } = await parse({ filename: tokensJSON, src: githubPrimer }, { config });
    const result = await build(tokens, { sources, config });
    await expect(result.outputFiles.find((f) => f.filename === 'want.js')?.contents).toMatchSnapshot();
    await expect(result.outputFiles.find((f) => f.filename === 'want.d.ts')?.contents).toMatchSnapshot();
  });
});
