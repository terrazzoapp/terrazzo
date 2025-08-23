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

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
