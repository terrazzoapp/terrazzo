import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { describe, expect, it } from 'vitest';

describe('tz init', () => {
  it('creates terrazzo.config.js', async () => {
    const cwd = new URL('./fixtures/init/', import.meta.url);

    await execa('node', ['../../../bin/cli.js', 'init'], { cwd });
    expect(fs.existsSync(new URL('./terrazzo.config.js', cwd)));
    expect(fs.readFileSync(new URL('./terrazzo.config.js', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.config.js', cwd)),
    );
  });
});
