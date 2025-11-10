import fs from 'node:fs/promises';
import { parse as parseJSON } from '@humanwhocodes/momoa';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import defineConfig from '../src/config.js';
import Logger from '../src/logger.js';
import parse from '../src/parse/index.js';
import { calculatePermutations, createResolver, validateResolver } from '../src/resolver/index.js';

describe('Resolver module', () => {
  describe('core', () => {
    const tests: [string, { given: any; want: any }][] = [
      [
        'errs on multiple resolvers',
        {
          given: [
            {
              filename: new URL('file:///resolver1.resolver.json'),
              src: JSON.stringify({ name: 'Resolver 1', version: '2025.10', resolutionOrder: [] }),
            },
            {
              filename: new URL('file:///resolver2.resolver.json'),
              src: JSON.stringify({ name: 'Resolver 2', version: '2025.10', resolutionOrder: [] }),
            },
          ],
          want: {
            error: `[parser:init] Resolver must be the only input, found 2 sources.`,
          },
        },
      ],
    ];

    it.each(tests)('%s', async (_, { given, want }) => {
      const config = defineConfig({}, { cwd: new URL(import.meta.url) });
      if (want.error) {
        try {
          await parse(given, { config });
        } catch (err) {
          expect(stripAnsi((err as Error).message)).toBe(want.error);
        }
        return;
      }

      const { tokens } = await parse(given, { config });
      expect(tokens).toEqual(want.tokens);
    });
  });

  describe('validation', () => {
    const tests: [string, { given: any; want: string | undefined }][] = [
      [
        'minimal valid',
        {
          given: {
            version: '2025.10',
            resolutionOrder: [{ $ref: '#/sets/base' }],
          },
          want: undefined,
        },
      ],
      [
        'version: missing',
        {
          given: {
            resolutionOrder: [{ $ref: '#/sets/base' }],
          },
          want: `[parser:resolver] Missing "version".

> 1 | {
    | ^
  2 |   "resolutionOrder": [
  3 |     {
  4 |       "$ref": "#/sets/base"`,
        },
      ],
      [
        'version: wrong type',
        {
          given: {
            version: 1,
            resolutionOrder: [{ $ref: '#/sets/base' }],
          },
          want: `[parser:resolver] Expected "version" to be "2025.10".

  1 | {
> 2 |   "version": 1,
    |              ^
  3 |   "resolutionOrder": [
  4 |     {
  5 |       "$ref": "#/sets/base"`,
        },
      ],
      [
        'modifier: some context is bad type',
        {
          given: {
            version: '2025.10',
            modifiers: {
              theme: {
                contexts: {
                  light: [{ $ref: 'theme/light.json' }],
                  dark: { $ref: 'theme/light.json' },
                },
              },
            },
            resolutionOrder: [{ $ref: '#/modifiers/theme' }],
          },
          want: `[parser:resolver] Expected array.

   9 |           }
  10 |         ],
> 11 |         "dark": {
     |                 ^
  12 |           "$ref": "theme/light.json"
  13 |         }
  14 |       }`,
        },
      ],
      [
        'resolutionOrder: missing',
        {
          given: {
            version: '2025.10',
          },
          want: `[parser:resolver] Missing "resolutionOrder".

> 1 | {
    | ^
  2 |   "version": "2025.10"
  3 | }`,
        },
      ],
      [
        'resolutionOrder: wrong type',
        {
          given: {
            version: '2025.10',
            resolutionOrder: { foo: 'bar' },
          },
          want: `[parser:resolver] Expected array.

  1 | {
  2 |   "version": "2025.10",
> 3 |   "resolutionOrder": {
    |                      ^
  4 |     "foo": "bar"
  5 |   }
  6 | }`,
        },
      ],
    ];

    it.each(tests)('%s', (_, { given, want }) => {
      const logger = new Logger();
      const src = JSON.stringify(given, undefined, 2);
      if (want === undefined) {
        expect(() => validateResolver(parseJSON(src), { logger, src })).not.toThrow();
      } else {
        try {
          validateResolver(parseJSON(src), { logger, src });
          expect(true).toBe(false);
        } catch (err) {
          expect(stripAnsi((err as Error).message)).toBe(want);
        }
      }
    });
  });

  describe('Additional cases', () => {
    it.skip('filesystem', async () => {
      const cwd = new URL('./fixtures/resolver/', import.meta.url);

      const filename = new URL('example.resolver.json', cwd);
      const config = defineConfig({}, { cwd });
      const { tokens, resolver } = await parse(
        [
          {
            filename,
            src: await fs.readFile(filename, 'utf8'),
          },
        ],
        { config },
      );

      expect(tokens).toEqual({
        'color.blue.6': {},
      });

      const r = createResolver(resolver!, { logger: new Logger({ level: 'silent' }) });
      expect(r.apply({ theme: 'light' })).toEqual({
        'color.blue.6': {
          $type: 'color',
          $value: {
            components: [0.0196078431372549, 0.3137254901960784, 0.6823529411764706],
            alpha: 1,
            hex: '#0550ae',
          },
        },
      });
      expect(r.apply({ theme: 'dark' })).toEqual({
        'color.blue.6': {
          $type: 'color',
          $value: {
            components: [0.06666666666666667, 0.34509803921568627, 0.7803921568627451],
            alpha: 1,
            hex: '#1158c7',
          },
        },
      });

      expect(r.inputPermutations).toEqual([{ theme: 'light' }, { theme: 'dark' }]);

      expect(r.isValidInput({ theme: 'dark' })).toBe(true);
      expect(r.isValidInput({})).toBe(false);
      expect(r.isValidInput({ theme: 'foobar' })).toBe(false);
    });
  });
});

describe('calculatePermutations', () => {
  it('zero modifiers', () => {
    expect(calculatePermutations([])).toEqual([{}]);
  });

  it('one modifier', () => {
    expect(calculatePermutations([['theme', ['light', 'dark']]])).toEqual([{ theme: 'light' }, { theme: 'dark' }]);
  });

  it('three modifiers', () => {
    expect(
      calculatePermutations([
        ['theme', ['light', 'light-hc', 'dark', 'dark-hc']],
        ['size', ['sm', 'md', 'lg']],
        ['subbrand', ['a', 'b', 'c', 'd']],
      ]),
    ).toEqual([
      { theme: 'light', size: 'sm', subbrand: 'a' },
      { theme: 'light-hc', size: 'sm', subbrand: 'a' },
      { theme: 'dark', size: 'sm', subbrand: 'a' },
      { theme: 'dark-hc', size: 'sm', subbrand: 'a' },
      { theme: 'light', size: 'md', subbrand: 'a' },
      { theme: 'light-hc', size: 'md', subbrand: 'a' },
      { theme: 'dark', size: 'md', subbrand: 'a' },
      { theme: 'dark-hc', size: 'md', subbrand: 'a' },
      { theme: 'light', size: 'lg', subbrand: 'a' },
      { theme: 'light-hc', size: 'lg', subbrand: 'a' },
      { theme: 'dark', size: 'lg', subbrand: 'a' },
      { theme: 'dark-hc', size: 'lg', subbrand: 'a' },
      { theme: 'light', size: 'sm', subbrand: 'b' },
      { theme: 'light-hc', size: 'sm', subbrand: 'b' },
      { theme: 'dark', size: 'sm', subbrand: 'b' },
      { theme: 'dark-hc', size: 'sm', subbrand: 'b' },
      { theme: 'light', size: 'md', subbrand: 'b' },
      { theme: 'light-hc', size: 'md', subbrand: 'b' },
      { theme: 'dark', size: 'md', subbrand: 'b' },
      { theme: 'dark-hc', size: 'md', subbrand: 'b' },
      { theme: 'light', size: 'lg', subbrand: 'b' },
      { theme: 'light-hc', size: 'lg', subbrand: 'b' },
      { theme: 'dark', size: 'lg', subbrand: 'b' },
      { theme: 'dark-hc', size: 'lg', subbrand: 'b' },
      { theme: 'light', size: 'sm', subbrand: 'c' },
      { theme: 'light-hc', size: 'sm', subbrand: 'c' },
      { theme: 'dark', size: 'sm', subbrand: 'c' },
      { theme: 'dark-hc', size: 'sm', subbrand: 'c' },
      { theme: 'light', size: 'md', subbrand: 'c' },
      { theme: 'light-hc', size: 'md', subbrand: 'c' },
      { theme: 'dark', size: 'md', subbrand: 'c' },
      { theme: 'dark-hc', size: 'md', subbrand: 'c' },
      { theme: 'light', size: 'lg', subbrand: 'c' },
      { theme: 'light-hc', size: 'lg', subbrand: 'c' },
      { theme: 'dark', size: 'lg', subbrand: 'c' },
      { theme: 'dark-hc', size: 'lg', subbrand: 'c' },
      { theme: 'light', size: 'sm', subbrand: 'd' },
      { theme: 'light-hc', size: 'sm', subbrand: 'd' },
      { theme: 'dark', size: 'sm', subbrand: 'd' },
      { theme: 'dark-hc', size: 'sm', subbrand: 'd' },
      { theme: 'light', size: 'md', subbrand: 'd' },
      { theme: 'light-hc', size: 'md', subbrand: 'd' },
      { theme: 'dark', size: 'md', subbrand: 'd' },
      { theme: 'dark-hc', size: 'md', subbrand: 'd' },
      { theme: 'light', size: 'lg', subbrand: 'd' },
      { theme: 'light-hc', size: 'lg', subbrand: 'd' },
      { theme: 'dark', size: 'lg', subbrand: 'd' },
      { theme: 'dark-hc', size: 'lg', subbrand: 'd' },
    ]);
  });
});
