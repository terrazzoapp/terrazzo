import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { describe, expect, it } from 'vitest';

describe('@terrazzo/plugin-js', () => {
  describe('CLI', () => {
    it.each([
      'adobe-spectrum',
      // 'apple-hig',
      'figma-sds',
      'github-primer',
      'ibm-carbon',
      'microsoft-fluent',
      'shopify-polaris',
    ])('%s', async (ds) => {
      const cwd = new URL(`./fixtures/${ds}/`, import.meta.url);
      await execa('../../../../cli/bin/cli.js', ['build'], { cwd, stdout: 'inherit' });

      await expect(await fs.readFile(new URL('actual.d.ts', cwd), 'utf8'), '.d.ts mismatch!').toMatchFileSnapshot(
        fileURLToPath(new URL('want.d.ts', cwd)),
      );
      await expect(await fs.readFile(new URL('actual.js', cwd), 'utf8'), '.js mismatch!').toMatchFileSnapshot(
        fileURLToPath(new URL('want.js', cwd)),
      );
    }, 120_000); // Note: GitHub has 12 permutations, which take ~5 seconds each  Allow more time for CI.
  });

  describe('runtime', () => {
    it.each([
      { theme: 'light', size: 'default' },
      { theme: 'light-hc', size: 'default' },
      { theme: 'dark', size: 'default' },
      { theme: 'dark-hc', size: 'default' },
      { theme: 'light', size: 'coarse' },
      { theme: 'light-hc', size: 'coarse' },
      { theme: 'dark', size: 'coarse' },
      { theme: 'dark-hc', size: 'coarse' },
      { theme: 'light', size: 'fine' },
      { theme: 'light-hc', size: 'fine' },
      { theme: 'dark', size: 'fine' },
      { theme: 'dark-hc', size: 'fine' },
    ] as const)('$theme/$size', async (input) => {
      const { resolver } = await import('./fixtures/github-primer/want.js');
      const tokens = resolver.apply(input);
      for (const id of Object.keys(tokens)) {
        expect({
          $type: tokens[id as keyof typeof tokens]!.$type,
          $value: tokens[id as keyof typeof tokens]!.$value,
        }).toMatchSnapshot(id);
      }
    });
  });
});
