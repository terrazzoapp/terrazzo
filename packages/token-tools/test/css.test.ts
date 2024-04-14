import { describe, expect, it } from 'vitest';
import {
  makeCSSVar,
  transformBooleanValue,
  transformBorderValue,
  transformColorValue,
  transformCubicBézierValue,
  transformGradientValue,
  transformTransitionValue,
} from '../src/css/index.js';

type Test<Given = any, Want = any> = [
  string,
  { given: Given; want: { error: string; success?: never } | { error?: never; success: Want } },
];

describe('makeCSSVar', () => {
  const tests: Test<Parameters<typeof makeCSSVar>, ReturnType<typeof makeCSSVar>>[] = [
    ['token ID', { given: ['color.blue.500'], want: { success: '--color-blue-500' } }],
    ['camelCase', { given: ['myCssVariable'], want: { success: '--my-css-variable' } }],
    ['extra dashes', { given: ['my-css---var'], want: { success: '--my-css-var' } }],
    ['emojis', { given: ['--🤡\\_'], want: { success: '--🤡-_' } }],
    ['prefix', { given: ['typography.body', 'tz'], want: { success: '--tz-typography-body' } }],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = makeCSSVar(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toBe(want.success);
  });
});

describe('transformBooleanValue', () => {
  const tests: Test<Parameters<typeof transformBooleanValue>, ReturnType<typeof transformBooleanValue>>[] = [
    ['true', { given: [true], want: { success: '1' } }],
    [
      'false',
      {
        given: [false],
        want: { success: '0' },
      },
    ],
    ['invalid', { given: ['true' as any], want: { error: 'Expected boolean, received string "true"' } }],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformBooleanValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toBe(want.success);
  });
});

describe('transformBorderalue', () => {
  const tests: Test<Parameters<typeof transformBorderValue>, ReturnType<typeof transformBorderValue>>[] = [
    [
      'basic',
      {
        given: [{ width: '1px', style: 'dashed', color: 'rgba(0, 0, 0, 0.1)' }],
        want: { success: '1px dashed color(srgb 0 0 0 / 0.1)' },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformBorderValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toBe(want.success);
  });
});

describe('transformColorValue', () => {
  const tests: Test<Parameters<typeof transformColorValue>, ReturnType<typeof transformColorValue>>[] = [
    ['string', { given: ['#663399'], want: { success: 'color(srgb 0.4 0.2 0.6)' } }],
    [
      'object',
      {
        given: [{ colorSpace: 'srgb', channels: [0.4, 0.2, 0.6], alpha: 1 }],
        want: { success: 'color(srgb 0.4 0.2 0.6)' },
      },
    ],
    ['invalid', { given: ['#wtf'], want: { error: 'Unable to parse color "#wtf"' } }],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformColorValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toBe(want.success);
  });
});

describe('transformCubicBézierValue', () => {
  const tests: Test<Parameters<typeof transformCubicBézierValue>, ReturnType<typeof transformCubicBézierValue>>[] = [
    ['basic', { given: [[0.33, 1, 0.68, 1]], want: { success: 'cubic-bezier(0.33, 1, 0.68, 1)' } }],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformCubicBézierValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toBe(want.success);
  });
});

describe('transformGradientValue', () => {
  const tests: Test<Parameters<typeof transformGradientValue>, ReturnType<typeof transformGradientValue>>[] = [
    [
      'basic',
      {
        given: [
          [
            { color: '#f0f', position: 0 },
            { color: '#0f0', position: 0.5 },
            { color: '#f00', position: 1 },
          ],
        ],
        want: { success: 'color(srgb 1 0 1) 0%, color(srgb 0 1 0) 50%, color(srgb 1 0 0) 100%' },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformGradientValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toBe(want.success);
  });
});

describe('transformTransitionValue', () => {
  const tests: Test<Parameters<typeof transformTransitionValue>, ReturnType<typeof transformTransitionValue>>[] = [
    [
      'basic',
      {
        given: [{ duration: '100ms', delay: '10ms', timingFunction: [0, 0, 1, 1] }],
        want: { success: '100ms 10ms cubic-bezier(0, 0, 1, 1)' },
      },
    ],
    [
      'missing delay',
      {
        given: [{ duration: '100ms', delay: 0, timingFunction: [0, 0, 1, 1] }],
        want: { success: '100ms cubic-bezier(0, 0, 1, 1)' },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformTransitionValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toBe(want.success);
  });
});
