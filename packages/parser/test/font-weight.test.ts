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
              'font-weight': {
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
            'font-weight.thin': { $value: 100 },
            'font-weight.hairline': { $value: 100 },
            'font-weight.extra-light': { $value: 200 },
            'font-weight.ultra-light': { $value: 200 },
            'font-weight.light': { $value: 300 },
            'font-weight.normal': { $value: 400 },
            'font-weight.regular': { $value: 400 },
            'font-weight.book': { $value: 400 },
            'font-weight.medium': { $value: 500 },
            'font-weight.semi-bold': { $value: 600 },
            'font-weight.demi-bold': { $value: 600 },
            'font-weight.bold': { $value: 700 },
            'font-weight.extra-bold': { $value: 800 },
            'font-weight.ultra-bold': { $value: 800 },
            'font-weight.black': { $value: 900 },
            'font-weight.heavy': { $value: 900 },
            'font-weight.extra-black': { $value: 950 },
            'font-weight.ultra-black': { $value: 950 },
          },
        },
      },
    ],
    [
      'invalid: unknown string',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { thinnish: { $type: 'fontWeight', $value: 'thinnish' } } }],
        want: {
          error: `lint:core/valid-font-weight: Must either be a valid number (0 - 999) or a valid font weight: thin, hairline, extra-light, ultra-light, light, normal, regular, book, medium, semi-bold, demi-bold, bold, extra-bold, ultra-bold, black, heavy, extra-black, or ultra-black.

  2 |   "thinnish": {
  3 |     "$type": "fontWeight",
> 4 |     "$value": "thinnish"
    |               ^
  5 |   }
  6 | }

lint:lint: 1 error`,
        },
      },
    ],
    [
      'invalid: number out of range',
      {
        given: [{ filename: DEFAULT_FILENAME, src: { kakarot: { $type: 'fontWeight', $value: 9001 } } }],
        want: {
          error: `lint:core/valid-font-weight: Must either be a valid number (0 - 999) or a valid font weight: thin, hairline, extra-light, ultra-light, light, normal, regular, book, medium, semi-bold, demi-bold, bold, extra-bold, ultra-bold, black, heavy, extra-black, or ultra-black.

  2 |   "kakarot": {
  3 |     "$type": "fontWeight",
> 4 |     "$value": 9001
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
