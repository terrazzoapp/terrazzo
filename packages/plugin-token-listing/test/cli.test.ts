import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execaNode } from 'execa';
import { describe, expect, it } from 'vitest';

const cmd = '../../../../cli/bin/cli.js';

describe('tz build', () => {
  it('basic meta', async () => {
    const cwd = new URL('./fixtures/cli/', import.meta.url);
    await execaNode({ cwd })`${cmd} build`;
    const testFile = new URL('./tokens/tokens.listing.json', cwd);

    // expect generated file exists & isn’t empty
    expect(fs.readFileSync(testFile, 'utf8')).toEqual(
      expect.stringContaining(`{
  "meta": {
    "version": 1,
    "authoringTool": "Terrazzo",
    "platforms": {}
  },
  "data": [
`),
    );
  });

  it('watch', async () => {
    // note: this test is identical to "default"; just duplicated so 2 tests can
    // touch the filesystem without conflicting
    const cwd = new URL('./fixtures/cli-watch/', import.meta.url);
    const testFile = new URL('./tokens/tokens.listing.json', cwd);

    try {
      // `--watch` will never terminate, so we want to cancel it after the file is created.
      // execa recommends AbortController rather than child.kill() for better cleanup.
      const controller = new AbortController();
      execaNode({
        cwd,
        cancelSignal: controller.signal,
        gracefulCancel: true,
        forceKillAfterDelay: false,
      })`${cmd} build --watch`;

      // poll for file creation (note: Vitest will handle timeouts)
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (fs.existsSync(testFile)) {
            clearInterval(interval);
            resolve(undefined);
          }
        }, 100);
      });

      // abort process (preferred over child.kill())
      controller.abort();
    } catch {
      // noop
    }

    // expect file isn’t empty
    expect(fs.readFileSync(testFile, 'utf8')).toEqual(
      expect.stringContaining(`{
  "meta": {
    "version": 1,
    "authoringTool": "Terrazzo",
    "platforms": {}
  },
  "data": [`),
    );
  });

  describe('plugin-token-listing options', () => {
    it('outDir', async () => {
      const cwd = new URL('./fixtures/cli-config-outdir/', import.meta.url);
      await execaNode({ cwd })`${cmd} build`;

      const actual = fs.readFileSync(new URL('./styles/out/actual.listing.json', cwd), 'utf8');
      const comparable = actual
        .replace(/"line": \d+/g, '"line": 0')
        .replace(/"column": \d+/g, '"column": 0')
        .replace(/"offset": \d+/g, '"offset": 0');
      await expect(comparable).toMatchFileSnapshot(fileURLToPath(new URL('./styles/out/want.listing.json', cwd)));
    });
  });
});
