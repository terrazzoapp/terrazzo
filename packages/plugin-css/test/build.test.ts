import build from '@cobalt-ui/cli/dist/build.js';
import fs from 'node:fs';
import {URL, fileURLToPath} from 'node:url';
import * as culori from 'culori';
import {describe, expect, test} from 'vitest';
import yaml from 'js-yaml';
import pluginCSS, {defaultNameGenerator} from '../dist/index.js';

describe('@cobalt-ui/plugin-css', () => {
  test.each(['border', 'color', 'shadow', 'typography', 'transition'])('%s', async (dir) => {
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

  test('handles whitespace and camelCases names', async () => {
    const cwd = new URL(`./whitespace-and-casing/`, import.meta.url);
    const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'));
    await build(tokens, {
      outDir: cwd,
      plugins: [pluginCSS({filename: 'actual.css'})],
      color: {},
      tokens: [],
    });
    expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
  });

  describe('options', () => {
    test('colorFormat', async () => {
      const cwd = new URL(`./color-format/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginCSS({
            filename: 'actual.css',
            colorFormat: 'oklch',
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

    test('transform', async () => {
      const cwd = new URL(`./transform/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginCSS({
            filename: 'actual.css',
            transform(token) {
              if (token.id === 'color.blue.5') {
                return '#0969db';
              }
            },
          }),
        ],
        color: {},
        tokens: [],
      });
      expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
    });

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

    test('generateName', async () => {
      function myGenerator(variableId, token) {
        if (variableId === 'color.gray') {
          return 'super-special-variable';
        }
        if (token.$type === 'border') {
          return `rad-${defaultNameGenerator(variableId)}`;
        }
        return defaultNameGenerator(variableId);
      }

      const cwd = new URL(`./generate-name/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'));
      await build(tokens, {
        outDir: cwd,
        plugins: [pluginCSS({filename: 'actual.css', generateName: myGenerator})],
        color: {},
        tokens: [],
      });
      expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
    });

    test('utility', async () => {
      const cwd = new URL('./utility/', import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd), 'utf8'));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginCSS({
            filename: 'actual.css',
            utility: {
              bg: ['color.semantic.*', 'color.gradient.*'],
              border: ['border.*'],
              font: ['typography.*'],
              gap: ['space.*'],
              margin: ['space.*'],
              padding: ['space.*'],
              shadow: ['shadow.*'],
              text: ['color.semantic.*', 'color.gradient.*'],
            },
          }),
        ],
        color: {},
        tokens: [],
      });
      expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
    });

    test('tailwind alpha value', async () => {
      const cwd = new URL(`./color-transform-tw-alpha/`, import.meta.url);
      const tokens = yaml.load(fs.readFileSync(new URL('./tokens.yaml', cwd), 'utf8'));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginCSS({
            filename: 'actual.css',
            transform(token) {
              if (token.$type === 'color') {
                const color = culori.parse(token.$value);
                if (!color) throw new Error(`Could not parse color "${token.$value}"`);
                const {r, g, b} = culori.rgb(color);
                return `${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)}`;
              }
            },
          }),
        ],
        color: {},
        tokens: [],
      });
      expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.css', cwd)));
    });
  });
});
