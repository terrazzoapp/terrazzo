import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

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
          error: `lint:core/valid-number: Must be a number.

  2 |   "number": {
  3 |     "$type": "number",
> 4 |     "$value": "100"
    |               ^
  5 |   }
  6 | }

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
