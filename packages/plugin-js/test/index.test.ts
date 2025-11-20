import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import adobeSpectrum from 'dtcg-examples/adobe-spectrum.json' with { type: 'json' };
import appleHig from 'dtcg-examples/apple-hig.json' with { type: 'json' };
import figmaSds from 'dtcg-examples/figma-sds.json' with { type: 'json' };
import githubPrimer from 'dtcg-examples/github-primer.json' with { type: 'json' };
import ibmCarbon from 'dtcg-examples/ibm-carbon.json' with { type: 'json' };
import microsoftFluent from 'dtcg-examples/microsoft-fluent.json' with { type: 'json' };
import radix from 'dtcg-examples/radix.json' with { type: 'json' };
import salesforceLightning from 'dtcg-examples/salesforce-lightning.json' with { type: 'json' };
import shopifyPolaris from 'dtcg-examples/shopify-polaris.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import js from '../src/index.js';

export const DS = {
  'adobe-spectrum': adobeSpectrum,
  'apple-hig': appleHig,
  'figma-sds': figmaSds,
  'github-primer': githubPrimer,
  'ibm-carbon': ibmCarbon,
  'microsoft-fluent': microsoftFluent,
  radix: radix,
  'salesforce-lightning': salesforceLightning,
  'shopify-polaris': shopifyPolaris,
};

describe('@terrazzo/plugin-js', () => {
  describe('snapshots', () => {
    it.each(['border', 'color', 'shadow', 'transition', 'typography'])('%s', async (dir) => {
      const filename = 'actual.js';
      const cwd = new URL(`./${dir}/`, import.meta.url);
      const config = defineConfig(
        {
          lint: {
            rules: {
              'core/consistent-naming': 'off',
            },
          },
          plugins: [
            js({
              js: filename,
            }),
          ],
        },
        { cwd },
      );
      const tokensJSON = new URL('./tokens.json', cwd);
      const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
        config,
      });
      const result = await build(tokens, { sources, config });
      await expect(result.outputFiles.find((f) => f.filename === filename)?.contents).toMatchFileSnapshot(
        fileURLToPath(new URL('./want.js', cwd)),
      );
      await expect(
        result.outputFiles.find((f) => f.filename === filename.replace(/\.js$/, '.d.ts'))?.contents,
      ).toMatchFileSnapshot(fileURLToPath(new URL('./want.d.ts', cwd)));

      // unique to plugin-js: we can also test that each runtime is valid by
      // importing the snapshot
      const mod = await import(fileURLToPath(new URL('./want.js', cwd)));
      const firstToken = Object.keys(mod.tokens)[0];
      expect(mod.token(firstToken)).toBeDefined();
      expect(mod.token(firstToken, '.')).toBeDefined();
      expect(mod.token(firstToken, 'bad-mode-wont-exist')).toBeUndefined();
      expect(mod.token('unequivocably.fake.token.value')).toBeUndefined();
    });
  });

  describe('external DSs', () => {
    it.each([
      'adobe-spectrum',
      'apple-hig',
      'figma-sds',
      'github-primer',
      'ibm-carbon',
      'microsoft-fluent',
      'radix',
      'salesforce-lightning',
      'shopify-polaris',
    ] as const)('%s', async (name) => {
      const src = DS[name];
      const cwd = new URL(`./fixtures/ds-${name}/`, import.meta.url);
      const config = defineConfig(
        {
          lint: {
            rules: {
              'core/consistent-naming': 'off',
            },
          },
          plugins: [
            js({
              js: 'want.js',
            }),
          ],
        },
        { cwd },
      );
      const { tokens, sources } = await parse([{ filename: cwd, src }], { config });
      const result = await build(tokens, { sources, config });
      await expect(result.outputFiles[0]?.contents).toMatchFileSnapshot(fileURLToPath(new URL('./want.js', cwd)));
      await expect(result.outputFiles[1]?.contents).toMatchFileSnapshot(fileURLToPath(new URL('./want.d.ts', cwd)));
    }, 30_000);
  });
});
