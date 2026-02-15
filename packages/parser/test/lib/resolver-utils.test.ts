import { describe, expect, it } from 'vitest';
import { destructiveMerge, filterResolverPaths, getPermutationID } from '../../src/lib/resolver-utils.js';

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

describe('descructiveMerge', () => {
  const tests: [string, { given: [any, any]; want: any }][] = [
    ['shallow object', { given: [{ a: 1 }, { b: 2 }], want: { a: 1, b: 2 } }],
    [
      'deep object',
      {
        given: [{ a: { b: { c: true } } }, { a: { b: { c: false, d: 23 } } }],
        want: { a: { b: { c: false, d: 23 } } },
      },
    ],
    ['array: simple', { given: [{ a: [0] }, { a: [1, 2, 3] }], want: { a: [1, 2, 3] } }],
    ['array: nested object', { given: [{ a: [{ a: 1 }] }, { a: [{ b: 2 }] }], want: { a: [{ b: 2 }] } }],
    ['null', { given: [{ a: { b: 1 } }, { a: { b: null } }], want: { a: { b: null } } }],
    [
      'nested array',
      {
        given: [
          {
            a: [
              [
                [1, 2],
                [2, 3],
              ],
            ],
          },
          { a: [[[0], [1], [[2, 3]], 4]] },
        ],
        want: { a: [[[0], [1], [[2, 3]], 4]] },
      },
    ],
    ['undefined (one)', { given: [undefined, { b: 2 }], want: undefined }],
    ['undefined (both)', { given: [undefined, undefined], want: undefined }],
  ];
  it.each(tests)('%s', (_, { given: [a, b], want }) => {
    destructiveMerge(a, b);
    expect(a).toEqual(want);
  });
});

it('getPermutationID', () => {
  expect(getPermutationID({ a: 'A', c: 'C', b: 'B' })).toBe('{"a":"A","b":"B","c":"C"}');
  expect(getPermutationID({ 0: '0', 11: '11', 2: '2' })).toBe('{"0":"0","2":"2","11":"11"}');
  expect(getPermutationID({})).toBe('{}');
});
