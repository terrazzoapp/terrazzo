import { print, parse as toMomoa } from '@humanwhocodes/momoa';
import { describe, expect, it } from 'vitest';
import { mergeDocuments } from '../src/parse/json.js';

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
