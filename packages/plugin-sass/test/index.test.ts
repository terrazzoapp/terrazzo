import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@terrazzo/parser';
import { execaNode } from 'execa';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import sass from '../src/index.js';

describe('@terrazzo/plugin-scss', () => {
  it.each(['basic', 'resolver'])('%s', async (dir) => {
    const cwd = new URL(`./fixtures/${dir}/`, import.meta.url);
    await execaNode({ cwd })`../../../../cli/bin/cli.js build`;
    await expect(await fs.readFile(new URL('actual.css', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('want.css', cwd)),
    );
    await expect(await fs.readFile(new URL('actual.scss', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('want.scss', cwd)),
    );
  });

  it('config', async () => {
    try {
      defineConfig({ plugins: [sass()] }, { cwd: new URL(import.meta.url) });
      expect(true).toBe(false);
    } catch (err: unknown) {
      expect(stripAnsi((err as Error).message)).toBe(`@terrazzo/plugin-sass relies on @terrazzo/plugin-css.
Please install @terrazzo/plugin-css and follow setup to add to your config.`);
    }
  });
});
