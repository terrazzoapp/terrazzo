import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('8.4 Font Weight', () => {
  const tests: Test[] = [
    [
      'valid: number',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { bold: { $type: 'fontWeight', $value: 700 } } }],
        want: { tokens: { bold: { $value: 700 } } },
      },
    ],
    [
      'valid: weight name',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              fontWeight: {
                $type: 'fontWeight',
                thin: { $value: 'thin' },
                hairline: { $value: 'hairline' },
                'extra-light': { $value: 'extra-light' },
                'ultra-light': { $value: 'ultra-light' },
                light: { $value: 'light' },
                normal: { $value: 'normal' },
                regular: { $value: 'regular' },
                book: { $value: 'book' },
                medium: { $value: 'medium' },
                'semi-bold': { $value: 'semi-bold' },
                'demi-bold': { $value: 'demi-bold' },
                bold: { $value: 'bold' },
                'extra-bold': { $value: 'extra-bold' },
                'ultra-bold': { $value: 'ultra-bold' },
                black: { $value: 'black' },
                heavy: { $value: 'heavy' },
                'extra-black': { $value: 'extra-black' },
                'ultra-black': { $value: 'ultra-black' },
              },
            },
          },
        ],
        want: {
          tokens: {
            'fontWeight.thin': { $value: 100 },
            'fontWeight.hairline': { $value: 100 },
            'fontWeight.extra-light': { $value: 200 },
            'fontWeight.ultra-light': { $value: 200 },
            'fontWeight.light': { $value: 300 },
            'fontWeight.normal': { $value: 400 },
            'fontWeight.regular': { $value: 400 },
            'fontWeight.book': { $value: 400 },
            'fontWeight.medium': { $value: 500 },
            'fontWeight.semi-bold': { $value: 600 },
            'fontWeight.demi-bold': { $value: 600 },
            'fontWeight.bold': { $value: 700 },
            'fontWeight.extra-bold': { $value: 800 },
            'fontWeight.ultra-bold': { $value: 800 },
            'fontWeight.black': { $value: 900 },
            'fontWeight.heavy': { $value: 900 },
            'fontWeight.extra-black': { $value: 950 },
            'fontWeight.ultra-black': { $value: 950 },
          },
        },
      },
    ],
    [
      'invalid: unknown string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { thinnish: { $type: 'fontWeight', $value: 'thinnish' } } }],
        want: {
          error: `[lint:core/valid-font-weight] Must either be a valid number (0 - 999) or a valid font weight: thin, hairline, extra-light, ultra-light, light, normal, regular, book, medium, semi-bold, demi-bold, bold, extra-bold, ultra-bold, black, heavy, extra-black, or ultra-black.

  2 |   "thinnish": {
  3 |     "$type": "fontWeight",
> 4 |     "$value": "thinnish"
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: number out of range',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { kakarot: { $type: 'fontWeight', $value: 9001 } } }],
        want: {
          error: `[lint:core/valid-font-weight] Must either be a valid number (0 - 999) or a valid font weight: thin, hairline, extra-light, ultra-light, light, normal, regular, book, medium, semi-bold, demi-bold, bold, extra-bold, ultra-bold, black, heavy, extra-black, or ultra-black.

  2 |   "kakarot": {
  3 |     "$type": "fontWeight",
> 4 |     "$value": 9001
    |               ^
  5 |   }
  6 | }

[lint:lint] 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
