import { describe, expect, it } from 'vitest';
import {
  makeCSSVar,
  transformBooleanValue,
  transformColorValue,
  transformCSSValue,
  transformCubicBezierValue,
  transformDimensionValue,
  transformDurationValue,
  transformFontWeightValue,
  transformGradientValue,
  transformNumberValue,
  transformShadowValue,
  transformTypographyValue,
} from '../src/css/index.js';
import type { TokenNormalized } from '../src/types.js';

type Test<Given = any, Want = any> = [
  string,
  { given: Given; want: { error: string; success?: never } | { error?: never; success: Want } },
];

describe('makeCSSVar', () => {
  const tests: Test<Parameters<typeof makeCSSVar>, ReturnType<typeof makeCSSVar>>[] = [
    ['token ID', { given: ['color.blue.500'], want: { success: '--color-blue-500' } }],
    ['camelCase', { given: ['myCssVariable'], want: { success: '--my-css-variable' } }],
    ['utf8', { given: ['farbe.grün.500'], want: { success: '--farbe-grün-500' } }],
    ['utf8 2', { given: ['layerÜber'], want: { success: '--layer-über' } }],
    ['extra dashes', { given: ['my-css---var'], want: { success: '--my-css-var' } }],
    ['number prefix', { given: ['space.2x'], want: { success: '--space-2x' } }],
    ['number suffix', { given: ['typography.heading2'], want: { success: '--typography-heading2' } }],
    ['emojis', { given: ['--🤡\\_'], want: { success: '--🤡' } }],
    ['ramp-pale_purple-500', { given: ['ramp-pale_purple-500'], want: { success: '--ramp-pale-purple-500' } }],
    ['prefix', { given: ['typography.body', { prefix: 'tz' }], want: { success: '--tz-typography-body' } }],
    [
      'prefix (already prefixed)',
      { given: ['--tz-typography-body', { prefix: 'tz' }], want: { success: '--tz-typography-body' } },
    ],
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

describe('transformCSSValue', () => {
  const tests: Test<Parameters<typeof transformCSSValue>, ReturnType<typeof transformCSSValue>>[] = [
    [
      'basic',
      {
        given: [
          {
            id: 'color.blue.6',
            $type: 'color',
            originalValue: { $type: 'color', $value: '#0000ff' },
            $value: { colorSpace: 'srgb', channels: [0, 0, 1], alpha: 1 },
            mode: {
              '.': {
                id: 'color.blue.6',
                $type: 'color',
                originalValue: { $type: 'color', $value: '#0000ff' },
                $value: { colorSpace: 'srgb', channels: [0, 0, 1], alpha: 1 },
              },
            },
          } as TokenNormalized,
          { mode: '.', transformAlias: (id) => `--${id}` },
        ],
        want: { success: 'color(srgb 0 0 1)' },
      },
    ],
    [
      'aliasing',
      {
        given: [
          {
            $type: 'boolean',
            $value: false,
            id: 'bool.idk',
            mode: {
              '.': {
                $type: 'boolean',
                $value: false,
                id: 'bool.idk',
                originalValue: { $value: '{bool.nuh-uh}' },
                group: { id: 'bool', tokens: [] },
                source: {} as any,
                aliasOf: 'bool.nuh-uh',
                aliasChain: ['bool.nuh-uh'],
              },
            },
            originalValue: { $value: '{bool.nuh-uh}' },
            group: { id: 'bool', tokens: [] },
            source: {} as any,
            aliasOf: 'bool.nuh-uh',
            aliasChain: ['bool.nuh-uh'],
          },
          { mode: '.' },
        ],
        want: { success: 'var(--bool-nuh-uh)' },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformCSSValue(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformBooleanValue', () => {
  const tests: Test<Parameters<typeof transformBooleanValue>, ReturnType<typeof transformBooleanValue>>[] = [
    ['true', { given: [true], want: { success: '1' } }],
    ['false', { given: [false], want: { success: '0' } }],
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
    ['10px', { given: [{ value: 10, unit: 'px' }], want: { success: '10px' } }],
    ['1.5rem', { given: [{ value: 1.5, unit: 'rem' }], want: { success: '1.5rem' } }],
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
    ['100ms', { given: [{ value: 100, unit: 'ms' }], want: { success: '100ms' } }],
    ['0.25s', { given: [{ value: 0.25, unit: 's' }], want: { success: '0.25s' } }],
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
            { color: { colorSpace: 'srgb', channels: [1, 0, 1], alpha: 1 }, position: 0 },
            { color: { colorSpace: 'srgb', channels: [0, 1, 0], alpha: 1 }, position: 0.5 },
            { color: { colorSpace: 'srgb', channels: [1, 0, 0], alpha: 1 }, position: 1 },
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

describe('transformFontWeightValue', () => {
  const tests: Test<Parameters<typeof transformFontWeightValue>, ReturnType<typeof transformFontWeightValue>>[] = [
    ['400', { given: [400], want: { success: '400' } }],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformFontWeightValue(...given);
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
        given: [
          [
            {
              color: { colorSpace: 'srgb', channels: [0, 0, 0], alpha: 0.1 },
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 0.25, unit: 'rem' },
              blur: { value: 0.5, unit: 'rem' },
              spread: { value: 0, unit: 'px' },
              inset: false,
            },
          ],
        ],
        want: { success: '0 0.25rem 0.5rem 0 color(srgb 0 0 0 / 0.1)' },
      },
    ],
    [
      'inset',
      {
        given: [
          [
            {
              color: { colorSpace: 'srgb', channels: [0, 0, 0], alpha: 0.1 },
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 0.25, unit: 'rem' },
              blur: { value: 0.5, unit: 'rem' },
              spread: { value: 0, unit: 'px' },
              inset: true,
            },
          ],
        ],
        want: { success: 'inset 0 0.25rem 0.5rem 0 color(srgb 0 0 0 / 0.1)' },
      },
    ],
    [
      'array',
      {
        given: [
          [
            {
              color: { colorSpace: 'srgb', channels: [0, 0, 0], alpha: 0.05 },
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 0.25, unit: 'rem' },
              blur: { value: 0.5, unit: 'rem' },
              spread: { value: 0, unit: 'px' },
              inset: false,
            },
            {
              color: { colorSpace: 'srgb', channels: [0, 0, 0], alpha: 0.05 },
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 0.5, unit: 'rem' },
              blur: { value: 1, unit: 'rem' },
              spread: { value: 0, unit: 'px' },
              inset: false,
            },
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

describe('transformTypography', () => {
  const tests: Test<Parameters<typeof transformTypographyValue>, ReturnType<typeof transformTypographyValue>>[] = [
    [
      'basic',
      {
        given: [
          {
            fontFamily: ['Helvetica'],
            fontSize: { value: 16, unit: 'px' },
            fontStyle: 'italic',
            fontVariant: 'small-caps',
            fontVariationSettings: '"wght" 600',
            fontWeight: 400,
            letterSpacing: { value: 0.125, unit: 'em' },
            lineHeight: { value: 24, unit: 'px' },
            textDecoration: 'underline',
            textTransform: 'uppercase',
          },
        ],
        want: {
          success: {
            'font-family': '"Helvetica"',
            'font-size': '16px',
            'font-style': 'italic',
            'font-variant': 'small-caps',
            'font-variation-settings': '"wght" 600',
            'font-weight': '400',
            'letter-spacing': '0.125em',
            'line-height': '24px',
            'text-decoration': 'underline',
            'text-transform': 'uppercase',
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
