import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('9.5 Shadow', () => {
  const tests: Test[] = [
    [
      'valid: single',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              'shadow-base': {
                $type: 'shadow',
                $value: {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.15, hex: '#000000' },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'rem' },
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            'shadow-base': {
              $value: [
                {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.15, hex: '#000000' },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'rem' },
                  inset: false,
                },
              ],
            },
          },
        },
      },
    ],
    [
      'valid: array',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              'shadow-base': {
                $type: 'shadow',
                $value: [
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                    spread: { value: 0, unit: 'rem' },
                  },
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.5, unit: 'rem' },
                    blur: { value: 1, unit: 'rem' },
                    spread: { value: 0, unit: 'rem' },
                  },
                ],
              },
            },
          },
        ],
        want: {
          tokens: {
            'shadow-base': {
              $value: [
                {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'rem' },
                  inset: false,
                },
                {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.5, unit: 'rem' },
                  blur: { value: 1, unit: 'rem' },
                  spread: { value: 0, unit: 'rem' },
                  inset: false,
                },
              ],
            },
          },
        },
      },
    ],
    [
      'invalid: bad dimension',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              'shadow-base': {
                $type: 'shadow',
                $value: [
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                    offsetX: 0,
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                    spread: { value: 0, unit: 'rem' },
                  },
                ],
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-dimension] Invalid dimension: 0. Expected object with "value" and "unit".

  13 |           "alpha": 0.1
  14 |         },
> 15 |         "offsetX": 0,
     |                    ^
  16 |         "offsetY": {
  17 |           "value": 0.25,
  18 |           "unit": "rem"

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: missing color',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              'shadow-base': {
                $type: 'shadow',
                $value: {
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'rem' },
                },
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-shadow] Missing required properties: color, offsetX, offsetY, blur, and spread.

  2 |   "shadow-base": {
  3 |     "$type": "shadow",
> 4 |     "$value": {
    |               ^
  5 |       "offsetX": {
  6 |         "value": 0,
  7 |         "unit": "rem"

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'valid: inset',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              'shadow-base': {
                $type: 'shadow',
                $value: {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000' },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'rem' },
                  inset: true,
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            'shadow-base': {
              $value: [
                {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1, hex: '#000000' },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'rem' },
                  inset: true,
                },
              ],
            },
          },
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
              'shadow-base': {
                $type: 'shadow',
                $value: [
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                    spread: { value: 0, unit: 'rem' },
                    inset: false,
                    bad: true,
                  },
                ],
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-shadow] Unknown property "bad".

  30 |         },
  31 |         "inset": false,
> 32 |         "bad": true
     |                ^
  33 |       }
  34 |     ]
  35 |   }

[lint:lint] 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
