import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { execa } from 'execa';
import { describe, expect, it } from 'vitest';
import vanillaExtract from '../src/index.js';

describe('vanilla-extract', () => {
  // Generate a Vanilla Extract theme, and run through Vite to verify it’s valid
  describe('examples', () => {
    const examples = ['figma-sds', 'github-primer'];
    const EXAMPLES_DIR = new URL('./fixtures/', import.meta.url);

    it.each(examples)(
      '%s',
      async (name) => {
        const cwd = new URL(`${name}/`, EXAMPLES_DIR);

        // 1. evaluate TZ output
        await execa({ cwd })`pnpm exec tz build -c test/fixtures/${name}/terrazzo.config.js`;
        // TODO: support renaming?
        await expect(fs.readFileSync(new URL('theme.css.ts', cwd), 'utf8')).toMatchFileSnapshot(
          fileURLToPath(new URL('want.theme.css.ts', cwd)),
        );

        // 2. evalute whether Vanilla CSS (Vite plugin) can build this, without trying to snapshot a third-party library
        await execa({ cwd })`pnpm exec vite build ${fileURLToPath(cwd)}`;
        expect(fs.existsSync(new URL('dist/', cwd))).toBeTruthy();
      },
      30_000, // these are doing large builds + building with Vite. They may take extra time in CI
    );
  });

  describe('options', () => {
    it('throws error on array key', () => {
      expect(() =>
        defineConfig(
          {
            plugins: [css(), vanillaExtract({ themes: { 'foo-bar': { mode: 'foo' } } })],
          },
          { cwd: new URL(import.meta.url) },
        ),
      ).toThrowError('"foo-bar" must be a valid JS identifier. Prefer camelCase so it may be used in JS.');
    });

    it('throws error on no themes specified', () => {
      expect(() =>
        defineConfig(
          {
            plugins: [css(), vanillaExtract({})],
          },
          { cwd: new URL(import.meta.url) },
        ),
      ).toThrowError('Must generate at least one theme in "themes" or "globalThemes".');
    });
  });
});
