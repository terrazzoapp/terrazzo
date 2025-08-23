import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('9.2 Stroke Style', () => {
  const tests: Test[] = [
    [
      'valid: string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { borderStyle: { $type: 'strokeStyle', $value: 'double' } } }],
        want: { tokens: { borderStyle: { $value: 'double' } } },
      },
    ],
    [
      'valid: object',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              borderStyle: {
                $type: 'strokeStyle',
                $value: {
                  lineCap: 'square',
                  dashArray: [
                    { value: 0.25, unit: 'rem' },
                    { value: 0.5, unit: 'rem' },
                  ],
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            borderStyle: {
              $value: {
                lineCap: 'square',
                dashArray: [
                  { value: 0.25, unit: 'rem' },
                  { value: 0.5, unit: 'rem' },
                ],
              },
            },
          },
        },
      },
    ],
    [
      'invalid: unknown string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { borderStyle: { $type: 'strokeStyle', $value: 'thicc' } } }],
        want: {
          error: `[lint:core/valid-stroke-style] Value most be one of solid, dashed, dotted, double, groove, ridge, outset, or inset.

  2 |   "borderStyle": {
  3 |     "$type": "strokeStyle",
> 4 |     "$value": "thicc"
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error, 1 warning`,
        },
      },
    ],
    [
      'invalid: legacy syntax',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              borderStyle: {
                $type: 'strokeStyle',
                $value: { lineCap: 'round', dashArray: ['0.25rem', '0.5rem'] },
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-dimension] Migrate to the new object format: { "value": 10, "unit": "px" }.

   5 |       "lineCap": "round",
   6 |       "dashArray": [
>  7 |         "0.25rem",
     |         ^
   8 |         "0.5rem"
   9 |       ]
  10 |     }

[lint:core/valid-dimension] Migrate to the new object format: { "value": 10, "unit": "px" }.

   6 |       "dashArray": [
   7 |         "0.25rem",
>  8 |         "0.5rem"
     |         ^
   9 |       ]
  10 |     }
  11 |   }

[lint:lint] 2 errors, 1 warning`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
