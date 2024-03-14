import { expect, test } from 'vitest';
import { getMinimumLc } from '../src/apca.js';

test('getMinimumLc', () => {
  expect(getMinimumLc(16, 400)).toBe(90);
  expect(getMinimumLc('1rem', 400, true)).toBe(105);
  expect(getMinimumLc('18px', 700)).toBe(55);
  expect(getMinimumLc(18, 300)).toBe(100);
  expect(getMinimumLc(21, 300)).toBe(90);
  expect(getMinimumLc('19.5px', 300)).toBe(95);
  expect(getMinimumLc(28, 200)).toBe(100);
  expect(getMinimumLc('96px', 900)).toBe(30);
});
