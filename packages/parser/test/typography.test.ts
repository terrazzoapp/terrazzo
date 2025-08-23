import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('9.7 Typography', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              typography: {
                $type: 'typography',
                $value: {
                  fontFamily: 'Helvetica',
                  fontSize: { value: 16, unit: 'px' },
                  fontStyle: 'italic',
                  fontVariant: 'small-caps',
                  fontWeight: 400,
                  letterSpacing: { value: 0.125, unit: 'rem' },
                  lineHeight: { value: 24, unit: 'px' },
                  textDecoration: 'underline',
                  textTransform: 'uppercase',
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            typography: {
              $value: {
                fontFamily: ['Helvetica'],
                fontSize: { value: 16, unit: 'px' },
                fontStyle: 'italic',
                fontVariant: 'small-caps',
                fontWeight: 400,
                letterSpacing: { value: 0.125, unit: 'rem' },
                lineHeight: { value: 24, unit: 'px' },
                textDecoration: 'underline',
                textTransform: 'uppercase',
              },
            },
          },
        },
      },
    ],
    [
      'lineHeight: number',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              typography: {
                $type: 'typography',
                $value: {
                  fontFamily: 'Helvetica',
                  fontSize: { value: 16, unit: 'px' },
                  fontWeight: 400,
                  letterSpacing: { value: 0, unit: 'px' },
                  lineHeight: 1.5,
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            typography: {
              $value: {
                fontFamily: ['Helvetica'],
                fontSize: { value: 16, unit: 'px' },
                fontWeight: 400,
                letterSpacing: { value: 0, unit: 'px' },
                lineHeight: 1.5,
              },
            },
          },
        },
      },
    ],
    [
      'invalid: missing properties',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { typography: { $type: 'typography', $value: {} } },
          },
        ],
        want: {
          error: `[lint:core/valid-typography] Missing required property "fontFamily".

  2 |   "typography": {
  3 |     "$type": "typography",
> 4 |     "$value": {
    |               ^
  5 |
  6 |     }
  7 |   }

[lint:core/valid-typography] Missing required property "fontSize".

  2 |   "typography": {
  3 |     "$type": "typography",
> 4 |     "$value": {
    |               ^
  5 |
  6 |     }
  7 |   }

[lint:core/valid-typography] Missing required property "fontWeight".

  2 |   "typography": {
  3 |     "$type": "typography",
> 4 |     "$value": {
    |               ^
  5 |
  6 |     }
  7 |   }

[lint:core/valid-typography] Missing required property "letterSpacing".

  2 |   "typography": {
  3 |     "$type": "typography",
> 4 |     "$value": {
    |               ^
  5 |
  6 |     }
  7 |   }

[lint:core/valid-typography] Missing required property "lineHeight".

  2 |   "typography": {
  3 |     "$type": "typography",
> 4 |     "$value": {
    |               ^
  5 |
  6 |     }
  7 |   }

[lint:lint] 5 errors`,
        },
      },
    ],
    [
      'invalid: dimension legacy format',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              typography: {
                $type: 'typography',
                $value: {
                  fontFamily: 'Helvetica',
                  fontSize: '16px',
                  fontWeight: 400,
                  letterSpacing: '0.001em',
                  lineHeight: '24px',
                },
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-dimension] Migrate to the new object format: { "value": 10, "unit": "px" }.

  4 |     "$value": {
  5 |       "fontFamily": "Helvetica",
> 6 |       "fontSize": "16px",
    |                   ^
  7 |       "fontWeight": 400,
  8 |       "letterSpacing": "0.001em",
  9 |       "lineHeight": "24px"

[lint:core/valid-dimension] Migrate to the new object format: { "value": 10, "unit": "px" }.

   7 |       "fontWeight": 400,
   8 |       "letterSpacing": "0.001em",
>  9 |       "lineHeight": "24px"
     |                     ^
  10 |     }
  11 |   }
  12 | }

[lint:core/valid-dimension] Migrate to the new object format: { "value": 10, "unit": "px" }.

   6 |       "fontSize": "16px",
   7 |       "fontWeight": 400,
>  8 |       "letterSpacing": "0.001em",
     |                        ^
   9 |       "lineHeight": "24px"
  10 |     }
  11 |   }

[lint:core/valid-number] Must be a number.

   7 |       "fontWeight": 400,
   8 |       "letterSpacing": "0.001em",
>  9 |       "lineHeight": "24px"
     |                     ^
  10 |     }
  11 |   }
  12 | }

[lint:lint] 4 errors`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
