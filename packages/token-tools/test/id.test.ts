import { describe, expect, it } from 'vitest';
import { getTokenMatch, isAlias, isTokenMatch, makeAlias, parseAlias, splitID } from '../src/id.js';

describe('isAlias', () => {
  it('returns true for valid ID', () => {
    expect(isAlias('{color.blue.60}')).toBe(true);
  });

  it('returns false for invalid ID', () => {
    expect(isAlias('{color}.{blue}.{60}')).toBe(false);
  });

  it('ignores invalid values', () => {
    expect(isAlias([])).toBe(false);
  });
});

describe('makeAlias', () => {
  it('turns ID into alias', () => {
    expect(makeAlias('color.blue.60')).toBe('{color.blue.60}');
  });

  it('existing aliases are kept', () => {
    expect(makeAlias('{color.blue.60}')).toBe('{color.blue.60}');
  });
});

describe('isTokenMatch', () => {
  it('basic', () => {
    expect(isTokenMatch('color.blue.60', ['color.*'])).toBe(true);
    expect(isTokenMatch('color.blue.60', ['*.blue.*'])).toBe(true);
    expect(isTokenMatch('color.blue.60', ['*.60'])).toBe(true);
    expect(isTokenMatch('color.blue.60', ['*'])).toBe(true);
    expect(isTokenMatch('color.blue.60', ['color'])).toBe(false);
    expect(isTokenMatch('color.blue.60', ['color.blue'])).toBe(false);
    expect(isTokenMatch('color.blue.60', ['color.blue.50'])).toBe(false);
  });
});

describe('getTokenMatch', () => {
  it('basic', () => {
    expect(getTokenMatch('color.blue.60', ['foo.*', 'bar.*', 'color.*'])).toBe('color.*');
    expect(getTokenMatch('color.blue.60', ['foo.*', 'bar.*'])).toBeUndefined();
  });
});

describe('parseAlias', () => {
  it('standard', () => {
    expect(parseAlias('{color.blue.60}')).toEqual({ id: 'color.blue.60' });
  });

  it('with mode', () => {
    expect(parseAlias('{color.blue.60#dark}')).toEqual({ id: 'color.blue.60', mode: 'dark' });
  });

  it('invalid', () => {
    expect(parseAlias('color.blue.60')).toEqual({ id: 'color.blue.60' });
  });
});

describe('splitID', () => {
  it('token ID', () => {
    expect(splitID('color.blue.60')).toEqual({ local: '60', group: 'color.blue' });
  });

  it('string', () => {
    expect(splitID('color')).toEqual({ local: 'color' });
  });
});
