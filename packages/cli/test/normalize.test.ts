import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { describe, expect, test } from 'vitest';

const cmd = '../../../bin/cli.js';

describe('tz normalize', () => {
  test('basic', async () => {
    const cwd = new URL('./fixtures/normalize/', import.meta.url);
    await execa(cmd, ['normalize', 'input.json', '-o', 'actual.json'], { cwd });
    expect(fs.readFileSync(new URL('./actual.json', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.json', cwd)),
    );
  });
});
