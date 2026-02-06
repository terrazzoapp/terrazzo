import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

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
                  { color: { alpha: 1, components: [0.4, 0.2, 0.6], colorSpace: 'srgb', hex: '#663399' }, position: 0 },
                  { color: { alpha: 1, components: [1, 0.6, 0], colorSpace: 'srgb', hex: '#ff9900' }, position: 1 },
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
                  { color: { colorSpace: 'mud' }, position: 0 },
                  { color: { alpha: 1, components: [1, 0.6, 0], colorSpace: 'srgb', hex: '#ff9900' }, position: 1 },
                ],
              },
            },
          },
        ],
        want: {
          error: `lint:core/valid-color: Invalid color space: mud. Expected a98-rgb, display-p3, hsl, hwb, lab, lab-d65, lch, okhsv, oklab, oklch, prophoto-rgb, rec2020, srgb, srgb-linear, xyz, xyz-d50, or xyz-d65.

   5 |       {
   6 |         "color": {
>  7 |           "colorSpace": "mud"
     |                         ^
   8 |         },
   9 |         "position": 0
  10 |       },

lint:lint: 1 error`,
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
                  { color: { alpha: 1, components: [0.4, 0.2, 0.6], colorSpace: 'srgb', hex: '#663399' }, position: 0 },
                  {
                    color: { alpha: 1, components: [1, 0.6, 0], colorSpace: 'srgb', hex: '#ff9900' },
                    position: '12px',
                  },
                ],
              },
            },
          },
        ],
        want: {
          error: `lint:core/valid-gradient: Expected number 0-1, received 12px.

  27 |           "hex": "#ff9900"
  28 |         },
> 29 |         "position": "12px"
     |                     ^
  30 |       }
  31 |     ]
  32 |   }

lint:lint: 1 error`,
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
                $value: [
                  { color: { alpha: 1, components: [0.4, 0.2, 0.6], colorSpace: 'srgb', hex: '#663399' }, position: 0 },
                  { color: { alpha: 1, components: [1, 0.6, 0], colorSpace: 'srgb', hex: '#ff9900' } },
                ],
              },
            },
          },
        ],
        want: {
          error: `lint:core/valid-gradient: Must be an array of { color, position } objects.

  16 |         "position": 0
  17 |       },
> 18 |       {
     |       ^
  19 |         "color": {
  20 |           "alpha": 1,
  21 |           "components": [

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: unknown prop',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              gradient: {
                $type: 'gradient',
                $value: [
                  {
                    color: { alpha: 1, components: [0.4, 0.2, 0.6], colorSpace: 'srgb', hex: '#663399' },
                    position: 0,
                    bad: true,
                  },
                ],
              },
            },
          },
        ],
        want: {
          error: `lint:core/valid-gradient: Unknown property "bad".

  3 |     "$type": "gradient",
  4 |     "$value": [
> 5 |       {
    |       ^
  6 |         "color": {
  7 |           "alpha": 1,
  8 |           "components": [

lint:lint: 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
