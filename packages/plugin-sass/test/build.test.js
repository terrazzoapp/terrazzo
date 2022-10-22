import {build} from '@cobalt-ui/cli/dist/build.js';
import fs from 'fs';
import {describe, expect, test} from 'vitest';
import pluginSass from '../dist/index.js';

describe('@cobalt-ui/plugin-sass', () => {
  describe('fixtures', () => {
    test.each(['basic'])('%s', async (dir) => {
      const cwd = new URL(`./${dir}/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd)));
      const result = await build(tokens, {
        outDir: cwd,
        plugins: [pluginSass({filename: 'actual.scss'})],
      });
      expect(fs.readFileSync(new URL('./actual.scss', cwd), 'utf8')).toBe(fs.readFileSync(new URL('./want.scss', cwd), 'utf8'));
    });
  });
});
