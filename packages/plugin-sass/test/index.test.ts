import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import sass from '../src/index.js';

describe('@terrazzo/plugin-scss', () => {
  it.each(['basic'])('%s', async (dir) => {
    const filename = 'actual.scss';
    const cwd = new URL(`./fixtures/${dir}/`, import.meta.url);
    const config = defineConfig(
      {
        plugins: [
          css({
            filename: 'actual.css',
            variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
          }),
          sass({
            filename,
          }),
        ],
      },
      { cwd },
    );
    const tokensJSON = new URL('./tokens.json', cwd);
    const { tokens, resolver, sources } = await parse(
      [{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }],
      {
        config,
      },
    );
    const result = await build(tokens, { sources, resolver, config });
    await expect(result.outputFiles.find((f) => f.filename === filename)?.contents).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.scss', cwd)),
    );
  });

  it('config', async () => {
    try {
      defineConfig(
        {
          plugins: [sass()],
        },
        { cwd: new URL(import.meta.url) },
      );
      expect(true).toBe(false);
    } catch (err: unknown) {
      expect(stripAnsi((err as Error).message)).toBe(`@terrazzo/plugin-sass relies on @terrazzo/plugin-css.
Please install @terrazzo/plugin-css and follow setup to add to your config.`);
    }
  });
});
