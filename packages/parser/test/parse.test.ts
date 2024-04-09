import parse from '../src/parse/index.js';
import { describe, expect, it } from 'vitest';

describe('parser', () => {
  it('JSON: invalid', async () => {
    await expect(parse('{]')).rejects.toThrow('Unexpected token RBracket found. (1:2)');
  });

  it('YAML: invalid', async () => {
    await expect(
      parse(`tokens:
  - foo: true
  false`),
    ).rejects.toThrow('j');
  });
});
