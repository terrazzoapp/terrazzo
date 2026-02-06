import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('9.7 Typography', () => {
  const DEFAULT_VALID = {
    fontFamily: ['Helvetica'],
    fontSize: { value: 16, unit: 'px' },
    fontStyle: 'italic',
    fontVariant: 'small-caps',
    fontWeight: 400,
    letterSpacing: { value: 0.125, unit: 'rem' },
    lineHeight: { value: 24, unit: 'px' },
    textDecoration: 'underline',
    textTransform: 'uppercase',
  };

  const tests: Test[] = [
    [
      'valid',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              typography: { body: { $type: 'typography', $value: { ...DEFAULT_VALID, fontFamily: 'Helvetica' } } },
            },
          },
        ],
        want: { tokens: { 'typography.body': { $value: DEFAULT_VALID } } },
      },
    ],
    [
      'valid: lineHeight (number)',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              typography: { body: { $type: 'typography', $value: { ...DEFAULT_VALID, lineHeight: 1.5 } } },
            },
          },
        ],
        want: {
          tokens: { 'typography.body': { $value: { ...DEFAULT_VALID, lineHeight: 1.5 } } },
        },
      },
    ],
    [
      'valid: fontFamily alias',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { family: { $type: 'fontFamily', $value: 'Helvetica' } },
              typography: { body: { $type: 'typography', $value: { ...DEFAULT_VALID, fontFamily: '{font.family}' } } },
            },
          },
        ],
        want: {
          tokens: {
            'font.family': { $value: ['Helvetica'], aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: DEFAULT_VALID,
              partialAliasOf: { fontFamily: 'font.family' },
              dependencies: ['#/font/family/$value'],
            },
          },
        },
      },
    ],
    [
      'valid: fontSize alias',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { size: { $type: 'dimension', $value: { value: 1.25, unit: 'rem' } } },
              typography: {
                body: { $type: 'typography', $value: { ...DEFAULT_VALID, fontSize: '{font.size}' } },
              },
            },
          },
        ],
        want: {
          tokens: {
            'font.size': { $value: { value: 1.25, unit: 'rem' }, aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: { ...DEFAULT_VALID, fontSize: { value: 1.25, unit: 'rem' } },
              partialAliasOf: { fontSize: 'font.size' },
              dependencies: ['#/font/size/$value'],
            },
          },
        },
      },
    ],
    [
      'valid: fontWeight alias',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { weight: { $type: 'fontWeight', $value: 750 } },
              typography: {
                body: { $type: 'typography', $value: { ...DEFAULT_VALID, fontWeight: '{font.weight}' } },
              },
            },
          },
        ],
        want: {
          tokens: {
            'font.weight': { $value: 750, aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: { ...DEFAULT_VALID, fontWeight: 750 },
              partialAliasOf: { fontWeight: 'font.weight' },
              dependencies: ['#/font/weight/$value'],
            },
          },
        },
      },
    ],
    [
      'valid: lineHeight alias (dimension)',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { 'line-height': { $type: 'dimension', $value: { value: 1.25, unit: 'rem' } } },
              typography: {
                body: { $type: 'typography', $value: { ...DEFAULT_VALID, lineHeight: '{font.line-height}' } },
              },
            },
          },
        ],
        want: {
          tokens: {
            'font.line-height': { $value: { value: 1.25, unit: 'rem' }, aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: { ...DEFAULT_VALID, lineHeight: { value: 1.25, unit: 'rem' } },
              partialAliasOf: { lineHeight: 'font.line-height' },
              dependencies: ['#/font/line-height/$value'],
            },
          },
        },
      },
    ],
    [
      'valid: lineHeight alias (number)',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { 'line-height': { $type: 'number', $value: 1.6 } },
              typography: {
                body: { $type: 'typography', $value: { ...DEFAULT_VALID, lineHeight: '{font.line-height}' } },
              },
            },
          },
        ],
        want: {
          tokens: {
            'font.line-height': { $value: 1.6, aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: { ...DEFAULT_VALID, lineHeight: 1.6 },
              partialAliasOf: { lineHeight: 'font.line-height' },
              dependencies: ['#/font/line-height/$value'],
            },
          },
        },
      },
    ],
    [
      'valid: letterSpacing alias',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { spacing: { $type: 'dimension', $value: { value: 0.01, unit: 'px' } } },
              typography: {
                body: { $type: 'typography', $value: { ...DEFAULT_VALID, letterSpacing: '{font.spacing}' } },
              },
            },
          },
        ],
        want: {
          tokens: {
            'font.spacing': { $value: { value: 0.01, unit: 'px' }, aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: { ...DEFAULT_VALID, letterSpacing: { value: 0.01, unit: 'px' } },
              partialAliasOf: { letterSpacing: 'font.spacing' },
              dependencies: ['#/font/spacing/$value'],
            },
          },
        },
      },
    ],
    [
      'valid: fontStyle alias',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { style: { $type: 'string', $value: 'normal' } },
              typography: {
                body: { $type: 'typography', $value: { ...DEFAULT_VALID, fontStyle: '{font.style}' } },
              },
            },
          },
        ],
        want: {
          tokens: {
            'font.style': { $value: 'normal', aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: { ...DEFAULT_VALID, fontStyle: 'normal' },
              partialAliasOf: { fontStyle: 'font.style' },
              dependencies: ['#/font/style/$value'],
            },
          },
        },
      },
    ],
    [
      'valid: non-spec value (string)',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { paragraphSpacing: { $type: 'string', $value: '14px' } },
              typography: {
                body: {
                  $type: 'typography',
                  $value: { ...DEFAULT_VALID, paragraphSpacing: '{font.paragraphSpacing}' },
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            'font.paragraphSpacing': { $value: '14px', aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: { ...DEFAULT_VALID, paragraphSpacing: '14px' },
              partialAliasOf: { paragraphSpacing: 'font.paragraphSpacing' },
              dependencies: ['#/font/paragraphSpacing/$value'],
            },
          },
        },
      },
    ],
    [
      'valid: non-spec value (dimension)',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { paragraphSpacing: { $type: 'dimension', $value: { value: 14, unit: 'px' } } },
              typography: {
                body: {
                  $type: 'typography',
                  $value: { ...DEFAULT_VALID, paragraphSpacing: '{font.paragraphSpacing}' },
                },
              },
            },
          },
        ],
        want: {
          tokens: {
            'font.paragraphSpacing': { $value: { value: 14, unit: 'px' }, aliasedBy: ['typography.body'] },
            'typography.body': {
              $value: { ...DEFAULT_VALID, paragraphSpacing: { value: 14, unit: 'px' } },
              partialAliasOf: { paragraphSpacing: 'font.paragraphSpacing' },
              dependencies: ['#/font/paragraphSpacing/$value'],
            },
          },
        },
      },
    ],
    [
      'invalid: incorrect fontWeight alias',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              font: { weight: { $type: 'number', $value: 750 } },
              typography: {
                body: { $type: 'typography', $value: { ...DEFAULT_VALID, fontWeight: '{font.weight}' } },
              },
            },
          },
        ],
        want: {
          error: `parser:init: Cannot alias to $type "number" from $type "fontWeight".

  19 |         "fontStyle": "italic",
  20 |         "fontVariant": "small-caps",
> 21 |         "fontWeight": "{font.weight}",
     |                       ^
  22 |         "letterSpacing": {
  23 |           "value": 0.125,
  24 |           "unit": "rem"`,
        },
      },
    ],
    [
      'invalid: missing properties',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { typography: { body: { $type: 'typography', $value: {} } } },
          },
        ],
        want: {
          error: `lint:core/valid-typography: Missing required property "fontFamily".

  3 |     "body": {
  4 |       "$type": "typography",
> 5 |       "$value": {
    |                 ^
  6 |
  7 |       }
  8 |     }

lint:core/valid-typography: Missing required property "fontSize".

  3 |     "body": {
  4 |       "$type": "typography",
> 5 |       "$value": {
    |                 ^
  6 |
  7 |       }
  8 |     }

lint:core/valid-typography: Missing required property "fontWeight".

  3 |     "body": {
  4 |       "$type": "typography",
> 5 |       "$value": {
    |                 ^
  6 |
  7 |       }
  8 |     }

lint:core/valid-typography: Missing required property "letterSpacing".

  3 |     "body": {
  4 |       "$type": "typography",
> 5 |       "$value": {
    |                 ^
  6 |
  7 |       }
  8 |     }

lint:core/valid-typography: Missing required property "lineHeight".

  3 |     "body": {
  4 |       "$type": "typography",
> 5 |       "$value": {
    |                 ^
  6 |
  7 |       }
  8 |     }

lint:lint: 5 errors`,
        },
      },
    ],
    [
      'invalid: dimension legacy format',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              typography: {
                $type: 'typography',
                $value: {
                  fontFamily: 'Helvetica',
                  fontSize: '16px',
                  fontWeight: 400,
                  letterSpacing: '0.001em',
                  lineHeight: '24px',
                },
              },
            },
          },
        ],
        want: {
          error: `lint:core/valid-dimension: Migrate to the new object format: { "value": 10, "unit": "px" }.

  4 |     "$value": {
  5 |       "fontFamily": "Helvetica",
> 6 |       "fontSize": "16px",
    |                   ^
  7 |       "fontWeight": 400,
  8 |       "letterSpacing": "0.001em",
  9 |       "lineHeight": "24px"

lint:core/valid-dimension: Migrate to the new object format: { "value": 10, "unit": "px" }.

   7 |       "fontWeight": 400,
   8 |       "letterSpacing": "0.001em",
>  9 |       "lineHeight": "24px"
     |                     ^
  10 |     }
  11 |   }
  12 | }

lint:core/valid-dimension: Migrate to the new object format: { "value": 10, "unit": "px" }.

   6 |       "fontSize": "16px",
   7 |       "fontWeight": 400,
>  8 |       "letterSpacing": "0.001em",
     |                        ^
   9 |       "lineHeight": "24px"
  10 |     }
  11 |   }

lint:core/valid-number: Must be a number.

   7 |       "fontWeight": 400,
   8 |       "letterSpacing": "0.001em",
>  9 |       "lineHeight": "24px"
     |                     ^
  10 |     }
  11 |   }
  12 | }

lint:lint: 4 errors`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
