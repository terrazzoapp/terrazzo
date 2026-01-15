import { describe, expect, it } from 'vitest';
import { filterResolverPaths, getPermutationID } from '../../src/lib/resolver-utils.js';

describe('filterResolverPaths', () => {
  const tests: [
    string,
    { given: Parameters<typeof filterResolverPaths>[0]; want: ReturnType<typeof filterResolverPaths> },
  ][] = [
    ['basic', { given: ['color', 'blue', '600'], want: ['color', 'blue', '600'] }],
    ['sets', { given: ['sets', 'base', 'sources', '0', 'color', 'blue', '600'], want: ['color', 'blue', '600'] }],
    [
      'modifiers',
      {
        given: ['modifiers', 'theme', 'contexts', 'light', '0', 'color', 'blue', '600'],
        want: ['color', 'blue', '600'],
      },
    ],
    [
      'resolutionOrder (set)',
      {
        given: ['resolutionOrder', '0', 'sources', '0', 'color', 'blue', '600'],
        want: ['color', 'blue', '600'],
      },
    ],
    [
      'resolutionOrder (modifier)',
      {
        given: ['resolutionOrder', '0', 'contexts', 'dark', '0', 'color', 'blue', '600'],
        want: ['color', 'blue', '600'],
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    expect(filterResolverPaths(given)).toEqual(want);
  });
});

it('getPermutationID', () => {
  expect(getPermutationID({ a: 'A', c: 'C', b: 'B' })).toBe('{"a":"A","b":"B","c":"C"}');
  expect(getPermutationID({ 0: '0', 11: '11', 2: '2' })).toBe('{"0":"0","2":"2","11":"11"}');
  expect(getPermutationID({})).toBe('{}');
});
