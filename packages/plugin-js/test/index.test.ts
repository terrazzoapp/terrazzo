import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import js from '../src/index.js';

describe('@terrazzo/plugin-js', () => {
  describe('snapshots', () => {
    it.each(['border', 'color', 'shadow', 'transition', 'typography'])('%s', async (dir) => {
      const filename = 'actual.js';
      const cwd = new URL(`./${dir}/`, import.meta.url);
      const config = defineConfig(
        {
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
    ])('%s', async (name) => {
      const src = await import(`dtcg-examples/${name}.json`).then((m) => m.default);
      const cwd = new URL(`./fixtures/ds-${name}/`, import.meta.url);
      const config = defineConfig(
        {
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
    });
  });
});
