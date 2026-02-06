import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { describe, expect, test } from 'vitest';

const cmd = '../../../bin/cli.js';

describe('tz normalize', () => {
  test('basic', async () => {
    const cwd = new URL('./fixtures/normalize/', import.meta.url);
    await execa(cmd, ['normalize', 'input.json', '--output', 'actual.json'], { cwd });
    await expect(fs.readFileSync(new URL('./actual.json', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.json', cwd)),
    );
  });

  test('basic (shortcut)', async () => {
    const cwd = new URL('./fixtures/normalize/', import.meta.url);
    await execa(cmd, ['normalize', 'input.json', '-o', 'actual.json'], { cwd });
    await expect(fs.readFileSync(new URL('./actual.json', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.json', cwd)),
    );
  });

  test('missing input', async () => {
    const cwd = new URL('./fixtures/normalize/', import.meta.url);
    await expect(execa(cmd, ['normalize', '--output', 'actual.json'], { cwd })).rejects.toThrow(
      `Command failed with exit code 1: ../../../bin/cli.js normalize --output actual.json

✗  config: Expected input: \`tz normalize <tokens.json> -o output.json\``,
    );
  });
});
