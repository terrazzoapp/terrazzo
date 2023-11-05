import {describe, expect, test} from 'vitest';
import {defaultNameGenerator, makeNameGenerator} from './generate-token-name.js';

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
  const incompleteMockToken = {id: 'Hello'};

  test('returns the default name generator if none is provided', () => {
    const generateName = makeNameGenerator();
    // @ts-expect-error - we aren't inspecting an actual token in this test, so no need to mock it fully
    expect(generateName(' path. to the .Token ', incompleteMockToken)).toBe('--path-toThe-Token');
  });

  describe('custom generators', () => {
    test('returns custom generator when provided', () => {
      const generateName = makeNameGenerator((variableId) => {
        return `--my-prefix-${variableId
          .split('.')
          .map((segment) => segment.trim().replaceAll(' ', '_'))
          .join('-')}`;
      });
      // @ts-expect-error - we aren't inspecting an actual token in this test, so no need to mock it fully
      expect(generateName('path.to the.token', incompleteMockToken)).toBe('--my-prefix-path-to_the-token');
    });

    test('prefixes returned name with -- if it is not already', () => {
      const generateName = makeNameGenerator((_variableId) => 'path-to-token');
      // @ts-expect-error - we aren't inspecting an actual token in this test, so no need to mock it fully
      expect(generateName('path.to.token', incompleteMockToken)).toBe('--path-to-token');
    });

    test('passes the token object to custom generators', () => {
      const generateName = makeNameGenerator((_variableId, token) => (token === incompleteMockToken ? 'yes' : 'no'));
      // @ts-expect-error - we aren't inspecting an actual token in this test, so no need to mock it fully
      expect(generateName('some.token.id', incompleteMockToken)).toBe('--yes');
    });
  });
});
