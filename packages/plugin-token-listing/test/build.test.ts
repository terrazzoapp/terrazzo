import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import css from '@terrazzo/plugin-css';
import { build, defineConfig, parse, type Plugin } from '@terrazzo/parser';
import { describe, expect, it, vi } from 'vitest';
import listing, { type CustomFunctionParams, type ListedToken, type TokenListingPluginOptions } from '../src/index.js';

async function setupTest(
  cwdPath: string,
  options: TokenListingPluginOptions,
  plugins: Plugin[] = [],
  inputSrc: object | undefined = undefined,
) {
  const cwd = new URL(cwdPath, import.meta.url);
  const config = defineConfig({ plugins: [...plugins, listing(options)] }, { cwd });
  const tokensJSON = new URL('./tokens.json', cwd);
  const { tokens, sources } = await parse([{ filename: tokensJSON, src: inputSrc ?? fs.readFileSync(tokensJSON, 'utf8') }], {
    config,
  });

  const result = await build(tokens, { sources, config });
  const file = result.outputFiles.find((f) => f.filename === options.filename);
  expect(file).toBeTruthy();

  return JSON.parse(file!.contents.toString());
}

describe('token-listing plugin - Node.js API', () => {
  describe('base', () => {
    it('outputs DTCG fields like name, type, value', async () => {
      const options = {
        filename: 'actual.listing.json',
      }
      const output = await setupTest('./fixtures/build-default/', options);

      expect(Array.isArray(output.data)).toBe(true);
      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed).toBeTruthy();
      expect(listed.$name).toBe('Colors.Blue.1100');
      expect(listed.$type).toBe('color');
      expect(listed.$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [
          0.047058823529411764,
          0.4666666666666667,
          0.5725490196078431,
        ],
      });
      expect(listed.$deprecated).toBeUndefined();
    })
  
    it('outputs version and authoringTool in meta', async () => {
      const options = {
        filename: 'actual.listing.json',
      }
      const output = await setupTest('./fixtures/build-default/', options);

      expect(output.meta.version).toEqual(1);
      expect(output.meta.authoringTool).toEqual('Terrazzo');
    });
  });

  describe('mode', () => {
    it('outputs one listing entry for each mode of a token', async () => {
      const options = {
        filename: 'actual.listing.json',
        modes: [{
          name: 'theme',
          values: ['Light', 'Dark', 'Dark blue'],
          description: 'Color mode',
        }],
      };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.filter((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed.length).toBe(4);
      expect(listed[0].$extensions['app.terrazzo.listing'].mode).toBeUndefined();
      expect(listed[0].$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [
          0.047058823529411764,
          0.4666666666666667,
          0.5725490196078431,
        ],
      });
      
      expect(listed[1].$extensions['app.terrazzo.listing'].mode).toBe('Light');
      expect(listed[1].$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [
          0.047058823529411764,
          0.4666666666666667,
          0.5725490196078431,
        ],
      });
      
      expect(listed[2].$extensions['app.terrazzo.listing'].mode).toBe('Dark');
      expect(listed[2].$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [
          0.12549019607843137,
          0.8156862745098039,
          0.9529411764705882,
        ],
      });
      
      expect(listed[3].$extensions['app.terrazzo.listing'].mode).toBe('Dark blue');
      expect(listed[3].$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [
          0.12549019607843137,
          0.8156862745098039,
          0.9529411764705882,
        ],
      });
    });

    it('outputs mode meta', async () => {
      const options = {
        filename: 'actual.listing.json',
        modes: [{
          name: 'theme',
          values: ['Light', 'Dark', 'Dark blue'],
          description: 'Color mode',
        }],
      };
      const output = await setupTest('./fixtures/build-default/', options);

      expect(output.meta.modes).toEqual([{
        name: 'theme',
        values: ['Light', 'Dark', 'Dark blue'],
        description: 'Color mode',
      }]);
    });
  });
  
  describe('name', () => {
    it('outputs name descriptions in meta', async () => {
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name: '@terrazzo/plugin-css',
          },
          sass: {
            description: 'SASS getter functions',
            name: '@terrazzo/plugin-sass',
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options);

      expect(output.meta.names).toMatchObject({
        css: {
          description: 'CSS variables',
        },
        sass: {
          description: 'SASS getter functions',
        },
      });
    });

    it('outputs names for a token by calling the passed custom naming function', async () => {
      const mockNameFn = vi.fn().mockImplementation(({ token }) => `--custom-${token.id.replace(/\./g, '-')}`);
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name: mockNameFn,
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed.$extensions['app.terrazzo.listing'].names.css).toEqual('--custom-Colors-Blue-1100');
      expect(mockNameFn).toHaveBeenCalledTimes(328);
    })

    it('outputs names for a token by calling plugin logic when a plugin name is passed', async () => {
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name: '@terrazzo/plugin-css',
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options, [css({ filename: 'tokens.css'})]);

      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed.$extensions['app.terrazzo.listing'].names.css).toEqual('--colors-blue-1100');
    })

    it('does not output names using a plugin\'s naming logic if the plugin isn\'t called', async () => {
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name: '@terrazzo/plugin-css',
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed.$extensions['app.terrazzo.listing'].names.css).toBeUndefined();
    })

    it('filters names based on a custom filter function', async () => {
      const filter = vi.fn().mockReturnValue(false);
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name: '@terrazzo/plugin-css',
            filter,
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options);

      expect(output.data.length).toBe(328);
      expect(output.data.map((token: ListedToken) => token.$extensions['app.terrazzo.listing'].names.css).filter((n: string | undefined) => n !== undefined).length).toBe(0);
      expect(filter).toHaveBeenCalledTimes(328);
    })

    it('filters names based on plugin logic when a plugin name is passed', async () => {
      const filter = vi.fn().mockReturnValue(false);
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name: '@terrazzo/plugin-css',
            filter,
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options);

      expect(output.data.length).toBe(328);
      expect(output.data.map((token: ListedToken) => token.$extensions['app.terrazzo.listing'].names.css).filter((n: string | undefined) => n !== undefined).length).toBe(0);
      expect(filter).toHaveBeenCalledTimes(328);
    })

    it('never outputs names that cannot be computed even if filter returns true', async () => {
      const name = vi.fn().mockReturnValue(undefined);
      const filter = vi.fn().mockReturnValue(true);
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name,
            filter,
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options);

      expect(output.data.length).toBe(328);
      expect(output.data.map((token: ListedToken) => token.$extensions['app.terrazzo.listing'].names.css).filter((n: string | undefined) => n !== undefined).length).toBe(0);
      expect(name).toHaveBeenCalledTimes(328);
      expect(filter).toHaveBeenCalledTimes(328);
    })
  });
  
  describe('previewValue', () => {
    it('outputs preview values for color tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('#0c7792');
    })

    it('outputs preview values for dimension tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.find((d: any) => d.$name === 'Layout.Space.200');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('8px');
    })

    it('outputs preview values for font-weight tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const src = await import(`dtcg-examples/figma-sds.json`).then((m) => m.default);
      const output = await setupTest('./fixtures/ds-figma-sds/', options, [], src);

      const listed = output.data.find((d: any) => d.$name === 'typography.weight.extralight');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('200');
    })

    it('outputs preview values for font-size tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const src = await import(`dtcg-examples/figma-sds.json`).then((m) => m.default);
      const output = await setupTest('./fixtures/ds-figma-sds/', options, [], src);

      const listed = output.data.find((d: any) => d.$name === 'typography.scale.04');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('1.25rem');
    })

    it('outputs preview values for font-family tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const src = await import(`dtcg-examples/figma-sds.json`).then((m) => m.default);
      const output = await setupTest('./fixtures/ds-figma-sds/', options, [], src);

      const listed = output.data.find((d: any) => d.$name === 'typography.family.serif');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('"noto serif", serif');
    })

    it('outputs preview values for composite typography tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.find((d: any) => d.$name === 'Typography.type.300.bold');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('600 16px/24px "Instrument Sans"');
    })

    it('calls a custom previewValue function when passed', async () => {
      const previewValue = vi.fn().mockImplementation(() => 'custom');
      const options = {
        filename: 'actual.listing.json',
        previewValue,
      };
      const output = await setupTest('./fixtures/build-default/', options);
      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('custom');
      expect(previewValue).toHaveBeenCalledTimes(328);
    })
  });

  describe('subtype', () => {
    it('outputs subtypes when a subtype function is passed', async () => {
      const subtype = vi.fn().mockImplementation(({ token }: CustomFunctionParams) => {
        if (token.$type === 'color') {
          return 'bgColor';
        }
        return undefined;
      });
      const options = {
        filename: 'actual.listing.json',
        subtype,
      };
      const output = await setupTest('./fixtures/build-default/', options);
      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed.$extensions['app.terrazzo.listing'].subtype).toBe('bgColor');
      expect(subtype).toHaveBeenCalledTimes(328);
    })
  });

  describe('deprecated', () => {
    it('outputs subtypes when a subtype function is passed', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options, [], {
        tokenOne: {
          $type: 'color',
          $value: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 },
          $deprecated: true,
        },
        tokenTwo: {
          $type: 'color',
          $value: { colorSpace: 'srgb', components: [0, 1, 0], alpha: 1 },
          $deprecated: false,
        },
        tokenThree: {
          $type: 'color',
          $value: { colorSpace: 'srgb', components: [0, 0, 1], alpha: 1 },
        }
      });
      expect(output.data[0].$deprecated).toBe(true);
      expect(output.data[1].$deprecated).toBe(false);
      expect(output.data[2].$deprecated).toBeUndefined();
    })
  });

  describe('source', () => {
    it('outputs token source as computed by Terrazzo', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options)
      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(listed.$extensions['app.terrazzo.listing'].source).toEqual({
        resource: `file://${fileURLToPath(new URL('./fixtures/build-default/tokens.json', import.meta.url))}`,
        loc: {
          start: { line: expect.any(Number), column: expect.any(Number), offset: expect.any(Number) },
          end: { line: expect.any(Number), column: expect.any(Number), offset: expect.any(Number) },
        },
      });
    })
  });

  describe('sourceOfTruth', () => {
    it('outputs default sot in meta if set', async () => {
      const options = { filename: 'actual.listing.json', sourceOfTruth: 'figma' };
      const output = await setupTest('./fixtures/build-default/', options)
      const listed = output.data.find((d: any) => d.$name === 'Colors.Blue.1100');
      expect(output.meta.sourceOfTruth).toBe('figma');
      expect(listed.$extensions['app.terrazzo.listing'].sourceOfTruth).toBeUndefined();
    })

    it('outputs custom sot only for tokens that have a custom sot', async () => {
      const custom = vi.fn().mockImplementation(({ token }: CustomFunctionParams) => {
        if (token.id === 'tokenOne') {
          return 'other';
        }
      })
      const options = { filename: 'actual.listing.json', sourceOfTruth: { default: 'figma', custom } };
      const output = await setupTest('./fixtures/build-default/', options, [], {
        tokenOne: {
          $type: 'color',
          $value: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 },
        },
        tokenTwo: {
          $type: 'color',
          $value: { colorSpace: 'srgb', components: [0, 1, 0], alpha: 1 },
        },
      });
      expect(output.data[0].$extensions['app.terrazzo.listing'].sourceOfTruth).toBe('other');
      expect(output.data[1].$extensions['app.terrazzo.listing'].sourceOfTruth).toBeUndefined();
    })
  });
});
