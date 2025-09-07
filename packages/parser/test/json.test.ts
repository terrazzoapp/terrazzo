import { print, parse as toMomoa } from '@humanwhocodes/momoa';
import { describe, expect, it } from 'vitest';
import { aliasToRef, mergeDocuments } from '../src/parse/json.js';

describe('mergeDocuments', () => {
  const tests: [string, { given: any[]; want: string }][] = [
    [
      'basic merge',
      {
        given: [{ foo: { bar: true } }, { bar: { baz: 23 } }],
        want: `{
  "foo": {
    "bar": true
  },
  "bar": {
    "baz": 23
  }
}`,
      },
    ],
    [
      'string',
      {
        given: [{ foo: { bar: 'old' } }, { foo: { bar: 'new' } }],
        want: `{
  "foo": {
    "bar": "new"
  }
}`,
      },
    ],
    [
      'number',
      {
        given: [{ foo: { bar: -1000 } }, { foo: { bar: 1000 } }],
        want: `{
  "foo": {
    "bar": 1000
  }
}`,
      },
    ],
    [
      'boolean',
      {
        given: [{ foo: { bar: true } }, { foo: { bar: false } }],
        want: `{
  "foo": {
    "bar": false
  }
}`,
      },
    ],
    [
      'array',
      {
        given: [{ foo: { bar: [1, 2, 3] } }, { foo: { bar: [] } }],
        want: `{
  "foo": {
    "bar": [

    ]
  }
}`,
      },
    ],
    [
      'object',
      {
        given: [{ foo: { bar: { a: 1, b: 2 } } }, { foo: { bar: { a: 10, c: 3 } } }],
        want: `{
  "foo": {
    "bar": {
      "a": 10,
      "b": 2,
      "c": 3
    }
  }
}`,
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    const input = given.map((src) => toMomoa(JSON.stringify(src)));
    expect(print(mergeDocuments(input), { indent: 2 })).toBe(want);
  });
});

describe('aliasToRef', () => {
  const tests: [string, { given: Parameters<typeof aliasToRef>[0]; want: ReturnType<typeof aliasToRef> }][] = [
    ['valid: simple', { given: '{color.blue.500}', want: { $ref: '#/color/blue/500/$value' } }],
    ['valid: single-level', { given: '{red}', want: { $ref: '#/red/$value' } }],
    ['valid: / char', { given: '{transition/ease/fast}', want: { $ref: '#/transition~1ease~1fast/$value' } }],
    ['valid: ~ char', { given: '{spacing.~.200}', want: { $ref: '#/spacing/~0/200/$value' } }],
    ['valid: ~0', { given: '{my.~0token.200}', want: { $ref: '#/my/~00token/200/$value' } }],
    ['invalid: bad alias', { given: '{color.text.bg', want: undefined }],
    ['invalid: ref string', { given: '#/color/blue/200', want: undefined }],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    expect(aliasToRef(given)).toEqual(want);
  });
});
