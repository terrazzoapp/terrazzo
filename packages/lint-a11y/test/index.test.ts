import build from '@cobalt-ui/cli/dist/build.js';
import type { Group, ParseResult } from '@cobalt-ui/core';
import fs from 'node:fs';
import { describe, expect, test } from 'vitest';
import { execa } from 'execa';
import stripAnsi from 'strip-ansi';
import yaml from 'yaml';
import a11y, { type RuleContrastOptions } from '../src/index.js';
import { fileURLToPath } from 'node:url';

describe('a11y plugin', () => {
  describe('rules', () => {
    describe('a11y/contrast', () => {
      const tokensURL = new URL('./fixtures/tokens.yaml', import.meta.url);
      const tokens = yaml.parse(fs.readFileSync(tokensURL, 'utf8'));

      const tests: [
        string,
        {
          options?: RuleContrastOptions;
          want: { success: boolean; errors?: never } | { success?: never; errors: string[] };
        },
      ][] = [
        [
          'passing (silver)',
          {
            options: {
              checks: [
                {
                  tokens: {
                    foreground: 'color.high-contrast-text',
                    background: 'color.high-contrast-bg',
                    typography: 'typography.large',
                  },
                  apca: 'silver',
                  wcag2: 'AAA',
                },
              ],
            },
            want: { success: true },
          },
        ],
        [
          'passing (number)',
          {
            options: {
              checks: [
                {
                  tokens: {
                    foreground: 'color.high-contrast-text',
                    background: 'color.high-contrast-bg',
                    typography: 'typography.large',
                    modes: ['light', 'dark'],
                  },
                  apca: 75,
                  wcag2: 'AAA',
                },
              ],
            },
            want: { success: true },
          },
        ],
        [
          'passing light, failing dark',
          {
            options: {
              checks: [
                {
                  tokens: {
                    foreground: 'color.failing-dark-text',
                    background: 'color.failing-dark-bg',
                    typography: 'typography.large',
                    modes: ['light', 'dark'],
                  },
                  apca: 75,
                  wcag2: 'AAA',
                },
              ],
            },
            want: {
              errors: [
                `a11y/contrast: ERROR
    [WCAG2] Failed contrast (AAA)
      Foreground: color.failing-dark-text  →  #606060 (mode: dark)
      Background: color.failing-dark-bg    →  #101010 (mode: dark)

      Wanted: 7:1 / Actual: 3.03:1`,
                `a11y/contrast: ERROR
    [APCA] Failed contrast
      Foreground: color.failing-dark-text  →  #606060 (mode: dark)
      Background: color.failing-dark-bg    →  #101010 (mode: dark)

      Wanted: 75 / Actual: 20.09`,
              ],
            },
          },
        ],
        [
          'failing (default settings)',
          {
            options: {
              checks: [
                {
                  tokens: {
                    foreground: 'color.failing-dark-text',
                    background: 'color.failing-dark-bg',
                    typography: 'typography.body',
                  },
                },
              ],
            },
            want: {
              errors: [
                '[@cobalt-ui/lint-a11y] Error a11y/contrast: WCAG 2: Token pair #606060, #101010 (mode: dark) failed contrast. Expected 7:1 ("AAA"), received 3.03:1',
              ],
            },
          },
        ],
        [
          'no options provided',
          {
            options: undefined,
            want: { errors: ['options.checks must be an array'] },
          },
        ],
        [
          'blue test',
          {
            options: {
              checks: [
                {
                  tokens: {
                    background: 'color.blue.1200',
                    foreground: 'color.blue.400',
                  },
                  apca: 88.04,
                },
                {
                  tokens: {
                    background: 'color.blue.100',
                    foreground: 'color.blue.900',
                  },
                  wcag2: 2.95,
                  apca: 42.98,
                },
              ],
            },
            want: { success: true },
          },
        ],
      ];
      test.each(tests)('%s', async (_, { options, want }) => {
        let buildResult: ParseResult;
        try {
          buildResult = await build(tokens as Group, {
            tokens: [tokensURL],
            outDir: new URL('./index/', import.meta.url),
            plugins: [a11y()],
            lint: {
              build: { enabled: true },
              rules: {
                'a11y/contrast': {
                  id: 'a11y/contrast',
                  severity: 'error' as const,
                  options,
                },
              },
            },
            color: {},
          });
        } catch (err) {
          expect(stripAnsi((err as SyntaxError).message)).toBe(want.errors?.[0]);
          return;
        }

        if (want.success) {
          if (buildResult.errors) {
            // eslint-disable-next-line no-console
            console.error(...buildResult.errors);
          }
          expect(buildResult.errors?.[0]).toBeUndefined();
        } else {
          for (let i = 0; i < (buildResult.errors?.length || 0); i++) {
            expect(stripAnsi(buildResult.errors?.[i] ?? '')).toBe(want.errors![i]);
          }
        }
      });
    });
  });

  describe('CLI', () => {
    test('basic', async () => {
      const cwd = new URL('./fixtures/', import.meta.url);

      await execa('node', ['../../../cli/bin/cli.js', 'build'], { cwd: fileURLToPath(cwd) });

      // assert plugin-css generated content as a proxy for no lint errors (building not blocked)
      const tokens = fs.readFileSync(new URL('./index/tokens.css', cwd), 'utf8');
      expect(tokens.length).toBeGreaterThan(100);
    });
  });
});
