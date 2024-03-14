import { describe, expect, test } from 'vitest';
import { parse } from '../src/index.js';

describe('parse', () => {
  test('sorts tokens', () => {
    const {
      result: { tokens },
    } = parse(
      {
        color: {
          $type: 'color',
          blue: {
            '70': { $value: '#4887c9' },
            '10': { $value: '#062053' },
            '30': { $value: '#192f7d' },
            '80': { $value: '#5ca9d7' },
            '40': { $value: '#223793' },
            '50': { $description: 'Medium blue', $value: '#2b3faa' },
            '100': { $value: '#89eff1' },
            '60': { $value: '#3764ba' },
            '90': { $value: '#72cce5' },
            '20': { $value: '#0f2868' },
            '00': { $value: '{color.black}' },
          },
          black: { $value: '#000000' },
        },
      },
      { color: {} },
    );
    expect(tokens.map((t) => t.id)).toEqual([
      'color.black',
      'color.blue.00',
      'color.blue.10',
      'color.blue.20',
      'color.blue.30',
      'color.blue.40',
      'color.blue.50',
      'color.blue.60',
      'color.blue.70',
      'color.blue.80',
      'color.blue.90',
      'color.blue.100',
    ]);
  });
});
