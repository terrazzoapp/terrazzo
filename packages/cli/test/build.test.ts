import { describe, expect, it } from 'vitest';
import { execa } from 'execa';

const cmd = '../../../bin/cli.js';

describe('tz build', () => {
  describe('errors', () => {
    const errors: [string, { cwd: string; want: string | RegExp }][] = [
      [
        'no tokens',
        {
          cwd: 'error-no-tokens',
          want: /✘\s{2}Could not locate tokens\.json\. To create one, run `npx tz init`\./,
        },
      ],
      [
        'config: no default export',
        {
          cwd: 'error-no-default-export',
          want: /✘\s{2}No default export found in terrazzo.config\.js\. See https:\/\/terrazzo.dev\/docs\/cli for instructions./,
        },
      ],
    ];

    it.each(errors)('%s', async (_, { cwd, want }) => {
      await expect(async () => {
        await execa('node', [cmd, 'build'], { cwd: new URL(`./fixtures/${cwd}/`, import.meta.url) });
        expect(true).toBe(false);
      }).rejects.toThrowError(want);
    });
  });
});
