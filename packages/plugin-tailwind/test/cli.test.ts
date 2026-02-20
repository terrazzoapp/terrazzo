import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { execa, execaNode } from 'execa';
import stripAnsi from 'strip-ansi';
import { describe, expect, test } from 'vitest';
import tailwind from '../src/index.js';

const cmd = '../../../../cli/bin/cli.js';

describe('CLI', () => {
  const fixtures = ['legacy-modes', 'resolver'];

  test.each(fixtures)('%s', async (dir) => {
    const cwd = new URL(`./fixtures/${dir}/`, import.meta.url);
    await execaNode({ cwd })`${cmd} build`;

    const actual = fs.readFileSync(new URL('./actual.css', cwd), 'utf8').replace(/\r\n/g, '\n');
    const want = fileURLToPath(new URL('./want.css', cwd));
    await expect(actual).toMatchFileSnapshot(want);
  });

  // Test Tailwind separately so it doesn’t tick up previous test runtime
  test.each(fixtures)('%s: Tailwind', async (dir) => {
    const cwd = new URL(`./fixtures/${dir}/`, import.meta.url);
    const tailwindActual = new URL('./tailwind.actual.css', cwd);
    const tailwindWant = new URL('./tailwind.want.css', cwd);
    const want = fileURLToPath(new URL('./want.css', cwd));

    // Note: this test is important for 2 reasons:
    // 1. It tests that we generated valid Tailwind
    // 2. It tests that Tailwind’s treeshaking doesn’t accidentally “eat” tokens.
    //
    // Though this is a bit weird we’re testing the golden snapshot, not the
    // actual output, it’s functionally the same and allows for this to be
    // parallelized (it just may show an error on the next run after the goldens
    // have been updated).
    await execa({ cwd })`pnpm exec tailwindcss -i ${want} -o ${fileURLToPath(tailwindActual)}`;
    await expect(fs.readFileSync(tailwindActual, 'utf8')).toMatchFileSnapshot(fileURLToPath(tailwindWant));
  });

  describe('errors', () => {
    test('plugin-css missing', async () => {
      const cwd = new URL('./fixtures/legacy-modes/', import.meta.url);
      expect(() => defineConfig({ plugins: [tailwind({ template: '', theme: {} })] }, { cwd })).toThrowError(
        '@terrazzo/plugin-css missing! Please install and add to the plugins array to use the Tailwind plugin.',
      );
    });

    test('bad template', async () => {
      const cwd = new URL('./fixtures/legacy-modes/', import.meta.url);
      try {
        const config = defineConfig(
          { plugins: [css({ skipBuild: true }), tailwind({ template: 'bad', theme: {} })] },
          { cwd },
        );
        expect(config).toThrowError();
      } catch (err) {
        expect(stripAnsi((err as Error).message)).toBe(
          'plugin:@terrazzo/plugin-tailwind: Could not locate template "bad". Does the file exist?',
        );
      }
    });
  });
});
