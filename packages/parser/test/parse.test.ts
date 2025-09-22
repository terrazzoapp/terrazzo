import type { AnyNode } from '@humanwhocodes/momoa';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import yamlToMomoa from 'yaml-to-momoa';
import defineConfig from '../src/config.js';
import parse from '../src/parse/index.js';
import { cwd, DEFAULT_FILENAME } from './test-utils.js';

describe('Additional cases', () => {
  it('JSON: invalid', async () => {
    const config = defineConfig({}, { cwd });
    await expect(parse([{ filename: DEFAULT_FILENAME, src: '{]' }], { config })).rejects.toThrow(
      'Unexpected token RBracket found. (1:2)',
    );
  });

  it.skip('Buffer', async () => {
    const config = defineConfig({}, { cwd });
    expect(
      (
        await parse(
          [
            {
              filename: DEFAULT_FILENAME,
              src: Buffer.from('{"size":{"large":{"$type":"dimension","$value":{"value":1,"unit":"rem"}}}}', 'utf8'),
            },
          ],
          { config },
        )
      ).tokens,
    ).toEqual({
      'size.large': expect.objectContaining({ $value: { value: 1, unit: 'rem' } }),
    });
  });

  it('YAML: plugin not installed', async () => {
    try {
      const config = defineConfig({}, { cwd });
      const result = await parse([{ filename: new URL('file:///tokens.yaml'), src: 'foo: bar' }], { config });
      expect(() => result).toThrow;
    } catch (err) {
      expect(stripAnsi((err as Error).message)).toMatchInlineSnapshot(`
        "[parser:yaml] Install yaml-to-momoa package to parse YAML, and pass in as option, e.g.:

            import { parse } from '@terrazzo/parser';
            import yamlToMomoa from 'yaml-to-momoa';

            parse(yamlString, { yamlToMomoa });"
      `);
    }
  });

  it('YAML: invalid', async () => {
    try {
      const config = defineConfig({}, { cwd });
      const result = await parse(
        [
          {
            filename: new URL('file:///tokens.yaml'),
            src: `tokens:
  - foo: true
  false`,
          },
        ],
        { config, yamlToMomoa },
      );
      expect(() => result).toThrow();
    } catch (err) {
      expect(stripAnsi((err as Error).message)).toMatchInlineSnapshot(`
        "[parser:json] YAMLParseError: All mapping items must start at the same column at line 3, column 1:

  - foo: true
  false
^
"`);
    }
  });

  describe('$type', () => {
    it('aliases get updated', async () => {
      const config = defineConfig({}, { cwd });
      const result = await parse(
        [
          {
            filename: DEFAULT_FILENAME,
            src: {
              color: {
                base: { blue: { 500: { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0.2, 1] } } } },
                semantic: { $value: '{color.base.blue.500}' },
              },
            },
          },
        ],
        { config },
      );
      expect(result.tokens['color.base.blue.500']?.$type).toBe('color');
      expect(result.tokens['color.semantic']?.$type).toBe('color');
    });

    it('inheritance works', async () => {
      const config = defineConfig({}, { cwd });
      const result = await parse(
        [
          {
            filename: DEFAULT_FILENAME,
            src: {
              $type: 'color',
              typography: {
                $type: 'typography',
                family: {
                  $type: 'fontFamily',
                  sans: {
                    $value: [
                      'Instrument Sans',
                      'system-ui',
                      '-apple-system',
                      'Aptos',
                      'Helvetica Neue',
                      'Helvetica',
                      'Arial',
                      'Noto Sans',
                      'sans-serif',
                      'Helvetica',
                      'Apple Color Emoji',
                      'Segoe UI Emoji',
                      'Noto Color Emoji',
                    ],
                  },
                  mono: { $value: ['Fragment Mono', 'ui-monospace', 'monospace'] },
                },
                base: {
                  $value: {
                    fontFamily: '{typography.family.sans}',
                    fontWeight: 400,
                    fontSize: { value: 0.75, unit: 'rem' },
                    lineHeight: 1.25,
                    letterSpacing: { value: 0.0024999999, unit: 'rem' },
                  },
                },
              },
              lime: {
                400: { $value: { colorSpace: 'srgb', components: [223 / 255, 1, 173 / 255] } },
              },
            },
          },
        ],
        { config },
      );
      expect(result.tokens['typography.family.sans']?.$type).toBe('fontFamily');
      expect(result.tokens['typography.base']?.$type).toBe('typography');
      expect(result.tokens['lime.400']?.$type).toBe('color');
    });
  });

  describe('$deprecated', () => {
    it('property is not forwarded when aliasing', async () => {
      const config = defineConfig({}, { cwd });
      const result = await parse(
        [
          {
            filename: DEFAULT_FILENAME,
            src: {
              color: {
                base: {
                  blue: {
                    500: { $type: 'color', $deprecated: true, $value: { colorSpace: 'srgb', components: [0, 0.2, 1] } },
                  },
                },
                semantic: { $value: '{color.base.blue.500}' },
              },
            },
          },
        ],
        { config },
      );
      expect(result.tokens['color.base.blue.500']?.$deprecated).toBe(true);
      expect(result.tokens['color.semantic']?.$deprecated).toBe(undefined);
    });

    it('inheritance works', async () => {
      const config = defineConfig({}, { cwd });
      const result = await parse(
        [
          {
            filename: DEFAULT_FILENAME,
            src: {
              color: {
                $type: 'color',
                combava: {
                  400: { $value: { colorSpace: 'srgb', components: [102 / 255, 148 / 255, 91 / 255] } },
                },
                lime: {
                  $deprecated: 'Use combava instead',
                  200: { $deprecated: false, $value: { colorSpace: 'srgb', components: [243 / 255, 1, 224 / 255] } },
                  400: { $value: { colorSpace: 'srgb', components: [223 / 255, 1, 173 / 255] } },
                },
              },
            },
          },
        ],
        { config },
      );
      expect(result.tokens['color.lime.200']?.$deprecated).toBe(false);
      expect(result.tokens['color.lime.400']?.$deprecated).toBe('Use combava instead');
    });
  });

  describe('values', () => {
    const tests: [string, { given: any; want: any }][] = [
      [
        'fontFamily',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                fontFamily: {
                  $type: 'fontFamily',
                  base: { $value: 'Helvetica' },
                  sans: { $value: '{fontFamily.base}' },
                },
              },
            },
          ],
          want: { 'fontFamily.base': ['Helvetica'], 'fontFamily.sans': ['Helvetica'] },
        },
      ],
    ];

    it.each(tests)('%s', async (_, { given, want }) => {
      const config = defineConfig({}, { cwd });
      const { tokens } = await parse(given, { config });
      for (const [id, value] of Object.entries(want)) {
        expect(tokens[id]?.$value).toEqual(value);
      }
    });
  });

  describe('groups', () => {
    it('collects all sibling tokens', async () => {
      const json = {
        color: {
          $type: 'color',
          blue: {
            $description: 'Blue palette',
            $extensions: { foo: 'bar' },
            '7': {
              $value: '#8ec8f6',
              $extensions: { mode: { light: '#8ec8f6', dark: '#205d9e' } },
            },
            '8': {
              $value: '#5eb1ef',
              $extensions: { mode: { light: '#5eb1ef', dark: '#2870bd' } },
            },
            '9': {
              $value: '#0090ff',
              $extensions: { mode: { light: '#0090ff', dark: '#0090ff' } },
            },
            '10': {
              $value: '#0588f0',
              $extensions: { mode: { light: '#0588f0', dark: '#3b9eff' } },
            },
          },
        },
        border: {
          $type: 'border',
        },
      };
      const config = defineConfig({}, { cwd });
      const { tokens } = await parse(
        [
          {
            filename: DEFAULT_FILENAME,
            src: JSON.stringify(json),
          },
        ],
        { config },
      );
      expect(tokens['color.blue.7']?.group).toEqual({
        id: 'color.blue',
        $type: 'color',
        $deprecated: undefined,
        $description: 'Blue palette',
        $extensions: { foo: 'bar' },
        tokens: ['color.blue.7', 'color.blue.8', 'color.blue.9', 'color.blue.10'],
      });
    });
  });

  describe.only('modes', () => {
    const tests: [string, { given: any; want: any }][] = [
      [
        'color',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: {
                  $type: 'color',
                  semantic: {
                    bg: {
                      $value: '{color.blue.7}',
                      $extensions: {
                        mode: {
                          light: '{color.blue.7}',
                          dark: '{color.blue.6}',
                        },
                      },
                    },
                  },
                  blue: {
                    '6': {
                      $value: { colorSpace: 'srgb', components: [0.02, 0.3, 0.68] },
                      $extensions: {
                        mode: {
                          light: { colorSpace: 'srgb', components: [0.02, 0.3, 0.68] },
                          dark: { colorSpace: 'srgb', components: [0.067, 0.35, 0.78] },
                        },
                      },
                    },
                    '7': {
                      $value: { colorSpace: 'srgb', components: [0.56, 0.78, 0.96] },
                      $extensions: {
                        mode: {
                          light: { colorSpace: 'srgb', components: [0.56, 0.78, 0.96] },
                          dark: { colorSpace: 'srgb', components: [0.13, 0.36, 0.62] },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
          want: {
            'color.blue.6': {
              '.': {
                $value: { alpha: 1, components: [0.02, 0.3, 0.68], colorSpace: 'srgb' },
                originalValue: { colorSpace: 'srgb', components: [0.02, 0.3, 0.68] },
                aliasChain: undefined,
                aliasOf: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              light: {
                $value: { alpha: 1, components: [0.02, 0.3, 0.68], colorSpace: 'srgb' },
                originalValue: { colorSpace: 'srgb', components: [0.02, 0.3, 0.68] },
                aliasChain: undefined,
                aliasOf: undefined,
                dependencies: undefined,
              },
              dark: {
                $value: { alpha: 1, components: [0.067, 0.35, 0.78], colorSpace: 'srgb' },
                originalValue: { components: [0.067, 0.35, 0.78], colorSpace: 'srgb' },
                aliasChain: undefined,
                aliasOf: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
              },
            },
            'color.blue.7': {
              '.': {
                $value: { alpha: 1, components: [0.56, 0.78, 0.96], colorSpace: 'srgb' },
                originalValue: { colorSpace: 'srgb', components: [0.56, 0.78, 0.96] },
                aliasChain: undefined,
                aliasOf: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              light: {
                $value: { alpha: 1, components: [0.56, 0.78, 0.96], colorSpace: 'srgb' },
                originalValue: { colorSpace: 'srgb', components: [0.56, 0.78, 0.96] },
                aliasChain: undefined,
                aliasOf: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              dark: {
                $value: { alpha: 1, components: [0.13, 0.36, 0.62], colorSpace: 'srgb' },
                originalValue: { colorSpace: 'srgb', components: [0.13, 0.36, 0.62] },
                aliasChain: undefined,
                aliasOf: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
              },
            },
            'color.semantic.bg': {
              '.': {
                $value: { alpha: 1, components: [0.56, 0.78, 0.96], colorSpace: 'srgb' },
                originalValue: '{color.blue.7}',
                aliasChain: ['color.blue.7'],
                aliasOf: 'color.blue.7',
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              light: {
                $value: { alpha: 1, components: [0.56, 0.78, 0.96], colorSpace: 'srgb' },
                originalValue: '{color.blue.7}',
                aliasChain: ['color.blue.7'],
                aliasOf: 'color.blue.7',
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              dark: {
                $value: { alpha: 1, components: [0.02, 0.3, 0.68], colorSpace: 'srgb' },
                originalValue: '{color.blue.6}',
                aliasChain: ['color.blue.6'],
                aliasOf: 'color.blue.6',
                partialAliasOf: undefined,
                dependencies: undefined,
              },
            },
          },
        },
      ],
      [
        'typography',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                typography: {
                  $type: 'typography',
                  base: {
                    $value: {
                      fontFamily: 'Helvetica',
                      fontSize: '{typography.size.sm}',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: 0,
                      lineHeight: 1.4,
                      textDecoration: 'none',
                      textTransform: 'none',
                    },
                    $extensions: {
                      mode: {
                        mobile: { fontSize: { value: 0.875, unit: 'rem' } },
                        desktop: { fontSize: { value: 1, unit: 'rem' } },
                      },
                    },
                  },
                  size: {
                    $type: 'dimension',
                    sm: { $value: { value: 0.875, unit: 'rem' } },
                  },
                },
              },
            },
          ],
          want: {
            'typography.base': {
              '.': {
                $value: {
                  fontFamily: ['Helvetica'],
                  fontSize: { unit: 'rem', value: 0.875 },
                  fontStyle: 'normal',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 400,
                  letterSpacing: { unit: 'px', value: 0 },
                  lineHeight: 1.4,
                  textDecoration: 'none',
                  textTransform: 'none',
                },
                originalValue: {
                  fontFamily: 'Helvetica',
                  fontSize: '{typography.size.sm}',
                  fontStyle: 'normal',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 400,
                  letterSpacing: 0,
                  lineHeight: 1.4,
                  textDecoration: 'none',
                  textTransform: 'none',
                },
                partialAliasOf: {
                  fontSize: 'typography.size.sm',
                },
              },
              mobile: {
                $value: {
                  fontFamily: ['Helvetica'],
                  fontSize: { unit: 'rem', value: 0.875 },
                  fontStyle: 'normal',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 400,
                  letterSpacing: { unit: 'px', value: 0 },
                  lineHeight: 1.4,
                  textDecoration: 'none',
                  textTransform: 'none',
                },
                originalValue: {
                  fontSize: { value: 0.875, unit: 'rem' },
                },
              },
              desktop: {
                $value: {
                  fontFamily: ['Helvetica'],
                  fontSize: { unit: 'rem', value: 1 },
                  fontStyle: 'normal',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 400,
                  letterSpacing: { unit: 'px', value: 0 },
                  lineHeight: 1.4,
                  textDecoration: 'none',
                  textTransform: 'none',
                },
                originalValue: {
                  fontSize: { value: 1, unit: 'rem' },
                },
              },
            },
            'typography.size.sm': {
              '.': {
                $value: { value: 0.875, unit: 'rem' },
                originalValue: { value: 0.875, unit: 'rem' },
              },
            },
          },
        },
      ],
    ];

    it.each(tests)('%s', async (_, { given, want }) => {
      const config = defineConfig({}, { cwd });
      const { tokens } = await parse(given, { config });
      for (const [id, value] of Object.entries(want)) {
        for (const [mode, wantedValue] of Object.entries(value!)) {
          const { source, ...modeValue } = tokens[id]?.mode[mode]!;
          expect(source).not.toBeFalsy();
          expect(modeValue).toEqual(wantedValue);
        }
      }
    });
  });

  describe('$extensions', () => {
    it('$value is ignored', async () => {
      const src = {
        emptyGroup: { $extensions: { foo: { $value: 'bar' } } },
        color: {
          $type: 'color',
          blue: { $value: { colorSpace: 'srgb', components: [0.2, 0.4, 0.8], alpha: 1 } },
          $extensions: { fake: { $value: 'foo' } },
        },
      };
      const config = defineConfig({}, { cwd });
      const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
      expect(tokens['color.blue']?.$value).toEqual({ alpha: 1, components: [0.2, 0.4, 0.8], colorSpace: 'srgb' });
    });
  });

  it('JSONC', async () => {
    const src = `{
  // color group
  "color": {
    "$type": "color",
    // blue group
    "blue": {
      "06": { "$value": { "colorSpace": "srgb", "components": [0, 0, 1] } }
    }
  }
}`;
    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], { config });
    expect(tokens['color.blue.06']?.$value).toEqual({ alpha: 1, components: [0, 0, 1], colorSpace: 'srgb' });
  });
});

interface Visit {
  name: string;
  json: any;
  path: string;
  ast: AnyNode;
}

describe('Transform', () => {
  it('color', async () => {
    const visits: Visit[] = [];
    const src = `{
  "color": {
    "$type": "color",
    "slate": {
      "700": { "$value": "#5a5a5a" },
      "800": { "$value": "#434343" },
      "900": { "$value": "#303030" },
      "1000": { "$value": "#242424" }
    },
    "bg": {
      "neutral": {
        "default": { "$value": "{color.slate.700}" },
        "hover": { "$value": "{color.slate.800}" }
      }
    }
  }
}`;

    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], {
      config,
      transform: {
        root(json, path, ast) {
          visits.push({ name: 'root', json, path, ast });
        },
        group(json, path, ast) {
          visits.push({ name: 'group', json, path, ast });
        },
        color(json, path, ast) {
          visits.push({ name: 'color', json, path, ast });
          if (path === 'color.bg.neutral.hover') {
            return { ...json, $value: '{color.slate.900}' };
          }
        },
      },
    });

    // assert visitors arrived in the right order
    expect(visits.map(({ name, path }) => ({ name, path }))).toEqual([
      { name: 'root', path: '.' },
      { name: 'group', path: 'color' },
      { name: 'group', path: 'color.slate' },
      { name: 'color', path: 'color.slate.700' },
      { name: 'color', path: 'color.slate.800' },
      { name: 'color', path: 'color.slate.900' },
      { name: 'color', path: 'color.slate.1000' },
      { name: 'group', path: 'color.bg' },
      { name: 'group', path: 'color.bg.neutral' },
      { name: 'color', path: 'color.bg.neutral.default' },
      { name: 'color', path: 'color.bg.neutral.hover' },
    ]);

    // assert color.bg.neutral.hover was transformed to color.slate.900 (not color.slate.800 as originally authored)
    expect(tokens['color.bg.neutral.hover']?.$value).toEqual({
      alpha: 1,
      components: [0.18823529411764706, 0.18823529411764706, 0.18823529411764706],
      colorSpace: 'srgb',
      hex: '#303030',
    });
  });

  it('color with token-level $type', async () => {
    const visits: Visit[] = [];
    const src = `{
  "color": {
    "slate": {
      "700": { "$type": "color", "$value": "#5a5a5a" },
      "800": { "$type": "color", "$value": "#434343" },
      "900": { "$type": "color", "$value": "#303030" },
      "1000": { "$type": "color", "$value": "#242424" }
    },
    "bg": {
      "neutral": {
        "default": { "$type": "color", "$value": "{color.slate.700}" },
        "hover": { "$type": "color", "$value": "{color.slate.800}" }
      }
    }
  }
}`;

    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], {
      config,
      transform: {
        root(json, path, ast) {
          visits.push({ name: 'root', json, path, ast });
        },
        group(json, path, ast) {
          visits.push({ name: 'group', json, path, ast });
        },
        color(json, path, ast) {
          visits.push({ name: 'color', json, path, ast });
          if (path === 'color.bg.neutral.hover') {
            return { ...json, $value: '{color.slate.900}' };
          }
        },
      },
    });

    // assert visitors arrived in the right order
    expect(visits.map(({ name, path }) => ({ name, path }))).toEqual([
      { name: 'root', path: '.' },
      { name: 'group', path: 'color' },
      { name: 'group', path: 'color.slate' },
      { name: 'color', path: 'color.slate.700' },
      { name: 'color', path: 'color.slate.800' },
      { name: 'color', path: 'color.slate.900' },
      { name: 'color', path: 'color.slate.1000' },
      { name: 'group', path: 'color.bg' },
      { name: 'group', path: 'color.bg.neutral' },
      { name: 'color', path: 'color.bg.neutral.default' },
      { name: 'color', path: 'color.bg.neutral.hover' },
    ]);

    // assert color.bg.neutral.hover was transformed to color.slate.900 (not color.slate.800 as originally authored)
    expect(tokens['color.bg.neutral.hover']?.$value).toEqual({
      alpha: 1,
      components: [0.18823529411764706, 0.18823529411764706, 0.18823529411764706],
      colorSpace: 'srgb',
      hex: '#303030',
    });
  });

  it('deleting', async () => {
    const src = `{
  "color": {
    "$type": "color",
    "slate": {
      "700": { "$value": "#5a5a5a" },
      "800": { "$value": "#434343" },
      "900": { "$value": "#303030" },
      "1000": { "$value": "#242424" }
    }
  }
}`;

    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], {
      config,
      transform: {
        group(json, path) {
          if (path === 'color.slate') {
            const groupJSON = { ...json };
            delete groupJSON['900'];
            return groupJSON;
          }
        },
      },
    });

    // assert only one token was removed, all others were kept in tact
    expect(tokens['color.slate.700']?.$value).toEqual({
      alpha: 1,
      colorSpace: 'srgb',
      components: [0.35294117647058826, 0.35294117647058826, 0.35294117647058826],
      hex: '#5a5a5a',
    });
    expect(tokens['color.slate.800']?.$value).toEqual({
      alpha: 1,
      colorSpace: 'srgb',
      components: [0.2627450980392157, 0.2627450980392157, 0.2627450980392157],
      hex: '#434343',
    });
    expect(tokens['color.slate.900']).toBeUndefined();
    expect(tokens['color.slate.1000']?.$value).toEqual({
      alpha: 1,
      colorSpace: 'srgb',
      components: [0.1411764705882353, 0.1411764705882353, 0.1411764705882353],
      hex: '#242424',
    });
  });

  it('injecting', async () => {
    const src = `{
  "color": {
    "$type": "color",
    "slate": {
      "700": { "$value": "#5a5a5a" }
    }
  }
}`;

    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], {
      config,
      transform: {
        group(json, path) {
          if (path === 'color.slate') {
            return { ...json, '800': { $value: '#434343' } };
          }
        },
      },
    });

    // assert original token was preserved as authored
    expect(tokens['color.slate.700']?.$value).toEqual({
      alpha: 1,
      colorSpace: 'srgb',
      components: [0.35294117647058826, 0.35294117647058826, 0.35294117647058826],
      hex: '#5a5a5a',
    });

    // assert dynamically-injected token matches
    expect(tokens['color.slate.800']?.$type).toBe('color');
    expect(tokens['color.slate.800']?.$value).toEqual({
      alpha: 1,
      colorSpace: 'srgb',
      components: [0.2627450980392157, 0.2627450980392157, 0.2627450980392157],
      hex: '#434343',
    });
  });

  it('unknown', async () => {
    const src = `{
  "color": {
    "$type": "foobar",
    "slate": {
      "700": { "$value": "bazbaz" }
    }
  }
}`;

    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], {
      config,
      transform: {
        foobar(json) {
          return { ...json, $type: 'color', $value: '#0088ff' };
        },
      },
    });

    // assert custom $type was parsed as a color (with a new $value)
    expect(tokens['color.slate.700']?.$type).toBe('color');
    expect(tokens['color.slate.700']?.$value).toEqual({
      alpha: 1,
      colorSpace: 'srgb',
      components: [0, 0.5333333333333333, 1],
      hex: '#0088ff',
    });
  });
});
