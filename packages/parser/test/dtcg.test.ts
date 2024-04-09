import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import parse from '../src/parse/index.js';

describe('8.1 Color', () => {
  const tests: [string, { given: any; want: { success: true; error?: never } | { success?: never; error: string } }][] =
    [
      [
        'valid: color()',
        { given: { color: { $type: 'color', $value: 'color(srgb 0.3 0.6 1)' } }, want: { success: true } },
      ],
      [
        'invalid: number',
        {
          given: { color: { $type: 'color', $value: 0x000000 } },
          want: {
            error: `parse: Expected string, received 0

  2 |   "color": {
  3 |     "$type": "color",
> 4 |     "$value": 0
    |               ^
  5 |   }
  6 | }`,
          },
        },
      ],
    ];

  it.each(tests)('%s', async (_, { given, want }) => {
    if (want.error) {
      try {
        const result = await parse(given);
        expect(result).toThrow();
      } catch (err) {
        expect(stripAnsi((err as Error).message)).toBe(want.error);
      }
    } else {
      await expect(parse(given)).resolves.not.toThrow();
    }
  });
});

describe('8.6 Cubic Bézier', () => {
  const tests: [string, { given: any; want: { success: true; error?: never } | { success?: never; error: string } }][] =
    [
      ['valid', { given: { cubic: { $type: 'cubicBezier', $value: [0.33, 1, 0.68, 1] } }, want: { success: true } }],
      [
        'invalid',
        {
          given: { cubic: { $type: 'cubicBezier', $value: [0.33, 1, 0.68, 1, 5] } },
          want: {
            error: `parse: Expected [𝑥1, 𝑦1, 𝑥2, 𝑦2]

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       0.33,
  6 |       1,
  7 |       0.68,`,
          },
        },
      ],
    ];

  it.each(tests)('%s', async (_, { given, want }) => {
    if (want.error) {
      try {
        const result = await parse(given);
        expect(result).toThrow();
      } catch (err) {
        expect(stripAnsi((err as Error).message)).toBe(want.error);
      }
    } else {
      await expect(parse(given)).resolves.not.toThrow();
    }
  });
});
