import { expect, test } from 'vitest';
import { dimensionToPx, isWCAG2LargeText } from '../src/lib.js';

test('isWCAGLargeText', () => {
  expect(isWCAG2LargeText(18 / 0.75, 400)).toBe(true);
  expect(isWCAG2LargeText(17 / 0.75, 475)).toBe(true);
  expect(isWCAG2LargeText(16 / 0.75, 550)).toBe(true);
  expect(isWCAG2LargeText(15 / 0.75, 625)).toBe(true);
  expect(isWCAG2LargeText(14 / 0.75, 700)).toBe(true);

  expect(isWCAG2LargeText(13, 700)).toBe(false);
  expect(isWCAG2LargeText(18, 300)).toBe(false);
});

test('dimensionToPx', () => {
  expect(dimensionToPx('16px')).toBe(16);
  expect(dimensionToPx('1.5rem')).toBe(24);
  expect(dimensionToPx('1em')).toBe(16);
  expect(dimensionToPx('15pt')).toBe(20);
  expect(dimensionToPx(16)).toBe(16);

  expect(() => dimensionToPx('25vw')).toThrowError('Can’t convert 25vw to px');
});
