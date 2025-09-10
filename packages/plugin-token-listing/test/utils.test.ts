import { describe, it, expect } from 'vitest';
import { mapValues } from '../src/utils/utils.js';

describe('mapValues', () => {
  it('maps values and preserves keys', () => {
    const input = { a: 1, b: 2, c: 3 };
  const out = mapValues(input, (v) => v * 2);
    expect(out).toEqual({ a: 2, b: 4, c: 6 });
  });

  it('works with empty object', () => {
    const input: Record<string, number> = {};
  const out = mapValues(input, (v) => v + 1);
    expect(out).toEqual({});
  });

  it('passes key to mapper', () => {
    const input = { x: 'one', y: 'two' };
  const out = mapValues(input, (v, k) => `${k}:${v}`);
    expect(out).toEqual({ x: 'x:one', y: 'y:two' });
  });
});
