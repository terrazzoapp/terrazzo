import {build} from '@cobalt-ui/cli/dist/build.js';
import fs from 'node:fs';
import {URL} from 'node:url';
import {describe, expect, test} from 'vitest';
import pluginSass from '../dist/index.js';

describe('@cobalt-ui/plugin-sass', () => {
  describe('fixtures', () => {
    test('basic', async () => {
      const cwd = new URL(`./basic/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd)));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginSass({
            filename: 'actual.scss',
          }),
        ],
      });
      expect(fs.readFileSync(new URL('./actual.scss', cwd), 'utf8')).toBe(fs.readFileSync(new URL('./want.scss', cwd), 'utf8'));
    });

    test('basic (indented)', async () => {
      const cwd = new URL(`./basic/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd)));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginSass({
            filename: 'actual.sass',
            indentedSyntax: true,
          }),
        ],
      });
      expect(fs.readFileSync(new URL('./actual.sass', cwd), 'utf8')).toBe(fs.readFileSync(new URL('./want.sass', cwd), 'utf8'));
    });

    test('plugin-css', async () => {
      const cwd = new URL(`./plugin-css/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd)));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginSass({
            filename: 'actual.scss',
            pluginCSS: {prefix: 'ds-'},
          }),
        ],
      });
      expect(fs.readFileSync(new URL('./actual.scss', cwd), 'utf8')).toBe(fs.readFileSync(new URL('./want.scss', cwd), 'utf8'));
    });
  });
});
