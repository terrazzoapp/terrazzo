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

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
