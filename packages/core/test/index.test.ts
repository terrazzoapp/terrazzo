import { describe, expect, test } from 'vitest';
import { parse } from '../src/index.js';
import { clampChroma, formatCss } from 'culori';

describe('parse', () => {
  test('sorts tokens', () => {
    const {
      result: { tokens },
    } = parse({
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
    });
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

  describe('color options', () => {
    const colorTealID = 'color.teal';
    const colorTealValue = 'oklch(69.41% 0.185 179)'; // this is intentionally outside both sRGB and P3 gamuts

    test('convertToHex', () => {
      // convertToHex: true
      const { result: result1 } = parse(
        { color: { teal: { $type: 'color', $value: colorTealValue } } },
        {
          color: { convertToHex: true },
        },
      );
      expect(result1.tokens.find((t) => t.id === colorTealID)?.$value).toBe('#00b69e');

      // convertToHex: false
      const { result: result2 } = parse(
        { color: { teal: { $type: 'color', $value: colorTealValue } } },
        {
          color: { convertToHex: false },
        },
      );
      expect(result2.tokens.find((t) => t.id === colorTealID)?.$value).toBe(colorTealValue);
    });

    test('gamut', () => {
      const { result: srgbResult } = parse({ color: { teal: { $type: 'color', $value: colorTealValue } } }, { color: { convertToHex: false, gamut: 'srgb' } });
      const srgbClamped = formatCss(clampChroma(colorTealValue, 'oklch', 'rgb'));
      expect(srgbResult.tokens.find((t) => t.id === colorTealID)?.$value, 'sRGB').toBe(srgbClamped);

      const { result: p3Result } = parse({ color: { teal: { $type: 'color', $value: colorTealValue } } }, { color: { convertToHex: false, gamut: 'p3' } });
      const p3Clamped = formatCss(clampChroma(colorTealValue, 'oklch', 'p3'));
      expect(p3Result.tokens.find((t) => t.id === colorTealID)?.$value, 'P3').toBe(p3Clamped);

      const { result: untouchedResult } = parse({ color: { teal: { $type: 'color', $value: colorTealValue } } }, { color: { convertToHex: false, gamut: undefined } });
      expect(untouchedResult.tokens.find((t) => t.id === colorTealID)?.$value, 'untouched').toBe(colorTealValue);

      // bonus: ignore invalid values (don’t bother warning)
      const { result: badResult } = parse(
        { color: { teal: { $type: 'color', $value: colorTealValue } } },
        {
          color: {
            convertToHex: false,
            // @ts-expect-error we’re doing this on purpose
            gamut: 'goofballs',
          },
        },
      );
      expect(badResult.tokens.find((t) => t.id === colorTealID)?.$value, 'bad').toBe(colorTealValue);
    });
  });
});
