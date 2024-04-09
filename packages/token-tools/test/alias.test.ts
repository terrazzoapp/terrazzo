import { describe, expect, test } from 'vitest';
import { isAlias } from '../src/alias.js';

describe('isAlias', () => {
  test('returns true for valid ID', () => {
    expect(isAlias('{color.blue.60}')).toBe(true);
  });

  test('returns false for invalid ID', () => {
    expect(isAlias('{color}.{blue}.{60}')).toBe(false);
  });

  test('ignores invalid values', () => {
    expect(isAlias([])).toBe(false);
  });
});
