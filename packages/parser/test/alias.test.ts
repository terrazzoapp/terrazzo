import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

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
                base: {
                  blue: {
                    500: {
                      $type: 'color',
                      $value: 'color(srgb 0 0.2 1)',
                    },
                  },
                },
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
              dependencies: ['#/size/2/$value', '#/size/3/$value'],
              partialAliasOf: {
                dashArray: {
                  '0': 'size.2',
                  '1': 'size.3',
                },
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
              dependencies: [
                '#/color/semantic/subdued/$value',
                '#/border/size/default/$value',
                '#/border/style/default/$value',
              ],
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
              dependencies: [
                '#/color/blue/500/$value',
                '#/perc/0/$value',
                '#/color/purple/800/$value',
                '#/perc/100/$value',
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
          error: `[parser:init] Could not resolve $ref "#/color/base/blue/600/$value"

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
          error: `[parser:init] Could not resolve $ref "#/color/base/blue/600/$value"

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
          error: `[parser:init] Token has no $type

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
              perc: {
                0: { $type: 'number', $value: 0.5 },
              },
              gradient: {
                $type: 'gradient',
                $value: [{ color: '{color.blue.500', position: '{perc.0}' }],
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-color] Could not parse color "{color.blue.500".

  10 |     "$value": [
  11 |       {
> 12 |         "color": "{color.blue.500",
     |                  ^
  13 |         "position": "{perc.0}"
  14 |       }
  15 |     ]

[lint:lint] 1 error`,
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
          error: `[parser:init] Circular alias detected.

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
                base: { $type: 'dimension', $value: { value: 1, unit: 'rem' } },
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
          error: `[lint:core/valid-border] Border token missing required properties: color, width, and style.

  12 |     "base": {
  13 |       "$type": "border",
> 14 |       "$value": "{dimension.base}"
     |                 ^
  15 |     }
  16 |   }
  17 | }

[lint:lint] 1 error`,
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
                  $value: {
                    colorSpace: 'srgb',
                    components: [0.062745098, 0.062745098, 0.6039215686],
                    hex: '#10109a',
                  },
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
          error: `[lint:core/valid-dimension] Invalid dimension: {"colorSpace":"srgb","components":[0.062745098,0.062745098,0.6039215686],"hex":"#10109a"}. Expected object with "value" and "unit".

  25 |       "$value": {
  26 |         "color": "{color.blue}",
> 27 |         "width": "{color.blue}",
     |                  ^
  28 |         "style": "{stroke.solid}"
  29 |       }
  30 |     }

[lint:lint] 1 error`,
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
                blue: {
                  $value: {
                    colorSpace: 'srgb',
                    components: [0.062745098, 0.062745098, 0.6039215686],
                    hex: '#10109a',
                  },
                },
              },
              stop: {
                $type: 'number',
                0: { $value: 0.5 },
              },
              duration: {
                $type: 'duration',
                s: { $value: { value: 100, unit: 'ms' } },
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
          error: `[lint:core/valid-gradient] Expected number 0-1, received {"value":100,"unit":"ms"}.

  39 |         {
  40 |           "color": "{color.blue}",
> 41 |           "position": "{duration.s}"
     |                       ^
  42 |         }
  43 |       ]
  44 |     }

[lint:lint] 1 error`,
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
              dimension: { $type: 'dimension', s: { $value: { value: 0.5, unit: 'rem' } } },
              number: { $type: 'number', 50: { $value: 50 } },
              strokeStyle: {
                $type: 'strokeStyle',
                dashed: { $value: { dashArray: ['{dimension.s}', '{number.50}'], lineCap: 'round' } },
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-dimension] Invalid dimension: 50. Expected object with "value" and "unit".

  21 |         "dashArray": [
  22 |           "{dimension.s}",
> 23 |           "{number.50}"
     |           ^
  24 |         ],
  25 |         "lineCap": "round"
  26 |       }

[lint:lint] 1 error, 1 warning`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
