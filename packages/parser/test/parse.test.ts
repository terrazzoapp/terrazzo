import type { AnyNode } from '@humanwhocodes/momoa';
import type { TokenNormalized } from '@terrazzo/token-tools';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import yamlToMomoa from 'yaml-to-momoa';
import defineConfig from '../src/config.js';
import type { TokensJSONError } from '../src/logger.js';
import parse from '../src/parse/index.js';

const cwd = new URL(import.meta.url);
const DEFAULT_FILENAME = new URL('file:///tokens.json');

describe('Tokens', () => {
  type Test = [
    string,
    {
      given: any;
      want:
        | {
            error?: never;
            tokens: Record<
              string,
              Pick<TokenNormalized, '$value' | 'aliasOf' | 'aliasChain' | 'aliasedBy' | 'partialAliasOf'>
            >;
          }
        | { error: string; tokens?: never };
    },
  ];

  async function runTest({ given, want }: Test[1]) {
    const config = defineConfig({}, { cwd });
    let result: Awaited<ReturnType<typeof parse>> | undefined;
    try {
      result = await parse(given, { config, yamlToMomoa });
    } catch (e) {
      // console.error(e)
      const err = e as TokensJSONError;
      expect(stripAnsi(err.message).replace(/\[parser:(validate|alias|normalize)\]\s*/, '')).toBe(want.error);

      // ensure TokenValidationError contains necessary properties
      // expect(err.node?.type?.length).toBeGreaterThan(0);
      // expect(err.node?.loc?.start?.line).toBeGreaterThanOrEqual(1);
    }

    if (result) {
      expect(want.tokens).toBeTruthy();
      expect(want.error).toBeUndefined();
      const expectedTokens: Record<string, any> = {};
      for (const [id, token] of Object.entries(result.tokens)) {
        expectedTokens[id] = { $value: token.$value };

        // Note: all these additions are a pain, but they are a huge lift to
        // test otherwise complex resolution logic. It’s OK when adding test cases
        // to just “snapshot” it and copy the current value—that’s expected.
        if (token.aliasedBy) {
          expectedTokens[id].aliasedBy = token.aliasedBy;
        }
        if (token.aliasOf) {
          expectedTokens[id].aliasOf = token.aliasOf;
        }
        if (token.aliasChain?.length) {
          expectedTokens[id].aliasChain = token.aliasChain;
        }
        if (token.partialAliasOf) {
          expectedTokens[id].partialAliasOf = token.partialAliasOf;
        }
      }
      expect(expectedTokens).toEqual(want.tokens);
    }
  }

  describe('7 Alias', () => {
    const tests: Test[] = [
      [
        'valid: primitive',
        {
          given: [
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
          want: {
            tokens: {
              'color.base.blue.500': {
                $value: { alpha: 1, components: [0, 0.2, 1], colorSpace: 'srgb' },
                aliasedBy: ['color.semantic'],
              },
              'color.semantic': {
                $value: { alpha: 1, components: [0, 0.2, 1], colorSpace: 'srgb' },
                aliasOf: 'color.base.blue.500',
                aliasChain: ['color.base.blue.500'],
              },
            },
          },
        },
      ],
      [
        'valid: primitive (YAML)',
        {
          given: [
            {
              filename: new URL('file:///tokens.yaml'),
              src: `color:
  base:
    blue:
      500:
        $type: color
        $value: color(srgb 0 0.2 1)
  semantic:
    $value: "{color.base.blue.500}"`,
            },
          ],
          want: {
            tokens: {
              'color.base.blue.500': {
                $value: { alpha: 1, components: [0, 0.2, 1], colorSpace: 'srgb' },
                aliasedBy: ['color.semantic'],
              },
              'color.semantic': {
                $value: { alpha: 1, components: [0, 0.2, 1], colorSpace: 'srgb' },
                aliasOf: 'color.base.blue.500',
                aliasChain: ['color.base.blue.500'],
              },
            },
          },
        },
      ],
      [
        'valid: Font Weight',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                font: { weight: { bold: { $type: 'fontWeight', $value: 700 } } },
                bold: { $type: 'fontWeight', $value: '{font.weight.bold}' },
              },
            },
          ],
          want: {
            tokens: {
              'font.weight.bold': { $value: 700, aliasedBy: ['bold'] },
              bold: { $value: 700, aliasOf: 'font.weight.bold', aliasChain: ['font.weight.bold'] },
            },
          },
        },
      ],
      [
        'valid: Font Weight (YAML)',
        {
          given: [
            {
              filename: new URL('file:///tokens.yaml'),
              src: `bold:
  $type: fontWeight
  $value: "{font.weight.700}"
font:
  weight:
    $type: fontWeight
    700:
      $value: 700`,
            },
          ],
          want: {
            tokens: {
              'font.weight.700': { $value: 700, aliasedBy: ['bold'] },
              bold: { $value: 700, aliasOf: 'font.weight.700', aliasChain: ['font.weight.700'] },
            },
          },
        },
      ],
      [
        'valid: Stroke Style',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                buttonStroke: {
                  $type: 'strokeStyle',
                  $value: { lineCap: 'round', dashArray: ['{size.2}', '{size.3}'] },
                },
                size: {
                  $type: 'dimension',
                  '2': { $value: { value: 0.125, unit: 'rem' } },
                  '3': { $value: { value: 0.25, unit: 'rem' } },
                },
              },
            },
          ],
          want: {
            tokens: {
              buttonStroke: {
                $value: {
                  lineCap: 'round',
                  dashArray: [
                    { value: 0.125, unit: 'rem' },
                    { value: 0.25, unit: 'rem' },
                  ],
                },
              },
              'size.2': { $value: { value: 0.125, unit: 'rem' }, aliasedBy: ['buttonStroke'] },
              'size.3': { $value: { value: 0.25, unit: 'rem' }, aliasedBy: ['buttonStroke'] },
            },
          },
        },
      ],
      [
        'valid: Border',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: { $type: 'color', semantic: { subdued: { $value: 'color(srgb 0 0 0 / 0.1)' } } },
                border: {
                  size: { $type: 'dimension', default: { $value: { value: 1, unit: 'px' } } },
                  style: { $type: 'strokeStyle', default: { $value: 'solid' } },
                },
                buttonBorder: {
                  $type: 'border',
                  $value: {
                    color: '{color.semantic.subdued}',
                    width: '{border.size.default}',
                    style: '{border.style.default}',
                  },
                },
              },
            },
          ],
          want: {
            tokens: {
              'color.semantic.subdued': {
                $value: { alpha: 0.1, components: [0, 0, 0], colorSpace: 'srgb' },
                aliasedBy: ['buttonBorder'],
              },
              'border.size.default': { $value: { value: 1, unit: 'px' }, aliasedBy: ['buttonBorder'] },
              'border.style.default': {
                $value: 'solid',
                aliasedBy: ['buttonBorder'],
              },
              buttonBorder: {
                $value: {
                  color: { alpha: 0.1, components: [0, 0, 0], colorSpace: 'srgb' },
                  width: { value: 1, unit: 'px' },
                  style: 'solid',
                },
                partialAliasOf: {
                  color: 'color.semantic.subdued',
                  width: 'border.size.default',
                  style: 'border.style.default',
                },
              },
            },
          },
        },
      ],
      [
        'valid: Gradient',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: {
                  $type: 'color',
                  blue: { 500: { $value: 'rgb(2, 101, 220)' } },
                  purple: { 800: { $value: 'rgb(93, 19, 183)' } },
                },
                perc: {
                  $type: 'number',
                  0: { $value: 0 },
                  100: { $value: 1 },
                },
                gradient: {
                  $type: 'gradient',
                  $value: [
                    { color: '{color.blue.500}', position: '{perc.0}' },
                    { color: '{color.purple.800}', position: '{perc.100}' },
                  ],
                },
              },
            },
          ],
          want: {
            tokens: {
              'color.blue.500': {
                $value: {
                  alpha: 1,
                  components: [0.00784313725490196, 0.396078431372549, 0.8627450980392157],
                  colorSpace: 'srgb',
                },
                aliasedBy: ['gradient'],
              },
              'color.purple.800': {
                $value: {
                  alpha: 1,
                  components: [0.36470588235294116, 0.07450980392156863, 0.7176470588235294],
                  colorSpace: 'srgb',
                },
                aliasedBy: ['gradient'],
              },
              'perc.0': {
                $value: 0,
                aliasedBy: ['gradient'],
              },
              'perc.100': {
                $value: 1,
                aliasedBy: ['gradient'],
              },
              gradient: {
                $value: [
                  {
                    color: {
                      alpha: 1,
                      components: [0.00784313725490196, 0.396078431372549, 0.8627450980392157],
                      colorSpace: 'srgb',
                    },
                    position: 0,
                  },
                  {
                    color: {
                      alpha: 1,
                      components: [0.36470588235294116, 0.07450980392156863, 0.7176470588235294],
                      colorSpace: 'srgb',
                    },
                    position: 1,
                  },
                ],
                partialAliasOf: [
                  { color: 'color.blue.500', position: 'perc.0' },
                  { color: 'color.purple.800', position: 'perc.100' },
                ],
              },
            },
          },
        },
      ],
      [
        'valid: deep, but noncircular',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                alias: {
                  $type: 'color',
                  a: { $value: '{alias.b}' },
                  b: { $value: '{alias.c}' },
                  c: { $value: '{alias.d}' },
                  d: { $value: '{alias.e}' },
                  e: { $value: '{alias.f}' },
                  f: { $value: '#808080' },
                },
              },
            },
          ],
          want: {
            tokens: {
              'alias.a': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.b', 'alias.c', 'alias.d', 'alias.e', 'alias.f'],
                aliasOf: 'alias.f',
              },
              'alias.b': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.c', 'alias.d', 'alias.e', 'alias.f'],
                aliasOf: 'alias.f',
              },
              'alias.c': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.d', 'alias.e', 'alias.f'],
                aliasOf: 'alias.f',
              },
              'alias.d': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.e', 'alias.f'],
                aliasOf: 'alias.f',
              },
              'alias.e': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.f'],
                aliasOf: 'alias.f',
              },
              'alias.f': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasedBy: ['alias.a', 'alias.b', 'alias.c', 'alias.d', 'alias.e'],
              },
            },
          },
        },
      ],
      [
        'valid: non-linear order (verify work isn’t being skipped)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                alias: {
                  $type: 'color',
                  a: { $value: '#808080' },
                  b: { $value: '{alias.f}' },
                  c: { $value: '{alias.e}' },
                  d: { $value: '{alias.a}' },
                  e: { $value: '{alias.d}' },
                  f: { $value: '{alias.c}' },
                },
              },
            },
          ],
          want: {
            tokens: {
              'alias.a': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasedBy: ['alias.b', 'alias.c', 'alias.d', 'alias.e', 'alias.f'],
              },
              'alias.b': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.f', 'alias.c', 'alias.e', 'alias.d', 'alias.a'],
                aliasOf: 'alias.a',
              },
              'alias.c': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.e', 'alias.d', 'alias.a'],
                aliasOf: 'alias.a',
              },
              'alias.d': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.a'],
                aliasOf: 'alias.a',
              },
              'alias.e': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.d', 'alias.a'],
                aliasOf: 'alias.a',
              },
              'alias.f': {
                $value: {
                  alpha: 1,
                  components: [0.5019607843137255, 0.5019607843137255, 0.5019607843137255],
                  colorSpace: 'srgb',
                  hex: '#808080',
                },
                aliasChain: ['alias.c', 'alias.e', 'alias.d', 'alias.a'],
                aliasOf: 'alias.a',
              },
            },
          },
        },
      ],
      [
        'invalid: not found',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: {
                  base: { blue: { 500: { $type: 'color', $value: 'color(srgb 0 0.2 1)' } } },
                  semantic: { $value: '{color.base.blue.600}' },
                },
              },
            },
          ],
          want: {
            error: `Alias {color.base.blue.600} not found.

/tokens.json:12:17

  10 |     },
  11 |     "semantic": {
> 12 |       "$value": "{color.base.blue.600}"
     |                 ^
  13 |     }
  14 |   }
  15 | }`,
          },
        },
      ],
      [
        'invalid: not found (multiple files)',
        {
          given: [
            {
              filename: new URL('file:///a.json'),
              src: {
                color: {
                  base: { blue: { 500: { $type: 'color', $value: 'color(srgb 0 0.2 1)' } } },
                },
              },
            },
            {
              filename: new URL('file:///b.json'),
              src: {
                semantic: { $value: '{color.base.blue.600}' },
              },
            },
          ],
          want: {
            error: `Alias {color.base.blue.600} not found.

/b.json:3:15

  1 | {
  2 |   "semantic": {
> 3 |     "$value": "{color.base.blue.600}"
    |               ^
  4 |   }
  5 | }`,
          },
        },
      ],
      [
        'invalid: bad syntax',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { alias: { $value: '{foo.bar' } },
            },
          ],
          want: {
            error: `Invalid alias: "{foo.bar"

  1 | {
  2 |   "alias": {
> 3 |     "$value": "{foo.bar"
    |               ^
  4 |   }
  5 | }`,
          },
        },
      ],
      [
        'invalid: Gradient (bad syntax)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                gradient: {
                  $type: 'gradient',
                  $value: [{ color: '{color.blue.500', position: '{perc.0}' }],
                },
              },
            },
          ],
          want: {
            error: `Invalid alias: "{color.blue.500"

/tokens.json:6:18

  4 |     "$value": [
  5 |       {
> 6 |         "color": "{color.blue.500",
    |                  ^
  7 |         "position": "{perc.0}"
  8 |       }
  9 |     ]`,
          },
        },
      ],
      [
        'invalid: circular',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: {
                  $type: 'color',
                  primary: { $value: '{color.text.primary}' },
                  text: { primary: { $value: '{color.primary}' } },
                },
              },
            },
          ],
          want: {
            error: `Circular alias detected from {color.text.primary}.

/tokens.json:5:17

  3 |     "$type": "color",
  4 |     "primary": {
> 5 |       "$value": "{color.text.primary}"
    |                 ^
  6 |     },
  7 |     "text": {
  8 |       "primary": {`,
          },
        },
      ],
      [
        'invalid: wrong type (root)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                dimension: {
                  base: { $type: 'dimension', $value: '1rem' },
                },
                border: {
                  base: {
                    $type: 'border',
                    $value: '{dimension.base}',
                  },
                },
              },
            },
          ],
          want: {
            error: `Invalid alias: expected $type: border, received $type: dimension.

/tokens.json:11:17

   9 |     "base": {
  10 |       "$type": "border",
> 11 |       "$value": "{dimension.base}"
     |                 ^
  12 |     }
  13 |   }
  14 | }`,
          },
        },
      ],
      [
        'invalid: wrong type (composite)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: {
                  $type: 'color',
                  blue: {
                    $value: '#10109a',
                  },
                },
                stroke: {
                  $type: 'strokeStyle',
                  solid: { $value: 'solid' },
                },
                border: {
                  nested: {
                    $type: 'border',
                    $value: {
                      color: '{color.blue}',
                      width: '{color.blue}',
                      style: '{stroke.solid}',
                    },
                  },
                },
              },
            },
          ],
          want: {
            error: `Invalid alias: expected $type: dimension, received $type: color.

/tokens.json:19:18

  17 |       "$value": {
  18 |         "color": "{color.blue}",
> 19 |         "width": "{color.blue}",
     |                  ^
  20 |         "style": "{stroke.solid}"
  21 |       }
  22 |     }`,
          },
        },
      ],
      [
        'invalid: wrong type (composite array)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: {
                  $type: 'color',
                  blue: { $value: '#10109a' },
                },
                stop: {
                  $type: 'number',
                  0: { $value: 0.5 },
                },
                duration: {
                  $type: 'duration',
                  s: { $value: '100ms' },
                },
                gradient: {
                  base: {
                    $type: 'gradient',
                    $value: [
                      { color: '{color.blue}', position: '{stop.0}' },
                      { color: '{color.blue}', position: '{duration.s}' },
                    ],
                  },
                },
              },
            },
          ],
          want: {
            error: `Invalid alias: expected $type: number, received $type: duration.

/tokens.json:30:23

  28 |         {
  29 |           "color": "{color.blue}",
> 30 |           "position": "{duration.s}"
     |                       ^
  31 |         }
  32 |       ]
  33 |     }`,
          },
        },
      ],
      [
        'invalid: wrong type (strokeStyle)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                dimension: { $type: 'dimension', s: { $value: '0.5rem' } },
                number: { $type: 'number', 50: { $value: 50 } },
                strokeStyle: {
                  $type: 'strokeStyle',
                  dashed: { $value: { dashArray: ['{dimension.s}', '{number.50}'], lineCap: 'round' } },
                },
              },
            },
          ],
          want: {
            error: `Invalid alias: expected $type: dimension, received $type: number.

/tokens.json:20:11

  18 |         "dashArray": [
  19 |           "{dimension.s}",
> 20 |           "{number.50}"
     |           ^
  21 |         ],
  22 |         "lineCap": "round"
  23 |       }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.1 Color', () => {
    const tests: Test[] = [
      [
        'valid: color()',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { color: { cobalt: { $type: 'color', $value: 'color(srgb 0.3 0.6 1)' } } },
            },
          ],
          want: { tokens: { 'color.cobalt': { $value: { alpha: 1, components: [0.3, 0.6, 1], colorSpace: 'srgb' } } } },
        },
      ],
      [
        'valid: object',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { color: { cobalt: { $type: 'color', $value: { colorSpace: 'srgb', components: [0.3, 0.6, 1] } } } },
            },
          ],
          want: { tokens: { 'color.cobalt': { $value: { alpha: 1, components: [0.3, 0.6, 1], colorSpace: 'srgb' } } } },
        },
      ],
      [
        'valid: object (legacy channels)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { color: { cobalt: { $type: 'color', $value: { colorSpace: 'srgb', channels: [0.3, 0.6, 1] } } } },
            },
          ],
          want: { tokens: { 'color.cobalt': { $value: { alpha: 1, components: [0.3, 0.6, 1], colorSpace: 'srgb' } } } },
        },
      ],
      [
        'invalid: empty string',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { color: { $type: 'color', $value: '' } },
            },
          ],
          want: {
            error: `Expected color, received empty string

  2 |   "color": {
  3 |     "$type": "color",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: number',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { color: { $type: 'color', $value: 0x000000 } },
            },
          ],
          want: {
            error: `Expected object, received Number

  2 |   "color": {
  3 |     "$type": "color",
> 4 |     "$value": 0
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: missing colorSpace',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { color: { cobalt: { $type: 'color', $value: { components: [0.3, 0.6, 1] } } } },
            },
          ],
          want: {
            error: `Missing required property "colorSpace"

  3 |     "cobalt": {
  4 |       "$type": "color",
> 5 |       "$value": {
    |                 ^
  6 |         "components": [
  7 |           0.3,
  8 |           0.6,`,
          },
        },
      ],
      [
        'invalid: missing components',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { color: { cobalt: { $type: 'color', $value: { colorSpace: 'srgb' } } } },
            },
          ],
          want: {
            error: `Missing required property "components"

  3 |     "cobalt": {
  4 |       "$type": "color",
> 5 |       "$value": {
    |                 ^
  6 |         "colorSpace": "srgb"
  7 |       }
  8 |     }`,
          },
        },
      ],
      [
        // note: the number of components will change according to the colorSpace in the future, but it’s always 3 for now
        // TODO: provide colorSpace-specific error message, e.g. "srgb requires 3 components, etc."
        'invalid: wrong number of components',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                filename: DEFAULT_FILENAME,
                src: [
                  {
                    color: {
                      cobalt: { $type: 'color', $value: { colorSpace: 'srgb', components: [0.3, 0.6, 1, 0.2] } },
                    },
                  },
                ],
              },
            },
          ],
          want: {
            error: `Expected 3 components, received 4

   8 |           "$value": {
   9 |             "colorSpace": "srgb",
> 10 |             "components": [
     |                           ^
  11 |               0.3,
  12 |               0.6,
  13 |               1,`,
          },
        },
      ],
      [
        'invalid: unknown colorSpace',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: { cobalt: { $type: 'color', $value: { colorSpace: 'mondrian', components: [0.3, 0.6, 1] } } },
              },
            },
          ],
          want: {
            error: `Unsupported colorspace "mondrian"

  4 |       "$type": "color",
  5 |       "$value": {
> 6 |         "colorSpace": "mondrian",
    |                       ^
  7 |         "components": [
  8 |           0.3,
  9 |           0.6,`,
          },
        },
      ],
      [
        'invalid: bad alpha value',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: {
                  cobalt: { $type: 'color', $value: { colorSpace: 'srgb', components: [0.3, 0.6, 1], alpha: 'quack' } },
                },
              },
            },
          ],
          want: {
            error: `Expected number, received String

  10 |           1
  11 |         ],
> 12 |         "alpha": "quack"
     |                  ^
  13 |       }
  14 |     }
  15 |   }`,
          },
        },
      ],
      [
        'invalid: bad hex fallback',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                color: {
                  cobalt: { $type: 'color', $value: { colorSpace: 'srgb', hex: '#abcde', components: [0.3, 0.6, 1] } },
                },
              },
            },
          ],
          want: {
            error: `Invalid hex color "#abcde"

   5 |       "$value": {
   6 |         "colorSpace": "srgb",
>  7 |         "hex": "#abcde",
     |                ^
   8 |         "components": [
   9 |           0.3,
  10 |           0.6,`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.2 Dimension', () => {
    const tests: Test[] = [
      [
        'valid: rem',
        {
          given: [
            { filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: { value: 0.5, unit: 'rem' } } } },
          ],
          want: { tokens: { xs: { $value: { value: 0.5, unit: 'rem' } } } },
        },
      ],
      [
        'valid: rem (string)',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: '0.5rem' } } }],
          want: { tokens: { xs: { $value: { value: 0.5, unit: 'rem' } } } },
        },
      ],
      [
        'valid: px',
        {
          given: [
            { filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: { value: 12, unit: 'px' } } } },
          ],
          want: { tokens: { xs: { $value: { value: 12, unit: 'px' } } } },
        },
      ],
      [
        'valid: px (string)',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: '12px' } } }],
          want: { tokens: { xs: { $value: { value: 12, unit: 'px' } } } },
        },
      ],
      [
        'valid: em',
        {
          given: [
            { filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: { value: 0.25, unit: 'em' } } } },
          ],
          want: { tokens: { xs: { $value: { value: 0.25, unit: 'em' } } } },
        },
      ],
      [
        'valid: em (string)',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: '0.25em' } } }],
          want: { tokens: { xs: { $value: { value: 0.25, unit: 'em' } } } },
        },
      ],
      [
        'valid: negative',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { space: { 1: { $type: 'dimension', $value: { value: -0.25, unit: 'rem' } } } },
            },
          ],
          want: { tokens: { 'space.1': { $value: { value: -0.25, unit: 'rem' } } } },
        },
      ],
      [
        'invalid: empty string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: '' } } }],
          want: {
            error: `Expected dimension, received empty string

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: no number',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: 'rem' } } }],
          want: {
            error: `Expected dimension with units, received "rem"

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": "rem"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: no units',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: '16' } } }],
          want: {
            error: `Expected unit "px", "em", or "rem", received "16"

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": "16"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: number',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: 42 } } }],
          want: {
            error: `Expected string, received Number

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": 42
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'valid: 0',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { '00': { $type: 'dimension', $value: 0 } } }],
          want: { tokens: { '00': { $value: { value: 0, unit: 'px' } } } },
        },
      ],
      [
        'invalid: unsupported unit',
        {
          given: [
            { filename: DEFAULT_FILENAME, src: { md: { $type: 'dimension', $value: { value: 1, unit: 'vw' } } } },
          ],
          want: {
            error: `Expected unit "px", "em", or "rem", received "vw"

  4 |     "$value": {
  5 |       "value": 1,
> 6 |       "unit": "vw"
    |               ^
  7 |     }
  8 |   }
  9 | }`,
          },
        },
      ],
      [
        'invalid: unsupported unit (string)',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { md: { $type: 'dimension', $value: '1vw' } } }],
          want: {
            error: `Expected unit "px", "em", or "rem", received "vw"

  2 |   "md": {
  3 |     "$type": "dimension",
> 4 |     "$value": "1vw"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.3 Font Family', () => {
    const tests: Test[] = [
      [
        'valid: string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { base: { $type: 'fontFamily', $value: ['Helvetica'] } } }],
          want: { tokens: { base: { $value: ['Helvetica'] } } },
        },
      ],
      [
        'valid: string[]',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { base: { $type: 'fontFamily', $value: ['Helvetica', 'system-ui', 'sans-serif'] } },
            },
          ],
          want: { tokens: { base: { $value: ['Helvetica', 'system-ui', 'sans-serif'] } } },
        },
      ],
      [
        'invalid: empty string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { base: { $type: 'fontFamily', $value: '' } } }],
          want: {
            error: `Expected font family name, received empty string

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: empty string in array',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { base: { $type: 'fontFamily', $value: [''] } } }],
          want: {
            error: `Expected an array of strings, received some non-strings or empty strings

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": [
    |               ^
  5 |       ""
  6 |     ]
  7 |   }`,
          },
        },
      ],
      [
        'invalid: number',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { base: { $type: 'fontFamily', $value: 200 } } }],
          want: {
            error: `Expected string or array of strings, received Number

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": 200
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.4 Font Weight', () => {
    const tests: Test[] = [
      [
        'valid: number',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { bold: { $type: 'fontWeight', $value: 700 } } }],
          want: { tokens: { bold: { $value: 700 } } },
        },
      ],
      [
        'valid: weight name',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                fontWeight: {
                  $type: 'fontWeight',
                  thin: { $value: 'thin' },
                  hairline: { $value: 'hairline' },
                  'extra-light': { $value: 'extra-light' },
                  'ultra-light': { $value: 'ultra-light' },
                  light: { $value: 'light' },
                  normal: { $value: 'normal' },
                  regular: { $value: 'regular' },
                  book: { $value: 'book' },
                  medium: { $value: 'medium' },
                  'semi-bold': { $value: 'semi-bold' },
                  'demi-bold': { $value: 'demi-bold' },
                  bold: { $value: 'bold' },
                  'extra-bold': { $value: 'extra-bold' },
                  'ultra-bold': { $value: 'ultra-bold' },
                  black: { $value: 'black' },
                  heavy: { $value: 'heavy' },
                  'extra-black': { $value: 'extra-black' },
                  'ultra-black': { $value: 'ultra-black' },
                },
              },
            },
          ],
          want: {
            tokens: {
              'fontWeight.thin': { $value: 100 },
              'fontWeight.hairline': { $value: 100 },
              'fontWeight.extra-light': { $value: 200 },
              'fontWeight.ultra-light': { $value: 200 },
              'fontWeight.light': { $value: 300 },
              'fontWeight.normal': { $value: 400 },
              'fontWeight.regular': { $value: 400 },
              'fontWeight.book': { $value: 400 },
              'fontWeight.medium': { $value: 500 },
              'fontWeight.semi-bold': { $value: 600 },
              'fontWeight.demi-bold': { $value: 600 },
              'fontWeight.bold': { $value: 700 },
              'fontWeight.extra-bold': { $value: 800 },
              'fontWeight.ultra-bold': { $value: 800 },
              'fontWeight.black': { $value: 900 },
              'fontWeight.heavy': { $value: 900 },
              'fontWeight.extra-black': { $value: 950 },
              'fontWeight.ultra-black': { $value: 950 },
            },
          },
        },
      ],
      [
        'invalid: unknown string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { thinnish: { $type: 'fontWeight', $value: 'thinnish' } } }],
          want: {
            error: `Unknown font weight "thinnish". Expected one of: thin, hairline, extra-light, ultra-light, light, normal, regular, book, medium, semi-bold, demi-bold, bold, extra-bold, ultra-bold, black, heavy, extra-black, or ultra-black.

  2 |   "thinnish": {
  3 |     "$type": "fontWeight",
> 4 |     "$value": "thinnish"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: number out of range',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { kakarot: { $type: 'fontWeight', $value: 9001 } } }],
          want: {
            error: `Expected number 0–1000, received 9001

  2 |   "kakarot": {
  3 |     "$type": "fontWeight",
> 4 |     "$value": 9001
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.5 Duration', () => {
    const tests: Test[] = [
      [
        'valid: ms',
        {
          given: [
            { filename: DEFAULT_FILENAME, src: { quick: { $type: 'duration', $value: { value: 100, unit: 'ms' } } } },
          ],
          want: { tokens: { quick: { $value: { value: 100, unit: 'ms' } } } },
        },
      ],
      [
        'valid: ms (string)',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { quick: { $type: 'duration', $value: '100ms' } } }],
          want: { tokens: { quick: { $value: { value: 100, unit: 'ms' } } } },
        },
      ],
      [
        'valid: s',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { moderate: { $type: 'duration', $value: { value: 0.25, unit: 's' } } },
            },
          ],
          want: { tokens: { moderate: { $value: { value: 0.25, unit: 's' } } } },
        },
      ],
      [
        'valid: s (string)',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: '0.25s' } } }],
          want: { tokens: { moderate: { $value: { value: 0.25, unit: 's' } } } },
        },
      ],
      [
        'invalid: empty string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: '' } } }],
          want: {
            error: `Expected duration, received empty string

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: no number',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: 'ms' } } }],
          want: {
            error: `Expected duration with units, received "ms"

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": "ms"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: no units',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: '250' } } }],
          want: {
            error: `Expected unit "ms" or "s", received "250"

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": "250"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: number',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: 250 } } }],
          want: {
            error: `Expected string, received Number

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": 250
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'valid: 0',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { '00': { $type: 'duration', $value: 0 } } }],
          want: { tokens: { '00': { $value: { value: 0, unit: 'ms' } } } },
        },
      ],
      [
        'invalid: unsupported unit',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { microscopic: { $type: 'duration', $value: { value: 200, unit: 'ns' } } },
            },
          ],
          want: {
            error: `Expected unit "ms" or "s", received "ns"

  4 |     "$value": {
  5 |       "value": 200,
> 6 |       "unit": "ns"
    |               ^
  7 |     }
  8 |   }
  9 | }`,
          },
        },
      ],
      [
        'invalid: unsupported unit (string)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { microscopic: { $type: 'duration', $value: '200ns' } },
            },
          ],
          want: {
            error: `Expected unit "ms" or "s", received "ns"

  2 |   "microscopic": {
  3 |     "$type": "duration",
> 4 |     "$value": "200ns"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.6 Cubic Bézier', () => {
    const tests: Test[] = [
      [
        'valid',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { cubic: { $type: 'cubicBezier', $value: [0.33, 1, 0.68, 1] } } }],
          want: { tokens: { cubic: { $value: [0.33, 1, 0.68, 1] } } },
        },
      ],
      [
        'invalid: aliases',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                cubic: { $type: 'cubicBezier', $value: ['{number.a}', '{number.b}', '{number.c}', '{number.d}'] },
                number: {
                  $type: 'number',
                  a: { $value: 0.33 },
                  b: { $value: 1 },
                  c: { $value: 0.68 },
                  d: { $value: 1 },
                },
              },
            },
          ],
          want: {
            error: `Expected an array of 4 numbers, received some non-numbers

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       "{number.a}",
  6 |       "{number.b}",
  7 |       "{number.c}",`,
          },
        },
      ],
      [
        'invalid: length',
        {
          given: [
            { filename: DEFAULT_FILENAME, src: { cubic: { $type: 'cubicBezier', $value: [0.33, 1, 0.68, 1, 5] } } },
          ],
          want: {
            error: `Expected an array of 4 numbers, received 5

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       0.33,
  6 |       1,
  7 |       0.68,`,
          },
        },
      ],
      [
        'invalid: type',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { cubic: { $type: 'cubicBezier', $value: ['33%', '100%', '68%', '100%'] } },
            },
          ],
          want: {
            error: `Expected an array of 4 numbers, received some non-numbers

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       "33%",
  6 |       "100%",
  7 |       "68%",`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.7 Number', () => {
    const tests: Test[] = [
      [
        'valid',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { number: { $type: 'number', $value: 42 } } }],
          want: { tokens: { number: { $value: 42 } } },
        },
      ],
      [
        'invalid',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { number: { $type: 'number', $value: '100' } } }],
          want: {
            error: `Expected number, received String

  2 |   "number": {
  3 |     "$type": "number",
> 4 |     "$value": "100"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: type',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { cubic: { $type: 'cubicBezier', $value: ['33%', '100%', '68%', '100%'] } },
            },
          ],
          want: {
            error: `Expected an array of 4 numbers, received some non-numbers

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       "33%",
  6 |       "100%",
  7 |       "68%",`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.? Boolean', () => {
    const tests: Test[] = [
      [
        'valid: true',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { myBool: { $type: 'boolean', $value: true } } }],
          want: { tokens: { myBool: { $value: true } } },
        },
      ],
      [
        'valid: false',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { myBool: { $type: 'boolean', $value: false } } }],
          want: { tokens: { myBool: { $value: false } } },
        },
      ],
      [
        'invalid: string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { myBool: { $type: 'boolean', $value: 'true' } } }],
          want: {
            error: `Expected boolean, received String

/tokens.json:4:15

  2 |   "myBool": {
  3 |     "$type": "boolean",
> 4 |     "$value": "true"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: binary',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { myBool: { $type: 'boolean', $value: 0 } } }],
          want: {
            error: `Expected boolean, received Number

/tokens.json:4:15

  2 |   "myBool": {
  3 |     "$type": "boolean",
> 4 |     "$value": 0
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.? Link', () => {
    const tests: Test[] = [
      [
        'valid',
        {
          given: [
            { filename: DEFAULT_FILENAME, src: { iconStar: { $type: 'link', $value: '/assets/icons/star.svg' } } },
          ],
          want: { tokens: { iconStar: { $value: '/assets/icons/star.svg' } } },
        },
      ],
      [
        'invalid: empty string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { iconStar: { $type: 'link', $value: '' } } }],
          want: {
            error: `Expected URL, received empty string

/tokens.json:4:15

  2 |   "iconStar": {
  3 |     "$type": "link",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: number',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { iconStar: { $type: 'link', $value: 100 } } }],
          want: {
            error: `Expected string, received Number

/tokens.json:4:15

  2 |   "iconStar": {
  3 |     "$type": "link",
> 4 |     "$value": 100
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('8.? String', () => {
    const tests: Test[] = [
      [
        'valid',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { myString: { $type: 'string', $value: 'foobar' } } }],
          want: { tokens: { myString: { $value: 'foobar' } } },
        },
      ],
      [
        'valid: empty string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { myString: { $type: 'string', $value: '' } } }],
          want: { tokens: { myString: { $value: '' } } },
        },
      ],
      [
        'invalid: number',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { myString: { $type: 'string', $value: 99 } } }],
          want: {
            error: `Expected string, received Number

/tokens.json:4:15

  2 |   "myString": {
  3 |     "$type": "string",
> 4 |     "$value": 99
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('9.2 Stroke Style', () => {
    const tests: Test[] = [
      [
        'valid: string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { borderStyle: { $type: 'strokeStyle', $value: 'double' } } }],
          want: { tokens: { borderStyle: { $value: 'double' } } },
        },
      ],
      [
        'valid: object',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                borderStyle: {
                  $type: 'strokeStyle',
                  $value: { lineCap: 'square', dashArray: ['0.25rem', '0.5rem'] },
                },
              },
            },
          ],
          want: { tokens: { borderStyle: { $value: { lineCap: 'square', dashArray: ['0.25rem', '0.5rem'] } } } },
        },
      ],
      [
        'invalid: unknown string',
        {
          given: [{ filename: DEFAULT_FILENAME, src: { borderStyle: { $type: 'strokeStyle', $value: 'thicc' } } }],
          want: {
            error: `Unknown stroke style "thicc". Expected one of: solid, dashed, dotted, double, groove, ridge, outset, or inset.

/tokens.json:4:15

  2 |   "borderStyle": {
  3 |     "$type": "strokeStyle",
> 4 |     "$value": "thicc"
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
      [
        'invalid: bad dashArray',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                borderStyle: {
                  $type: 'strokeStyle',
                  $value: { lineCap: 'round', dashArray: [300, 500] },
                },
              },
            },
          ],
          want: {
            error: `Expected array of strings, recieved some non-strings or empty strings.

/tokens.json:7:9

   5 |       "lineCap": "round",
   6 |       "dashArray": [
>  7 |         300,
     |         ^
   8 |         500
   9 |       ]
  10 |     }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('9.3 Border', () => {
    const tests: Test[] = [
      [
        'valid',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                border: {
                  $type: 'border',
                  $value: { color: '#00000020', style: 'solid', width: { value: 1, unit: 'px' } },
                },
              },
            },
          ],
          want: {
            tokens: {
              border: {
                $value: {
                  color: { alpha: 0.12549019607843137, components: [0, 0, 0], colorSpace: 'srgb', hex: '#000000' },
                  style: 'solid',
                  width: { value: 1, unit: 'px' },
                },
              },
            },
          },
        },
      ],
      [
        'invalid: missing color',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: { border: { $type: 'border', $value: { style: 'solid', width: { value: 1, unit: 'px' } } } },
            },
          ],
          want: {
            error: `Missing required property "color"

/tokens.json:4:15

  2 |   "border": {
  3 |     "$type": "border",
> 4 |     "$value": {
    |               ^
  5 |       "style": "solid",
  6 |       "width": {
  7 |         "value": 1,`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('9.4 Transition', () => {
    const tests: Test[] = [
      [
        'valid',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                transition: {
                  'ease-in-out': {
                    $type: 'transition',
                    $value: {
                      duration: '{timing.quick}',
                      timingFunction: '{ease.in-out}',
                      delay: { value: 0, unit: 'ms' },
                    },
                  },
                },
                timing: {
                  $type: 'duration',
                  quick: { $value: { value: 150, unit: 'ms' } },
                },
                ease: {
                  $type: 'cubicBezier',
                  'in-out': { $value: [0.42, 0, 0.58, 1] },
                },
              },
            },
          ],
          want: {
            tokens: {
              'transition.ease-in-out': {
                $value: {
                  duration: { value: 150, unit: 'ms' },
                  timingFunction: [0.42, 0, 0.58, 1],
                  delay: { value: 0, unit: 'ms' },
                },
                partialAliasOf: {
                  duration: 'timing.quick',
                  timingFunction: 'ease.in-out',
                },
              },
              'timing.quick': {
                $value: { value: 150, unit: 'ms' },
                aliasedBy: ['transition.ease-in-out'],
              },
              'ease.in-out': { $value: [0.42, 0, 0.58, 1], aliasedBy: ['transition.ease-in-out'] },
            },
          },
        },
      ],
      [
        'valid: optional delay',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                transition: {
                  'ease-in-out': {
                    $type: 'transition',
                    $value: { duration: '{timing.quick}', timingFunction: '{ease.in-out}' },
                  },
                },
                timing: {
                  $type: 'duration',
                  quick: { $value: { value: 150, unit: 'ms' } },
                },
                ease: {
                  $type: 'cubicBezier',
                  'in-out': { $value: [0.42, 0, 0.58, 1] },
                },
              },
            },
          ],
          want: {
            tokens: {
              'transition.ease-in-out': {
                $value: {
                  duration: { value: 150, unit: 'ms' },
                  timingFunction: [0.42, 0, 0.58, 1],
                  delay: { value: 0, unit: 'ms' },
                },
                partialAliasOf: {
                  duration: 'timing.quick',
                  timingFunction: 'ease.in-out',
                },
              },
              'timing.quick': { $value: { value: 150, unit: 'ms' }, aliasedBy: ['transition.ease-in-out'] },
              'ease.in-out': { $value: [0.42, 0, 0.58, 1], aliasedBy: ['transition.ease-in-out'] },
            },
          },
        },
      ],
      [
        'invalid: missing duration',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                transition: {
                  'ease-in-out': {
                    $type: 'transition',
                    $value: { timingFunction: [0.42, 0, 0.58, 1] },
                  },
                },
              },
            },
          ],
          want: {
            error: `Missing required property "duration"

/tokens.json:5:17

  3 |     "ease-in-out": {
  4 |       "$type": "transition",
> 5 |       "$value": {
    |                 ^
  6 |         "timingFunction": [
  7 |           0.42,
  8 |           0,`,
          },
        },
      ],
      [
        'invalid: missing timingFunction',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                transition: {
                  'ease-in-out': {
                    $type: 'transition',
                    $value: { duration: '150ms' },
                  },
                },
              },
            },
          ],
          want: {
            error: `Missing required property "timingFunction"

/tokens.json:5:17

  3 |     "ease-in-out": {
  4 |       "$type": "transition",
> 5 |       "$value": {
    |                 ^
  6 |         "duration": "150ms"
  7 |       }
  8 |     }`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('9.5 Shadow', () => {
    const tests: Test[] = [
      [
        'valid: single',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                shadowBase: {
                  $type: 'shadow',
                  $value: {
                    color: '#000000',
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                  },
                },
              },
            },
          ],
          want: {
            tokens: {
              shadowBase: {
                $value: [
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1, hex: '#000000' },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                    spread: { value: 0, unit: 'px' },
                    inset: false,
                  },
                ],
              },
            },
          },
        },
      ],
      [
        'valid: array',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                shadowBase: {
                  $type: 'shadow',
                  $value: [
                    {
                      color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                      offsetX: { value: 0, unit: 'rem' },
                      offsetY: { value: 0.25, unit: 'rem' },
                      blur: { value: 0.5, unit: 'rem' },
                      spread: 0,
                    },
                    {
                      color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                      offsetX: { value: 0, unit: 'rem' },
                      offsetY: { value: 0.5, unit: 'rem' },
                      blur: { value: 1, unit: 'rem' },
                      spread: 0,
                    },
                  ],
                },
              },
            },
          ],
          want: {
            tokens: {
              shadowBase: {
                $value: [
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                    spread: { value: 0, unit: 'px' },
                    inset: false,
                  },
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.5, unit: 'rem' },
                    blur: { value: 1, unit: 'rem' },
                    spread: { value: 0, unit: 'px' },
                    inset: false,
                  },
                ],
              },
            },
          },
        },
      ],
      [
        'invalid: missing color',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                shadowBase: {
                  $type: 'shadow',
                  $value: { offsetX: 0, offsetY: '0.25rem', blur: '0.5rem' },
                },
              },
            },
          ],
          want: {
            error: `Missing required property "color"

  2 |   "shadowBase": {
  3 |     "$type": "shadow",
> 4 |     "$value": {
    |               ^
  5 |       "offsetX": 0,
  6 |       "offsetY": "0.25rem",
  7 |       "blur": "0.5rem"`,
          },
        },
      ],
      [
        'valid: inset',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                shadowBase: {
                  $type: 'shadow',
                  $value: {
                    color: '#000000',
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                    inset: true,
                  },
                },
              },
            },
          ],
          want: {
            tokens: {
              shadowBase: {
                $value: [
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1, hex: '#000000' },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                    spread: { value: 0, unit: 'px' },
                    inset: true,
                  },
                ],
              },
            },
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('9.6 Gradient', () => {
    const tests: Test[] = [
      [
        'valid',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                gradient: {
                  $type: 'gradient',
                  $value: [
                    { color: '#663399', position: 0 },
                    { color: '#ff9900', position: 1 },
                  ],
                },
              },
            },
          ],
          want: {
            tokens: {
              gradient: {
                $value: [
                  { color: { alpha: 1, components: [0.4, 0.2, 0.6], colorSpace: 'srgb', hex: '#663399' }, position: 0 },
                  { color: { alpha: 1, components: [1, 0.6, 0], colorSpace: 'srgb', hex: '#ff9900' }, position: 1 },
                ],
              },
            },
          },
        },
      ],
      [
        'invalid: bad color',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                gradient: {
                  $type: 'gradient',
                  $value: [
                    { color: 'foo', position: 0 },
                    { color: '#ff9900', position: 1 },
                  ],
                },
              },
            },
          ],
          want: {
            error: `Unable to parse color "foo"

/tokens.json:4:15

  2 |   "gradient": {
  3 |     "$type": "gradient",
> 4 |     "$value": [
    |               ^
  5 |       {
  6 |         "color": "foo",
  7 |         "position": 0`,
          },
        },
      ],
      [
        'invalid: bad position',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                gradient: {
                  $type: 'gradient',
                  $value: [
                    { color: 'foo', position: 0 },
                    { color: '#ff9900', position: '12px' },
                  ],
                },
              },
            },
          ],
          want: {
            error: `Expected number, received String

/tokens.json:11:21

   9 |       {
  10 |         "color": "#ff9900",
> 11 |         "position": "12px"
     |                     ^
  12 |       }
  13 |     ]
  14 |   }`,
          },
        },
      ],
      [
        'invalid: missing position',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                gradient: {
                  $type: 'gradient',
                  $value: [{ color: 'foo', position: 0 }, { color: '#ff9900' }],
                },
              },
            },
          ],
          want: {
            error: `Missing required property "position"

/tokens.json:9:7

   7 |         "position": 0
   8 |       },
>  9 |       {
     |       ^
  10 |         "color": "#ff9900"
  11 |       }
  12 |     ]`,
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });

  describe('9.7 Typography', () => {
    const tests: Test[] = [
      [
        'valid',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                typography: {
                  $type: 'typography',
                  $value: {
                    fontFamily: 'Helvetica',
                    fontSize: { value: 16, unit: 'px' },
                    fontStyle: 'italic',
                    fontVariant: 'small-caps',
                    fontWeight: 400,
                    letterSpacing: { value: 0.125, unit: 'em' },
                    lineHeight: { value: 24, unit: 'px' },
                    textDecoration: 'underline',
                    textTransform: 'uppercase',
                  },
                },
              },
            },
          ],
          want: {
            tokens: {
              typography: {
                $value: {
                  fontFamily: ['Helvetica'],
                  fontSize: { value: 16, unit: 'px' },
                  fontStyle: 'italic',
                  fontVariant: 'small-caps',
                  fontWeight: 400,
                  letterSpacing: { value: 0.125, unit: 'em' },
                  lineHeight: { value: 24, unit: 'px' },
                  textDecoration: 'underline',
                  textTransform: 'uppercase',
                },
              },
            },
          },
        },
      ],
      [
        'lineHeight: number',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                typography: {
                  $type: 'typography',
                  $value: {
                    lineHeight: 1.5,
                  },
                },
              },
            },
          ],
          want: { tokens: { typography: { $value: { lineHeight: 1.5 } } } },
        },
      ],
      [
        'dimension (legacy format)',
        {
          given: [
            {
              filename: DEFAULT_FILENAME,
              src: {
                typography: {
                  $type: 'typography',
                  $value: {
                    fontSize: '16px',
                    letterSpacing: '0.001em',
                    lineHeight: '24px',
                  },
                },
              },
            },
          ],
          want: {
            tokens: {
              typography: {
                $value: {
                  fontSize: { value: 16, unit: 'px' },
                  letterSpacing: { value: 0.001, unit: 'em' },
                  lineHeight: { value: 24, unit: 'px' },
                },
              },
            },
          },
        },
      ],
    ];

    it.each(tests)('%s', (_, testCase) => runTest(testCase));
  });
});

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
        "[parser:yaml] Install \`yaml-to-momoa\` package to parse YAML, and pass in as option, e.g.:

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


        /tokens.yaml:0:0

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
        "TokensJSONError: [parser:normalize] Unable to parse color "#646464)"

        /tokens.json:45:29

          43 |         "900": { "$value": "#8c8d86", "$extensions": { "mode": { "light": "#8c8d86", "dark": "#818181" } } },
          44 |         "1000": { "$value": "#82827C", "$extensions": { "mode": { "light": "#82827C", "dark": "#b1b1b1" } } },
        > 45 |         "1100": { "$value": "#646464)", "$extensions": { "mode": { "light": "#646464)", "dark": "#eeeeee" } } },
             |                             ^
          46 |         "1200": { "$value": "#202020", "$extensions": { "mode": { "light": "#202020", "dark": "#fdfdfc" } } },
          47 |         "1300": { "$value": "#000000", "$extensions": { "mode": { "light": "#000000", "dark": "#ffffff" } } }
          48 |       }"
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
                    fontSize: '0.75rem',
                    lineHeight: 1.25,
                    letterSpacing: '0.0024999999rem',
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
