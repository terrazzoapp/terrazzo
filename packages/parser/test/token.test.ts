import * as momoa from '@humanwhocodes/momoa';
import type { RefMap } from '@terrazzo/json-schema-tools';
import type { TokenNormalized, TokenNormalizedSet } from '@terrazzo/token-tools';
import { describe, expect, it } from 'vitest';
import Logger from '../src/logger.js';
import { aliasToRef, graphAliases, refToTokenID } from '../src/parse/token.js';

describe('aliasToRef', () => {
  const tests: [string, { given: Parameters<typeof aliasToRef>[0]; want: ReturnType<typeof aliasToRef> }][] = [
    ['valid: simple', { given: '{color.blue.500}', want: { $ref: '#/color/blue/500/$value' } }],
    ['valid: single-level', { given: '{red}', want: { $ref: '#/red/$value' } }],
    ['valid: / char', { given: '{transition/ease/fast}', want: { $ref: '#/transition~1ease~1fast/$value' } }],
    ['valid: ~ char', { given: '{spacing.~.200}', want: { $ref: '#/spacing/~0/200/$value' } }],
    ['valid: ~0', { given: '{my.~0token.200}', want: { $ref: '#/my/~00token/200/$value' } }],
    ['invalid: bad alias', { given: '{color.text.bg', want: undefined }],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    expect(aliasToRef(given)).toEqual(want);
  });
});

describe('graphAliases', () => {
  // Note: the actual **values** of the tokens do not matter in this test. We test value
  // resolution rigorously in other places. For this test, we only care about the graph,
  // which means values are ignored (but they must still be shaped correctly)
  const TOKEN_DATA = {
    border: {
      $type: 'border',
      $value: {
        color: { colorSpace: 'srgb', components: [0, 0, 0] },
        stroke: 'solid',
        width: { value: 1, unit: 'px' },
      },
    },
    color: { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0, 0] } },
    cubicBezier: { $type: 'cubicBezier', $value: [0.22, 1, 0.36, 1] },
    dimension: { $type: 'dimension', $value: { value: 1, unit: 'px' } },
    gradient: {
      $type: 'gradient',
      $value: [
        { color: { colorSpace: 'srgb', components: [0, 0, 0] }, stop: 0 },
        { color: { colorSpace: 'srgb', components: [0, 0, 0] }, stop: 0 },
        { color: { colorSpace: 'srgb', components: [0, 0, 0] }, stop: 0 },
      ],
    },
    number: { $type: 'number', $value: 0.5 },
  };

  const filename = '.';

  // The refMap shared across tests acts as half of the tests, the others being the assertion.
  const refMap: RefMap = {
    // Single alias
    '#/color/test-1-b/$value': { refChain: ['#/color/test-1-a/$value'], filename },

    // Chained alias
    '#/color/test-2-b/$value': { refChain: ['#/color/test-2-a/$value'], filename },
    '#/color/test-2-c/$value': { refChain: ['#/color/test-2-b/$value', '#/color/test-2-a/$value'], filename },

    // Partial alias (object)
    '#/border/test-3/$value/color': {
      refChain: ['#/color/test-3-a/$value', '#/color/test-3-b/$value'],
      filename,
    },
    '#/color/test-3-a/$value': { refChain: ['#/color/test-3-b/$value'], filename },

    // Partial alias (array)
    '#/cubic-bezier/test-4/$value/1': {
      refChain: ['#/number/test-4-a/$value', '#/number/test-4-b/$value'],
      filename,
    },
    '#/number/test-4-a/$value': { refChain: ['#/number/test-4-b/$value'], filename },

    // Partial alias (nested object/array)
    '#/gradient/test-5/$value/1/color': {
      refChain: ['#/color/test-5-a/$value', '#/color/test-5-b/$value'],
      filename,
    },
    '#/gradient/test-5/$value/1/stop': { refChain: ['#/number/test-5-a/$value'], filename },
    '#/gradient/test-5/$value/2/stop': { refChain: ['#/number/test-5-b/$value'], filename },
    '#/color/test-5-a/$value': { refChain: ['#/color/test-5-b/$value'], filename },

    // Mode aliases
    '#/color/test-6-a/$value': { refChain: ['#/color/test-6-d/$value'], filename },
    '#/color/test-6-a/$value/$extensions/mode/light/$value': {
      refChain: ['#/color/test-6-c/$extensions/mode/light/$value'],
      filename,
    },
    '#/color/test-6-a/$value/$extensions/mode/dark/$value': {
      refChain: ['#/color/test-6-b/$extensions/mode/dark/$value'],
      filename,
    },
  };

  // These tests both describe the desired shape as well as provide stub tokens via $type.
  // $values are dynamically-created, but the $types must agree (both for full and partial aliases)
  const tests: [
    string,
    Record<
      string,
      Pick<TokenNormalized, '$type' | 'aliasOf' | 'aliasChain' | 'aliasedBy' | 'partialAliasOf' | 'dependencies'> & {
        mode: Record<
          string,
          Pick<TokenNormalized, 'aliasOf' | 'aliasChain' | 'aliasedBy' | 'partialAliasOf' | 'dependencies'>
        >;
      }
    >,
  ][] = [
    [
      'simple alias',
      {
        '#/color/test-1-a': {
          $type: 'color',
          aliasOf: undefined,
          aliasedBy: ['color.test-1-b'],
          aliasChain: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: ['color.test-1-b'],
              aliasChain: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
        '#/color/test-1-b': {
          $type: 'color',
          aliasOf: 'color.test-1-a',
          aliasedBy: undefined,
          aliasChain: ['color.test-1-a'],
          partialAliasOf: undefined,
          dependencies: ['#/color/test-1-a/$value'],
          mode: {
            '.': {
              aliasOf: 'color.test-1-a',
              aliasedBy: undefined,
              aliasChain: ['color.test-1-a'],
              partialAliasOf: undefined,
              dependencies: ['#/color/test-1-a/$value'],
            },
          },
        },
      },
    ],
    [
      'chained alias',
      {
        '#/color/test-2-a': {
          $type: 'color',
          aliasOf: undefined,
          aliasedBy: ['color.test-2-b', 'color.test-2-c'],
          aliasChain: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: ['color.test-2-b', 'color.test-2-c'],
              aliasChain: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
        '#/color/test-2-b': {
          $type: 'color',
          aliasOf: 'color.test-2-a',
          aliasedBy: ['color.test-2-c'],
          aliasChain: ['color.test-2-a'],
          partialAliasOf: undefined,
          dependencies: ['#/color/test-2-a/$value'],
          mode: {
            '.': {
              aliasOf: 'color.test-2-a',
              aliasedBy: ['color.test-2-c'],
              aliasChain: ['color.test-2-a'],
              partialAliasOf: undefined,
              dependencies: ['#/color/test-2-a/$value'],
            },
          },
        },
        '#/color/test-2-c': {
          $type: 'color',
          aliasOf: 'color.test-2-a',
          aliasedBy: undefined,
          aliasChain: ['color.test-2-b', 'color.test-2-a'],
          partialAliasOf: undefined,
          dependencies: ['#/color/test-2-a/$value', '#/color/test-2-b/$value'],
          mode: {
            '.': {
              aliasOf: 'color.test-2-a',
              aliasedBy: undefined,
              aliasChain: ['color.test-2-b', 'color.test-2-a'],
              partialAliasOf: undefined,
              dependencies: ['#/color/test-2-a/$value', '#/color/test-2-b/$value'],
            },
          },
        },
      },
    ],
    [
      'partial alias (object)',
      {
        '#/border/test-3': {
          $type: 'border',
          aliasOf: undefined,
          aliasedBy: undefined,
          aliasChain: undefined,
          partialAliasOf: {
            color: 'color.test-3-b',
          },
          dependencies: ['#/color/test-3-a/$value', '#/color/test-3-b/$value'],
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: undefined,
              aliasChain: undefined,
              partialAliasOf: {
                color: 'color.test-3-b',
              },
              dependencies: ['#/color/test-3-a/$value', '#/color/test-3-b/$value'],
            },
          },
        },
        '#/color/test-3-a': {
          $type: 'color',
          aliasOf: 'color.test-3-b',
          aliasedBy: ['border.test-3'],
          aliasChain: ['color.test-3-b'],
          partialAliasOf: undefined,
          dependencies: ['#/color/test-3-b/$value'],
          mode: {
            '.': {
              aliasOf: 'color.test-3-b',
              aliasedBy: ['border.test-3'],
              aliasChain: ['color.test-3-b'],
              partialAliasOf: undefined,
              dependencies: ['#/color/test-3-b/$value'],
            },
          },
        },
        '#/color/test-3-b': {
          $type: 'color',
          aliasOf: undefined,
          aliasedBy: ['border.test-3', 'color.test-3-a'],
          aliasChain: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: ['border.test-3', 'color.test-3-a'],
              aliasChain: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
      },
    ],
    [
      'partial alias (array)',
      {
        '#/cubic-bezier/test-4': {
          $type: 'cubicBezier',
          aliasOf: undefined,
          aliasedBy: undefined,
          aliasChain: undefined,
          partialAliasOf: [undefined, 'number.test-4-b'] as any,
          dependencies: ['#/number/test-4-a/$value', '#/number/test-4-b/$value'],
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: undefined,
              aliasChain: undefined,
              partialAliasOf: [undefined, 'number.test-4-b'] as any,
              dependencies: ['#/number/test-4-a/$value', '#/number/test-4-b/$value'],
            },
          },
        },
        '#/number/test-4-a': {
          $type: 'number',
          aliasOf: 'number.test-4-b',
          aliasedBy: ['cubic-bezier.test-4'],
          aliasChain: ['number.test-4-b'],
          partialAliasOf: undefined,
          dependencies: ['#/number/test-4-b/$value'],
          mode: {
            '.': {
              aliasOf: 'number.test-4-b',
              aliasedBy: ['cubic-bezier.test-4'],
              aliasChain: ['number.test-4-b'],
              partialAliasOf: undefined,
              dependencies: ['#/number/test-4-b/$value'],
            },
          },
        },
        '#/number/test-4-b': {
          $type: 'number',
          aliasOf: undefined,
          aliasedBy: ['cubic-bezier.test-4', 'number.test-4-a'],
          aliasChain: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: ['cubic-bezier.test-4', 'number.test-4-a'],
              aliasChain: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
      },
    ],
    [
      'partial alias (nested object/array)',
      {
        '#/gradient/test-5': {
          $type: 'gradient',
          aliasOf: undefined,
          aliasedBy: undefined,
          aliasChain: undefined,
          partialAliasOf: [
            undefined,
            { color: 'color.test-5-b', stop: 'number.test-5-a' },
            { stop: 'number.test-5-b' },
          ] as any,
          dependencies: [
            '#/color/test-5-a/$value',
            '#/color/test-5-b/$value',
            '#/number/test-5-a/$value',
            '#/number/test-5-b/$value',
          ],
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: undefined,
              aliasChain: undefined,
              partialAliasOf: [
                undefined,
                { color: 'color.test-5-b', stop: 'number.test-5-a' },
                { stop: 'number.test-5-b' },
              ] as any,
              dependencies: [
                '#/color/test-5-a/$value',
                '#/color/test-5-b/$value',
                '#/number/test-5-a/$value',
                '#/number/test-5-b/$value',
              ],
            },
          },
        },
        '#/color/test-5-a': {
          $type: 'color',
          aliasOf: 'color.test-5-b',
          aliasedBy: ['gradient.test-5'],
          aliasChain: ['color.test-5-b'],
          partialAliasOf: undefined,
          dependencies: ['#/color/test-5-b/$value'],
          mode: {
            '.': {
              aliasOf: 'color.test-5-b',
              aliasedBy: ['gradient.test-5'],
              aliasChain: ['color.test-5-b'],
              partialAliasOf: undefined,
              dependencies: ['#/color/test-5-b/$value'],
            },
          },
        },
        '#/color/test-5-b': {
          $type: 'color',
          aliasOf: undefined,
          aliasedBy: ['color.test-5-a', 'gradient.test-5'],
          aliasChain: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: ['color.test-5-a', 'gradient.test-5'],
              aliasChain: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
        '#/number/test-5-a': {
          $type: 'number',
          aliasOf: undefined,
          aliasedBy: ['gradient.test-5'],
          aliasChain: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: ['gradient.test-5'],
              aliasChain: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
        '#/number/test-5-b': {
          $type: 'number',
          aliasOf: undefined,
          aliasedBy: ['gradient.test-5'],
          aliasChain: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasedBy: ['gradient.test-5'],
              aliasChain: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
      },
    ],
    [
      'modes',
      {
        '#/color/test-6-a': {
          $type: 'color',
          aliasOf: 'color.test-6-d',
          aliasChain: ['color.test-6-d'],
          aliasedBy: undefined,
          partialAliasOf: undefined,
          dependencies: ['#/color/test-6-d/$value'],
          mode: {
            '.': {
              aliasOf: 'color.test-6-d',
              aliasChain: ['color.test-6-d'],
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: ['#/color/test-6-d/$value'],
            },
            light: {
              aliasOf: 'color.test-6-c',
              aliasChain: ['color.test-6-c'],
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: ['#/color/test-6-c/$extensions/mode/light/$value'],
            },
            dark: {
              aliasOf: 'color.test-6-b',
              aliasChain: ['color.test-6-b'],
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: ['#/color/test-6-b/$extensions/mode/dark/$value'],
            },
          },
        },
        '#/color/test-6-b': {
          $type: 'color',
          aliasOf: undefined,
          aliasChain: undefined,
          aliasedBy: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
            light: {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
            dark: {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: ['color.test-6-a'],
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
        '#/color/test-6-c': {
          $type: 'color',
          aliasOf: undefined,
          aliasChain: undefined,
          aliasedBy: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
            light: {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: ['color.test-6-a'],
              partialAliasOf: undefined,
              dependencies: undefined,
            },
            dark: {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
        '#/color/test-6-d': {
          $type: 'color',
          aliasOf: undefined,
          aliasChain: undefined,
          aliasedBy: ['color.test-6-a'],
          partialAliasOf: undefined,
          dependencies: undefined,
          mode: {
            '.': {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: ['color.test-6-a'],
              partialAliasOf: undefined,
              dependencies: undefined,
            },
            light: {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
            dark: {
              aliasOf: undefined,
              aliasChain: undefined,
              aliasedBy: undefined,
              partialAliasOf: undefined,
              dependencies: undefined,
            },
          },
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, want) => {
    // Create stub tokens dynamically for every test.
    const tokens = {} as TokenNormalizedSet;
    for (const [jsonID, token] of Object.entries(want)) {
      const source = {
        node: momoa.parse(JSON.stringify((TOKEN_DATA as any)[token.$type])).body as momoa.ObjectNode,
        filename: 'file:///tokens.json',
      };
      tokens[jsonID] = {
        id: refToTokenID(jsonID)!,
        $type: token.$type as any,
        $value: (TOKEN_DATA as any)[token.$type].$value as any,
        aliasOf: undefined,
        partialAliasOf: undefined,
        aliasedBy: undefined,
        aliasChain: undefined,
        dependencies: undefined,
        source,
        mode: Object.fromEntries(
          Object.keys(token.mode).map((name) => [
            name,
            {
              $value: (TOKEN_DATA as any)[token.$type].$value as any,
              aliasOf: undefined,
              partialAliasOf: undefined,
              aliasedBy: undefined,
              aliasChain: undefined,
              dependencies: undefined,
              source,
            },
          ]),
        ) as any,
      } as TokenNormalized;
    }

    graphAliases(refMap, { tokens, sources: {}, logger: new Logger() });

    for (const [jsonID, { mode: expectedMode, ...expected }] of Object.entries(want)) {
      const { source, mode: actualMode, ...token } = tokens[jsonID]!;
      // removing AST nodes makes failures much easier to parse
      expect(token).toEqual(expect.objectContaining(expected));
      for (const [key, { source, ...modeValue }] of Object.entries(actualMode)) {
        expect(modeValue, key).toEqual(expect.objectContaining(expectedMode[key]));
      }
    }
  });
});
