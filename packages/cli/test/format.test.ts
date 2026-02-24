import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { describe, expect, test } from 'vitest';

const cmd = '../../../bin/cli.js';

describe('tz format', () => {
  test('basic', async () => {
    const cwd = new URL('./fixtures/format/', import.meta.url);
    await execa(cmd, ['format', 'input.json', '--output', 'actual.json'], { cwd });
    await expect(fs.readFileSync(new URL('./actual.json', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.json', cwd)),
    );
  });

  test('basic (shortcut)', async () => {
    const cwd = new URL('./fixtures/format/', import.meta.url);
    await execa(cmd, ['format', 'input.json', '-o', 'actual.json'], { cwd });
    await expect(fs.readFileSync(new URL('./actual.json', cwd), 'utf8')).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.json', cwd)),
    );
  });

  test('missing input', async () => {
    const cwd = new URL('./fixtures/format/', import.meta.url);
    await expect(execa(cmd, ['format', '--output', 'actual.json'], { cwd })).rejects.toThrow(
      `Command failed with exit code 1: ../../../bin/cli.js format --output actual.json

✗  config: Expected input: \`tz format <tokens.json> -o output.json\``,
    );
  });
});
