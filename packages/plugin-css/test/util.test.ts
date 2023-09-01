import {describe, expect, test} from 'vitest';
import {isTokenMatch} from '../src/util.js';

describe('isTokenMatch', () => {
  test('finds matching tokens', () => {
    expect(isTokenMatch('color.blue.50', ['color.*'])).toBe(true);
    expect(isTokenMatch('size.m.padding', ['*.m.*'])).toBe(true);
  });

  test('skips non-matching tokens', () => {
    expect(isTokenMatch('typography.base', ['typography'])).toBe(false);
    expect(isTokenMatch('button.color.base', ['color.*'])).toBe(false);
  });
});
