import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('8.? Boolean', () => {
  const tests: Test[] = [
    [
      'valid: true',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { myBool: { $type: 'boolean', $value: true } } }],
        want: { tokens: { myBool: { $value: true } } },
      },
    ],
    [
      'valid: false',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { myBool: { $type: 'boolean', $value: false } } }],
        want: { tokens: { myBool: { $value: false } } },
      },
    ],
    [
      'invalid: string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { myBool: { $type: 'boolean', $value: 'true' } } }],
        want: {
          error: `[lint:core/valid-boolean] Must be a boolean.

  2 |   "myBool": {
  3 |     "$type": "boolean",
> 4 |     "$value": "true"
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error, 1 warning`,
        },
      },
    ],
    [
      'invalid: binary',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { myBool: { $type: 'boolean', $value: 0 } } }],
        want: {
          error: `[lint:core/valid-boolean] Must be a boolean.

  2 |   "myBool": {
  3 |     "$type": "boolean",
> 4 |     "$value": 0
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error, 1 warning`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});

describe('8.? Link', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { iconStar: { $type: 'link', $value: '/assets/icons/star.svg' } } }],
        want: { tokens: { iconStar: { $value: '/assets/icons/star.svg' } } },
      },
    ],
    [
      'invalid: empty string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { iconStar: { $type: 'link', $value: '' } } }],
        want: {
          error: `[lint:core/valid-link] Must be a string.

  2 |   "iconStar": {
  3 |     "$type": "link",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error, 1 warning`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { iconStar: { $type: 'link', $value: 100 } } }],
        want: {
          error: `[lint:core/valid-link] Must be a string.

  2 |   "iconStar": {
  3 |     "$type": "link",
> 4 |     "$value": 100
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error, 1 warning`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});

describe('8.? String', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { myString: { $type: 'string', $value: 'foobar' } } }],
        want: { tokens: { myString: { $value: 'foobar' } } },
      },
    ],
    [
      'valid: empty string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { myString: { $type: 'string', $value: '' } } }],
        want: { tokens: { myString: { $value: '' } } },
      },
    ],
    [
      'invalid: number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { myString: { $type: 'string', $value: 99 } } }],
        want: {
          error: `[lint:core/valid-string] Must be a string.

  2 |   "myString": {
  3 |     "$type": "string",
> 4 |     "$value": 99
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error, 1 warning`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
