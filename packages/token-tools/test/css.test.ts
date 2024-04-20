import { describe, expect, it } from 'vitest';
import {
  makeCSSVar,
  transformBooleanValue,
  transformBorderValue,
  transformColorValue,
  transformCubicBezierValue,
  transformDimensionValue,
  transformDurationValue,
  transformGradientValue,
  transformNumberValue,
  transformShadowValue,
  transformTransitionValue,
  transformTypographyValue,
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
    ['prefix', { given: ['typography.body', { prefix: 'tz' }], want: { success: '--tz-typography-body' } }],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = makeCSSVar(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
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
    expect(result).toEqual(want.success);
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
    [
      'expanded (border)',
      {
        given: [{ width: '2px', style: 'solid', color: '#663399' }, 'border'],
        want: {
          success: { 'border-width': '2px', 'border-style': 'solid', 'border-color': 'color(srgb 0.4 0.2 0.6)' },
        },
      },
    ],
    [
      'expanded (outline)',
      {
        given: [{ width: '2px', style: 'solid', color: '#663399' }, 'outline'],
        want: {
          success: { 'outline-width': '2px', 'outline-style': 'solid', 'outline-color': 'color(srgb 0.4 0.2 0.6)' },
        },
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
    expect(result).toEqual(want.success);
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
    expect(result).toEqual(want.success);
  });
});

describe('transformCubicBezierValue', () => {
  const tests: Test<Parameters<typeof transformCubicBezierValue>, ReturnType<typeof transformCubicBezierValue>>[] = [
    ['basic', { given: [[0.33, 1, 0.68, 1]], want: { success: 'cubic-bezier(0.33, 1, 0.68, 1)' } }],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformCubicBezierValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformDimensionValue', () => {
  const tests: Test<Parameters<typeof transformDimensionValue>, ReturnType<typeof transformDimensionValue>>[] = [
    ['10px', { given: ['10px'], want: { success: '10px' } }],
    ['1.5rem', { given: ['1.5rem'], want: { success: '1.5rem' } }],
    ['0', { given: [0 as any], want: { success: '0' } }],
    ['32', { given: [32 as any], want: { success: '32px' } }],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformDimensionValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformDurationValue', () => {
  const tests: Test<Parameters<typeof transformDurationValue>, ReturnType<typeof transformDurationValue>>[] = [
    ['100ms', { given: ['100ms'], want: { success: '100ms' } }],
    ['0.25s', { given: ['0.25s'], want: { success: '0.25s' } }],
    ['0', { given: ['0'], want: { success: '0ms' } }],
    ['500', { given: [500 as any], want: { success: '500ms' } }],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformDurationValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
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
    expect(result).toEqual(want.success);
  });
});

describe('transformNumberValue', () => {
  const tests: Test<Parameters<typeof transformNumberValue>, ReturnType<typeof transformNumberValue>>[] = [
    ['basic', { given: [42], want: { success: '42' } }],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformNumberValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformShadowValue', () => {
  const tests: Test<Parameters<typeof transformShadowValue>, ReturnType<typeof transformShadowValue>>[] = [
    [
      'basic',
      {
        given: [{ color: 'color(srgb 0 0 0 / 0.1)', offsetX: '0', offsetY: '0.25rem', blur: '0.5rem', spread: '0' }],
        want: { success: '0 0.25rem 0.5rem 0 color(srgb 0 0 0 / 0.1)' },
      },
    ],
    [
      'array',
      {
        given: [
          [
            { color: 'color(srgb 0 0 0 / 0.05)', offsetX: '0', offsetY: '0.25rem', blur: '0.5rem', spread: '0' },
            { color: 'color(srgb 0 0 0 / 0.05)', offsetX: '0', offsetY: '0.5rem', blur: '1rem', spread: '0' },
          ],
        ],
        want: { success: '0 0.25rem 0.5rem 0 color(srgb 0 0 0 / 0.05), 0 0.5rem 1rem 0 color(srgb 0 0 0 / 0.05)' },
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformShadowValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
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
        want: { success: '100ms 0ms cubic-bezier(0, 0, 1, 1)' },
      },
    ],
    [
      'expanded (transition)',
      {
        given: [{ duration: '100ms', delay: 0, timingFunction: [0, 0, 1, 1] }, 'transition'],
        want: {
          success: {
            'transition-duration': '100ms',
            'transition-delay': '0ms',
            'transition-timing-function': 'cubic-bezier(0, 0, 1, 1)',
          },
        },
      },
    ],
    [
      'expanded (animation)',
      {
        given: [{ duration: '100ms', delay: 0, timingFunction: [0, 0, 1, 1] }, 'animation'],
        want: {
          success: {
            'animation-duration': '100ms',
            'animation-delay': '0ms',
            'animation-timing-function': 'cubic-bezier(0, 0, 1, 1)',
          },
        },
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
    expect(result).toEqual(want.success);
  });
});

describe('transformTypographyValue', () => {
  const tests: Test<Parameters<typeof transformTypographyValue>, ReturnType<typeof transformTypographyValue>>[] = [
    [
      'basic',
      {
        given: [
          {
            fontFamily: ['Helvetica', 'sans-serif', 'Apple Color Emoji', 'Noto Color Emoji'],
            fontSize: '15px',
            lineHeight: '20px',
            fontStyle: 'normal',
            letterSpacing: '0',
            fontVariantNumeric: 'tabular-nums',
          },
        ],
        want: {
          success: {
            'font-family': '"Helvetica", sans-serif, "Apple Color Emoji", "Noto Color Emoji"',
            'font-size': '15px',
            'font-style': 'normal',
            'font-variant-numeric': 'tabular-nums',
            'letter-spacing': '0',
            'line-height': '20px',
          },
        },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformTypographyValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});
