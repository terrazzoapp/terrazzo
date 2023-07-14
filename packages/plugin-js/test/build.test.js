import {build} from '@cobalt-ui/cli/dist/build.js';
import fs from 'node:fs';
import {URL} from 'node:url';
import {describe, expect, test} from 'vitest';
import pluginJS from '../dist/index.js';

describe('@cobalt-ui/plugin-js', () => {
  describe('fixtures', () => {
    test.each(['border', 'color', 'typography', 'transition'])('%s', async (dir) => {
      const cwd = new URL(`./${dir}/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('tokens.json', cwd)));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginJS({
            js: 'actual.js',
            json: 'actual.json',
          }),
        ],
        color: {},
      });
      expect(fs.readFileSync(new URL('actual.js', cwd), 'utf8'), `${dir}: JS`).toBe(fs.readFileSync(new URL('want.js', cwd), 'utf8'));
      expect(fs.readFileSync(new URL('actual.d.ts', cwd), 'utf8'), `${dir}: TS`).toBe(fs.readFileSync(new URL('want.d.ts', cwd), 'utf8'));
      expect(fs.readFileSync(new URL('actual.json', cwd), 'utf8'), `${dir}: JSON`).toBe(fs.readFileSync(new URL('want.json', cwd), 'utf8'));
    });
  });
});
