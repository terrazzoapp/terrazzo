import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execaNode } from 'execa';
import { describe, expect, it } from 'vitest';
import { createBuildQueue } from '../src/build.js';

const cmd = '../../../bin/cli.js';

describe('tz build', () => {
  // note: More advanced plugins are tested in their respective folders, to avoid a circular dep.
  // This tests errors, and simplified plugin examples
  describe('transform', () => {
    it('getTransforms / setTransform', async () => {
      const cwd = new URL('./fixtures/get-transforms-resolver/', import.meta.url);
      await execaNode({ cwd })`${cmd} build`;
      const given = fs.readFileSync(new URL('./actual.json', cwd), 'utf8');
      await expect(given).toMatchFileSnapshot(fileURLToPath(new URL('./want.json', cwd)));
    });

    it('getTransforms / setTransform (legacy modes)', async () => {
      const cwd = new URL('./fixtures/get-transforms-mode/', import.meta.url);
      await execaNode({ cwd })`${cmd} build`;
      const given = fs.readFileSync(new URL('./actual.json', cwd), 'utf8');
      await expect(given).toMatchFileSnapshot(fileURLToPath(new URL('./want.json', cwd)));
    });
  });

  describe('errors', () => {
    // note: Parsing out the execa error is more hassle than just using inline
    // snapshots.  Ignoring that line, the error message below is what users
    // actually see.
    it('no tokens', async () => {
      const cwd = new URL('./fixtures/error-no-tokens/', import.meta.url);
      await expect(() => execaNode({ cwd })`${cmd} build`).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        [ExecaError: Command failed with exit code 1: ../../../bin/cli.js build

        ✗  config: Could not locate tokens.json. To create one, run \`npx tz init\`.]
      `);
    });

    // Note: while splitting tests by platform isn’t normally a good idea, this
    // Windows case is a really important one to guard against resolution AND
    // have the error message make it really clear what it tried to resolve.
    // Obfuscating this only hurts users and future bugfixes.

    it.skipIf(os.platform() === 'win32')('config: no default export (Non-Windows)', async () => {
      const cwd = new URL('./fixtures/error-no-default-export/', import.meta.url);
      await expect(() => execaNode({ cwd })`${cmd} build`).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        [ExecaError: Command failed with exit code 1: ../../../bin/cli.js build

        ✗  config: No default export found in file://terrazzo.config.js. See https://terrazzo.dev/docs for instructions.]
      `);
    });

    it.skipIf(os.platform() !== 'win32')('config: no default export (Windows)', async () => {
      const cwd = new URL('./fixtures/error-no-default-export/', import.meta.url);
      await expect(() => execaNode({ cwd })`${cmd} build`).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        [ExecaError: Command failed with exit code 1: ../../../bin/cli.js build

        ✗  config: No default export found in file:///D:/a/terrazzo/terrazzo/packages/cli/test/fixtures/error-no-default-export/terrazzo.config.js. See https://terrazzo.dev/docs for instructions.]
      `);
    });
  });

  describe('watch build queue', () => {
    it('queues only the latest rebuild while a build is in progress', async () => {
      const started: string[] = [];
      const finished: string[] = [];
      let releaseFirst!: () => void;
      const firstGate = new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });

      const enqueue = createBuildQueue(async (label: string) => {
        started.push(label);
        if (label === 'first') {
          await firstGate;
        }
        finished.push(label);
      });

      const p1 = enqueue('first');
      const p2 = enqueue('second');
      const p3 = enqueue('third');

      expect(started).toEqual(['first']);
      releaseFirst();
      await Promise.all([p1, p2, p3]);

      expect(started).toEqual(['first', 'third']);
      expect(finished).toEqual(['first', 'third']);
    });
  });
});
