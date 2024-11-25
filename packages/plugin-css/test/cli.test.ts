import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { describe, expect, it } from 'vitest';

const cmd = '../../../../cli/bin/cli.js';

describe('tz build', () => {
  it('simple', async () => {
    const cwd = new URL('./fixtures/cli/', import.meta.url);
    await execa('node', [cmd, 'build'], { cwd });
    const testFile = new URL('./tokens/index.css', cwd);

    // expect generated file exists & isn’t empty
    expect(fs.readFileSync(testFile, 'utf8')).toEqual(
      expect.stringContaining(`/* -------------------------------------------
 *  Autogenerated by ⛋ Terrazzo. DO NOT EDIT!
 * ------------------------------------------- */`),
    );
  });

  it('yaml', async () => {
    const cwd = new URL('./fixtures/cli-yaml/', import.meta.url);
    await execa('node', [cmd, 'build'], { cwd });
    const testFile = new URL('./tokens/index.css', cwd);

    // expect generated file exists & isn’t empty
    expect(fs.readFileSync(testFile, 'utf8')).toEqual(
      expect.stringContaining(`/* -------------------------------------------
 *  Autogenerated by ⛋ Terrazzo. DO NOT EDIT!
 * ------------------------------------------- */`),
    );
  });

  it('watch', async () => {
    // note: this test is identical to "default"; just duplicated so 2 tests can
    // touch the filesystem without conflicting
    const cwd = new URL('./fixtures/cli-watch/', import.meta.url);
    const testFile = new URL('./tokens/index.css', cwd);

    // `--watch` will never terminate, so we want to cancel it after the file is created.
    // execa recommends AbortController rather than child.kill() for better cleanup.
    const controller = new AbortController();
    execa('node', [cmd, 'build', '--watch'], { cwd, cancelSignal: controller.signal, gracefulCancel: true });

    // poll for file creation (note: Vitest will handle timeouts)
    await new Promise((resolve) => {
      setInterval(() => {
        if (fs.existsSync(testFile)) {
          resolve(undefined);
        }
      }, 100);
    });

    // abort process (preferred over child.kill()
    controller.abort();

    // expect file isn’t empty
    expect(fs.readFileSync(testFile, 'utf8')).toEqual(
      expect.stringContaining(`/* -------------------------------------------
 *  Autogenerated by ⛋ Terrazzo. DO NOT EDIT!
 * ------------------------------------------- */`),
    );
  });

  describe('plugin-css options', () => {
    it('outDir', async () => {
      const cwd = new URL('./fixtures/cli-config-outdir/', import.meta.url);
      await execa('node', [cmd, 'build'], { cwd });
      expect(fs.readFileSync(new URL('./styles/out/actual.css', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('./styles/out/want.css', cwd)),
      );
    });
  });
});