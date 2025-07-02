import { describe, expect, it } from 'vitest';
import {
  makeCSSVar,
  transformBoolean,
  transformCSSValue,
  transformColor,
  transformCubicBezier,
  transformDimension,
  transformDuration,
  transformFontWeight,
  transformGradient,
  transformNumber,
  transformShadow,
  transformTypography,
} from '../src/css/index.js';

type Test<Given = any, Want = any> = [
  string,
  {
    given: Given;
    want: { error: string; success?: never } | { error?: never; success: Want };
  },
];

describe('makeCSSVar', () => {
  const tests: Test<Parameters<typeof makeCSSVar>, ReturnType<typeof makeCSSVar>>[] = [
    ['token ID', { given: ['color.blue.500'], want: { success: '--color-blue-500' } }],
    ['camelCase', { given: ['myCssVariable'], want: { success: '--my-css-variable' } }],
    ['utf8', { given: ['farbe.grün.500'], want: { success: '--farbe-grün-500' } }],
    ['utf8 2', { given: ['layerÜber'], want: { success: '--layer-über' } }],
    ['extra dashes', { given: ['my-css---var'], want: { success: '--my-css-var' } }],
    ['number prefix', { given: ['space.2x'], want: { success: '--space-2x' } }],
    [
      'number suffix',
      {
        given: ['typography.heading2'],
        want: { success: '--typography-heading2' },
      },
    ],
    ['emojis', { given: ['--🤡\\_'], want: { success: '--🤡' } }],
    [
      'ramp-pale_purple-500',
      {
        given: ['ramp-pale_purple-500'],
        want: { success: '--ramp-pale-purple-500' },
      },
    ],
    [
      'prefix',
      {
        given: ['typography.body', { prefix: 'tz' }],
        want: { success: '--tz-typography-body' },
      },
    ],
    [
      'prefix (already prefixed)',
      {
        given: ['--tz-typography-body', { prefix: 'tz' }],
        want: { success: '--tz-typography-body' },
      },
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
            $value: { colorSpace: 'srgb', components: [0, 0, 1], alpha: 1 },
            mode: {
              '.': {
                id: 'color.blue.6',
                $type: 'color',
                originalValue: { $type: 'color', $value: '#0000ff' },
                $value: { colorSpace: 'srgb', components: [0, 0, 1], alpha: 1 },
              },
            },
          } as any,
          { mode: '.', tokensSet: {}, transformAlias: (id) => `--${id}` },
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
                $value: false,
                originalValue: '{bool.nuh-uh}',
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
          {
            mode: '.',
            tokensSet: {
              'bool.idk': { $type: 'boolean', $value: false, id: 'bool.idk' },
              'bool.nuh-uh': {
                $type: 'boolean',
                $value: false,
                id: 'bool.nuh-uh',
              },
            } as any,
          },
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

describe('transformBoolean', () => {
  const tests: Test<Parameters<typeof transformBoolean>, ReturnType<typeof transformBoolean>>[] = [
    [
      'true',
      {
        given: [{ $value: true } as any, { tokensSet: {} }],
        want: { success: '1' },
      },
    ],
    [
      'false',
      {
        given: [{ $value: false } as any, { tokensSet: {} }],
        want: { success: '0' },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformBoolean(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformColor', () => {
  const tests: Test<Parameters<typeof transformColor>, ReturnType<typeof transformColor>>[] = [
    [
      'string',
      {
        given: [{ $value: '#663399' }, { tokensSet: {} }],
        want: { success: 'color(srgb 0.4 0.2 0.6)' },
      },
    ],
    [
      'srgb',
      {
        given: [
          {
            $value: { colorSpace: 'srgb', components: [0.4, 0.2, 0.6] } as any,
          },
          { tokensSet: {} },
        ],
        want: { success: 'color(srgb 0.4 0.2 0.6)' },
      },
    ],
    [
      'a98-rgb',
      {
        given: [
          {
            $value: { colorSpace: 'a98-rgb', components: [0.4, 0.2, 0.6] } as any,
          },
          { tokensSet: {} },
        ],
        want: { success: 'color(a98-rgb 0.4 0.2 0.6)' },
      },
    ],
    [
      'lrgb',
      {
        given: [
          {
            $value: { colorSpace: 'srgb-linear', components: [0.4, 0.2, 0.6] } as any,
          },
          { tokensSet: {} },
        ],
        want: { success: 'color(srgb-linear 0.4 0.2 0.6)' },
      },
    ],
    [
      'p3',
      {
        given: [
          {
            $value: { colorSpace: 'display-p3', components: [0.4, 0.2, 0.6] } as any,
          },
          { tokensSet: {} },
        ],
        want: { success: 'color(display-p3 0.4 0.2 0.6)' },
      },
    ],
    [
      'prophoto-rgb',
      {
        given: [
          {
            $value: { colorSpace: 'prophoto-rgb', components: [0.4, 0.2, 0.6] } as any,
          },
          { tokensSet: {} },
        ],
        want: { success: 'color(prophoto-rgb 0.4 0.2 0.6)' },
      },
    ],
    [
      'rec2020',
      {
        given: [
          {
            $value: { colorSpace: 'rec2020', components: [0.4, 0.2, 0.6] } as any,
          },
          { tokensSet: {} },
        ],
        want: { success: 'color(rec2020 0.4 0.2 0.6)' },
      },
    ],
    [
      'hsl',
      {
        given: [
          {
            $value: { colorSpace: 'hsl', components: [218, 50, 67] },
          } as any,
          { tokensSet: {} },
        ],
        want: { success: 'hsl(218 50% 67%)' },
      },
    ],
    [
      'hwb',
      {
        given: [{ $value: { colorSpace: 'hwb', components: [45, 40, 80] } } as any, { tokensSet: {} }],
        want: { success: 'hwb(45 40% 80%)' },
      },
    ],
    [
      'lab',
      {
        given: [
          {
            $value: { colorSpace: 'lab', components: [0.97607, -15.753, 93.388] },
          } as any,
          { tokensSet: {} },
        ],
        want: {
          success: {
            '.': 'lab(0.97607 -15.753 93.388)',
            p3: 'lab(0.9992456122453213 -0.22075576349825377 1.6354688171982878)',
            rec2020: 'lab(0.9909312517695597 -0.24730031693993848 1.649082035846855)',
            srgb: 'lab(1.001832729252527 -0.1892285324187476 1.4850469752498152)',
          },
        },
      },
    ],
    [
      'lab-d65',
      {
        given: [
          {
            $value: { colorSpace: 'lab-d65', components: [0.97607, -15.753, 93.388] },
          } as any,
          { tokensSet: {} },
        ],
        want: {
          success: {
            '.': 'color(--lab-d65 0.97607 -15.753 93.388)',
            p3: 'color(--lab-d65 1.8855122166091576 -0.360479905092595 3.1148289149372954)',
            rec2020: 'color(--lab-d65 1.8734299289396539 -0.39990148710858375 3.1455705440267545)',
            srgb: 'color(--lab-d65 1.894456898976582 -0.28385578499251496 2.832328734182904)',
          },
        },
      },
    ],
    [
      'lch',
      {
        given: [
          {
            $value: { colorSpace: 'lch', components: [0.292345, 44.2, 27] },
          } as any,
          { tokensSet: {} },
        ],
        want: {
          success: {
            '.': 'lch(0.292345 44.2 27)',
            p3: 'lch(0.3008995559138441 1.5469628958122028 19.61978258664296)',
            rec2020: 'lch(0.2981584825921537 1.538049285636121 19.485853861927055)',
            srgb: 'lch(0.3214049466640958 1.5192684802362915 19.699130975077715)',
          },
        },
      },
    ],
    [
      'oklab',
      {
        given: [{ $value: { colorSpace: 'oklab', components: [0.40101, 0.1147, 0.0453] } }, { tokensSet: {} }],
        want: { success: 'oklab(0.40101 0.1147 0.0453)' },
      },
    ],
    [
      'oklch (in gamut)',
      {
        given: [
          {
            $value: { colorSpace: 'oklch', components: [0, 0, 0], alpha: 1 },
          } as any,
          { tokensSet: {} },
        ],
        want: { success: 'oklch(0 0 0)' },
      },
    ],
    [
      'oklch (out of gamut)',
      {
        given: [
          {
            $value: { colorSpace: 'oklch', components: [1, 0.2, 40], alpha: 1 },
          } as any,
          { tokensSet: {} },
        ],
        want: {
          success: {
            '.': 'oklch(1 0.2 40)',
            p3: 'oklch(0.999999993473546 3.727399542465306e-8 89.87556275421639)',
            rec2020: 'oklch(0.9999999934735462 3.7273995536157345e-8 89.87556241327162)',
            srgb: 'oklch(0.999999993473546 0 none)',
          },
        },
      },
    ],
    [
      'okhsv',
      {
        given: [
          {
            $value: { colorSpace: 'okhsv', components: [218, 0.5, 0.67] },
          } as any,
          { tokensSet: {} },
        ],
        want: { success: 'color(--okhsv 218 0.5 0.67)' },
      },
    ],
    [
      'xyz',
      {
        given: [{ $value: { colorSpace: 'xyz', components: [0.2005, 0.14089, 0.4472] } } as any, { tokensSet: {} }],
        want: { success: 'color(xyz-d65 0.2005 0.14089 0.4472)' },
      },
    ],
    [
      'xyz-d50',
      {
        given: [{ $value: { colorSpace: 'xyz-d50', components: [0.2005, 0.14089, 0.4472] } } as any, { tokensSet: {} }],
        want: { success: 'color(xyz-d50 0.2005 0.14089 0.4472)' },
      },
    ],
    [
      'xyz-d65',
      {
        given: [{ $value: { colorSpace: 'xyz-d65', components: [0.2005, 0.14089, 0.4472] } } as any, { tokensSet: {} }],
        want: { success: 'color(xyz-d65 0.2005 0.14089 0.4472)' },
      },
    ],
    [
      'invalid',
      {
        given: [{ $value: '#wtf' } as any, { tokensSet: {} }],
        want: { error: 'Unable to parse color "#wtf"' },
      },
    ],
    [
      'unknown colorSpace',
      {
        given: [{ $value: { colorSpace: 'bad', components: [0.1, 0.1, 0.1] } } as any, { tokensSet: {} }],
        want: {
          error:
            'Invalid colorSpace "bad". Expected one of a98-rgb, display-p3, hsl, hwb, lab, lab-d65, lch, oklab, oklch, okhsv, prophoto-rgb, rec2020, srgb, srgb-linear, xyz, xyz-d50, xyz-d65',
        },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformColor(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformCubicBezier', () => {
  const tests: Test<Parameters<typeof transformCubicBezier>, ReturnType<typeof transformCubicBezier>>[] = [
    [
      'basic',
      {
        given: [{ $value: [0.33, 1, 0.68, 1] } as any, { tokensSet: {} }],
        want: { success: 'cubic-bezier(0.33, 1, 0.68, 1)' },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformCubicBezier(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformDimension', () => {
  const tests: Test<Parameters<typeof transformDimension>, ReturnType<typeof transformDimension>>[] = [
    [
      '10px',
      {
        given: [{ $value: { value: 10, unit: 'px' } } as any, { tokensSet: {} }],
        want: { success: '10px' },
      },
    ],
    [
      '1.5rem',
      {
        given: [{ $value: { value: 1.5, unit: 'rem' } } as any, { tokensSet: {} }],
        want: { success: '1.5rem' },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformDimension(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformDuration', () => {
  const tests: Test<Parameters<typeof transformDuration>, ReturnType<typeof transformDuration>>[] = [
    [
      '100ms',
      {
        given: [{ $value: { value: 100, unit: 'ms' } } as any, { tokensSet: {} }],
        want: { success: '100ms' },
      },
    ],
    [
      '0.25s',
      {
        given: [{ $value: { value: 0.25, unit: 's' } } as any, { tokensSet: {} }],
        want: { success: '0.25s' },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformDuration(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformGradient', () => {
  const tests: Test<Parameters<typeof transformGradient>, ReturnType<typeof transformGradient>>[] = [
    [
      'basic',
      {
        given: [
          {
            $value: [
              {
                color: { colorSpace: 'srgb', components: [1, 0, 1], alpha: 1 },
                position: 0,
              },
              {
                color: { colorSpace: 'srgb', components: [0, 1, 0], alpha: 1 },
                position: 0.5,
              },
              {
                color: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 },
                position: 1,
              },
            ],
          } as any,
          { tokensSet: {} },
        ],
        want: {
          success: 'color(srgb 1 0 1) 0%, color(srgb 0 1 0) 50%, color(srgb 1 0 0) 100%',
        },
      },
    ],
  ];
  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformGradient(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformFontWeight', () => {
  const tests: Test<Parameters<typeof transformFontWeight>, ReturnType<typeof transformFontWeight>>[] = [
    [
      '400',
      {
        given: [{ $value: 400 } as any, { tokensSet: {} }],
        want: { success: '400' },
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformFontWeight(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformNumber', () => {
  const tests: Test<Parameters<typeof transformNumber>, ReturnType<typeof transformNumber>>[] = [
    [
      'basic',
      {
        given: [{ $value: 42 } as any, { tokensSet: {} }],
        want: { success: '42' },
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformNumber(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformShadow', () => {
  const tests: Test<Parameters<typeof transformShadow>, ReturnType<typeof transformShadow>>[] = [
    [
      'basic',
      {
        given: [
          {
            $value: [
              {
                color: {
                  colorSpace: 'srgb',
                  components: [0, 0, 0],
                  alpha: 0.1,
                },
                offsetX: { value: 0, unit: 'px' },
                offsetY: { value: 0.25, unit: 'rem' },
                blur: { value: 0.5, unit: 'rem' },
                spread: { value: 0, unit: 'px' },
                inset: false,
              },
            ],
          } as any,
          { tokensSet: {} },
        ],
        want: { success: '0 0.25rem 0.5rem 0 color(srgb 0 0 0 / 0.1)' },
      },
    ],
    [
      'inset',
      {
        given: [
          {
            $value: [
              {
                color: {
                  colorSpace: 'srgb',
                  components: [0, 0, 0],
                  alpha: 0.1,
                },
                offsetX: { value: 0, unit: 'px' },
                offsetY: { value: 0.25, unit: 'rem' },
                blur: { value: 0.5, unit: 'rem' },
                spread: { value: 0, unit: 'px' },
                inset: true,
              },
            ],
          } as any,
          { tokensSet: {} },
        ],
        want: { success: 'inset 0 0.25rem 0.5rem 0 color(srgb 0 0 0 / 0.1)' },
      },
    ],
    [
      'array',
      {
        given: [
          {
            $value: [
              {
                color: {
                  colorSpace: 'srgb',
                  components: [0, 0, 0],
                  alpha: 0.05,
                },
                offsetX: { value: 0, unit: 'px' },
                offsetY: { value: 0.25, unit: 'rem' },
                blur: { value: 0.5, unit: 'rem' },
                spread: { value: 0, unit: 'px' },
                inset: false,
              },
              {
                color: {
                  colorSpace: 'srgb',
                  components: [0, 0, 0],
                  alpha: 0.05,
                },
                offsetX: { value: 0, unit: 'px' },
                offsetY: { value: 0.5, unit: 'rem' },
                blur: { value: 1, unit: 'rem' },
                spread: { value: 0, unit: 'px' },
                inset: false,
              },
            ],
          } as any,
          { tokensSet: {} },
        ],
        want: {
          success: '0 0.25rem 0.5rem 0 color(srgb 0 0 0 / 0.05), 0 0.5rem 1rem 0 color(srgb 0 0 0 / 0.05)',
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformShadow(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});

describe('transformTypography', () => {
  const tests: Test<Parameters<typeof transformTypography>, ReturnType<typeof transformTypography>>[] = [
    [
      'basic',
      {
        given: [
          {
            $value: {
              fontFamily: ['Helvetica Neue', 'Helvetica', '-apple-system', 'system-ui', 'sans-serif'],
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
          } as any,
          { tokensSet: {} },
        ],
        want: {
          success: {
            'font-family': '"Helvetica Neue", "Helvetica", -apple-system, system-ui, sans-serif',
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
    [
      'alias',
      {
        given: [
          {
            id: 'typography.labelSmall',
            $value: {
              fontFamily: ['Inter'],
            },
            partialAliasOf: { fontFamily: 'font.sans' },
          } as any,
          {
            tokensSet: {
              'typography.labelSmall': {
                $type: 'typography',
                $value: { fontFamily: ['Inter'] },
              },
              'font.sans': {
                $type: 'typography',
                $value: { fontFamily: ['Inter'] },
              },
            } as any,
          },
        ],
        want: {
          success: {
            'font-family': 'var(--font-sans-font-family)',
          },
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    let result: typeof want.success;
    try {
      result = transformTypography(...given);
    } catch (err) {
      expect((err as Error).message).toBe(want.error);
    }
    expect(result).toEqual(want.success);
  });
});
