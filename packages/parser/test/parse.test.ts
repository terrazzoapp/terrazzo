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



          1 | tokens:
          2 |   - foo: true
          3 |   false"
      `);
    }
  });

  it('error messages', async () => {
    try {
      const config = defineConfig({}, { cwd });
      await parse(
        [
          {
            filename: DEFAULT_FILENAME,
            src: `{
  "color": {
    "$type": "color",
    "base": {
      "blue": {
        "100": { "$value": "#fafdfe", "$extensions": { "mode": { "light": "#fafdfe", "dark": "#07191d" } } },
        "200": { "$value": "#f2fcfd", "$extensions": { "mode": { "light": "#f2fcfd", "dark": "#0b1d22" } } },
        "300": { "$value": "#e7f9fb", "$extensions": { "mode": { "light": "#e7f9fb", "dark": "#0f272e" } } },
        "400": { "$value": "#d8f3f6", "$extensions": { "mode": { "light": "#d8f3f6", "dark": "#112f37" } } },
        "500": { "$value": "#c4eaef", "$extensions": { "mode": { "light": "#c4eaef", "dark": "#143741" } } },
        "600": { "$value": "#aadee6", "$extensions": { "mode": { "light": "#aadee6", "dark": "#17444f" } } },
        "700": { "$value": "#84cdda", "$extensions": { "mode": { "light": "#84cdda", "dark": "#1d586a" } } },
        "800": { "$value": "#3db9cf", "$extensions": { "mode": { "light": "#3db9cf", "dark": "#28879f" } } },
        "900": { "$value": "#8c8d86", "$extensions": { "mode": { "light": "#8c8d86", "dark": "#05a2c2" } } },
        "1000": { "$value": "#0894b3", "$extensions": { "mode": { "light": "#0894b3", "dark": "#13b7d8" } } },
        "1100": { "$value": "#0c7792", "$extensions": { "mode": { "light": "#0c7792", "dark": "#20d0f3" } } },
        "1200": { "$value": "#0d3c48", "$extensions": { "mode": { "light": "#0d3c48", "dark": "#b6ecf7" } } }
      },
      "green": {
        "100": { "$value": "#fbfefb", "$extensions": { "mode": { "light": "#fbfefb", "dark": "#203c25" } } },
        "200": { "$value": "#f3fcf3", "$extensions": { "mode": { "light": "#f3fcf3", "dark": "#297c3b" } } },
        "300": { "$value": "#ebf9eb", "$extensions": { "mode": { "light": "#ebf9eb", "dark": "#3d9a50" } } },
        "400": { "$value": "#dff3df", "$extensions": { "mode": { "light": "#dff3df", "dark": "#46a758" } } },
        "500": { "$value": "#ceebcf", "$extensions": { "mode": { "light": "#ceebcf", "dark": "#65ba75" } } },
        "600": { "$value": "#b7dfba", "$extensions": { "mode": { "light": "#b7dfba", "dark": "#97cf9c" } } },
        "700": { "$value": "#97cf9c", "$extensions": { "mode": { "light": "#97cf9c", "dark": "#b7dfba" } } },
        "800": { "$value": "#65ba75", "$extensions": { "mode": { "light": "#65ba75", "dark": "#ceebcf" } } },
        "900": { "$value": "#46a758", "$extensions": { "mode": { "light": "#46a758", "dark": "#dff3df" } } },
        "1000": { "$value": "#3d9a50", "$extensions": { "mode": { "light": "#3d9a50", "dark": "#ebf9eb" } } },
        "1100": { "$value": "#297c3b", "$extensions": { "mode": { "light": "#297c3b", "dark": "#f3fcf3" } } },
        "1200": { "$value": "#203c25", "$extensions": { "mode": { "light": "#203c25", "dark": "#fbfefb" } } }
      },
      "gray": {
        "000": { "$value": "#ffffff", "$extensions": { "mode": { "light": "#ffffff", "dark": "#000000" } } },
        "100": { "$value": "#fdfdfc", "$extensions": { "mode": { "light": "#fdfdfc", "dark": "#181818" } } },
        "200": { "$value": "#f9f9f8", "$extensions": { "mode": { "light": "#f9f9f8", "dark": "#282828" } } },
        "300": { "$value": "#f1f0ef", "$extensions": { "mode": { "light": "#f1f0ef", "dark": "#303030" } } },
        "400": { "$value": "#e9e8e6", "$extensions": { "mode": { "light": "#e9e8e6", "dark": "#373737" } } },
        "500": { "$value": "#e2e1de", "$extensions": { "mode": { "light": "#e2e1de", "dark": "#3f3f3f" } } },
        "600": { "$value": "#dad9d6", "$extensions": { "mode": { "light": "#dad9d6", "dark": "#4a4a4a" } } },
        "700": { "$value": "#cfceca", "$extensions": { "mode": { "light": "#cfceca", "dark": "#606060" } } },
        "800": { "$value": "#bcbbb5", "$extensions": { "mode": { "light": "#bcbbb5", "dark": "#6e6e6e" } } },
        "900": { "$value": "#8c8d86", "$extensions": { "mode": { "light": "#8c8d86", "dark": "#818181" } } },
        "1000": { "$value": "#82827C", "$extensions": { "mode": { "light": "#82827C", "dark": "#b1b1b1" } } },
        "1100": { "$value": "#646464)", "$extensions": { "mode": { "light": "#646464)", "dark": "#eeeeee" } } },
        "1200": { "$value": "#202020", "$extensions": { "mode": { "light": "#202020", "dark": "#fdfdfc" } } },
        "1300": { "$value": "#000000", "$extensions": { "mode": { "light": "#000000", "dark": "#ffffff" } } }
      }
    }
  }
}`,
          },
        ],
        { config },
      );
      expect(true).toBe(false);
    } catch (err) {
      expect(stripAnsi(String(err))).toMatchInlineSnapshot(`
        "TokensJSONError: [lint:core/valid-color] Could not parse color "#646464)".

          43 |         "900": { "$value": "#8c8d86", "$extensions": { "mode": { "light": "#8c8d86", "dark": "#818181" } } },
          44 |         "1000": { "$value": "#82827C", "$extensions": { "mode": { "light": "#82827C", "dark": "#b1b1b1" } } },
        > 45 |         "1100": { "$value": "#646464)", "$extensions": { "mode": { "light": "#646464)", "dark": "#eeeeee" } } },
             |                             ^
          46 |         "1200": { "$value": "#202020", "$extensions": { "mode": { "light": "#202020", "dark": "#fdfdfc" } } },
          47 |         "1300": { "$value": "#000000", "$extensions": { "mode": { "light": "#000000", "dark": "#ffffff" } } }
          48 |       }

        [lint:lint] 1 error"
      `);
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
                base: { blue: { 500: { $type: 'color', $value: 'color(srgb 0 0.2 1)' } } },
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
                400: { $value: '#dfffad' },
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
                base: { blue: { 500: { $type: 'color', $deprecated: true, $value: 'color(srgb 0 0.2 1)' } } },
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
                  400: { $value: '#66945b' },
                },
                lime: {
                  $deprecated: 'Use combava instead',
                  200: { $deprecated: false, $value: '#f3ffe0ff' },
                  400: { $value: '#dfffad' },
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

  describe('modes', () => {
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
                      $extensions: { mode: { light: '{color.blue.7}', dark: '{color.blue.6}' } },
                    },
                  },
                  blue: {
                    '6': { $value: '#0550ae', $extensions: { mode: { light: '#0550ae', dark: '#1158c7' } } },
                    '7': { $value: '#8ec8f6', $extensions: { mode: { light: '#8ec8f6', dark: '#205d9e' } } },
                  },
                },
              },
            },
          ],
          want: {
            'color.blue.6': {
              '.': {
                $value: {
                  alpha: 1,
                  components: [0.0196078431372549, 0.3137254901960784, 0.6823529411764706],
                  colorSpace: 'srgb',
                  hex: '#0550ae',
                },
                originalValue: '#0550ae',
              },
              light: {
                $value: {
                  alpha: 1,
                  components: [0.0196078431372549, 0.3137254901960784, 0.6823529411764706],
                  colorSpace: 'srgb',
                  hex: '#0550ae',
                },
                originalValue: '#0550ae',
              },
              dark: {
                $value: {
                  alpha: 1,
                  components: [0.06666666666666667, 0.34509803921568627, 0.7803921568627451],
                  colorSpace: 'srgb',
                  hex: '#1158c7',
                },
                originalValue: '#1158c7',
              },
            },
            'color.blue.7': {
              '.': {
                $value: {
                  alpha: 1,
                  components: [0.5568627450980392, 0.7843137254901961, 0.9647058823529412],
                  colorSpace: 'srgb',
                  hex: '#8ec8f6',
                },
                originalValue: '#8ec8f6',
              },
              light: {
                $value: {
                  alpha: 1,
                  components: [0.5568627450980392, 0.7843137254901961, 0.9647058823529412],
                  colorSpace: 'srgb',
                  hex: '#8ec8f6',
                },
                originalValue: '#8ec8f6',
              },
              dark: {
                $value: {
                  alpha: 1,
                  components: [0.12549019607843137, 0.36470588235294116, 0.6196078431372549],
                  colorSpace: 'srgb',
                  hex: '#205d9e',
                },
                originalValue: '#205d9e',
              },
            },
            'color.semantic.bg': {
              '.': {
                $value: {
                  alpha: 1,
                  components: [0.5568627450980392, 0.7843137254901961, 0.9647058823529412],
                  colorSpace: 'srgb',
                  hex: '#8ec8f6',
                },
                aliasChain: ['color.blue.7'],
                aliasOf: 'color.blue.7',
                originalValue: '{color.blue.7}',
              },
              light: {
                $value: {
                  alpha: 1,
                  components: [0.5568627450980392, 0.7843137254901961, 0.9647058823529412],
                  colorSpace: 'srgb',
                  hex: '#8ec8f6',
                },
                aliasChain: ['color.blue.7'],
                aliasOf: 'color.blue.7',
                originalValue: '{color.blue.7}',
              },
              dark: {
                $value: {
                  alpha: 1,
                  components: [0.0196078431372549, 0.3137254901960784, 0.6823529411764706],
                  colorSpace: 'srgb',
                  hex: '#0550ae',
                },
                aliasChain: ['color.blue.6'],
                aliasOf: 'color.blue.6',
                originalValue: '{color.blue.6}',
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
