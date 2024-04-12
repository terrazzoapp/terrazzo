import stripAnsi from 'strip-ansi';
import parse from '../src/parse/index.js';
import { describe, expect, it } from 'vitest';

describe('parser', () => {
  it('JSON: invalid', async () => {
    await expect(parse('{]')).rejects.toThrow('Unexpected token RBracket found. (1:2)');
  });

  it('YAML: invalid', async () => {
    try {
      const result = await parse(`tokens:
  - foo: true
  false`);
      expect(() => result).toThrow();
    } catch (err) {
      expect(stripAnsi((err as Error).message)).toBe(`parse:yaml: BAD_INDENT All mapping items must start at the same column

  1 | tokens:
  2 |   - foo: true
> 3 |   false
    |  ^`);
    }
  });
});
