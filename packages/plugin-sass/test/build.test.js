import build from '@cobalt-ui/cli/dist/build.js';
import fs from 'node:fs';
import {URL, fileURLToPath} from 'node:url';
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
        color: {},
      });
      expect(fs.readFileSync(new URL('./actual.scss', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.scss', cwd)));
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
        color: {},
      });
      expect(fs.readFileSync(new URL('./actual.sass', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.sass', cwd)));
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
        color: {},
      });
      expect(fs.readFileSync(new URL('./actual.scss', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.scss', cwd)));
    });
  });
});
