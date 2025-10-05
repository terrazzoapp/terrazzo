import * as momoa from '@humanwhocodes/momoa';
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
        "[parser:init] Install yaml-to-momoa package to parse YAML, and pass in as option, e.g.:

            import { bundle } from '@terrazzo/json-schema-tools';
            import yamlToMomoa from 'yaml-to-momoa';

            bundle(yamlString, { yamlToMomoa });"
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
        "[parser:init] All mapping items must start at the same column at line 3, column 1:

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
                'font-family': {
                  $type: 'fontFamily',
                  base: { $value: 'Helvetica' },
                  sans: { $value: '{font-family.base}' },
                },
              },
            },
          ],
          want: { 'font-family.base': ['Helvetica'], 'font-family.sans': ['Helvetica'] },
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
            '6': {
              $value: {
                colorSpace: 'srgb',
                components: [0.0196078431372549, 0.3137254901960784, 0.6823529411764706],
                alpha: 1,
                hex: '#0550ae',
              },
              $extensions: {
                mode: {
                  light: {
                    colorSpace: 'srgb',
                    components: [0.0196078431372549, 0.3137254901960784, 0.6823529411764706],
                    alpha: 1,
                    hex: '#0550ae',
                  },
                  'light-colorblind': {
                    colorSpace: 'srgb',
                    components: [0.0196078431372549, 0.3137254901960784, 0.6823529411764706],
                    alpha: 1,
                    hex: '#0550ae',
                  },
                  'light-high-contrast': {
                    colorSpace: 'srgb',
                    components: [0.00784313725490196, 0.23137254901960785, 0.5843137254901961],
                    alpha: 1,
                    hex: '#023b95',
                  },
                  dark: {
                    colorSpace: 'srgb',
                    components: [0.06666666666666667, 0.34509803921568627, 0.7803921568627451],
                    alpha: 1,
                    hex: '#1158c7',
                  },
                  'dark-dimmed': {
                    colorSpace: 'srgb',
                    components: [0.1450980392156863, 0.35294117647058826, 0.6980392156862745],
                    alpha: 1,
                    hex: '#255ab2',
                  },
                  'dark-high-contrast': {
                    colorSpace: 'srgb',
                    components: [0.19215686274509805, 0.5450980392156862, 0.9725490196078431],
                    alpha: 1,
                    hex: '#318bf8',
                  },
                  'dark-colorblind': {
                    colorSpace: 'srgb',
                    components: [0.06666666666666667, 0.34509803921568627, 0.7803921568627451],
                    alpha: 1,
                    hex: '#1158c7',
                  },
                },
              },
            },
            '7': {
              $value: {
                colorSpace: 'srgb',
                components: [0.011764705882352941, 0.23921568627450981, 0.5450980392156862],
                alpha: 1,
                hex: '#033d8b',
              },
              $extensions: {
                mode: {
                  light: {
                    colorSpace: 'srgb',
                    components: [0.011764705882352941, 0.23921568627450981, 0.5450980392156862],
                    alpha: 1,
                    hex: '#033d8b',
                  },
                  'light-colorblind': {
                    colorSpace: 'srgb',
                    components: [0.011764705882352941, 0.23921568627450981, 0.5450980392156862],
                    alpha: 1,
                    hex: '#033d8b',
                  },
                  'light-high-contrast': {
                    colorSpace: 'srgb',
                    components: [0.00784313725490196, 0.1843137254901961, 0.47843137254901963],
                    alpha: 1,
                    hex: '#022f7a',
                  },
                  dark: {
                    colorSpace: 'srgb',
                    components: [0.050980392156862744, 0.2549019607843137, 0.615686274509804],
                    alpha: 1,
                    hex: '#0d419d',
                  },
                  'dark-dimmed': {
                    colorSpace: 'srgb',
                    components: [0.10588235294117647, 0.29411764705882354, 0.5686274509803921],
                    alpha: 1,
                    hex: '#1b4b91',
                  },
                  'dark-high-contrast': {
                    colorSpace: 'srgb',
                    components: [0.14901960784313725, 0.4470588235294118, 0.9529411764705882],
                    alpha: 1,
                    hex: '#2672f3',
                  },
                  'dark-colorblind': {
                    colorSpace: 'srgb',
                    components: [0.050980392156862744, 0.2549019607843137, 0.615686274509804],
                    alpha: 1,
                    hex: '#0d419d',
                  },
                },
              },
            },
            '8': {
              $value: {
                colorSpace: 'srgb',
                components: [0.0392156862745098, 0.18823529411764706, 0.4117647058823529],
                alpha: 1,
                hex: '#0a3069',
              },
              $extensions: {
                mode: {
                  light: {
                    colorSpace: 'srgb',
                    components: [0.0392156862745098, 0.18823529411764706, 0.4117647058823529],
                    alpha: 1,
                    hex: '#0a3069',
                  },
                  'light-colorblind': {
                    colorSpace: 'srgb',
                    components: [0.0392156862745098, 0.18823529411764706, 0.4117647058823529],
                    alpha: 1,
                    hex: '#0a3069',
                  },
                  'light-high-contrast': {
                    colorSpace: 'srgb',
                    components: [0.011764705882352941, 0.1450980392156863, 0.38823529411764707],
                    alpha: 1,
                    hex: '#032563',
                  },
                  dark: {
                    colorSpace: 'srgb',
                    components: [0.047058823529411764, 0.17647058823529413, 0.4196078431372549],
                    alpha: 1,
                    hex: '#0c2d6b',
                  },
                  'dark-dimmed': {
                    colorSpace: 'srgb',
                    components: [0.0784313725490196, 0.23921568627450981, 0.4745098039215686],
                    alpha: 1,
                    hex: '#143d79',
                  },
                  'dark-high-contrast': {
                    colorSpace: 'srgb',
                    components: [0.11764705882352941, 0.3764705882352941, 0.8352941176470589],
                    alpha: 1,
                    hex: '#1e60d5',
                  },
                  'dark-colorblind': {
                    colorSpace: 'srgb',
                    components: [0.047058823529411764, 0.17647058823529413, 0.4196078431372549],
                    alpha: 1,
                    hex: '#0c2d6b',
                  },
                },
              },
            },
            '9': {
              $value: {
                colorSpace: 'srgb',
                components: [0, 0.12941176470588237, 0.3333333333333333],
                alpha: 1,
                hex: '#002155',
              },
              $extensions: {
                mode: {
                  light: {
                    colorSpace: 'srgb',
                    components: [0, 0.12941176470588237, 0.3333333333333333],
                    alpha: 1,
                    hex: '#002155',
                  },
                  'light-colorblind': {
                    colorSpace: 'srgb',
                    components: [0, 0.12941176470588237, 0.3333333333333333],
                    alpha: 1,
                    hex: '#002155',
                  },
                  'light-high-contrast': {
                    colorSpace: 'srgb',
                    components: [0.00784313725490196, 0.10196078431372549, 0.2901960784313726],
                    alpha: 1,
                    hex: '#021a4a',
                  },
                  dark: {
                    colorSpace: 'srgb',
                    components: [0.0196078431372549, 0.11372549019607843, 0.30196078431372547],
                    alpha: 1,
                    hex: '#051d4d',
                  },
                  'dark-dimmed': {
                    colorSpace: 'srgb',
                    components: [0.058823529411764705, 0.17647058823529413, 0.3607843137254902],
                    alpha: 1,
                    hex: '#0f2d5c',
                  },
                  'dark-high-contrast': {
                    colorSpace: 'srgb',
                    components: [0.09803921568627451, 0.30980392156862746, 0.6941176470588235],
                    alpha: 1,
                    hex: '#194fb1',
                  },
                  'dark-colorblind': {
                    colorSpace: 'srgb',
                    components: [0.0196078431372549, 0.11372549019607843, 0.30196078431372547],
                    alpha: 1,
                    hex: '#051d4d',
                  },
                },
              },
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
      expect(tokens['color.blue.6']?.group).toEqual({
        id: 'color.blue',
        $type: 'color',
        $deprecated: undefined,
        $description: 'Blue palette',
        $extensions: { foo: 'bar' },
        tokens: ['color.blue.6', 'color.blue.7', 'color.blue.8', 'color.blue.9'],
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
                aliasedBy: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              light: {
                $value: { alpha: 1, components: [0.02, 0.3, 0.68], colorSpace: 'srgb' },
                originalValue: { colorSpace: 'srgb', components: [0.02, 0.3, 0.68] },
                aliasChain: undefined,
                aliasOf: undefined,
                aliasedBy: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              dark: {
                $value: { alpha: 1, components: [0.067, 0.35, 0.78], colorSpace: 'srgb' },
                originalValue: { components: [0.067, 0.35, 0.78], colorSpace: 'srgb' },
                aliasChain: undefined,
                aliasOf: undefined,
                aliasedBy: ['color.semantic.bg'],
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
                aliasedBy: ['color.semantic.bg'],
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              light: {
                $value: { alpha: 1, components: [0.56, 0.78, 0.96], colorSpace: 'srgb' },
                originalValue: { colorSpace: 'srgb', components: [0.56, 0.78, 0.96] },
                aliasChain: undefined,
                aliasOf: undefined,
                aliasedBy: ['color.semantic.bg'],
                partialAliasOf: undefined,
                dependencies: undefined,
              },
              dark: {
                $value: { alpha: 1, components: [0.13, 0.36, 0.62], colorSpace: 'srgb' },
                originalValue: { colorSpace: 'srgb', components: [0.13, 0.36, 0.62] },
                aliasChain: undefined,
                aliasOf: undefined,
                aliasedBy: undefined,
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
                aliasedBy: undefined,
                partialAliasOf: undefined,
                dependencies: ['#/color/blue/7/$value'],
              },
              light: {
                $value: { alpha: 1, components: [0.56, 0.78, 0.96], colorSpace: 'srgb' },
                originalValue: '{color.blue.7}',
                aliasChain: ['color.blue.7'],
                aliasOf: 'color.blue.7',
                aliasedBy: undefined,
                partialAliasOf: undefined,
                dependencies: ['#/color/blue/7/$extensions/mode/light/$value'],
              },
              dark: {
                $value: { alpha: 1, components: [0.067, 0.35, 0.78], colorSpace: 'srgb' },
                originalValue: '{color.blue.6}',
                aliasChain: ['color.blue.6'],
                aliasOf: 'color.blue.6',
                aliasedBy: undefined,
                partialAliasOf: undefined,
                dependencies: ['#/color/blue/6/$extensions/mode/dark/$value'],
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
                      letterSpacing: { value: 0, unit: 'px' },
                      lineHeight: 1.4,
                      textDecoration: 'none',
                      textTransform: 'none',
                    },
                    $extensions: {
                      mode: {
                        mobile: {
                          fontFamily: 'Helvetica',
                          fontSize: { value: 0.875, unit: 'rem' },
                          fontStyle: 'normal',
                          fontWeight: 400,
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: { value: 0, unit: 'px' },
                          lineHeight: 1.4,
                          textDecoration: 'none',
                          textTransform: 'none',
                        },
                        desktop: {
                          fontFamily: 'Helvetica',
                          fontSize: { value: 1, unit: 'rem' },
                          fontStyle: 'normal',
                          fontWeight: 400,
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: { value: 0, unit: 'px' },
                          lineHeight: 1.4,
                          textDecoration: 'none',
                          textTransform: 'none',
                        },
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
                  letterSpacing: { value: 0, unit: 'px' },
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
                  letterSpacing: { value: 0, unit: 'px' },
                  lineHeight: 1.4,
                  textDecoration: 'none',
                  textTransform: 'none',
                },
                aliasOf: undefined,
                aliasChain: undefined,
                aliasedBy: undefined,
                partialAliasOf: {
                  fontSize: 'typography.size.sm',
                },
                dependencies: ['#/typography/size/sm/$value'],
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
                  fontFamily: 'Helvetica',
                  fontSize: { value: 0.875, unit: 'rem' },
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: { value: 0, unit: 'px' },
                  lineHeight: 1.4,
                  textDecoration: 'none',
                  textTransform: 'none',
                },
                aliasOf: undefined,
                aliasChain: undefined,
                aliasedBy: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
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
                  fontFamily: 'Helvetica',
                  fontSize: { value: 1, unit: 'rem' },
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: { value: 0, unit: 'px' },
                  lineHeight: 1.4,
                  textDecoration: 'none',
                  textTransform: 'none',
                },
                aliasOf: undefined,
                aliasChain: undefined,
                aliasedBy: undefined,
                partialAliasOf: undefined,
                dependencies: undefined,
              },
            },
            'typography.size.sm': {
              '.': {
                $value: { value: 0.875, unit: 'rem' },
                originalValue: { value: 0.875, unit: 'rem' },
                aliasOf: undefined,
                aliasChain: undefined,
                aliasedBy: ['typography.base'],
                partialAliasOf: undefined,
                dependencies: undefined,
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
  node: momoa.AnyNode;
  path: string[];
}

describe('Transform', () => {
  it('color', async () => {
    const visits: Visit[] = [];
    const src = `{
  "color": {
    "$type": "color",
    "slate": {
      "700": { "$value": { "colorSpace": "srgb", "components": [0.35294117647058826, 0.35294117647058826, 0.35294117647058826], "alpha": 1, "hex": "#5a5a5a" } },
      "800": { "$value": { "colorSpace": "srgb", "components": [0.2627450980392157, 0.2627450980392157, 0.2627450980392157], "alpha": 1, "hex": "#434343" } },
      "900": { "$value": { "colorSpace": "srgb", "components": [0.18823529411764706, 0.18823529411764706, 0.18823529411764706], "alpha": 1, "hex": "#303030" } },
      "1000": {  "$value": { "colorSpace": "srgb", "components": [0.1411764705882353, 0.1411764705882353, 0.1411764705882353], "alpha": 1, "hex": "#242424" } }
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
        root(node, { path }) {
          visits.push({ name: 'root', node, path });
        },
        group(node, { path }) {
          visits.push({ name: 'group', node, path });
        },
        color(node, { path }) {
          visits.push({ name: 'color', node, path });
          if (path.join('.') === 'color.bg.neutral.hover') {
            (
              (node as momoa.ObjectNode).members.find((m) => (m.name as momoa.StringNode).value === '$value')!
                .value as momoa.StringNode
            ).value = '{color.slate.900}';
            return node;
          }
        },
      },
    });

    // assert visitors arrived in the right order
    expect(visits.map(({ name, path }) => ({ name, path }))).toEqual([
      { name: 'root', path: [] },
      { name: 'group', path: ['color'] },
      { name: 'group', path: ['color', 'slate'] },
      { name: 'color', path: ['color', 'slate', '700'] },
      { name: 'color', path: ['color', 'slate', '800'] },
      { name: 'color', path: ['color', 'slate', '900'] },
      { name: 'color', path: ['color', 'slate', '1000'] },
      { name: 'group', path: ['color', 'bg'] },
      { name: 'group', path: ['color', 'bg', 'neutral'] },
      { name: 'color', path: ['color', 'bg', 'neutral', 'default'] },
      { name: 'color', path: ['color', 'bg', 'neutral', 'hover'] },
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
      "$type": "color",
      "700": { "$value": { "colorSpace": "srgb", "components": [0.35294117647058826, 0.35294117647058826, 0.35294117647058826], "alpha": 1, "hex": "#5a5a5a" } },
      "800": { "$value": { "colorSpace": "srgb", "components": [0.2627450980392157, 0.2627450980392157, 0.2627450980392157], "alpha": 1, "hex": "#434343" } },
      "900": { "$value": { "colorSpace": "srgb", "components": [0.18823529411764706, 0.18823529411764706, 0.18823529411764706], "alpha": 1, "hex": "#303030" } },
      "1000": {  "$value": { "colorSpace": "srgb", "components": [0.1411764705882353, 0.1411764705882353, 0.1411764705882353], "alpha": 1, "hex": "#242424" } }
    },
    "bg": {
      "neutral": {
        "default": { "$type": "color", "$value": "{color.slate.700}" },
        "hover": { "$type": "color", "$value": "{color.slate.800}" }
      }
    }
  }
}`;

    const config = defineConfig(
      {
        lint: {
          rules: {
            'core/no-type-on-alias': 'off',
          },
        },
      },
      { cwd },
    );
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], {
      config,
      transform: {
        root(node, { path }) {
          visits.push({ name: 'root', node, path });
        },
        group(node, { path }) {
          visits.push({ name: 'group', node, path });
        },
        color(node, { path }) {
          visits.push({ name: 'color', node, path });
          if (path.join('.') === 'color.bg.neutral.hover') {
            (
              (node as momoa.ObjectNode).members.find((m) => (m.name as momoa.StringNode).value === '$value')!
                .value as momoa.StringNode
            ).value = '{color.slate.900}';
            return node;
          }
        },
      },
    });

    // assert visitors arrived in the right order
    expect(visits.map(({ name, path }) => ({ name, path }))).toEqual([
      { name: 'root', path: [] },
      { name: 'group', path: ['color'] },
      { name: 'group', path: ['color', 'slate'] },
      { name: 'color', path: ['color', 'slate', '700'] },
      { name: 'color', path: ['color', 'slate', '800'] },
      { name: 'color', path: ['color', 'slate', '900'] },
      { name: 'color', path: ['color', 'slate', '1000'] },
      { name: 'group', path: ['color', 'bg'] },
      { name: 'group', path: ['color', 'bg', 'neutral'] },
      { name: 'color', path: ['color', 'bg', 'neutral', 'default'] },
      { name: 'color', path: ['color', 'bg', 'neutral', 'hover'] },
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
      "700": { "$value": { "colorSpace": "srgb", "components": [0.35294117647058826, 0.35294117647058826, 0.35294117647058826], "alpha": 1, "hex": "#5a5a5a" } },
      "800": { "$value": { "colorSpace": "srgb", "components": [0.2627450980392157, 0.2627450980392157, 0.2627450980392157], "alpha": 1, "hex": "#434343" } },
      "900": { "$value": { "colorSpace": "srgb", "components": [0.18823529411764706, 0.18823529411764706, 0.18823529411764706], "alpha": 1, "hex": "#303030" } },
      "1000": {  "$value": { "colorSpace": "srgb", "components": [0.1411764705882353, 0.1411764705882353, 0.1411764705882353], "alpha": 1, "hex": "#242424" } }
    }
  }
}`;

    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], {
      config,
      transform: {
        group(node, { path }) {
          if (path.join('.') === 'color.slate') {
            (node as momoa.ObjectNode).members = (node as momoa.ObjectNode).members.filter(
              (m) => m.name.type === 'String' && m.name.value !== '900',
            );
            return node;
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
      "700": { "$value": { "colorSpace": "srgb", "components": [0.35294117647058826, 0.35294117647058826, 0.35294117647058826], "alpha": 1, "hex": "#5a5a5a" } }
    }
  }
}`;

    const config = defineConfig({}, { cwd });
    const { tokens } = await parse([{ filename: DEFAULT_FILENAME, src }], {
      config,
      transform: {
        group(node, { path }) {
          if (path.join('.') === 'color.slate') {
            (node as momoa.ObjectNode).members.push(
              (
                momoa.parse(
                  JSON.stringify({
                    '800': {
                      $value: {
                        colorSpace: 'srgb',
                        components: [0.2627450980392157, 0.2627450980392157, 0.2627450980392157],
                        alpha: 1,
                        hex: '#434343',
                      },
                    },
                  }),
                ).body as momoa.ObjectNode
              ).members[0]!,
            );
            return node;
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
        foobar(node) {
          const members = (
            momoa.parse(
              JSON.stringify({
                $type: 'color',
                $value: { colorSpace: 'srgb', components: [0, 0.5333333333333333, 1], hex: '#0088ff' },
              }),
            ).body as momoa.ObjectNode
          ).members;
          (node as momoa.ObjectNode).members = members;
          return node;
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
