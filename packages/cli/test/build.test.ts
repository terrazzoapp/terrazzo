import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { describe, expect, it } from 'vitest';

const cmd = '../../../bin/cli.js';

describe('tz build', () => {
  // note: More advanced plugins are tested in their respective folders, to avoid a circular dep.
  // This tests errors, and simplified plugin examples
  describe('transform', () => {
    it('getTransforms / setTransform', async () => {
      const cwd = new URL('./fixtures/get-transforms/', import.meta.url);
      await execa('node', [cmd, 'build'], { cwd });
      const given = fs.readFileSync(new URL('given.json', cwd), 'utf8');
      await expect(given).toMatchFileSnapshot(fileURLToPath(new URL('want.json', cwd)));
    });
  });

  describe('errors', () => {
    // note: Parsing out the execa error is more hassle than just using inline
    // snapshots.  Ignoring that line, the error message below is what users
    // actually see.
    it('no tokens', async () => {
      const cwd = new URL('./fixtures/error-no-tokens/', import.meta.url);
      await expect(() => execa('node', [cmd, 'build'], { cwd })).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ExecaError: Command failed with exit code 1: node ../../../bin/cli.js build

        ✗  [config] Could not locate tokens.json. To create one, run \`npx tz init\`.]
      `);
    });

    it('config: no default export', async () => {
      const cwd = new URL('./fixtures/error-no-default-export/', import.meta.url);
      await expect(() => execa('node', [cmd, 'build'], { cwd })).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ExecaError: Command failed with exit code 1: node ../../../bin/cli.js build

        ✗  [config] No default export found in terrazzo.config.js. See https://terrazzo.dev/docs/cli for instructions.]
      `);
    });
  });
});
