import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('8.3 Font Family', () => {
  const tests: Test[] = [
    [
      'valid: string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { base: { $type: 'fontFamily', $value: ['Helvetica'] } } }],
        want: { tokens: { base: { $value: ['Helvetica'] } } },
      },
    ],
    [
      'valid: string[]',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { base: { $type: 'fontFamily', $value: ['Helvetica', 'system-ui', 'sans-serif'] } },
          },
        ],
        want: { tokens: { base: { $value: ['Helvetica', 'system-ui', 'sans-serif'] } } },
      },
    ],
    [
      'invalid: empty string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { base: { $type: 'fontFamily', $value: '' } } }],
        want: {
          error: `lint:core/valid-font-family: Must be a string, or array of strings.

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: empty string in array',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { base: { $type: 'fontFamily', $value: [''] } } }],
        want: {
          error: `lint:core/valid-font-family: Must be a string, or array of strings.

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": [
    |               ^
  5 |       ""
  6 |     ]
  7 |   }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { base: { $type: 'fontFamily', $value: 200 } } }],
        want: {
          error: `lint:core/valid-font-family: Must be a string, or array of strings.

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": 200
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
