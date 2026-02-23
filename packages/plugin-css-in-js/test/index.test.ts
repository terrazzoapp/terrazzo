import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execaNode } from 'execa';
import { describe, expect, it } from 'vitest';

describe('plugin-css-in-js', () => {
  const tests = ['typography'];

  it.each(tests)('%s', async (dir) => {
    const cwd = new URL(`./fixtures/${dir}/`, import.meta.url);
    await execaNode({ cwd })`../../../../cli/bin/cli.js build`;

    const js = await fs.readFile(new URL('./actual.js', cwd), 'utf8');
    await expect(js).toMatchFileSnapshot(fileURLToPath(new URL('./want.js', cwd)));
    const dts = await fs.readFile(new URL('./actual.d.ts', cwd), 'utf8');
    await expect(dts).toMatchFileSnapshot(fileURLToPath(new URL('./want.d.ts', cwd)));
  });

  describe('DS', () => {
    it('Figma SDS', async () => {
      const cwd = new URL('./fixtures/figma-sds/', import.meta.url);
      await execaNode({ cwd })`../../../../cli/bin/cli.js build`;

      const js = await fs.readFile(new URL('./actual.js', cwd), 'utf8');
      await expect(js).toMatchFileSnapshot(fileURLToPath(new URL('./want.js', cwd)));

      // assert all $root’s got hoisted
      expect(js).toEqual(expect.stringContaining('"brand"'));
      expect(js).toEqual(expect.stringContaining('"brandHover"'));
      expect(js).toEqual(expect.stringContaining('"brandSecondary"'));
      expect(js).not.toEqual(expect.stringContaining('$root'));

      await expect(await fs.readFile(new URL('./actual.d.ts', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('./want.d.ts', cwd)),
      );
    }, 15_000); // Windows tests in CI need extra time
  });
});
