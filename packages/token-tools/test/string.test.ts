import { describe, expect, it } from 'vitest';
import { padStr } from '../src/string.js';

describe('padStr', () => {
  it('basic', () => {
    expect(padStr('input', 10)).toMatchInlineSnapshot(`"input     "`);
    expect(padStr('input', 10, 'right')).toMatchInlineSnapshot(`"     input"`);
    expect(padStr('input', 10, 'center')).toMatchInlineSnapshot(`"  input   "`);
    expect(padStr('reallyreallylongword', 5, 'center')).toMatchInlineSnapshot(`"reallyreallylongword"`);
  });

  it('chaotic', () => {
    expect(padStr('input', -100, 'center')).toMatchInlineSnapshot(`"input"`);
    expect(padStr('input', Infinity, 'center')).toMatchInlineSnapshot(
      `"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 input                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  "`,
    );
    expect(padStr('input', -Infinity, 'center')).toMatchInlineSnapshot(`"input"`);
    expect(padStr('input', -0, 'center')).toMatchInlineSnapshot(`"input"`);
    expect(padStr('input', Number.NaN, 'center')).toMatchInlineSnapshot(`"input"`);
  });
});
