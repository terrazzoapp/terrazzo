import fs from 'node:fs/promises';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import { defineConfig, parse } from '../src/index.js';
import { cwd, DEFAULT_FILENAME } from './test-utils.js';

describe('JSON $refs', () => {
  it('token $refs', async () => {
    const src = {
      color: {
        $type: 'color',
        gray: { 1: { $value: { colorSpace: 'srgb', components: [0.2, 0.2, 0.2] } } },
        grey: { 1: { $ref: '#/color/gray/1' } },
      },
    };
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
    expect(tokens['color.gray.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.2, 0.2, 0.2], alpha: 1 });
    expect(tokens['color.gray.1']?.aliasOf).toBeUndefined();
    expect(tokens['color.grey.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.2, 0.2, 0.2], alpha: 1 });
    expect(tokens['color.grey.1']?.aliasOf).toBe('color.gray.1');
    expect(tokens['color.grey.1']?.dependencies).toEqual(['#/color/gray/1']);
  });

  it('$value $refs', async () => {
    const src = {
      color: {
        $type: 'color',
        gray: { 1: { $value: { colorSpace: 'srgb', components: [0.2, 0.2, 0.2] } } },
        grey: { 1: { $value: { $ref: '#/color/gray/1/$value' } } },
      },
    };
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
    expect(tokens['color.gray.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.2, 0.2, 0.2], alpha: 1 });
    expect(tokens['color.grey.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.2, 0.2, 0.2], alpha: 1 });
  });

  it('array $refs', async () => {
    const src = {
      perc: {
        $type: 'number',
        0: { $value: 0 },
        100: { $value: 1 },
      },
      ease: {
        $type: 'cubicBezier',
        linear: {
          $value: [
            { $ref: '#/perc/0/$value' },
            { $ref: '#/perc/0/$value' },
            { $ref: '#/perc/100/$value' },
            { $ref: '#/perc/100/$value' },
          ],
        },
      },
    };
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
    expect(tokens['perc.0']?.$value).toBe(0);
    expect(tokens['perc.100']?.$value).toBe(1);
    expect(tokens['ease.linear']?.$value).toEqual([0, 0, 1, 1]);
    expect(tokens['ease.linear']?.aliasOf).toBeUndefined();
    expect(tokens['ease.linear']?.partialAliasOf).toEqual(['perc.0', 'perc.0', 'perc.100', 'perc.100']);
    expect(tokens['ease.linear']?.dependencies).toEqual(['#/perc/0/$value', '#/perc/100/$value']);
  });

  it('group $refs', async () => {
    const src = {
      color: {
        $type: 'color',
        gray: { 1: { $value: { colorSpace: 'srgb', components: [0.2, 0.2, 0.2] } } },
        grey: { $ref: '#/color/gray', 2: { $value: { colorSpace: 'srgb', components: [0.3, 0.3, 0.3] } } },
      },
    };
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
    expect(tokens['color.gray.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.2, 0.2, 0.2], alpha: 1 });
    expect(tokens['color.gray.2']).toBeUndefined(); // assert original node doesn’t get polluted
    expect(tokens['color.grey.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.2, 0.2, 0.2], alpha: 1 });
    expect(tokens['color.grey.1']?.aliasOf).toBeUndefined();
    expect(tokens['color.grey.2']?.$value).toEqual({ colorSpace: 'srgb', components: [0.3, 0.3, 0.3], alpha: 1 });
    expect(tokens['color.grey.2']?.aliasOf).toBeUndefined();
  });

  it('string $refs (literal)', async () => {
    const src = {
      a: {
        $description: 'Default description',
        $type: { $ref: '#/b/$type' },
        $value: { colorSpace: 'srgb', components: [0.4, 0.2, 0.6] },
      },
      b: {
        $description: { $ref: '#/a/$description' },
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.4, 0.2, 0.6] },
      },
    };
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
    expect(tokens.a?.$description).toBe('Default description');
    expect(tokens.a?.$type).toBe('color');
    expect(tokens.b?.$description).toBe('Default description');
    expect(tokens.b?.$type).toBe('color');
  });

  it('local $refs + $defs + $type inheritance', async () => {
    const src = {
      color: {
        $type: 'color', // this should cascade to the $ref
        red: { 1: { $ref: '#/$defs/red-1' } },
      },
      $defs: {
        'red-1': { $value: { colorSpace: 'srgb', components: [0.4, 0.1, 0] } }, // this is invalid as-written, but $defs shouldn’t be validated (only the final, resolved value)
      },
    };
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
    expect(tokens['color.red.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.4, 0.1, 0], alpha: 1 });
  });

  it('flattens $refs correctly', async () => {
    const filename = new URL('./fixtures/refs/dark.json', import.meta.url);
    const src = await fs.readFile(filename, 'utf8');
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename, src }], { config });
    expect(tokens).toEqual({
      // dark value
      'base.color.black': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0, 0.02, 0.04], alpha: 1 },
      }),
      // dark value
      'base.color.blue.0': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.78, 0.91, 1], alpha: 1, hex: '#cae8ff' },
      }),
      // dark value
      'base.color.blue.1': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.65, 0.84, 1], alpha: 1, hex: '#a5d6ff' },
      }),
      'base.color.blue.2': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.5, 0.8, 1], alpha: 1 },
      }),
      'base.color.blue.3': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.33, 0.68, 1], alpha: 1 },
      }),
      'base.color.blue.4': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.13, 0.55, 1], alpha: 1 },
      }),
      'base.color.blue.5': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.04, 0.41, 0.85], alpha: 1 },
      }),
      'base.color.blue.6': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.02, 0.31, 0.68], alpha: 1 },
      }),
      'base.color.blue.7': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.01, 0.24, 0.55], alpha: 1 },
      }),
      'base.color.blue.8': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.04, 0.19, 0.41], alpha: 1 },
      }),
      'base.color.blue.9': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0, 0.13, 0.33], alpha: 1 },
      }),
      'base.color.inset': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 },
      }),
      'base.color.neutral.0': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 },
      }),
      'base.color.neutral.1': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.96, 0.97, 0.98], alpha: 1 },
      }),
      'base.color.neutral.2': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.94, 0.95, 0.96], alpha: 1 },
      }),
      'base.color.neutral.3': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.9, 0.92, 0.94], alpha: 1 },
      }),
      'base.color.neutral.4': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.88, 0.9, 0.91], alpha: 1 },
      }),
      'base.color.neutral.5': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.85, 0.88, 0.91], alpha: 1 },
      }),
      'base.color.neutral.6': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.82, 0.85, 0.88], alpha: 1 },
      }),
      'base.color.neutral.7': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.78, 0.82, 0.85], alpha: 1 },
      }),
      'base.color.neutral.8': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.51, 0.55, 0.6], alpha: 1 },
      }),
      'base.color.neutral.9': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.35, 0.39, 0.43], alpha: 1 },
      }),
      'base.color.neutral.10': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.27, 0.3, 0.33], alpha: 1 },
      }),
      'base.color.neutral.11': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.22, 0.25, 0.27], alpha: 1 },
      }),
      'base.color.neutral.12': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0.15, 0.16, 0.18], alpha: 1 },
      }),
      'base.color.neutral.13': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [0, 0.02, 0.04], alpha: 1 },
      }),
      'base.color.transparent': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0 },
      }),
      'base.color.white': expect.objectContaining({
        $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 },
      }),
      'base.size.2': expect.objectContaining({ $value: { value: 2, unit: 'px' } }),
      'base.size.4': expect.objectContaining({ $value: { value: 4, unit: 'px' } }),
      'base.size.6': expect.objectContaining({ $value: { value: 6, unit: 'px' } }),
      'base.size.8': expect.objectContaining({ $value: { value: 8, unit: 'px' } }),
      'base.size.12': expect.objectContaining({ $value: { value: 12, unit: 'px' } }),
      'base.size.16': expect.objectContaining({ $value: { value: 16, unit: 'px' } }),
      'base.size.20': expect.objectContaining({ $value: { value: 20, unit: 'px' } }),
      'base.size.24': expect.objectContaining({ $value: { value: 24, unit: 'px' } }),
      'base.size.28': expect.objectContaining({ $value: { value: 28, unit: 'px' } }),
      'base.size.32': expect.objectContaining({ $value: { value: 32, unit: 'px' } }),
      'base.size.36': expect.objectContaining({ $value: { value: 36, unit: 'px' } }),
      'base.size.40': expect.objectContaining({ $value: { value: 40, unit: 'px' } }),
      'base.size.44': expect.objectContaining({ $value: { value: 44, unit: 'px' } }),
      'base.size.48': expect.objectContaining({ $value: { value: 48, unit: 'px' } }),
      'base.size.64': expect.objectContaining({ $value: { value: 64, unit: 'px' } }),
      'base.size.80': expect.objectContaining({ $value: { value: 80, unit: 'px' } }),
      'base.size.96': expect.objectContaining({ $value: { value: 96, unit: 'px' } }),
      'base.size.112': expect.objectContaining({ $value: { value: 112, unit: 'px' } }),
      'base.size.128': expect.objectContaining({ $value: { value: 128, unit: 'px' } }),
    });
  });

  it('root $refs throw error', async () => {
    const src = { color: { $type: 'color', gray: { $ref: '#/' } } };
    const config = defineConfig({}, { cwd });
    try {
      await parse([{ filename: DEFAULT_FILENAME, src }], { config });
      expect(true).toBe(false);
    } catch (err) {
      expect(
        stripAnsi((err as Error).message),
      ).toMatch(`[parser:init] $ref "#/" can’t recursively embed its parent document

  2 |   "$ref": "#\\/"
  3 | }`);
    }
  });

  it('circular $refs throw error', async () => {
    const src = {
      color: {
        $type: 'color',
        gray: { $ref: '#/color/grey' },
        grey: { $ref: '#/color/gray' },
      },
    };
    const config = defineConfig({}, { cwd });
    try {
      await parse([{ filename: DEFAULT_FILENAME, src }], { config });
      expect(true).toBe(false);
    } catch (err) {
      expect(stripAnsi((err as Error).message)).toMatch(`[parser:init] Circular $ref detected: "#/color/grey"

  3 |     "$type": "color",
  4 |     "gray": {
> 5 |       "$ref": "#/color/grey"
    |               ^
  6 |     },
  7 |     "grey": {
  8 |       "$ref": "#/color/gray"`);
    }
  });

  it('invalid $refs throw error', async () => {
    const src = {
      color: {
        $type: 'color',
        blue: { 100: { $ref: 23 } },
      },
    };
    const config = defineConfig({}, { cwd });
    try {
      await parse([{ filename: DEFAULT_FILENAME, src }], { config });
      expect(true).toBe(false);
    } catch (err) {
      expect(stripAnsi((err as Error).message)).toMatch(`[parser:init] Invalid $ref. Expected string.

  4 |     "blue": {
  5 |       "100": {
> 6 |         "$ref": 23
    |                 ^
  7 |       }
  8 |     }
  9 |   }`);
    }
  });
});
