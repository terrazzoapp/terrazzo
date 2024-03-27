import { expect, test } from 'vitest';
import { dimensionToPx, isWCAG2LargeText, round } from '../src/lib.js';

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

test('round', () => {
  expect(round(1.0004)).toBe(1);
  expect(round(45.56, 2)).toBe(45.56);
  expect(round(3.025844118406322, 2)).toBe(3.03);
  expect(round(20345.7842, 2)).toBe(20345.78);
  expect(round(-0.499)).toBe(-0.5);
  expect(round(0.49999, 3)).toBe(0.5);
  expect(round(43, -1)).toBe(43);
  expect(round(0.4444444, 4)).toBe(0.4444);
});
