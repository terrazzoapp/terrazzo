import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('8.2 Dimension', () => {
  const tests: Test[] = [
    [
      'valid: rem',
      {
        given: [
          { filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: { value: 0.5, unit: 'rem' } } } },
        ],
        want: { tokens: { xs: { $value: { value: 0.5, unit: 'rem' } } } },
      },
    ],
    [
      'valid: px',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: { value: 12, unit: 'px' } } } }],
        want: { tokens: { xs: { $value: { value: 12, unit: 'px' } } } },
      },
    ],
    [
      'valid: negative',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { space: { 1: { $type: 'dimension', $value: { value: -0.25, unit: 'rem' } } } },
          },
        ],
        want: { tokens: { 'space.1': { $value: { value: -0.25, unit: 'rem' } } } },
      },
    ],
    [
      'valid: 0',
      {
        given: [
          { filename: DEFAULT_FILENAME, src: { '00': { $type: 'dimension', $value: { value: 0, unit: 'px' } } } },
        ],
        want: { tokens: { '00': { $value: { value: 0, unit: 'px' } } } },
      },
    ],
    [
      'invalid: legacy format',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: '0.5rem' } } }],
        want: {
          error: `lint:core/valid-dimension: Migrate to the new object format: { "value": 10, "unit": "px" }.

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": "0.5rem"
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: empty string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: '' } } }],
        want: {
          error: `lint:core/valid-dimension: Migrate to the new object format: { "value": 10, "unit": "px" }.

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: no number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: 'rem' } } }],
        want: {
          error: `lint:core/valid-dimension: Migrate to the new object format: { "value": 10, "unit": "px" }.

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": "rem"
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: no units',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: '16' } } }],
        want: {
          error: `lint:core/valid-dimension: Migrate to the new object format: { "value": 10, "unit": "px" }.

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": "16"
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: 42 } } }],
        want: {
          error: `lint:core/valid-dimension: Invalid dimension: 42. Expected object with "value" and "unit".

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": 42
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: number (zero)',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { xs: { $type: 'dimension', $value: 0 } } }],
        want: {
          error: `lint:core/valid-dimension: Invalid dimension: 0. Expected object with "value" and "unit".

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": 0
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: unsupported unit',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { md: { $type: 'dimension', $value: { value: 1, unit: 'vw' } } } }],
        want: {
          error: `lint:core/valid-dimension: Unit vw not allowed. Expected px, em, or rem.

  4 |     "$value": {
  5 |       "value": 1,
> 6 |       "unit": "vw"
    |               ^
  7 |     }
  8 |   }
  9 | }

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
            src: { xs: { $type: 'dimension', $value: { value: 2, unit: 'px', bad: true } } },
          },
        ],
        want: {
          error: `lint:core/valid-dimension: Unknown property "bad".

   5 |       "value": 2,
   6 |       "unit": "px",
>  7 |       "bad": true
     |              ^
   8 |     }
   9 |   }
  10 | }

lint:lint: 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
