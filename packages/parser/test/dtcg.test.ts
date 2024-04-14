import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import type { TokensJSONError } from '../logger.js';
import parse from '../parse/index.js';
import type { TokenNormalized } from '../types.js';

type Test = [
  string,
  {
    given: any;
    want:
      | { success: true; error?: never; tokens?: Record<string, TokenNormalized> }
      | { success?: never; error: string; tokens?: never };
  },
];

async function runTest({ given, want }: Test[1]) {
  if (want.error) {
    try {
      const result = await parse(given, { plugins: [] });
      expect(() => result).toThrow();
    } catch (e) {
      const err = e as TokensJSONError;
      expect(stripAnsi(err.message)).toBe(want.error);

      // ensure TokenValidationError contains necessary properties
      expect(err.node?.type?.length).toBeGreaterThan(0);
      expect(err.node?.loc?.start?.line).toBeGreaterThanOrEqual(1);
    }
  } else {
    const result = await parse(given, { plugins: [] });
    expect(() => result).not.toThrow();
    if (want.tokens) {
      for (const id in want.tokens) {
        const { sourceNode, ...token } = result[id]!;
        expect(sourceNode).not.toBeFalsy();
        expect(token).toEqual(want.tokens[id]);
      }
    }
  }
}

describe('7 Alias', () => {
  const tests: Test[] = [
    [
      'valid: primitive',
      {
        given: {
          color: {
            base: { blue: { 500: { $type: 'color', value: 'color(srgb 0 0.2 1)' } } },
            semantic: { $value: '{color.base.blue.500}' },
          },
        },
        want: { success: true },
      },
    ],
    [
      'valid: primitive (YAML)',
      {
        given: `color:
  $value: "{color.base.blue.500}"`,
        want: { success: true },
      },
    ],
    [
      'valid: Font Weight',
      {
        given: {
          font: { weight: { bold: { $type: 'fontWeight', $value: 700 } } },
          bold: { $type: 'fontWeight', $value: '{font.weight.bold}' },
        },
        want: { success: true },
      },
    ],
    [
      'valid: Font Weight (YAML)',
      {
        given: `bold:
  $type: fontWeight
  $value: "{font.weight.700}"`,
        want: { success: true },
      },
    ],
    [
      'valid: Stroke Style',
      {
        given: {
          buttonStroke: {
            $type: 'strokeStyle',
            $value: { lineCap: 'round', dashArray: ['{size.2}', '{size.3}'] },
          },
        },
        want: { success: true },
      },
    ],
    [
      'valid: Border',
      {
        given: {
          color: { $type: 'color', semantic: { subdued: { $value: 'color(srgb 0 0 0 / 0.1)' } } },
          border: {
            size: { $type: 'dimension', default: { $value: '1px' } },
            style: { $type: 'strokeStyle', default: { $value: 'solid' } },
          },
          buttonBorder: {
            $type: 'border',
            $value: {
              color: '{color.semantic.subdued}',
              width: '{border.size.default}',
              style: '{border.style.default}',
            },
          },
        },
        want: { success: true },
      },
    ],
    [
      'valid: Gradient',
      {
        given: {
          gradient: {
            $type: 'gradient',
            $value: [
              { color: '{color.blue.500}', position: '{perc.0}' },
              { color: '{color.purple.800}', position: '{perc.100}' },
            ],
          },
        },
        want: { success: true },
      },
    ],
    [
      'invalid: bad syntax',
      {
        given: { alias: { $value: '{foo.bar' } },
        want: {
          error: `Invalid alias: "{foo.bar"

  1 | {
  2 |   "alias": {
> 3 |     "$value": "{foo.bar"
    |               ^
  4 |   }
  5 | }`,
        },
      },
    ],
    [
      'invalid: Gradient (bad syntax)',
      {
        given: {
          gradient: {
            $type: 'gradient',
            $value: [{ color: '{color.blue.500', position: '{perc.0}' }],
          },
        },
        want: {
          error: `Invalid alias: "{color.blue.500"

  4 |     "$value": [
  5 |       {
> 6 |         "color": "{color.blue.500",
    |                  ^
  7 |         "position": "{perc.0}"
  8 |       }
  9 |     ]`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.1 Color', () => {
  const tests: Test[] = [
    [
      'valid: color()',
      {
        given: { color: { cobalt: { $type: 'color', $value: 'color(srgb 0.3 0.6 1)' } } },
        want: {
          success: true,
          tokens: {
            'color.cobalt': {
              id: 'color.cobalt',
              originalValue: { $type: 'color', $value: 'color(srgb 0.3 0.6 1)' },
              $type: 'color',
              $value: { colorSpace: 'srgb', channels: [0.3, 0.6, 1], alpha: 1 },
              group: {
                id: 'color',
                tokens: {},
              },
              mode: {
                '.': 'color(srgb 0.3 0.6 1)',
              },
            } as any,
          },
        },
      },
    ],
    [
      'invalid: empty string',
      {
        given: { color: { $type: 'color', $value: '' } },
        want: {
          error: `Expected color, received empty string

  2 |   "color": {
  3 |     "$type": "color",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: { color: { $type: 'color', $value: 0x000000 } },
        want: {
          error: `Expected string, received Number

  2 |   "color": {
  3 |     "$type": "color",
> 4 |     "$value": 0
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.2 Dimension', () => {
  const tests: Test[] = [
    [
      'valid: rem',
      {
        given: { xs: { $type: 'dimension', $value: '0.5rem' } },
        want: { success: true },
      },
    ],
    [
      'valid: px',
      {
        given: { xs: { $type: 'dimension', $value: '12px' } },
        want: { success: true },
      },
    ],
    [
      'invalid: empty string',
      {
        given: { xs: { $type: 'dimension', $value: '' } },
        want: {
          error: `Expected dimension, received empty string

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: no number',
      {
        given: { xs: { $type: 'dimension', $value: 'rem' } },
        want: {
          error: `Expected dimension with units, received "rem"

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": "rem"
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: no units',
      {
        given: { xs: { $type: 'dimension', $value: '16' } },
        want: {
          error: `Missing units

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": "16"
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: { xs: { $type: 'dimension', $value: 42 } },
        want: {
          error: `Expected string, received Number

  2 |   "xs": {
  3 |     "$type": "dimension",
> 4 |     "$value": 42
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'valid: 0',
      {
        given: { '00': { $type: 'dimension', $value: 0 } },
        want: { success: true },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.3 Font Family', () => {
  const tests: Test[] = [
    [
      'valid: string',
      {
        given: { base: { $type: 'fontFamily', $value: 'Helvetica' } },
        want: { success: true },
      },
    ],
    [
      'valid: string[]',
      {
        given: { base: { $type: 'fontFamily', $value: ['Helvetica', 'system-ui', 'sans-serif'] } },
        want: { success: true },
      },
    ],
    [
      'invalid: empty string',
      {
        given: { base: { $type: 'fontFamily', $value: '' } },
        want: {
          error: `Expected font family name, received empty string

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: empty string in array',
      {
        given: { base: { $type: 'fontFamily', $value: [''] } },
        want: {
          error: `Expected an array of strings, received some non-strings or empty strings

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": [
    |               ^
  5 |       ""
  6 |     ]
  7 |   }`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: { base: { $type: 'fontFamily', $value: 200 } },
        want: {
          error: `Expected string or array of strings, received Number

  2 |   "base": {
  3 |     "$type": "fontFamily",
> 4 |     "$value": 200
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.4 Font Weight', () => {
  const tests: Test[] = [
    [
      'valid: number',
      {
        given: { bold: { $type: 'fontWeight', $value: 700 } },
        want: { success: true },
      },
    ],
    [
      'valid: weight name',
      {
        given: { black: { $type: 'fontWeight', $value: 'black' } },
        want: { success: true },
      },
    ],
    [
      'invalid: unknown string',
      {
        given: { thinnish: { $type: 'fontWeight', $value: 'thinnish' } },
        want: {
          error: `Unknown font weight "thinnish". Expected one of: thin, hairline, extra-light, ultra-light, light, normal, regular, book, medium, semi-bold, demi-bold, bold, extra-bold, ultra-bold, black, heavy, extra-black, or ultra-black.

  2 |   "thinnish": {
  3 |     "$type": "fontWeight",
> 4 |     "$value": "thinnish"
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: number out of range',
      {
        given: { kakarot: { $type: 'fontWeight', $value: 9001 } },
        want: {
          error: `Expected number 0–1000, received 9001

  2 |   "kakarot": {
  3 |     "$type": "fontWeight",
> 4 |     "$value": 9001
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.5 Duration', () => {
  const tests: Test[] = [
    [
      'valid: ms',
      {
        given: { quick: { $type: 'duration', $value: '100ms' } },
        want: { success: true },
      },
    ],
    [
      'valid: s',
      {
        given: { moderate: { $type: 'duration', $value: '0.25s' } },
        want: { success: true },
      },
    ],
    [
      'invalid: empty string',
      {
        given: { moderate: { $type: 'duration', $value: '' } },
        want: {
          error: `Expected duration, received empty string

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: no number',
      {
        given: { moderate: { $type: 'duration', $value: 'ms' } },
        want: {
          error: `Expected duration in \`ms\` or \`s\`, received "ms"

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": "ms"
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: no units',
      {
        given: { moderate: { $type: 'duration', $value: '250' } },
        want: {
          error: `Missing unit "ms" or "s"

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": "250"
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: { moderate: { $type: 'duration', $value: 250 } },
        want: {
          error: `Expected string, received Number

  2 |   "moderate": {
  3 |     "$type": "duration",
> 4 |     "$value": 250
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'valid: 0',
      {
        given: { '00': { $type: 'dimension', $value: 0 } },
        want: { success: true },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.6 Cubic Bézier', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: { cubic: { $type: 'cubicBezier', $value: [0.33, 1, 0.68, 1] } },
        want: { success: true },
      },
    ],
    [
      'invalid: length',
      {
        given: { cubic: { $type: 'cubicBezier', $value: [0.33, 1, 0.68, 1, 5] } },
        want: {
          error: `Expected an array of 4 numbers, received 5

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       0.33,
  6 |       1,
  7 |       0.68,`,
        },
      },
    ],
    [
      'invalid: type',
      {
        given: { cubic: { $type: 'cubicBezier', $value: ['33%', '100%', '68%', '100%'] } },
        want: {
          error: `Expected an array of 4 numbers, received some non-numbers

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       "33%",
  6 |       "100%",
  7 |       "68%",`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.7 Number', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: { number: { $type: 'number', $value: 42 } },
        want: { success: true },
      },
    ],
    [
      'invalid',
      {
        given: { number: { $type: 'number', $value: '100' } },
        want: {
          error: `Expected number, received String

  2 |   "number": {
  3 |     "$type": "number",
> 4 |     "$value": "100"
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: type',
      {
        given: { cubic: { $type: 'cubicBezier', $value: ['33%', '100%', '68%', '100%'] } },
        want: {
          error: `Expected an array of 4 numbers, received some non-numbers

  2 |   "cubic": {
  3 |     "$type": "cubicBezier",
> 4 |     "$value": [
    |               ^
  5 |       "33%",
  6 |       "100%",
  7 |       "68%",`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.? Boolean', () => {
  const tests: Test[] = [
    [
      'valid: true',
      {
        given: { myBool: { $type: 'boolean', $value: true } },
        want: { success: true },
      },
    ],
    [
      'valid: false',
      {
        given: { myBool: { $type: 'boolean', $value: false } },
        want: { success: true },
      },
    ],
    [
      'invalid: string',
      {
        given: { myBool: { $type: 'boolean', $value: 'true' } },
        want: {
          error: `Expected boolean, received String

  2 |   "myBool": {
  3 |     "$type": "boolean",
> 4 |     "$value": "true"
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: binary',
      {
        given: { myBool: { $type: 'boolean', $value: 0 } },
        want: {
          error: `Expected boolean, received Number

  2 |   "myBool": {
  3 |     "$type": "boolean",
> 4 |     "$value": 0
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.? Link', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: { iconStar: { $type: 'link', $value: '/assets/icons/star.svg' } },
        want: { success: true },
      },
    ],
    [
      'invalid: empty string',
      {
        given: { iconStar: { $type: 'link', $value: '' } },
        want: {
          error: `Expected URL, received empty string

  2 |   "iconStar": {
  3 |     "$type": "link",
> 4 |     "$value": ""
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: number',
      {
        given: { iconStar: { $type: 'link', $value: 100 } },
        want: {
          error: `Expected string, received Number

  2 |   "iconStar": {
  3 |     "$type": "link",
> 4 |     "$value": 100
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('8.? String', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: { myString: { $type: 'string', $value: 'foobar' } },
        want: { success: true },
      },
    ],
    [
      'valid: empty string',
      {
        given: { myString: { $type: 'string', $value: '' } },
        want: { success: true },
      },
    ],
    [
      'invalid: number',
      {
        given: { myString: { $type: 'string', $value: 99 } },
        want: {
          error: `Expected string, received Number

  2 |   "myString": {
  3 |     "$type": "string",
> 4 |     "$value": 99
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('9.2 Stroke Style', () => {
  const tests: Test[] = [
    [
      'valid: string',
      {
        given: { shadowBase: { $type: 'strokeStyle', $value: 'double' } },
        want: { success: true },
      },
    ],
    [
      'valid: object',
      {
        given: {
          shadowBase: {
            $type: 'strokeStyle',
            $value: { lineCap: 'square', dashArray: ['0.25rem', '0.5rem'] },
          },
        },
        want: { success: true },
      },
    ],
    [
      'invalid: unknown string',
      {
        given: { shadowBase: { $type: 'strokeStyle', $value: 'thicc' } },
        want: {
          error: `Unknown stroke style "thicc". Expected one of: solid, dashed, dotted, double, groove, ridge, outset, or inset.

  2 |   "shadowBase": {
  3 |     "$type": "strokeStyle",
> 4 |     "$value": "thicc"
    |               ^
  5 |   }
  6 | }`,
        },
      },
    ],
    [
      'invalid: bad dashArray',
      {
        given: {
          shadowBase: {
            $type: 'strokeStyle',
            $value: { lineCap: 'round', dashArray: [300, 500] },
          },
        },
        want: {
          error: `Expected array of strings, recieved some non-strings or empty strings.

   5 |       "lineCap": "round",
   6 |       "dashArray": [
>  7 |         300,
     |         ^
   8 |         500
   9 |       ]
  10 |     }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('9.3 Border', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: { border: { $type: 'border', $value: { color: '#00000020', style: 'solid', width: '1px' } } },
        want: { success: true },
      },
    ],
    [
      'invalid: missing color',
      {
        given: { border: { $type: 'border', $value: { style: 'solid', width: '1px' } } },
        want: {
          error: `Missing required property "color"

  2 |   "border": {
  3 |     "$type": "border",
> 4 |     "$value": {
    |               ^
  5 |       "style": "solid",
  6 |       "width": "1px"
  7 |     }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('9.5 Shadow', () => {
  const tests: Test[] = [
    [
      'valid: single',
      {
        given: {
          shadowBase: {
            $type: 'shadow',
            $value: { color: '#000000', offsetX: 0, offsetY: '0.25rem', blur: '0.5rem' },
          },
        },
        want: { success: true },
      },
    ],
    [
      'valid: array',
      {
        given: {
          shadowBase: {
            $type: 'shadow',
            $value: [
              { color: '#00000020', offsetX: 0, offsetY: '0.25rem', blur: '0.5rem', spread: 0 },
              { color: '#00000020', offsetX: 0, offsetY: '0.5rem', blur: '1rem', spread: 0 },
            ],
          },
        },
        want: { success: true },
      },
    ],
    [
      'invalid: missing color',
      {
        given: {
          shadowBase: {
            $type: 'shadow',
            $value: { offsetX: 0, offsetY: '0.25rem', blur: '0.5rem' },
          },
        },
        want: {
          error: `Missing required property "color"

  2 |   "shadowBase": {
  3 |     "$type": "shadow",
> 4 |     "$value": {
    |               ^
  5 |       "offsetX": 0,
  6 |       "offsetY": "0.25rem",
  7 |       "blur": "0.5rem"`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});

describe('9.6 Gradient', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: {
          gradient: {
            $type: 'gradient',
            $value: [
              { color: '#663399', position: 0 },
              { color: '#ff9900', position: 1 },
            ],
          },
        },
        want: { success: true },
      },
    ],
    [
      'invalid: bad color',
      {
        given: {
          gradient: {
            $type: 'gradient',
            $value: [
              { color: 'foo', position: 0 },
              { color: '#ff9900', position: 1 },
            ],
          },
        },
        want: { error: `` },
      },
    ],
    [
      'invalid: bad position',
      {
        given: {
          gradient: {
            $type: 'gradient',
            $value: [
              { color: 'foo', position: 0 },
              { color: '#ff9900', position: '12px' },
            ],
          },
        },
        want: {
          error: `Expected number, received String

   9 |       {
  10 |         "color": "#ff9900",
> 11 |         "position": "12px"
     |                     ^
  12 |       }
  13 |     ]
  14 |   }`,
        },
      },
    ],
    [
      'invalid: missing position',
      {
        given: {
          gradient: {
            $type: 'gradient',
            $value: [{ color: 'foo', position: 0 }, { color: '#ff9900' }],
          },
        },
        want: {
          error: `Missing required property "position"

   7 |         "position": 0
   8 |       },
>  9 |       {
     |       ^
  10 |         "color": "#ff9900"
  11 |       }
  12 |     ]`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => runTest(testCase));
});
