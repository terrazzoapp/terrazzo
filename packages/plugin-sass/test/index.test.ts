import { build, defineConfig, parse } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import css from '@terrazzo/plugin-css';
import stripAnsi from 'strip-ansi';
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import sass from '../src/index.js';

describe('@terrazzo/plugin-scss', () => {
  test.each(['basic'])('%s', async (dir) => {
    const cwd = new URL(`./${dir}/`, import.meta.url);
    const config = defineConfig(
      {
        plugins: [
          css({
            filename: 'actual.css',
            variableName: (name) => makeCSSVar(name, { prefix: 'ds' }),
          }),
          sass({
            filename: 'actual.scss',
          }),
        ],
      },
      { cwd },
    );
    const { tokens, ast } = await parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'), { config });
    const result = await build(tokens, { ast, config });
    expect(result.outputFiles.find((f) => f.filename.endsWith('.scss'))?.contents).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.scss', cwd)),
    );
  });

  test('config', async () => {
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
