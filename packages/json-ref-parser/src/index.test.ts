import { describe, expect, test } from 'vitest';
import parseRef from './index.js';

describe('parseRef', () => {
  const tests: [Parameters<typeof parseRef>[0], ReturnType<typeof parseRef>][] = [
    ['#/foo', { url: '.', subpath: ['foo'] }],
    ['#/foo/bar', { url: '.', subpath: ['foo', 'bar'] }],
    ['#/foo/bar/0', { url: '.', subpath: ['foo', 'bar', '0'] }],
    ['#', { url: '.' }],
    ['', { url: '.' }],
    ['/foo/bar', { url: '.', subpath: ['foo', 'bar'] }],
    ['#/foo~0/~1bar', { url: '.', subpath: ['foo~', '/bar'] }],
    ['local.json', { url: 'local.json' }],
    ['local.json#/foo/bar', { url: 'local.json', subpath: ['foo', 'bar'] }],
    ['local.json/#/foo/bar', { url: 'local.json/', subpath: ['foo', 'bar'] }],
    ['./local.json#/foo/bar', { url: './local.json', subpath: ['foo', 'bar'] }],
    ['../../../local.json#/foo/bar', { url: '../../../local.json', subpath: ['foo', 'bar'] }],
    ['https://example.com/api/v1/tokens.json', { url: 'https://example.com/api/v1/tokens.json' }],
    [
      'https://example.com/api/v1/tokens.json#/foo/bar',
      { url: 'https://example.com/api/v1/tokens.json', subpath: ['foo', 'bar'] },
    ],
    [
      'file:///Users/tz/Documents/testing/file.json#/foo/bar',
      { url: 'file:///Users/tz/Documents/testing/file.json', subpath: ['foo', 'bar'] },
    ],
    ['local.json#/🐼/🧙‍♂️', { url: 'local.json', subpath: ['🐼', '🧙‍♂️'] }],

    // invalid usecases
    [
      'tokens.json#/foo#/bar#/baz',
      {
        url: 'tokens.json',
        subpath: ['foo'], // this is wrong but we don’t care. fixing this is a perf hit. We just want to not blow up
      },
    ],
  ];

  test.each(tests)('%s', (given, want) => {
    expect(parseRef(given)).toEqual(want);
  });
});
