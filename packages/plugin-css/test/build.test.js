import {build} from '@cobalt-ui/cli/dist/build.js';
import fs from 'node:fs';
import {URL, fileURLToPath} from 'node:url';
import {describe, expect, test} from 'vitest';
import yaml from 'js-yaml';
import pluginCSS from '../dist/index.js';

describe('@cobalt-ui/plugin-css', () => {
  test.each(['border', 'color', 'typography', 'transition'])('%s', async (dir) => {
    const cwd = new URL(`./${dir}/`, import.meta.url);
    const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd)));
    await build(tokens, {
      outDir: cwd,
      plugins: [
        pluginCSS({
          filename: 'actual.css',
          prefix: 'ds-',
          modeSelectors: {
            '#light': ['@media (prefers-color-scheme: light)'],
            '#dark': ['@media (prefers-color-scheme: dark)'],
            'color#light': ['[data-color-theme="light"]'],
            'color#dark': ['[data-color-theme="dark"]'],
            'color#light-colorblind': ['[data-color-theme="light-colorblind"]'],
            'color#light-high-contrast': ['[data-color-theme="light-high-contrast"]'],
            'color#dark-dimmed': ['[data-color-theme="dark-dimmed"]'],
            'color#dark-high-contrast': ['[data-color-theme="high-contrast"]'],
            'color#dark-colorblind': ['[data-color-theme="dark-colorblind"]'],
          },
        }),
      ],
      color: {},
    });

    expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
  });

  test('doesn’t generate empty media queries', async () => {
    const cwd = new URL(`./no-empty-modes/`, import.meta.url);
    const tokens = yaml.load(fs.readFileSync(new URL('./tokens.yaml', cwd)));
    await build(tokens, {
      outDir: cwd,
      plugins: [
        pluginCSS({
          filename: 'actual.css',
          modeSelectors: {
            'color#light': ['@media (prefers-color-scheme: light)', '[data-color-mode="light"]'],
            'color#dark': ['@media (prefers-color-scheme: dark)', '[data-color-mode="dark"]'],
          },
        }),
      ],
      color: {},
    });
    expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
  });

  describe('options', () => {
    test('p3', async () => {
      const cwd = new URL(`./p3/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd)));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginCSS({
            filename: 'actual.css',
            p3: false,
          }),
        ],
        color: {},
      });
      expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
    });
  });
});
