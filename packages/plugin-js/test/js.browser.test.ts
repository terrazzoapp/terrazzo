import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import js from '../src/index.js';

describe('Browser', () => {
  it('generates correct JS + DTS', async () => {
    const cwd = new URL('file:///');
    const tokensJSON = new URL('./tokens.json', cwd);
    const primer = await import(`dtcg-examples/github-primer.json`).then((m) => m.default);
    const config = defineConfig(
      {
        plugins: [
          js({
            js: 'want.js',
          }),
        ],
      },
      { cwd },
    );
    const { tokens, sources } = await parse({ filename: tokensJSON, src: primer }, { config });
    const result = await build(tokens, { sources, config });
    await expect(result.outputFiles.find((f) => f.filename === 'want.js')?.contents).toMatchSnapshot();
    await expect(result.outputFiles.find((f) => f.filename === 'want.d.ts')?.contents).toMatchSnapshot();
  });
});
