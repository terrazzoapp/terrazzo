import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('9.3 Border', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              border: {
                $type: 'border',
                $value: {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.15 },
                  style: 'solid',
                  width: { value: 1, unit: 'px' },
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            border: {
              $value: {
                color: { alpha: 0.15, components: [0, 0, 0], colorSpace: 'srgb' },
                style: 'solid',
                width: { value: 1, unit: 'px' },
              },
            },
          },
        },
      },
    ],
    [
      'invalid: missing color',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { border: { $type: 'border', $value: { style: 'solid', width: { value: 1, unit: 'px' } } } },
          },
        ],
        want: {
          error: `lint:core/valid-border: Border token missing required properties: color, width, and style.

  2 |   "border": {
  3 |     "$type": "border",
> 4 |     "$value": {
    |               ^
  5 |       "style": "solid",
  6 |       "width": {
  7 |         "value": 1,

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
            src: {
              border: {
                $type: 'border',
                $value: {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.15 },
                  style: 'solid',
                  width: { value: 1, unit: 'px' },
                  bad: 'foo',
                },
              },
            },
          },
        ],
        want: {
          error: `lint:core/valid-border: Unknown property: "bad".

  17 |         "unit": "px"
  18 |       },
> 19 |       "bad": "foo"
     |              ^
  20 |     }
  21 |   }
  22 | }

lint:lint: 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
