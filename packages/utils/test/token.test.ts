import { describe, expect, test } from 'vitest';
import { getAliasID, getLocalID, hasSegment, isAlias } from '../src/token.js';

describe('getAliasID', () => {
  test('returns unwrapped ID for valid ID', () => {
    expect(getAliasID('{color.blue.60}')).toBe('color.blue.60');
  });

  test('returns string as-is for invalid IDs', () => {
    expect(getAliasID('f{oo}')).toBe('f{oo}');
  });
});

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

describe('localID', () => {
  test('returns last segment of ID', () => {
    expect(getLocalID('color.blue.60')).toBe('60');
  });

  test('returns entire token if no segments', () => {
    expect(getLocalID('token')).toBe('token');
  });
});

describe('hasSegment', () => {
  test('basic', () => {
    expect(hasSegment('token.foo.bar', 'bar')).toBe(true);
    expect(hasSegment('token.foo.bar', 'token.foo')).toBe(true);
    expect(hasSegment('token.foo.bar', 'token.foo.bar')).toBe(true);
    expect(hasSegment('token.foo.bar', 'foo.bar')).toBe(true);
    expect(hasSegment('token.foo.bar', 'token.foo')).toBe(true);

    expect(hasSegment('token.foo.', 'baz')).toBe(false); // don’t match bad dots
    expect(hasSegment('token.foo.bar', 'baz')).toBe(false);
    expect(hasSegment('token.foo.bar', 'oke')).toBe(false); // don’t match partial segments
  });
});
