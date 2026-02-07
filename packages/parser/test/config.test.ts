import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import defineConfig from '../src/config.js';
import parse from '../src/parse/index.js';

describe('config', () => {
  describe('validation error', () => {
    const tests: [string, { given: any; want: string }][] = [
      [
        'tokens: URL',
        {
          given: { tokens: new URL('https://google.com') },
          want: 'config: tokens: Expected string or array of strings, received object',
        },
      ],
      [
        'outDir: null',
        {
          given: { outDir: null },
          want: 'config: outDir: Expected string, received null',
        },
      ],
      [
        'plugins: not array',
        {
          given: { plugins: {} },
          want: 'config: plugins: Expected array of plugins, received {}',
        },
      ],
      [
        'lint.rules: bad severity number',
        {
          given: {
            plugins: [
              {
                name: 'my-plugin',
                lint() {
                  return { 'foo-bar': () => {} };
                },
              },
            ],
            lint: {
              rules: {
                'foo-bar': 42,
              },
            },
          },
          want: 'config: lint.rules.foo-bar: Invalid number 42. Specify 0 (off), 1 (warn), or 2 (error).',
        },
      ],
      [
        'lint.rules: bad severity string',
        {
          given: {
            plugins: [
              {
                name: 'my-plugin',
                lint() {
                  return { 'foo-bar': () => {} };
                },
              },
            ],
            lint: {
              rules: {
                'foo-bar': 'feebee',
              },
            },
          },
          want: 'config: lint.rules.foo-bar: Invalid string "feebee". Specify "off", "warn", or "error".',
        },
      ],
      [
        'lint.rules: unknown rule',
        {
          given: {
            lint: {
              rules: { 'foo-bar': 'error' },
            },
          },
          want: 'config: lint.rules.foo-bar: Unknown rule. Is the plugin installed?',
        },
      ],
    ];
    it.each(tests)('%s', (_, { given, want }) => {
      try {
        const result = defineConfig(given, { cwd: new URL('file:///') });
        expect(result).toThrow();
      } catch (err) {
        expect(stripAnsi((err as Error).message)).toBe(want);
      }
    });
  });

  describe('options', () => {
    it('outDir', () => {
      const config = defineConfig({ outDir: './custom-output/' }, { cwd: new URL(import.meta.url) });
      expect(config.outDir.href).toMatch(/^file:\/\/\/.*\/parser\/test\/custom-output\/$/);
    });

    it('ignore', async () => {
      const config = defineConfig(
        {
          ignore: {
            tokens: ['color-legacy.**'],
            deprecated: true,
          },
        },
        { cwd: new URL(import.meta.url) },
      );
      const result = await parse(
        [
          {
            filename: new URL('file:///tokens.json'),
            src: {
              color: { red: { $type: 'color', $value: { colorSpace: 'display-p3', components: [1, 0, 0] } } },
              'color-legacy': { red: { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 0, 0] } } },
              deprecated: { $type: 'dimension', space: { $deprecated: true, $value: { value: 0.25, unit: 'rem' } } },
            },
          },
        ],
        { config },
      );
      expect(result.tokens).toEqual({
        'color.red': expect.objectContaining({ $value: { colorSpace: 'display-p3', components: [1, 0, 0], alpha: 1 } }),
        // color-legacy omitted
      });
    });
  });
});
