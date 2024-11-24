import { describe, expect, test } from 'vitest';

import stripAnsi from 'strip-ansi';
import { type Logger, type TokensJSONError, defineConfig, parse } from '../src/index.js';
import {
  COLORSPACE,
  CONSISTENT_NAMING,
  DUPLICATE_VALUES,
  MAX_GAMUT,
  REQUIRED_CHILDREN,
  REQUIRED_MODES,
  REQUIRED_TYPOGRAPHY_PROPERTIES,
  type RuleColorspaceOptions,
  type RuleConsistentNamingOptions,
  type RuleDuplicateValueOptions,
  type RuleMaxGamutOptions,
  type RuleRequiredChildrenOptions,
  type RuleRequiredModesOptions,
  type RuleRequiredTypographyPropertiesOptions,
} from '../src/lint/plugin-core/index.js';

const cwd = new URL(import.meta.url);
const DEFAULT_FILENAME = new URL('file:///tokens.json');
type Test = [string, TestOptions];

interface TestOptions {
  given: { tokens: any } & (
    | { rule: typeof DUPLICATE_VALUES; options: RuleDuplicateValueOptions }
    | { rule: typeof COLORSPACE; options: RuleColorspaceOptions }
    | { rule: typeof CONSISTENT_NAMING; options: RuleConsistentNamingOptions }
    | { rule: typeof MAX_GAMUT; options: RuleMaxGamutOptions }
    | { rule: typeof REQUIRED_CHILDREN; options: RuleRequiredChildrenOptions }
    | { rule: typeof REQUIRED_MODES; options: RuleRequiredModesOptions }
    | { rule: typeof REQUIRED_TYPOGRAPHY_PROPERTIES; options: RuleRequiredTypographyPropertiesOptions }
  );
  want: { errors: string[]; success?: never } | { errors?: never; success: true };
}

describe('rules', () => {
  const tests: Test[] = [
    [
      `[${COLORSPACE}] srgb (success)`,
      {
        given: {
          rule: COLORSPACE,
          options: { colorSpace: 'srgb' },
          tokens: { color: { blue: { 100: { $type: 'color', $value: 'oklch(80.98% 0.089 243.05)' } } } },
        },
        want: { success: true },
      },
    ],
    [
      `[${COLORSPACE}] oklab (success; ignored)`,
      {
        given: {
          rule: COLORSPACE,
          options: { colorSpace: 'oklab', ignore: ['color.*'] },
          tokens: { color: { blue: { 100: { $type: 'color', $value: 'oklch(80.98% 0.089 243.05)' } } } },
        },
        want: { success: true },
      },
    ],
    [
      `[${COLORSPACE}] oklch (success)`,
      {
        given: {
          rule: COLORSPACE,
          options: { colorSpace: 'oklch' },
          tokens: { color: { blue: { 100: { $type: 'color', $value: 'oklch(80.98% 0.089 243.05)' } } } },
        },
        want: { success: true },
      },
    ],
    [
      `[${COLORSPACE}] oklch (fail)`,
      {
        given: {
          rule: COLORSPACE,
          options: { colorSpace: 'oklch' },
          tokens: { color: { blue: { 100: { $type: 'color', $value: '#3c3c43' } } } },
        },
        want: { errors: ['Color color.blue.100 not in colorspace oklch'] },
      },
    ],
    [
      `[${CONSISTENT_NAMING}] kebab-case (success)`,
      {
        given: {
          rule: CONSISTENT_NAMING,
          options: { format: 'kebab-case' },
          tokens: { token: { 'kebab-case': { $type: 'number', $value: 42 } } },
        },
        want: { success: true },
      },
    ],
    [
      `[${CONSISTENT_NAMING}] kebab-case (fail)`,
      {
        given: {
          rule: CONSISTENT_NAMING,
          options: { format: 'kebab-case' },
          tokens: { token: { camelCase: { $type: 'number', $value: 42 } } },
        },
        want: { errors: ['Token token.camelCase: not in kebab-case'] },
      },
    ],
    [
      `[${CONSISTENT_NAMING}] camelCase (success)`,
      {
        given: {
          rule: CONSISTENT_NAMING,
          options: { format: 'camelCase' },
          tokens: { token: { camelCase: { $type: 'number', $value: 42 } } },
        },
        want: { success: true },
      },
    ],
    [
      `[${CONSISTENT_NAMING}] camelCase (fail)`,
      {
        given: {
          rule: CONSISTENT_NAMING,
          options: { format: 'camelCase' },
          tokens: { token: { 'kebab-case': { $type: 'number', $value: 42 } } },
        },
        want: { errors: ['Token token.kebab-case: not in camelCase'] },
      },
    ],
    [
      `[${DUPLICATE_VALUES}] no duplicates`,
      {
        given: {
          rule: DUPLICATE_VALUES,
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
      `[${DUPLICATE_VALUES}] duplicates (fail)`,
      {
        given: {
          rule: DUPLICATE_VALUES,
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
        want: { errors: ['Duplicated value: "#3c3c43" (color.blue.200)'] },
      },
    ],
    [
      `[${DUPLICATE_VALUES}] duplicates (success; ignored)`,
      {
        given: {
          rule: DUPLICATE_VALUES,
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
      `[${DUPLICATE_VALUES}] custom tokens ignored`,
      {
        given: {
          rule: DUPLICATE_VALUES,
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
      `[${MAX_GAMUT}] srgb (success)`,
      {
        given: {
          rule: MAX_GAMUT,
          options: { gamut: 'srgb' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(87.94% 0.163 96.35)' } } },
        },
        want: { success: true },
      },
    ],
    [
      `[${MAX_GAMUT}] srgb (fail)`,
      {
        given: {
          rule: MAX_GAMUT,
          options: { gamut: 'srgb' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(89.12% 0.2 96.35)' } } },
        },
        want: { errors: ['Color color.yellow outside srgb gamut'] },
      },
    ],
    [
      `[${MAX_GAMUT}] p3 (success)`,
      {
        given: {
          rule: MAX_GAMUT,
          options: { gamut: 'p3' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(89.12% 0.2 96.35)' } } },
        },
        want: { success: true },
      },
    ],
    [
      `[${MAX_GAMUT}] p3 (fail)`,
      {
        given: {
          rule: MAX_GAMUT,
          options: { gamut: 'p3' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(88.82% 0.217 96.35)' } } },
        },
        want: { errors: ['Color color.yellow outside p3 gamut'] },
      },
    ],
    [
      `[${MAX_GAMUT}] rec2020 (success)`,
      {
        given: {
          rule: MAX_GAMUT,
          options: { gamut: 'rec2020' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(90.59% 0.215 96.35)' } } },
        },
        want: { success: true },
      },
    ],
    [
      `[${MAX_GAMUT}] rec2020 (fail)`,
      {
        given: {
          rule: MAX_GAMUT,
          options: { gamut: 'rec2020' },
          tokens: { color: { yellow: { $type: 'color', $value: 'oklch(91.18% 0.234 96.35)' } } },
        },
        want: { errors: ['Color color.yellow outside rec2020 gamut'] },
      },
    ],
    [
      `[${REQUIRED_CHILDREN}] tokens (success)`,
      {
        given: {
          rule: REQUIRED_CHILDREN,
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
      `[${REQUIRED_CHILDREN}] tokens (failure)`,
      {
        given: {
          rule: REQUIRED_CHILDREN,
          options: { matches: [{ match: ['color.*'], requiredTokens: ['100', '200'] }] },
          tokens: { color: { blue: { '100': { $type: 'color', $value: '#3c3c43' } } } },
        },
        want: { errors: ['Match 0: some groups missing required token "200"'] },
      },
    ],
    [
      `[${REQUIRED_CHILDREN}] groups (success)`,
      {
        given: {
          rule: REQUIRED_CHILDREN,
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
      `[${REQUIRED_CHILDREN}] groups (failure)`,
      {
        given: {
          rule: REQUIRED_CHILDREN,
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
        want: { errors: ['Match 0: some tokens missing required group "error"'] },
      },
    ],
    [
      `[${REQUIRED_MODES}] success`,
      {
        given: {
          rule: REQUIRED_MODES,
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
      `[${REQUIRED_MODES}] fail`,
      {
        given: {
          rule: REQUIRED_MODES,
          options: { matches: [{ match: ['typography.*'], modes: ['mobile', 'desktop'] }] },
          tokens: {
            typography: {
              size: {
                body: { $type: 'dimension', $value: '16px', $extensions: { mode: { desktop: '16px' } } },
              },
            },
          },
        },
        want: { errors: ['Token typography.size.body: missing required mode "mobile"'] },
      },
    ],
    [
      `[${REQUIRED_TYPOGRAPHY_PROPERTIES}] success`,
      {
        given: {
          rule: REQUIRED_TYPOGRAPHY_PROPERTIES,
          options: { properties: ['fontWeight'] },
          tokens: {
            typography: {
              body: {
                $type: 'typography',
                $value: { fontFamily: ['Inter'], fontSize: { unit: 'rem', value: 1 }, fontWeight: 400 },
              },
            },
          },
        },
        want: { success: true },
      },
    ],
    [
      `[${REQUIRED_TYPOGRAPHY_PROPERTIES}] error`,
      {
        given: {
          rule: REQUIRED_TYPOGRAPHY_PROPERTIES,
          options: { properties: ['fontWeight'] },
          tokens: {
            typography: {
              body: {
                $type: 'typography',
                $value: { fontFamily: ['Inter'], fontSize: { unit: 'rem', value: 1 } },
              },
            },
          },
        },
        want: { errors: ['typography.body missing required typographic property "fontWeight"'] },
      },
    ],
  ];

  test.each(tests)('%s', async (_, { given, want }) => {
    let result: Awaited<ReturnType<typeof parse>> | undefined;
    const errors: string[] = [];
    try {
      const config = defineConfig(
        {
          lint: {
            rules: {
              [given.rule]: ['error', given.options],
            },
          },
        },
        { cwd },
      );
      result = await parse([{ filename: DEFAULT_FILENAME, src: given.tokens }], {
        config,
        logger: {
          level: 'error',
          debugCount: 0,
          debugScope: '*',
          errorCount: 0,
          infoCount: 0,
          warnCount: 0,
          error({ message }) {
            errors.push(message);
          },
          warn() {},
          info() {},
          debug() {},
          stats() {
            return { debugCount: 0, errorCount: 0, infoCount: 0, warnCount: 0 };
          },
          setLevel() {},
        } as Logger,
      });
      if (want.success) {
        expect(result).toBeTruthy();
      } else {
        expect(result).not.toBeTruthy();
      }
    } catch {
      expect(errors.filter((error) => !error.includes('Lint failed with error'))).toEqual(want.errors);
    }

    if (result) {
      expect(want.errors).toBeUndefined();
      for (const id in result.tokens) {
        const { source } = result.tokens[id]!;
        expect(source).not.toBeFalsy();
      }
    }
  });
});
