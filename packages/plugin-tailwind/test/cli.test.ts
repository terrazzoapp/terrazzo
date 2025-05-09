import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@terrazzo/parser';
import { execa } from 'execa';
import { describe, expect, test } from 'vitest';
import tailwind from '../src/index.js';

const CMD = '../../../../cli/bin/cli.js';

describe('CLI', () => {
  const fixtures = ['primer'];

  test.each(fixtures)('%s', async (dir) => {
    const cwd = new URL(`./fixtures/${dir}/`, import.meta.url);
    await execa('node', [CMD, 'build'], { cwd, stdout: 'inherit' });
    await expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.css', cwd)),
    );
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
