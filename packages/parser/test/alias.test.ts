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
                      $value: { colorSpace: 'srgb', components: [0, 0.2, 1] },
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
              dependencies: ['#/color/base/blue/500/$value'],
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
        $value:
          colorSpace: srgb
          components:
            - 0
            - 0.2
            - 1
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
              dependencies: ['#/color/base/blue/500/$value'],
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
              bold: { $value: '{font.weight.bold}' },
            },
          },
        ],
        want: {
          tokens: {
            'font.weight.bold': { $value: 700, aliasedBy: ['bold'] },
            bold: {
              $value: 700,
              aliasOf: 'font.weight.bold',
              aliasChain: ['font.weight.bold'],
              dependencies: ['#/font/weight/bold/$value'],
            },
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
            bold: {
              $value: 700,
              aliasOf: 'font.weight.700',
              aliasChain: ['font.weight.700'],
              dependencies: ['#/font/weight/700/$value'],
            },
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
              'button-stroke': {
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
            'button-stroke': {
              $value: {
                lineCap: 'round',
                dashArray: [
                  { value: 0.125, unit: 'rem' },
                  { value: 0.25, unit: 'rem' },
                ],
              },
              dependencies: ['#/size/2/$value', '#/size/3/$value'],
              partialAliasOf: {
                dashArray: ['size.2', 'size.3'],
              },
            },
            'size.2': { $value: { value: 0.125, unit: 'rem' }, aliasedBy: ['button-stroke'] },
            'size.3': { $value: { value: 0.25, unit: 'rem' }, aliasedBy: ['button-stroke'] },
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
              color: {
                $type: 'color',
                semantic: { subdued: { $value: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 } } },
              },
              border: {
                size: { $type: 'dimension', default: { $value: { value: 1, unit: 'px' } } },
                style: { $type: 'strokeStyle', default: { $value: 'solid' } },
              },
              'button-border': {
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
              aliasedBy: ['button-border'],
            },
            'border.size.default': { $value: { value: 1, unit: 'px' }, aliasedBy: ['button-border'] },
            'border.style.default': {
              $value: 'solid',
              aliasedBy: ['button-border'],
            },
            'button-border': {
              $value: {
                color: { alpha: 0.1, components: [0, 0, 0], colorSpace: 'srgb' },
                width: { value: 1, unit: 'px' },
                style: 'solid',
              },
              dependencies: [
                '#/border/size/default/$value',
                '#/border/style/default/$value',
                '#/color/semantic/subdued/$value',
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
                blue: { 500: { $value: { colorSpace: 'srgb', components: [0.01, 0.4, 0.86] } } },
                purple: { 800: { $value: { colorSpace: 'srgb', components: [0.365, 0.075, 0.718] } } },
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
              $value: { alpha: 1, components: [0.01, 0.4, 0.86], colorSpace: 'srgb' },
              aliasedBy: ['gradient'],
            },
            'color.purple.800': {
              $value: { alpha: 1, components: [0.365, 0.075, 0.718], colorSpace: 'srgb' },
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
                  color: { alpha: 1, components: [0.01, 0.4, 0.86], colorSpace: 'srgb' },
                  position: 0,
                },
                {
                  color: { alpha: 1, components: [0.365, 0.075, 0.718], colorSpace: 'srgb' },
                  position: 1,
                },
              ],
              dependencies: [
                '#/color/blue/500/$value',
                '#/color/purple/800/$value',
                '#/perc/0/$value',
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
                f: { $value: { colorSpace: 'srgb', components: [0.5, 0.5, 0.5], hex: '#808080' } },
              },
            },
          },
        ],
        want: {
          tokens: {
            'alias.a': {
              $value: {
                alpha: 1,
                components: [0.5, 0.5, 0.5],
                colorSpace: 'srgb',
                hex: '#808080',
              },
              aliasChain: ['alias.b', 'alias.c', 'alias.d', 'alias.e', 'alias.f'],
              aliasOf: 'alias.f',
              dependencies: [
                '#/alias/b/$value',
                '#/alias/c/$value',
                '#/alias/d/$value',
                '#/alias/e/$value',
                '#/alias/f/$value',
              ],
            },
            'alias.b': {
              $value: {
                alpha: 1,
                components: [0.5, 0.5, 0.5],
                colorSpace: 'srgb',
                hex: '#808080',
              },
              aliasChain: ['alias.c', 'alias.d', 'alias.e', 'alias.f'],
              aliasOf: 'alias.f',
              aliasedBy: ['alias.a'],
              dependencies: ['#/alias/c/$value', '#/alias/d/$value', '#/alias/e/$value', '#/alias/f/$value'],
            },
            'alias.c': {
              $value: {
                alpha: 1,
                components: [0.5, 0.5, 0.5],
                colorSpace: 'srgb',
                hex: '#808080',
              },
              aliasChain: ['alias.d', 'alias.e', 'alias.f'],
              aliasOf: 'alias.f',
              aliasedBy: ['alias.a', 'alias.b'],
              dependencies: ['#/alias/d/$value', '#/alias/e/$value', '#/alias/f/$value'],
            },
            'alias.d': {
              $value: {
                alpha: 1,
                components: [0.5, 0.5, 0.5],
                colorSpace: 'srgb',
                hex: '#808080',
              },
              aliasChain: ['alias.e', 'alias.f'],
              aliasOf: 'alias.f',
              aliasedBy: ['alias.a', 'alias.b', 'alias.c'],
              dependencies: ['#/alias/e/$value', '#/alias/f/$value'],
            },
            'alias.e': {
              $value: {
                alpha: 1,
                components: [0.5, 0.5, 0.5],
                colorSpace: 'srgb',
                hex: '#808080',
              },
              aliasChain: ['alias.f'],
              aliasOf: 'alias.f',
              aliasedBy: ['alias.a', 'alias.b', 'alias.c', 'alias.d'],
              dependencies: ['#/alias/f/$value'],
            },
            'alias.f': {
              $value: {
                alpha: 1,
                components: [0.5, 0.5, 0.5],
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
                a: { $value: { colorSpace: 'srgb', components: [0.5, 0.5, 0.5] } },
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
              $value: { alpha: 1, components: [0.5, 0.5, 0.5], colorSpace: 'srgb' },
              aliasedBy: ['alias.b', 'alias.c', 'alias.d', 'alias.e', 'alias.f'],
            },
            'alias.b': {
              $value: { alpha: 1, components: [0.5, 0.5, 0.5], colorSpace: 'srgb' },
              aliasOf: 'alias.a',
              aliasChain: ['alias.f', 'alias.c', 'alias.e', 'alias.d', 'alias.a'],
              dependencies: [
                '#/alias/a/$value',
                '#/alias/c/$value',
                '#/alias/d/$value',
                '#/alias/e/$value',
                '#/alias/f/$value',
              ],
            },
            'alias.c': {
              $value: { alpha: 1, components: [0.5, 0.5, 0.5], colorSpace: 'srgb' },
              aliasChain: ['alias.e', 'alias.d', 'alias.a'],
              aliasOf: 'alias.a',
              aliasedBy: ['alias.b', 'alias.f'],
              dependencies: ['#/alias/a/$value', '#/alias/d/$value', '#/alias/e/$value'],
            },
            'alias.d': {
              $value: { alpha: 1, components: [0.5, 0.5, 0.5], colorSpace: 'srgb' },
              aliasOf: 'alias.a',
              aliasChain: ['alias.a'],
              aliasedBy: ['alias.b', 'alias.c', 'alias.e', 'alias.f'],
              dependencies: ['#/alias/a/$value'],
            },
            'alias.e': {
              $value: { alpha: 1, components: [0.5, 0.5, 0.5], colorSpace: 'srgb' },
              aliasOf: 'alias.a',
              aliasChain: ['alias.d', 'alias.a'],
              aliasedBy: ['alias.b', 'alias.c', 'alias.f'],
              dependencies: ['#/alias/a/$value', '#/alias/d/$value'],
            },
            'alias.f': {
              $value: { alpha: 1, components: [0.5, 0.5, 0.5], colorSpace: 'srgb' },
              aliasOf: 'alias.a',
              aliasChain: ['alias.c', 'alias.e', 'alias.d', 'alias.a'],
              aliasedBy: ['alias.b'],
              dependencies: ['#/alias/a/$value', '#/alias/c/$value', '#/alias/d/$value', '#/alias/e/$value'],
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
                base: { blue: { 500: { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0.2, 1] } } } },
                semantic: { $value: '{color.base.blue.600}' },
              },
            },
          },
        ],
        want: {
          error: `[parser:init] Could not resolve alias {color.base.blue.600}.

  17 |     },
  18 |     "semantic": {
> 19 |       "$value": "{color.base.blue.600}"
     |                 ^
  20 |     }
  21 |   }
  22 | }`,
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
                base: { blue: { 500: { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0.2, 1] } } } },
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
          error: `[parser:init] Could not resolve alias {color.base.blue.600}.

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
          error: `[parser:init] Invalid alias syntax.

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
          error: `[parser:init] Cannot alias to $type "dimension" from $type "border".

  12 |     "base": {
  13 |       "$type": "border",
> 14 |       "$value": "{dimension.base}"
     |                 ^
  15 |     }
  16 |   }
  17 | }`,
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
          error: `[parser:init] Cannot alias to $type "color" from $type "dimension".

  25 |       "$value": {
  26 |         "color": "{color.blue}",
> 27 |         "width": "{color.blue}",
     |                  ^
  28 |         "style": "{stroke.solid}"
  29 |       }
  30 |     }`,
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
          error: `[parser:init] Cannot alias to $type "duration" from $type "number".

  39 |         {
  40 |           "color": "{color.blue}",
> 41 |           "position": "{duration.s}"
     |                       ^
  42 |         }
  43 |       ]
  44 |     }`,
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
              'stroke-style': {
                $type: 'strokeStyle',
                dashed: { $value: { dashArray: ['{dimension.s}', '{number.50}'], lineCap: 'round' } },
              },
            },
          },
        ],
        want: {
          error: `[parser:init] Cannot alias to $type "number" from $type "dimension".

  21 |         "dashArray": [
  22 |           "{dimension.s}",
> 23 |           "{number.50}"
     |           ^
  24 |         ],
  25 |         "lineCap": "round"
  26 |       }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
