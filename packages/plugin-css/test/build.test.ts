import build from '@cobalt-ui/cli/dist/build.js';
import fs from 'node:fs';
import {URL, fileURLToPath} from 'node:url';
import {describe, expect, test} from 'vitest';
import yaml from 'js-yaml';
import pluginCSS from '../dist/index.js';

describe('@cobalt-ui/plugin-css', () => {
  test.each(['border', 'color', 'typography', 'transition'])('%s', async (dir) => {
    const cwd = new URL(`./${dir}/`, import.meta.url);
    const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'));
    await build(tokens, {
      outDir: cwd,
      plugins: [
        pluginCSS({
          filename: 'actual.css',
          prefix: 'ds-',
          modeSelectors: [
            {mode: 'light', selectors: ['@media (prefers-color-scheme: light)']},
            {mode: 'dark', selectors: ['@media (prefers-color-scheme: dark)']},
            {mode: 'light', tokens: ['color.*'], selectors: ['[data-color-theme="light"]']},
            {mode: 'dark', tokens: ['color.*'], selectors: ['[data-color-theme="dark"]']},
            {mode: 'light-colorblind', tokens: ['color.*'], selectors: ['[data-color-theme="light-colorblind"]']},
            {mode: 'light-high-contrast', tokens: ['color.*'], selectors: ['[data-color-theme="light-high-contrast"]']},
            {mode: 'dark-dimmed', tokens: ['color.*'], selectors: ['[data-color-theme="dark-dimmed"]']},
            {mode: 'dark-high-contrast', tokens: ['color.*'], selectors: ['[data-color-theme="dark-high-contrast"]']},
            {mode: 'dark-colorblind', tokens: ['color.*'], selectors: ['[data-color-theme="dark-colorblind"]']},
          ],
        }),
      ],
      color: {},
      tokens: [],
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
          modeSelectors: [
            {mode: 'light', tokens: ['color.*'], selectors: ['@media (prefers-color-scheme: light)', '[data-color-mode="light"]']},
            {mode: 'dark', tokens: ['color.*'], selectors: ['@media (prefers-color-scheme: dark)', '[data-color-mode="dark"]']},
          ],
        }),
      ],
      color: {},
      tokens: [],
    });
    expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
  });

  describe('options', () => {
    test('p3', async () => {
      const cwd = new URL(`./p3/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginCSS({
            filename: 'actual.css',
            p3: false,
          }),
        ],
        color: {},
        tokens: [],
      });
      expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
    });
  });
});
