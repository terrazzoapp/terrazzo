import { execa } from 'execa';
import { fileURLToPath } from 'node:url';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';

const CMD = './bin/cli.js';

describe('tz check', () => {
  it('valid', async () => {
    const { stdout } = await execa('node', [CMD, 'check', 'test/fixtures/check-valid/tokens.json'], {
      cwd: fileURLToPath(new URL('../', import.meta.url)),
    });
    const output = stripAnsi(stdout);

    expect(output).toMatch('test/fixtures/check-valid/tokens.json');
    expect(output).toMatch('✔  No errors'); // note: this contains a timestamp that would be flaky
  });

  it('invalid', async () => {
    try {
      await execa('node', [CMD, 'check', 'test/fixtures/check-invalid/tokens.json'], {
        cwd: fileURLToPath(new URL('../', import.meta.url)),
      });
      expect(true).toBe(false);
    } catch (err) {
      expect(stripAnsi(String(err))).toMatch(`Expected array, received "[0, 0.2, 1]"

  4 |       "100": {
  5 |         "$type": "color",
> 6 |         "$value": { "colorSpace": "srgb", "channels": "[0, 0.2, 1]", "alpha": 1 }
    |                                                       ^
  7 |       }
  8 |     }
  9 |   }`);
    }
  });
});
