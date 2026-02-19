import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execaNode } from 'execa';
import { describe, expect, it } from 'vitest';

const cmd = '../../../bin/cli.js';

describe('tz build', () => {
  // note: More advanced plugins are tested in their respective folders, to avoid a circular dep.
  // This tests errors, and simplified plugin examples
  describe('transform', () => {
    it('getTransforms / setTransform', async () => {
      const cwd = new URL('./fixtures/get-transforms-resolver/', import.meta.url);
      await execaNode({ cwd })`${cmd} build`;
      const given = fs.readFileSync(new URL('actual.json', cwd), 'utf8');
      await expect(given).toMatchFileSnapshot(fileURLToPath(new URL('want.json', cwd)));
    });

    it('getTransforms / setTransform (legacy modes)', async () => {
      const cwd = new URL('./fixtures/get-transforms-mode/', import.meta.url);
      await execaNode({ cwd })`${cmd} build`;
      const given = fs.readFileSync(new URL('actual.json', cwd), 'utf8');
      await expect(given).toMatchFileSnapshot(fileURLToPath(new URL('want.json', cwd)));
    });
  });

  describe('errors', () => {
    // note: Parsing out the execa error is more hassle than just using inline
    // snapshots.  Ignoring that line, the error message below is what users
    // actually see.
    it('no tokens', async () => {
      const cwd = new URL('./fixtures/error-no-tokens/', import.meta.url);
      await expect(() => execaNode({ cwd })`${cmd} build`).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ExecaError: Command failed with exit code 1: ../../../bin/cli.js build

        ✗  config: Could not locate tokens.json. To create one, run \`npx tz init\`.]
      `);
    });

    it('config: no default export', async () => {
      const cwd = new URL('./fixtures/error-no-default-export/', import.meta.url);
      await expect(() => execaNode({ cwd })`${cmd} build`).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ExecaError: Command failed with exit code 1: ../../../bin/cli.js build

        ✗  config: No default export found in terrazzo.config.js. See https://terrazzo.dev/docs for instructions.]
      `);
    });
  });
});
