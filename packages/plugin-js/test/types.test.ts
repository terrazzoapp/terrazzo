import {describe, expect, test} from 'vitest';
import {token} from './types/index.js';

describe('TypeScript types', () => {
  test('token()', () => {
    const blue = token('color.blue');
    expect(blue).toBe('#218bff');
  });

  test('token() with mode', () => {
    const red = token('color.red');
    expect(red).toBe('#fa4549');

    const redDarkMode = token('color.red', 'dark');
    expect(redDarkMode).toBe('#da3633');
  });
});
