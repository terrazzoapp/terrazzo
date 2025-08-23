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

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
