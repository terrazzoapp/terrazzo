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
              shadowBase: {
                $type: 'shadow',
                $value: {
                  color: '#000000',
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            shadowBase: {
              $value: [
                {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1, hex: '#000000' },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'px' },
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
              shadowBase: {
                $type: 'shadow',
                $value: [
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.25, unit: 'rem' },
                    blur: { value: 0.5, unit: 'rem' },
                    spread: 0,
                  },
                  {
                    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                    offsetX: { value: 0, unit: 'rem' },
                    offsetY: { value: 0.5, unit: 'rem' },
                    blur: { value: 1, unit: 'rem' },
                    spread: 0,
                  },
                ],
              },
            },
          },
        ],
        want: {
          tokens: {
            shadowBase: {
              $value: [
                {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'px' },
                  inset: false,
                },
                {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1 },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.5, unit: 'rem' },
                  blur: { value: 1, unit: 'rem' },
                  spread: { value: 0, unit: 'px' },
                  inset: false,
                },
              ],
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
            src: {
              shadowBase: {
                $type: 'shadow',
                $value: { offsetX: 0, offsetY: '0.25rem', blur: '0.5rem' },
              },
            },
          },
        ],
        want: {
          error: `Missing required property "color"

  2 |   "shadowBase": {
  3 |     "$type": "shadow",
> 4 |     "$value": {
    |               ^
  5 |       "offsetX": 0,
  6 |       "offsetY": "0.25rem",
  7 |       "blur": "0.5rem"`,
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
              shadowBase: {
                $type: 'shadow',
                $value: {
                  color: '#000000',
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  inset: true,
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            shadowBase: {
              $value: [
                {
                  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1, hex: '#000000' },
                  offsetX: { value: 0, unit: 'rem' },
                  offsetY: { value: 0.25, unit: 'rem' },
                  blur: { value: 0.5, unit: 'rem' },
                  spread: { value: 0, unit: 'px' },
                  inset: true,
                },
              ],
            },
          },
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
