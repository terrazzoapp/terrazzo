import { build, defineConfig, parse } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import css from '@terrazzo/plugin-css';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
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
            variableName: (name) => makeCSSVar(name, { prefix: 'ds' }),
          }),
          sass({
            filename,
          }),
        ],
      },
      { cwd },
    );
    const { tokens, ast } = await parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'), { config });
    const result = await build(tokens, { ast, config });
    expect(result.outputFiles.find((f) => f.filename === filename)?.contents).toMatchFileSnapshot(
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
