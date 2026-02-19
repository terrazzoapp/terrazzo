import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@terrazzo/parser';
import { execa } from 'execa';
import { describe, expect, test } from 'vitest';
import tailwind from '../src/index.js';

const cmd = '../../../../cli/bin/cli.js';

describe('CLI', () => {
  const fixtures = ['primer', 'template', 'resolver'];

  test.each(fixtures)('%s', async (dir) => {
    const cwd = new URL(`./fixtures/${dir}/`, import.meta.url);
    await execa('node', [cmd, 'build'], { cwd, stdout: 'inherit' });
    const actual = fs.readFileSync(new URL('./actual.css', cwd), 'utf8');
    await expect(actual).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
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
