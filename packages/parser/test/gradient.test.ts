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
                  { color: 'foo', position: 0 },
                  { color: { alpha: 1, components: [1, 0.6, 0], colorSpace: 'srgb', hex: '#ff9900' }, position: 1 },
                ],
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-color] Could not parse color "foo".

  4 |     "$value": [
  5 |       {
> 6 |         "color": "foo",
    |                  ^
  7 |         "position": 0
  8 |       },
  9 |       {

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-gradient] Expected number 0-1, received 12px.

  27 |           "hex": "#ff9900"
  28 |         },
> 29 |         "position": "12px"
     |                     ^
  30 |       }
  31 |     ]
  32 |   }

[lint:lint] 1 error`,
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
          error: `[lint:core/valid-gradient] Must be an array of { color, position } objects.

  16 |         "position": 0
  17 |       },
> 18 |       {
     |       ^
  19 |         "color": {
  20 |           "alpha": 1,
  21 |           "components": [

[lint:lint] 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
