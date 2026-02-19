import { execaNode } from 'execa';
import { describe, expect, test } from 'vitest';

const cmd = './bin/cli.js';

describe('tz --version', () => {
  test('returns version', async () => {
    const { stdout } = await execaNode`${cmd} --version`;
    expect(stdout).toMatch(/^\d+\.\d+\.\d+/);
  });
});
