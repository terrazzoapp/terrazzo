import { describe, expect, test } from 'vitest';
import { cloneDeep } from '../src/object.js';

describe('cloneDeep', () => {
  test('creates deep copies of all types', () => {
    const original = {
      string: 'string',
      boolean: true,
      number: 42,
      object: { foo: 'bar' },
      array: [{ foo: 'bar' }],
    };
    const clone = cloneDeep(original);

    // assert all values persist
    expect(clone.string).toBe(original.string);
    expect(clone.boolean).toBe(original.boolean);
    expect(clone.number).toBe(original.number);
    expect(clone.object).toEqual(original.object);
    expect(clone.array).toEqual(original.array);
    expect(clone.array[0]).toEqual(original.array[0]);

    // assert deep references are truly cloned
    expect(clone.object).not.toBe(original.object);
    expect(clone.array).not.toBe(original.array);
    expect(clone.array[0]).not.toBe(original.array[0]);
  });
});
