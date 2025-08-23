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
                $value: { color: '#00000020', style: 'solid', width: { value: 1, unit: 'px' } },
              },
            },
          },
        ],
        want: {
          tokens: {
            border: {
              $value: {
                color: { alpha: 0.12549019607843137, components: [0, 0, 0], colorSpace: 'srgb', hex: '#000000' },
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
          error: `Missing required property "color"

/tokens.json:4:15

  2 |   "border": {
  3 |     "$type": "border",
> 4 |     "$value": {
    |               ^
  5 |       "style": "solid",
  6 |       "width": {
  7 |         "value": 1,`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
