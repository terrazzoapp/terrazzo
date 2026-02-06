import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('8.? Boolean', () => {
  const tests: Test[] = [
    [
      'valid: true',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { 'my-bool': { $type: 'boolean', $value: true } } }],
        want: { tokens: { 'my-bool': { $value: true } } },
      },
    ],
    [
      'valid: false',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { 'my-bool': { $type: 'boolean', $value: false } } }],
        want: { tokens: { 'my-bool': { $value: false } } },
      },
    ],
    [
      'invalid: string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { 'my-bool': { $type: 'boolean', $value: 'true' } } }],
        want: {
          error: `lint:core/valid-boolean: Must be a boolean.

  2 |   "my-bool": {
  3 |     "$type": "boolean",
> 4 |     "$value": "true"
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: binary',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { 'my-bool': { $type: 'boolean', $value: 0 } } }],
        want: {
          error: `lint:core/valid-boolean: Must be a boolean.

  2 |   "my-bool": {
  3 |     "$type": "boolean",
> 4 |     "$value": 0
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

describe('8.? Link', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: [
          { filename: DEFAULT_FILENAME, src: { icon: { star: { $type: 'link', $value: '/assets/icons/star.svg' } } } },
        ],
        want: { tokens: { 'icon.star': { $value: '/assets/icons/star.svg' } } },
      },
    ],
    [
      'invalid: empty string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { icon: { star: { $type: 'link', $value: '' } } } }],
        want: {
          error: `lint:core/valid-link: Must be a string.

  3 |     "star": {
  4 |       "$type": "link",
> 5 |       "$value": ""
    |                 ^
  6 |     }
  7 |   }
  8 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { icon: { star: { $type: 'link', $value: 100 } } } }],
        want: {
          error: `lint:core/valid-link: Must be a string.

  3 |     "star": {
  4 |       "$type": "link",
> 5 |       "$value": 100
    |                 ^
  6 |     }
  7 |   }
  8 | }

lint:lint: 1 error`,
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
        given: [{ filename: DEFAULT_FILENAME, src: { 'my-string': { $type: 'string', $value: 'foobar' } } }],
        want: { tokens: { 'my-string': { $value: 'foobar' } } },
      },
    ],
    [
      'valid: empty string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { 'my-string': { $type: 'string', $value: '' } } }],
        want: { tokens: { 'my-string': { $value: '' } } },
      },
    ],
    [
      'invalid: number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { 'my-string': { $type: 'string', $value: 99 } } }],
        want: {
          error: `lint:core/valid-string: Must be a string.

  2 |   "my-string": {
  3 |     "$type": "string",
> 4 |     "$value": 99
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
