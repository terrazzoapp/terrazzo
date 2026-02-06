import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

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
      'valid: aliases',
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
          tokens: {
            cubic: {
              $value: [0.33, 1, 0.68, 1],
              partialAliasOf: ['number.a', 'number.b', 'number.c', 'number.d'],
              dependencies: ['#/number/a/$value', '#/number/b/$value', '#/number/c/$value', '#/number/d/$value'],
            },
            'number.a': { $value: 0.33, aliasedBy: ['cubic'] },
            'number.b': { $value: 1, aliasedBy: ['cubic'] },
            'number.c': { $value: 0.68, aliasedBy: ['cubic'] },
            'number.d': { $value: 1, aliasedBy: ['cubic'] },
          },
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
          error: `lint:core/valid-cubic-bezier: Expected [number, number, number, number].

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       0.33,
  6 |       1,
  7 |       0.68,

lint:lint: 1 error`,
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
          error: `lint:core/valid-cubic-bezier: x values must be between 0-1.

  3 |     "$type": "cubicBezier",
  4 |     "$value": [
> 5 |       "33%",
    |       ^
  6 |       "100%",
  7 |       "68%",
  8 |       "100%"

lint:core/valid-cubic-bezier: x values must be between 0-1.

   5 |       "33%",
   6 |       "100%",
>  7 |       "68%",
     |       ^
   8 |       "100%"
   9 |     ]
  10 |   }

lint:core/valid-cubic-bezier: y values must be a valid number.

  4 |     "$value": [
  5 |       "33%",
> 6 |       "100%",
    |       ^
  7 |       "68%",
  8 |       "100%"
  9 |     ]

lint:core/valid-cubic-bezier: y values must be a valid number.

   6 |       "100%",
   7 |       "68%",
>  8 |       "100%"
     |       ^
   9 |     ]
  10 |   }
  11 | }

lint:lint: 4 errors`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
