import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('8.5 Duration', () => {
  const tests: Test[] = [
    [
      'valid: ms',
      {
        given: [
          { filename: DEFAULT_FILENAME, src: { quick: { $type: 'duration', $value: { value: 100, unit: 'ms' } } } },
        ],
        want: { tokens: { quick: { $value: { value: 100, unit: 'ms' } } } },
      },
    ],
    [
      'valid: s',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { moderate: { $type: 'duration', $value: { value: 0.25, unit: 's' } } },
          },
        ],
        want: { tokens: { moderate: { $value: { value: 0.25, unit: 's' } } } },
      },
    ],
    [
      'valid: 0',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { '00': { $type: 'duration', $value: { value: 0, unit: 'ms' } } } }],
        want: { tokens: { '00': { $value: { value: 0, unit: 'ms' } } } },
      },
    ],
    [
      'valid: -100',
      {
        given: [
          { filename: DEFAULT_FILENAME, src: { '-100': { $type: 'duration', $value: { value: -100, unit: 'ms' } } } },
        ],
        want: { tokens: { '-100': { $value: { value: -100, unit: 'ms' } } } },
      },
    ],
    [
      'invalid: legacy format',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { quick: { $type: 'duration', $value: '100ms' } } }],
        want: {
          error: `[lint:core/valid-duration] Migrate to the new object format: { \"value\": 2, \"unit\": \"ms\" }.

  2 |   "quick": {
  3 |     "$type": "duration",
> 4 |     "$value": "100ms"
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: empty string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: '' } } }],
        want: {
          error: `[lint:core/valid-duration] Migrate to the new object format: { "value": 2, "unit": "ms" }.

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: no number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: 'ms' } } }],
        want: {
          error: `[lint:core/valid-duration] Migrate to the new object format: { "value": 2, "unit": "ms" }.

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": "ms"
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: no units',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: '250' } } }],
        want: {
          error: `[lint:core/valid-duration] Migrate to the new object format: { "value": 2, "unit": "ms" }.

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": "250"
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { moderate: { $type: 'duration', $value: 250 } } }],
        want: {
          error: `[lint:core/valid-duration] Migrate to the new object format: { "value": 2, "unit": "ms" }.

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": 250
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: unsupported unit',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { microscopic: { $type: 'duration', $value: { value: 200, unit: 'ns' } } },
          },
        ],
        want: {
          error: `[lint:core/valid-duration] Unknown unit ns. Expected "ms" or "s".

  4 |     "$value": {
  5 |       "value": 200,
> 6 |       "unit": "ns"
    |               ^
  7 |     }
  8 |   }
  9 | }

[lint:lint] 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
