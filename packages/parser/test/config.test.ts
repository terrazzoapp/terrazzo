import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import validateAndNormalizeConfig from '../src/config.js';

describe('config', () => {
  describe('validation error', () => {
    const tests: [string, { given: any; want: string }][] = [
      [
        'tokens: URL',
        {
          given: { tokens: new URL('https://google.com') },
          want: 'config.tokens: Expected string or array of strings, received object',
        },
      ],
      [
        'outDir: null',
        {
          given: { outDir: null },
          want: 'config.outDir: Expected string, received null',
        },
      ],
      [
        'plugins: not array',
        { given: { plugins: {} }, want: 'config.plugins: Expected array of plugins, received {}' },
      ],
      [
        'lint.rules: bad severity number',
        {
          given: { lint: { rules: { 'foo-bar': 42 } } },
          want: 'config.lint.rule:foo-bar: Invalid number 42. Specify 0 (off), 1 (warn), or 2 (error).',
        },
      ],
      [
        'lint.rules: bad severity string',
        {
          given: { lint: { rules: { 'foo-bar': 'feebee' } } },
          want: 'config.lint.rule:foo-bar: Invalid string "feebee". Specify "off", "warn", or "error".',
        },
      ],
    ];
    it.each(tests)('%s', (_, { given, want }) => {
      try {
        const result = validateAndNormalizeConfig(given, { cwd: new URL('file:///') });
        expect(result).toThrow();
      } catch (err) {
        expect(stripAnsi((err as Error).message)).toBe(want);
      }
    });
  });
});
