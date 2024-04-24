import { describe, expect, test } from 'vitest';
import { isAlias, makeAlias, parseAlias } from '../src/alias.js';

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

describe('makeAlias', () => {
  test('turns ID into alias', () => {
    expect(makeAlias('color.blue.60')).toBe('{color.blue.60}');
  });

  test('existing aliases are kept', () => {
    expect(makeAlias('{color.blue.60}')).toBe('{color.blue.60}');
  });
});

describe('parseAlias', () => {
  test('standard', () => {
    expect(parseAlias('{color.blue.60}')).toEqual({ id: 'color.blue.60' });
  });

  test('with mode', () => {
    expect(parseAlias('{color.blue.60#dark}')).toEqual({ id: 'color.blue.60', mode: 'dark' });
  });

  test('invalid', () => {
    expect(parseAlias('color.blue.60')).toEqual({ id: 'color.blue.60' });
  });
});
