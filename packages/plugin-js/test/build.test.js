import build from '@cobalt-ui/cli/dist/build.js';
import fs from 'node:fs';
import { URL, fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import pluginJS from '../dist/index.js';

describe('@cobalt-ui/plugin-js', () => {
  describe('fixtures', () => {
    test.each(['border', 'color', 'shadow', 'typography', 'transition'])('%s', async (dir) => {
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
      expect(fs.readFileSync(new URL('actual.js', cwd), 'utf8'), `${dir}: JS`).toMatchFileSnapshot(fileURLToPath(new URL('want.js', cwd)));
      expect(fs.readFileSync(new URL('actual.d.ts', cwd), 'utf8'), `${dir}: TS`).toMatchFileSnapshot(fileURLToPath(new URL('want.d.ts', cwd)));
      expect(fs.readFileSync(new URL('actual.json', cwd), 'utf8'), `${dir}: JSON`).toMatchFileSnapshot(fileURLToPath(new URL('want.json', cwd)));
    });
  });

  describe('nested output', () => {
    test('nested output is correct', async () => {
      const cwd = new URL(`./nested/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('tokens.json', cwd)));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginJS({
            js: 'actual.js',
            json: 'actual.json',
            deep: true,
          }),
        ],
        color: {},
      });
      expect(fs.readFileSync(new URL('actual.js', cwd), 'utf8'), `nested: JS`).toMatchFileSnapshot(fileURLToPath(new URL('want.js', cwd)));
      expect(fs.readFileSync(new URL('actual.d.ts', cwd), 'utf8'), `nested: TS`).toMatchFileSnapshot(fileURLToPath(new URL('want.d.ts', cwd)));
      expect(fs.readFileSync(new URL('actual.json', cwd), 'utf8'), `nested: JSON`).toMatchFileSnapshot(fileURLToPath(new URL('want.json', cwd)));
    });
  });

  test('exclude meta from output when options.meta is false', async () => {
    const cwd = new URL(`./meta/`, import.meta.url);
    const tokens = JSON.parse(fs.readFileSync(new URL('tokens.json', cwd)));
    await build(tokens, {
      outDir: cwd,
      plugins: [
        pluginJS({
          js: 'actual.js',
          json: 'actual.json',
          meta: false,
        }),
      ],
      color: {},
    });
    expect(fs.readFileSync(new URL('actual.js', cwd), 'utf8'), `meta: JS`).toMatchFileSnapshot(fileURLToPath(new URL('want.js', cwd)));
    expect(fs.readFileSync(new URL('actual.d.ts', cwd), 'utf8'), `meta: TS`).toMatchFileSnapshot(fileURLToPath(new URL('want.d.ts', cwd)));
    expect(fs.readFileSync(new URL('actual.json', cwd), 'utf8'), `meta: JSON`).toMatchFileSnapshot(fileURLToPath(new URL('want.json', cwd)));
  });
});
