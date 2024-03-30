import { describe, expect, test } from 'vitest';
import { getMinimumSilverLc } from '../src/lib/apca.js';

describe('getMinimumSilverLc', () => {
  const tests: [string, { given: Parameters<typeof getMinimumSilverLc>; want: ReturnType<typeof getMinimumSilverLc> }][] = [
    ['14px/400', { given: [14, 400, true], want: 100 }],
    ['16px/400', { given: [16, 400, true], want: 90 }],
    ['1rem/400', { given: ['1rem', 400, true], want: 90 }],
    ['18px/700', { given: ['18px', 700, false], want: 55 }],
    ['18px/300', { given: [18, 300, false], want: 100 }],
    ['21px/300', { given: [21, 300, false], want: 90 }],
    ['19.5px/300', { given: ['19.5px', 300, false], want: 95 }],
    ['28px/200', { given: [28, 200, false], want: 100 }],
    ['96px/900', { given: ['96px', 900, false], want: 30 }],
    ['16.5px/400', { given: ['16.5px', 400, true], want: 86.25 }],
  ];

  test.each(tests)('%s', (_, { given, want }) => {
    expect(getMinimumSilverLc(...given)).toBe(want);
  });
});
