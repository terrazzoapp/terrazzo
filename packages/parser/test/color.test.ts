import { describe, expect, it } from 'vitest';
import yamlToMomoa from 'yaml-to-momoa';
import defineConfig from '../src/config.js';
import { parse } from '../src/index.js';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('8.1 Color', () => {
  const tests: Test[] = [
    [
      'valid: object (srgb)',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { color: { cobalt: { $type: 'color', $value: { colorSpace: 'srgb', components: [0.3, 0.6, 1] } } } },
          },
        ],
        want: {
          tokens: {
            'color.cobalt': { $value: { alpha: 1, components: [0.3, 0.6, 1], colorSpace: 'srgb' } },
          },
        },
      },
    ],
    [
      'valid: object (hsl)',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              color: { blue: { 10: { $type: 'color', $value: { colorSpace: 'hsl', components: [218, 50, 67] } } } },
            },
          },
        ],
        want: {
          tokens: {
            'color.blue.10': { $value: { alpha: 1, components: [218, 50, 67], colorSpace: 'hsl' } },
          },
        },
      },
    ],
    [
      'invalid: string',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { color: { cobalt: { $type: 'color', $value: 'color(srgb 0.3 0.6 1)' } } },
          },
        ],
        want: {
          error: `[lint:core/valid-color] Migrate to the new object format, e.g. "#ff0000" → { "colorSpace": "srgb", "components": [1, 0, 0] } }

  3 |     "cobalt": {
  4 |       "$type": "color",
> 5 |       "$value": "color(srgb 0.3 0.6 1)"
    |                 ^
  6 |     }
  7 |   }
  8 | }

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: object (legacy channels)',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { color: { cobalt: { $type: 'color', $value: { colorSpace: 'srgb', channels: [0.3, 0.6, 1] } } } },
          },
        ],
        want: {
          error: `[lint:core/valid-color] Expected components to be array of numbers, received undefined.

  3 |     "cobalt": {
  4 |       "$type": "color",
> 5 |       "$value": {
    |                 ^
  6 |         "colorSpace": "srgb",
  7 |         "channels": [
  8 |           0.3,

[lint:lint] 1 error`,
        },
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
          error: `[lint:core/valid-color] Could not parse color "".

  2 |   "color": {
  3 |     "$type": "color",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-color] Could not parse color 0.

  2 |   "color": {
  3 |     "$type": "color",
> 4 |     "$value": 0
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-color] Invalid color space: undefined. Expected a98-rgb, display-p3, hsl, hwb, lab, lab-d65, lch, oklab, oklch, okhsv, prophoto-rgb, rec2020, srgb, srgb-linear, xyz-d50, xyz, or xyz-d65

  3 |     "cobalt": {
  4 |       "$type": "color",
> 5 |       "$value": {
    |                 ^
  6 |         "components": [
  7 |           0.3,
  8 |           0.6,

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-color] Expected components to be array of numbers, received undefined.

  3 |     "cobalt": {
  4 |       "$type": "color",
> 5 |       "$value": {
    |                 ^
  6 |         "colorSpace": "srgb"
  7 |       }
  8 |     }

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-color] Expected 3 components, received 4.

   8 |           "$value": {
   9 |             "colorSpace": "srgb",
> 10 |             "components": [
     |                           ^
  11 |               0.3,
  12 |               0.6,
  13 |               1,

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-color] Invalid color space: mondrian. Expected a98-rgb, display-p3, hsl, hwb, lab, lab-d65, lch, oklab, oklch, okhsv, prophoto-rgb, rec2020, srgb, srgb-linear, xyz-d50, xyz, or xyz-d65

  4 |       "$type": "color",
  5 |       "$value": {
> 6 |         "colorSpace": "mondrian",
    |                       ^
  7 |         "components": [
  8 |           0.3,
  9 |           0.6,

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-color] Alpha quack not in range 0 – 1.

  10 |           1
  11 |         ],
> 12 |         "alpha": "quack"
     |                  ^
  13 |       }
  14 |     }
  15 |   }

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-color] Could not parse color #abcde.

   5 |       "$value": {
   6 |         "colorSpace": "srgb",
>  7 |         "hex": "#abcde",
     |                ^
   8 |         "components": [
   9 |           0.3,
  10 |           0.6,

[lint:lint] 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));

  it('legacyFormat', async () => {
    const cwd = new URL('file:///');
    const config = defineConfig(
      {
        lint: {
          rules: {
            'core/valid-color': ['error', { legacyFormat: true }],
          },
        },
      },
      { cwd },
    );
    let result: Awaited<ReturnType<typeof parse>> | undefined;
    const given = [
      {
        filename: DEFAULT_FILENAME,
        src: { color: { cobalt: { $type: 'color', $value: 'color(srgb 0.3 0.6 1)' } } },
      },
    ];

    result = await parse(given, { config, yamlToMomoa });
    expect(result.tokens['color.cobalt']).toEqual(
      expect.objectContaining({ $value: { colorSpace: 'srgb', components: [0.3, 0.6, 1], alpha: 1 } }),
    );
  });
});
