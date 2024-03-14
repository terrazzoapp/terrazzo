import type { ParsedColorToken } from '@cobalt-ui/core';
import { describe, expect, test } from 'vitest';
import { defaultNameGenerator, isTokenMatch, makeNameGenerator } from './token.js';

describe('isTokenMatch', () => {
  test('finds matching tokens', () => {
    expect(isTokenMatch('color.blue.50', ['color.*'])).toBe('color.*');
    expect(isTokenMatch('size.m.padding', ['*.m.*'])).toBe('*.m.*');
  });

  test('skips non-matching tokens', () => {
    expect(isTokenMatch('typography.base', ['typography'])).toBe(undefined);
    expect(isTokenMatch('button.color.base', ['color.*'])).toBe(undefined);
  });
});

describe('defaultNameGenerator', () => {
  test('separate groups names with single dashes', () => {
    expect(defaultNameGenerator('token')).toBe('token');
    expect(defaultNameGenerator('path.to.token')).toBe('path-to-token');
  });

  test('removes leading and trailing whitespace from group and token names', () => {
    expect(defaultNameGenerator(' path.to.token ')).toBe('path-to-token');
    expect(defaultNameGenerator('path. to .token')).toBe('path-to-token');
  });

  test('leaves capitalized names with no spaces alone', () => {
    expect(defaultNameGenerator('Path.To.Token')).toBe('Path-To-Token');
  });

  test('camelCases group and token names with middle spaces', () => {
    expect(defaultNameGenerator('path.to the.token')).toBe('path-toThe-token');
    expect(defaultNameGenerator('path.to.the token')).toBe('path-to-theToken');
  });

  describe('prefix option (deprecated)', () => {
    test('adds a prefix when provided', () => {
      expect(defaultNameGenerator('path.to.token', 'scope')).toBe('scope-path-to-token');
      expect(defaultNameGenerator('token', 'scope')).toBe('scope-token');
    });

    test('avoids duplicating leading dashes with prefix', () => {
      expect(defaultNameGenerator('path.to.token', '--scope')).toBe('scope-path-to-token');
    });

    test('avoids duplicating trailing dashes with prefix', () => {
      expect(defaultNameGenerator('path.to.token', '--scope-')).toBe('scope-path-to-token');
      expect(defaultNameGenerator('path.to.token', 'scope-')).toBe('scope-path-to-token');
    });
  });
});

describe('makeNameGenerator', () => {
  const mockToken: ParsedColorToken = {
    id: 'color.blue.500',
    $type: 'color',
    $value: '#0000ff',
    _original: { $type: 'color', $value: '#0000ff' },
    _group: { id: 'color.blue' },
  };

  test('returns the default name generator if none is provided', () => {
    const generateName = makeNameGenerator();
    expect(generateName(' path. to the .Token ', mockToken)).toBe('--path-toThe-Token');
  });

  describe('custom generators', () => {
    test('returns custom generator when provided', () => {
      const generateName = makeNameGenerator((variableId) => {
        return `--my-prefix-${variableId
          .split('.')
          .map((segment) => segment.trim().replace(/\s+/, '_'))
          .join('-')}`;
      });
      expect(generateName('path.to the.token', mockToken)).toBe('--my-prefix-path-to_the-token');
    });

    test('prefixes returned name with -- if it is not already', () => {
      const generateName = makeNameGenerator((_variableId) => 'path-to-token');
      expect(generateName('path.to.token', mockToken)).toBe('--path-to-token');
    });

    test('passes the token object to custom generators', () => {
      const generateName = makeNameGenerator((_variableId, token) => (token === mockToken ? 'yes' : 'no'));
      expect(generateName('some.token.id', mockToken)).toBe('--yes');
    });

    test('allows returning `undefined` to fall back to default', () => {
      const generateName = makeNameGenerator(() => undefined);
      expect(generateName('color.blue.500')).toBe('--color-blue-500');
    });
  });
});
