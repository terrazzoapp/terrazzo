import { describe, expect, test } from 'vitest';

// - Warn if node has "value" key; maybe they meant "$value"?

// - Warn if node has "type" key; maybe they meant "$type"?

import stripAnsi from 'strip-ansi';
import { type TokensJSONError, defineConfig, parse } from '../src/index.js';
import type { RuleDuplicateValueOptions } from '../src/lint/plugin-core/index.js';

/* eslint-disable @typescript-eslint/ban-types */

type Test = [string, TestOptions];

interface TestOptions {
  given: { tokens: any } & (
    | { rule: 'duplicate-values'; options: RuleDuplicateValueOptions }
    | { rule: 'naming'; options: RuleNamingOptions }
    | { rule: 'required-children'; options: RuleRequiredChildrenOptions }
    | { rule: 'required-modes'; options: RuleRequiredModesOptions }
    | { rule: 'color/format'; options: RuleColorFormatOptions }
    | { rule: 'color/gamut'; options: RuleColorGamutOptions }
    | { rule: 'typography/required-properties'; options: RuleTypographyRequiredPropertiesOptions }
  );
  want: { error: string; success?: never } | { error?: never; success: true };
}

describe('rules', () => {
  const tests: Test[] = [
    [
      '[duplicate-values] no duplicates',
      {
        given: {
          rule: 'duplicate-values',
          options: {},
          tokens: {
            color: {
              blue: {
                '100': { $type: 'color', $value: '#3c3c43' },
                '200': { $type: 'color', $value: '#f4faff' },
                '300': { $type: 'color', $value: '{color.blue.100}' },
              },
            },
          },
        },
        want: { success: true },
      },
    ],
    [
      '[duplicate-values] duplicates (fail)',
      {
        given: {
          rule: 'duplicate-values',
          options: {},
          tokens: {
            color: {
              blue: {
                '100': { $type: 'color', $value: '#3c3c43' },
                '200': { $type: 'color', $value: '#3c3c43' },
              },
            },
          },
        },
        want: { error: 'Duplicated value: "#3c3c43" (color.blue.200)' },
      },
    ],
    [
      '[duplicate-values] duplicates (success; ignored)',
      {
        given: {
          rule: 'duplicate-values',
          options: { ignore: ['color.*'] },
          tokens: {
            color: {
              blue: {
                '100': { $type: 'color', $value: '#3c3c43' },
                '200': { $type: 'color', $value: '#3c3c43' },
              },
            },
          },
        },
        want: { success: true },
      },
    ],
    [
      '[duplicate-values] custom tokens ignored',
      {
        given: {
          rule: 'duplicate-values',
          options: { ignore: ['color.*'] },
          tokens: {
            foo: {
              $type: 'bar',
              baz: {
                bat: { $value: '123' },
                boz: { $value: '456' },
              },
            },
          },
        },
        want: { success: true },
      },
    ],
    [
      '[naming] kebab-case (success)',
      {
        given: {
          rule: 'naming',
          options: { format: 'kebab-case' },
          tokens: { token: { 'kebab-case': { $type: 'number', $value: 42 } } },
        },
        want: { success: true },
      },
    ],
    [
      '[naming] kebab-case (fail)',
      {
        given: {
          rule: 'naming',
          options: { format: 'kebab-case' },
          tokens: { token: { camelCase: { $type: 'number', $value: 42 } } },
        },
        want: { error: 'Token token.camelCase: not in kebab-case' },
      },
    ],
    [
      '[naming] camelCase (success)',
      {
        given: {
          rule: 'naming',
          options: { format: 'camelCase' },
          tokens: { token: { camelCase: { $type: 'number', $value: 42 } } },
        },
        want: { success: true },
      },
    ],
    [
      '[naming] camelCase (fail)',
      {
        given: {
          rule: 'naming',
          options: { format: 'camelCase' },
          tokens: { token: { 'kebab-case': { $type: 'number', $value: 42 } } },
        },
        want: { error: 'Token token.kebab-case: not in camelCase' },
      },
    ],
    [
      '[required-children] tokens (success)',
      {
        given: {
          rule: 'required-children',
          options: { matches: [{ match: ['color.*'], requiredTokens: ['100', '200'] }] },
          tokens: {
            color: {
              blue: {
                '100': { $type: 'color', $value: '#3c3c43' },
                '200': { $type: 'color', $value: '#f4faff' },
              },
            },
          },
        },
        want: { success: true },
      },
    ],
    [
      '[required-children] tokens (failure)',
      {
        given: {
          rule: 'required-children',
          options: { matches: [{ match: ['color.*'], requiredTokens: ['100', '200'] }] },
          tokens: { color: { blue: { '100': { $type: 'color', $value: '#3c3c43' } } } },
        },
        want: { error: 'Match 0: some groups missing required token "200"' },
      },
    ],
    [
      '[required-children] groups (success)',
      {
        given: {
          rule: 'required-children',
          options: { matches: [{ match: ['color.*'], requiredGroups: ['action', 'error'] }] },
          tokens: {
            color: {
              semantic: {
                action: {
                  text: { $type: 'color', $value: '#5eb1ef' },
                  bg: { $type: 'color', $value: '#fbfdff' },
                },
                error: {
                  text: { $type: 'color', $value: '#eb8e90' },
                  bg: { $type: 'color', $value: '#fff7f7' },
                },
              },
            },
          },
        },
        want: { success: true },
      },
    ],
    [
      '[required-children] groups (failure)',
      {
        given: {
          rule: 'required-children',
          options: { matches: [{ match: ['color.*'], requiredGroups: ['action', 'error'] }] },
          tokens: {
            color: {
              semantic: {
                action: {
                  text: { $type: 'color', $value: '#5eb1ef' },
                  bg: { $type: 'color', $value: '#fbfdff' },
                },
              },
            },
          },
        },
        want: { error: 'Match 0: some tokens missing required group "error"' },
      },
    ],
    [
      '[required-modes] success',
      {
        given: {
          rule: 'required-modes',
          options: { matches: [{ match: ['typography.*'], modes: ['mobile', 'desktop'] }] },
          tokens: {
            typography: {
              size: {
                body: {
                  $type: 'dimension',
                  $value: '16px',
                  $extensions: { mode: { mobile: '16px', desktop: '16px' } },
                },
              },
            },
          },
        },
        want: { success: true },
      },
    ],
    [
      '[required-modes] fail',
      {
        given: {
          rule: 'required-modes',
          options: { matches: [{ match: ['typography.*'], modes: ['mobile', 'desktop'] }] },
          tokens: {
            typography: {
              size: {
                body: { $type: 'dimension', $value: '16px', $extensions: { mode: { desktop: '16px' } } },
              },
            },
          },
        },
        want: { error: 'Token typography.size.body: missing required mode "mobile"' },
      },
    ],
    [
      '[color/format] hex (success)',
      {
        given: {
          rule: 'color/format',
          options: { format: 'hex' },
          tokens: { color: { blue: { 100: { $type: 'color', $value: '#3c3c43' } } } },
        },
        want: { success: true },
      },
    ],
    [
      '[color/format] hex (fail)',
      {
        given: {
          rule: 'color/format',
          options: { format: 'hex' },
          tokens: { color: { blue: { 100: { $type: 'color', $value: 'oklch(80.98% 0.089 243.05)' } } } },
        },
        want: { error: 'Color color.blue.100: in oklch (expected hex)' },
      },
    ],
    [
      '[color/format] hex (success; ignored)',
      {
        given: {
          rule: 'color/format',
          options: { format: 'hex', ignore: ['color.*'] },
          tokens: { color: { blue: { 100: { $type: 'color', $value: 'oklch(80.98% 0.089 243.05)' } } } },
        },
        want: { success: true },
      },
    ],
    [
      '[color/format] oklch (success)',
      {
        given: {
          rule: 'color/format',
          options: { format: 'oklch' },
          tokens: { color: { blue: { 100: { $type: 'color', $value: 'oklch(80.98% 0.089 243.05)' } } } },
        },
        want: { success: true },
      },
    ],
    [
      '[color/format] oklch (fail)',
      {
        given: {
          rule: 'color/format',
          options: { format: 'oklch' },
          tokens: { color: { blue: { 100: { $type: 'color', $value: '#3c3c43' } } } },
        },
        want: { error: 'Color color.blue.100: in hex (expected oklch)' },
      },
    ],
    [
      '[color/gamut] srgb (success)',
      {
        given: {
          rule: 'color/gamut',
          options: { gamut: 'srgb' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(87.94% 0.163 96.35)' } } },
        },
        want: { success: true },
      },
    ],
    [
      '[color/gamut] srgb (fail)',
      {
        given: {
          rule: 'color/gamut',
          options: { gamut: 'srgb' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(89.12% 0.2 96.35)' } } },
        },
        want: { error: 'Color color.yellow outside srgb gamut' },
      },
    ],
    [
      '[color/gamut] p3 (success)',
      {
        given: {
          rule: 'color/gamut',
          options: { gamut: 'p3' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(89.12% 0.2 96.35)' } } },
        },
        want: { success: true },
      },
    ],
    [
      '[color/gamut] p3 (fail)',
      {
        given: {
          rule: 'color/gamut',
          options: { gamut: 'p3' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(88.82% 0.217 96.35)' } } },
        },
        want: { error: 'Color color.yellow outside p3 gamut' },
      },
    ],
    [
      '[color/gamut] rec2020 (success)',
      {
        given: {
          rule: 'color/gamut',
          options: { gamut: 'rec2020' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(90.59% 0.215 96.35)' } } },
        },
        want: { success: true },
      },
    ],
    [
      '[color/gamut] rec2020 (fail)',
      {
        given: {
          rule: 'color/gamut',
          options: { gamut: 'rec2020' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(91.18% 0.234 96.35)' } } },
        },
        want: { error: 'Color color.yellow outside rec2020 gamut' },
      },
    ],
  ];

  test.each(tests)('%s', async (_, { given, want }) => {
    let result: Awaited<ReturnType<typeof parse>> | undefined;
    try {
      const config = defineConfig(
        {
          lint: {
            rules: {
              [given.rule]: ['error', given.options],
            },
          },
        },
        { cwd: new URL('file:///') },
      );
      result = await parse(given.tokens, { config });
    } catch (e) {
      const err = e as TokensJSONError;
      expect(stripAnsi(err.message)).toBe(want.error);
    }

    if (result) {
      expect(want.error).toBeUndefined();
      for (const id in result.tokens) {
        const { source } = result.tokens[id]!;
        expect(source).not.toBeFalsy();
      }
    }
  });
});
