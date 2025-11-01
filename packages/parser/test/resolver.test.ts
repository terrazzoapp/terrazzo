import { describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import parse from '../src/parse/index.js';
import createResolver from '../src/resolver/index.js';
import defineConfig from '../src/config.js';

describe('Resolver module', () => {
  const tests: [string, { given: any; want: any }][] = [
    [
      'errors on multiple resolvers',
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
          error: 'Found 2 resolvers',
        },
      },
    ],
  ];

  it.each(tests)('%s', async (_, { given, want }) => {
    const config = defineConfig({}, { cwd: new URL(import.meta.url) });
    if (want.error) {
      expect(async () => await parse(given, { config })).rejects.toThrowError(want.error);
      return;
    }

    const { tokens } = await parse(given, { config });
    expect(tokens).toEqual(want.tokens);
  });

  describe('Additional cases', () => {
    it('filesystem', async () => {
      const cwd = new URL('./test/fixtures/resolver/', import.meta.url);

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

      expect(tokens).toEqual({});

      const r = createResolver(resolver);
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

      expect(r.getAllInputPermutations()).toEqual([{ theme: 'light' }, { theme: 'dark' }]);

      expect(r.isValidInput({ theme: 'dark' })).toBe(true);
      expect(r.isValidInput({})).toBe(false);
      expect(r.isValidInput({ theme: 'foobar' })).toBe(false);
    });
  });
});
