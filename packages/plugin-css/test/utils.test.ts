import { describe, expect, it } from 'vitest';
import defaultTransformer from '../src/transform/index.js';

describe('defaultTransformer', () => {
  it('simple token', () => {
    expect(
      defaultTransformer(
        {
          id: 'color.gray.2',
          $type: 'color',
          $value: '#d0d7de',
          _group: { name: 'color' },
          _original: { $type: 'color', $value: '#d0d7de' },
        },
        { colorFormat: 'hex' },
      ),
    ).toBe('#d0d7de');
  });

  it('alias', () => {
    expect(
      defaultTransformer(
        {
          id: 'color.bg',
          $type: 'color',
          $value: '#d0d7de',
          _group: { name: 'color' },
          _original: { $value: '{color.gray.2}' },
        },
        { colorFormat: 'hex' },
      ),
    ).toBe('var(--color-gray-2)');
  });
});
