import { execa } from 'execa';
import { describe, expect, it } from 'vitest';

const cmd = '../../../bin/cli.js';

describe('tz build', () => {
  // note: Successful build tests live in plugins’ directories, because
  // importing them here would create a circlar dep. Errors can be tested here,
  // though.

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
