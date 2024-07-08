import { execa } from 'execa';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('CLI API', () => {
  describe('plugin-css options', () => {
    it('outDir', async () => {
      const cwd = new URL('./fixtures/cli-config-outdir/', import.meta.url);
      await execa('node', ['../../../../cli/bin/cli.js', 'build'], { cwd: cwd });
      expect(fs.readFileSync(new URL('./styles/out/actual.css', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('./styles/out/want.css', cwd)),
      );
    });
  });
});
