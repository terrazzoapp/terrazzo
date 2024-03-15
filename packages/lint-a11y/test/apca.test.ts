import { describe, expect, test } from 'vitest';
import { getBronzeLc, getSilverLc } from '../src/apca.js';

describe('getBronzeLc', () => {
  const tests: [string, { given: Parameters<typeof getBronzeLc>; want: ReturnType<typeof getBronzeLc> }][] = [
    // 90
    ['18px/300', { given: ['18px', 300, false], want: 90 }],

    // 75
    ['24px/300', { given: ['24px', 300, false], want: 75 }],
    ['18px/400', { given: ['18px', 400, false], want: 75 }],
    ['16px/500', { given: ['16px', 500, false], want: 75 }],
    ['14px/700', { given: ['14px', 700, false], want: 75 }],
  ];

  test.each(tests)('%s', (_, { given, want }) => {
    expect(getBronzeLc(...given)).toBe(want);
  });
});

describe('getSilverLc', () => {
  const tests: [string, { given: Parameters<typeof getSilverLc>; want: ReturnType<typeof getSilverLc> }][] = [
    ['16px/400', { given: [16, 400, false], want: 90 }],
    ['1rem/400', { given: ['1rem', 400, true], want: 105 }],
    ['18px/700', { given: ['18px', 700, false], want: 55 }],
    ['18px/300', { given: [18, 300, false], want: 100 }],
    ['21px/300', { given: [21, 300, false], want: 90 }],
    ['19.5px/300', { given: ['19.5px', 300, false], want: 95 }],
    ['28px/200', { given: [28, 200, false], want: 100 }],
    ['96px/900', { given: ['96px', 900, false], want: 30 }],
  ];

  test.each(tests)('%s', (_, { given, want }) => {
    expect(getSilverLc(...given)).toBe(want);
  });
});
