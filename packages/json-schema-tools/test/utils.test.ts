import { describe, expect, it } from 'vitest';
import { relPath } from '../src/utils.js';

describe('relPath', () => {
  const tests: [string, { given: Parameters<typeof relPath>; want: ReturnType<typeof relPath> }][] = [
    [
      'same',
      {
        given: [new URL('file:///Users/test/foo/bar.json'), new URL('file:///Users/test/foo/bar.json')],
        want: '.',
      },
    ],
    [
      'folder <> file',
      {
        given: [new URL('file:///Users/test/foo/bar/'), new URL('file:///Users/test/foo/bar/test.json')],
        want: './test.json',
      },
    ],
    [
      'file <> file',
      {
        given: [new URL('file:///Users/test/foo/bar.json'), new URL('file:///Users/test/foo/baz/bat/test.json')],
        want: './baz/bat/test.json',
      },
    ],
    [
      'folder <> file (deeper)',
      {
        given: [new URL('file:///Users/test/foo/bar/'), new URL('file:///Users/test/foo/bar/baz/test.json')],
        want: './baz/test.json',
      },
    ],
    [
      'parent',
      {
        given: [new URL('file:///Users/test/foo/bar/baz.json'), new URL('file:///Users/test/foo.json')],
        want: '../../foo.json',
      },
    ],
    [
      'sibling',
      {
        given: [new URL('file:///Users/test/foo/bar/baz.json'), new URL('file:///Users/test/foo/baz/bat.json')],
        want: '../baz/bat.json',
      },
    ],
    [
      'remote URL',
      {
        given: [new URL('file:///Users/test/foo/bar/baz.json'), new URL('https://example.com/api/v1/tokens.json')],
        want: 'https://example.com/api/v1/tokens.json',
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    expect(relPath(...given)).toBe(want);
  });
});
