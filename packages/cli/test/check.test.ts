import os from 'node:os';
import { execaNode } from 'execa';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';

const PLATFORM = os.platform();

const cmd = './bin/cli.js';

describe('tz check', () => {
  it('valid', async () => {
    const cwd = new URL('../', import.meta.url);
    const { stdout } = await execaNode({ cwd })`${cmd} check test/fixtures/check-valid/tokens.json`;
    const output = stripAnsi(stdout);
    expect(output).toMatch('✔  No errors'); // note: this contains a timestamp that would be flaky
  });

  it('valid (config)', async () => {
    const cwd = new URL('./fixtures/check-config/', import.meta.url);
    const { stdout } = await execaNode({ cwd })`../../../bin/cli.js check`;
    const output = stripAnsi(stdout);
    expect(output).toMatch('✔  No errors'); // note: this contains a timestamp that would be flaky
  });

  it('valid, npm packages', async () => {
    const cwd = new URL('./fixtures/check-npm/', import.meta.url);
    const { stdout } = await execaNode({ cwd })`../../../bin/cli.js check`;
    const output = stripAnsi(stdout);
    expect(output).toMatch('✔  No errors');
  });

  it('TS', async () => {
    const cwd = new URL('../', import.meta.url);
    const { stdout } = await execaNode({ cwd })`${cmd} --config test/fixtures/check-ts/terrazzo.config.ts check`;
    const output = stripAnsi(stdout);
    expect(output).toMatch('✔  No errors');
  });

  it('invalid', async () => {
    const command = async () => {
      const cwd = new URL('../', import.meta.url);
      await execaNode({
        cwd,
      })`${cmd} check test/fixtures/check-invalid/tokens.json --config test/fixtures/check-invalid/terrazzo.config.mjs`;
    };

    if (PLATFORM === 'win32') {
      await expect(command).rejects.toThrow(); // don’t test error snapshot on Windows; it formats too differently
      return;
    }
    await expect(
      command,
    ).rejects.toThrowError(`✗  lint:core/valid-color: Expected components to be array of numbers, received "[0, 0.2, 1]".

  4 |       "100": {
  5 |         "$type": "color",
> 6 |         "$value": { "colorSpace": "srgb", "components": "[0, 0.2, 1]", "alpha": 1 }
    |                                                         ^
  7 |       }
  8 |     }
  9 |   }

lint:lint: 1 error`);
  });
});
