import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@terrazzo/parser';
import { execa, execaNode } from 'execa';
import { describe, expect, test } from 'vitest';
import tailwind from '../src/index.js';

const cmd = '../../../../cli/bin/cli.js';

describe('CLI', () => {
  const fixtures = ['primer', 'template', 'resolver'];

  test.each(fixtures)('%s', async (dir) => {
    const cwd = new URL(`./fixtures/${dir}/`, import.meta.url);
    await execaNode({ cwd })`${cmd} build`;

    // test snapshot
    const actual = fs.readFileSync(new URL('./actual.css', cwd), 'utf8').replace(/\r\n/g, '\n');
    const want = fileURLToPath(new URL('./want.css', cwd));
    await expect(actual).toMatchFileSnapshot(want);

    // test Tailwind validity
    const tailwindActual = new URL('./tailwind.actual.css', cwd);
    const tailwindWant = new URL('./tailwind.want.css', cwd);
    await execa({ cwd })`pnpm exec tailwindcss -i ${want} -o ${fileURLToPath(tailwindActual)}`;
    await expect(fs.readFileSync(tailwindActual, 'utf8')).toMatchFileSnapshot(fileURLToPath(tailwindWant));
  });

  describe('errors', () => {
    test('plugin-css missing', async () => {
      const cwd = new URL('./fixtures/primer/', import.meta.url);
      expect(() => defineConfig({ plugins: [tailwind({ theme: {} })] }, { cwd })).toThrowError(
        '@terrazzo/plugin-css missing! Please install and add to the plugins array to use the Tailwind plugin.',
      );
    });
  });
});
