import { describe, expect, test } from 'vitest';
import { splitID } from '../src/id.js';

describe('splitID', () => {
  test('token ID', () => {
    expect(splitID('color.blue.60')).toEqual({ local: '60', group: 'color.blue' });
  });

  test('string', () => {
    expect(splitID('color')).toEqual({ local: 'color' });
  });
});
