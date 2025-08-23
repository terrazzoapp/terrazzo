import { describe, expect, it } from 'vitest';
import { defineConfig, parse } from '../src/index.js';
import { cwd, DEFAULT_FILENAME } from './test-utils.js';

describe('JSON pointers', () => {
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
  });

  it('$value $refs (literal)', async () => {
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

  it('$value $refs (assumed)', async () => {
    const src = {
      color: {
        $type: 'color',
        gray: { 1: { $value: { colorSpace: 'srgb', components: [0.2, 0.2, 0.2] } } },
        grey: { 1: { $value: { $ref: '#/color/gray/1' } } },
      },
    };
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
    expect(tokens['color.gray.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.2, 0.2, 0.2], alpha: 1 });
    expect(tokens['color.grey.1']?.$value).toEqual({ colorSpace: 'srgb', components: [0.2, 0.2, 0.2], alpha: 1 });
  });

  it('array $refs', async () => {
    const src = {
      perc: { $type: 'number', 0: { $value: 0 }, 100: { $value: 1 } },
      ease: {
        $type: 'cubicBezier',
        linear: {
          $value: [
            { $ref: '#/perc/0/$value' },
            { $ref: '#/perc/0/$value' },
            { $ref: '#/perc/1/$value' },
            { $ref: '#/perc/1/$value' },
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
    expect(tokens['color.grey.1']?.aliasOf).toBe('color.gray.1');
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

  it('string $refs (assumed)', async () => {
    const src = {
      a: {
        $description: 'Default description',
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.4, 0.2, 0.6] },
      },
      b: {
        $description: { $ref: '#/a' },
        $type: { $ref: '#/a' },
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

  it('root $refs throw error', async () => {
    const src = { color: { $type: 'color', gray: { $ref: '#/' } } };
    const config = defineConfig({}, { cwd });
    await expect(() =>
      parse([{ filename: DEFAULT_FILENAME, src }], { config }),
    ).rejects.toThrowError(`[parser:alias] Invalid ref: #/. Can’t recursively embed the same document within itself.
/tokens.json:5:7
  3 |     "$type": "color",
  4 |     "gray": {
> 5 |       "$ref": "#\\/"
    |       ^
  6 |     }
  7 |   }
  8 | }`);
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
    await expect(() =>
      parse([{ filename: DEFAULT_FILENAME, src }], { config }),
    ).rejects.toThrowError(`[parser:parse] Circular ref detected: file:///#color/grey → file:///#color/gray
/tokens.json:5:7
  3 |     "$type": "color",
  4 |     "gray": {
> 5 |       "$ref": "#\\/color\\/grey"
    |       ^
  6 |     },
  7 |     "grey": {
  8 |       "$ref": "#\\/color\\/gray"`);
  });

  it('invalid $refs throw error', async () => {
    const src = {
      color: {
        $type: 'color',
        blue: { 100: { $ref: 23 } },
      },
    };
    const config = defineConfig({}, { cwd });
    await expect(() =>
      parse([{ filename: DEFAULT_FILENAME, src }], { config }),
    ).rejects.toThrowError(`[parser:parse] Invalid $ref. Expected string.
/tokens.json:5:7
  3 |     "$type": "color",
  4 |     "blue": {
> 5 |       "$ref": 23
    |       ^
  6 |     },`);
  });
});
