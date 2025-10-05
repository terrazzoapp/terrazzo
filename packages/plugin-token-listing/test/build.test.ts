import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, type Logger, type Plugin, parse } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import listing, { type CustomFunctionParams, type ListedToken, type TokenListingPluginOptions } from '../src/index.js';

describe('token-listing plugin - Node.js API', () => {
  const mockLogger: Logger = {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    level: 'info' as const,
    debugScope: '',
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
    debugCount: 0,
    setLevel: vi.fn(),
    stats: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function setupTest(
    cwdPath: string,
    options: TokenListingPluginOptions,
    plugins: Plugin[] = [],
    inputSrc: object | undefined = undefined,
  ) {
    const cwd = new URL(cwdPath, import.meta.url);
    const config = defineConfig(
      {
        lint: {
          rules: {
            'core/consistent-naming': 'off',
          },
        },
        plugins: [...plugins, listing(options)],
      },
      { cwd },
    );
    const tokensJSON = new URL('./tokens.json', cwd);
    const { tokens, sources } = await parse(
      [{ filename: tokensJSON, src: inputSrc ?? fs.readFileSync(tokensJSON, 'utf8') }],
      {
        config,
      },
    );

    const result = await build(tokens, { sources, config, logger: mockLogger });
    const file = result.outputFiles.find((f) => f.filename === options.filename);
    expect(file).toBeTruthy();

    return JSON.parse(file!.contents.toString());
  }

  describe('base', () => {
    it('outputs DTCG fields like name, type, value', async () => {
      const options = {
        filename: 'actual.listing.json',
      };
      const output = await setupTest('./fixtures/build-default/', options);

      expect(Array.isArray(output.data)).toBe(true);
      const listed = output.data.find((d: any) => d.$name === 'base.color.neutral.1');
      expect(listed).toBeTruthy();
      expect(listed.$name).toBe('base.color.neutral.1');
      expect(listed.$type).toBe('color');
      expect(listed.$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [0.9176470588235294, 0.9333333333333333, 0.9490196078431372],
      });
      expect(listed.$deprecated).toBeUndefined();
    });

    it('outputs version and authoringTool in meta', async () => {
      const options = {
        filename: 'actual.listing.json',
      };
      const output = await setupTest('./fixtures/build-default/', options);

      expect(output.meta.version).toEqual(1);
      expect(output.meta.authoringTool).toEqual('Terrazzo');
    });
  });

  describe('mode', () => {
    it('outputs one listing entry for each mode of a token', async () => {
      const options = {
        filename: 'actual.listing.json',
        modes: [
          {
            name: 'theme',
            values: ['Light', 'Dark', 'Dark blue'],
            description: 'Color mode',
          },
        ],
      };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.filter((d: any) => d.$name === 'base.color.black');
      expect(listed.length).toBe(9);
      expect(listed[0].$extensions['app.terrazzo.listing'].mode).toBeUndefined();
      expect(listed[0].$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [0.12156862745098039, 0.13725490196078433, 0.1568627450980392],
      });

      expect(listed[1].$extensions['app.terrazzo.listing'].mode).toBe('light');
      expect(listed[1].$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [0.12156862745098039, 0.13725490196078433, 0.1568627450980392],
      });

      expect(listed[2].$extensions['app.terrazzo.listing'].mode).toBe('light-colorblind');
      expect(listed[2].$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [0.10588235294117647, 0.12156862745098039, 0.1411764705882353],
      });

      expect(listed[3].$extensions['app.terrazzo.listing'].mode).toBe('light-high-contrast');
      expect(listed[3].$value).toMatchObject({
        alpha: 1,
        colorSpace: 'srgb',
        components: [0.00392156862745098, 0.01568627450980392, 0.03529411764705882],
      });
    });

    it('outputs mode meta', async () => {
      const options = {
        filename: 'actual.listing.json',
        modes: [
          {
            name: 'theme',
            values: ['Light', 'Dark', 'Dark blue'],
            description: 'Color mode',
          },
        ],
      };
      const output = await setupTest('./fixtures/build-default/', options);

      expect(output.meta.modes).toEqual([
        {
          name: 'theme',
          values: ['Light', 'Dark', 'Dark blue'],
          description: 'Color mode',
        },
      ]);
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

      expect(output.meta.platforms).toMatchObject({
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
      expect(mockLogger.error).toHaveBeenCalledTimes(0);

      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].names.css).toEqual('--custom-base-color-black');
      expect(mockNameFn).toHaveBeenCalledTimes(1294);
    });

    it('outputs names after plugin logic when a plugin name is passed', async () => {
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name: '@terrazzo/plugin-css',
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options, [css({ filename: 'tokens.css' })]);
      expect(mockLogger.error).toHaveBeenCalledTimes(0);

      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].names.css).toEqual('--base-color-black');
    });

    it("outputs names after plugin logic when a plugin's format name is passed", async () => {
      const options = {
        filename: 'actual.listing.json',
        platforms: {
          css: {
            description: 'CSS variables',
            name: 'css',
          },
        },
      };
      const output = await setupTest('./fixtures/build-default/', options, [css({ filename: 'tokens.css' })]);
      expect(mockLogger.error).toHaveBeenCalledTimes(0);

      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].names.css).toEqual('--base-color-black');
    });

    it("throws an error if asked to use the naming logic of a plugin that hasn't been called", async () => {
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
      expect(mockLogger.error).toHaveBeenCalledTimes(1294);

      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].names.css).toBeUndefined();
    });

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

      expect(output.data.length).toBe(1294);
      expect(
        output.data
          .map((token: ListedToken) => token.$extensions['app.terrazzo.listing'].names.css)
          .filter((n: string | undefined) => n !== undefined).length,
      ).toBe(0);
      expect(filter).toHaveBeenCalledTimes(1294);
    });

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

      expect(output.data.length).toBe(1294);
      expect(
        output.data
          .map((token: ListedToken) => token.$extensions['app.terrazzo.listing'].names.css)
          .filter((n: string | undefined) => n !== undefined).length,
      ).toBe(0);
      expect(filter).toHaveBeenCalledTimes(1294);
    });

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

      expect(output.data.length).toBe(1294);
      expect(
        output.data
          .map((token: ListedToken) => token.$extensions['app.terrazzo.listing'].names.css)
          .filter((n: string | undefined) => n !== undefined).length,
      ).toBe(0);
      expect(name).toHaveBeenCalledTimes(1294);
      expect(filter).toHaveBeenCalledTimes(1294);
    });
  });

  describe('previewValue', () => {
    it('outputs preview values for color tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('#1f2328');
    });

    it('outputs preview values for dimension tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.find((d: any) => d.$name === 'base.size.32');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('32px');
    });

    it('outputs preview values for font-weight tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const src = await import(`dtcg-examples/figma-sds.json`).then((m) => m.default);
      const output = await setupTest('./fixtures/build-default/', options, [], src);

      const listed = output.data.find((d: any) => d.$name === 'typography.weight.extralight');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('200');
    });

    it('outputs preview values for font-size tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const src = await import(`dtcg-examples/figma-sds.json`).then((m) => m.default);
      const output = await setupTest('./fixtures/build-default/', options, [], src);

      const listed = output.data.find((d: any) => d.$name === 'typography.scale.04');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('1.25rem');
    });

    it('outputs preview values for font-family tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const src = await import(`dtcg-examples/figma-sds.json`).then((m) => m.default);
      const output = await setupTest('./fixtures/build-default/', options, [], src);

      const listed = output.data.find((d: any) => d.$name === 'typography.family.serif');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('"noto serif", serif');
    });

    it('outputs preview values for composite typography tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);

      const listed = output.data.find((d: any) => d.$name === 'text.subtitle.shorthand');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe(
        '400 20px/1.6 -apple-system, "BlinkMacSystemFont", "Segoe UI", "Noto Sans", "Helvetica", "Arial", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      );
    });

    it('calls a custom previewValue function when passed', async () => {
      const previewValue = vi.fn().mockImplementation(() => 'custom');
      const options = {
        filename: 'actual.listing.json',
        previewValue,
      };
      const output = await setupTest('./fixtures/build-default/', options);
      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].previewValue).toBe('custom');
      expect(previewValue).toHaveBeenCalledTimes(1294);
    });
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
      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].subtype).toBe('bgColor');
      expect(subtype).toHaveBeenCalledTimes(1294);
    });
  });

  describe('description', () => {
    it('outputs description', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);
      const listed = output.data.find((d: any) => d.$name === 'text.subtitle.shorthand');
      expect(listed.$description).toBe(
        'Page sections/sub headings, or less important object names in page titles (automated action titles, for example). Same line-height as title (medium).',
      );
    });
  });

  describe('deprecated', () => {
    it('outputs deprecated', async () => {
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
        },
      });
      expect(output.data.find((d: any) => d.$name === 'tokenOne').$deprecated).toBe(true);
      expect(output.data.find((d: any) => d.$name === 'tokenTwo').$deprecated).toBe(false);
      expect(output.data.find((d: any) => d.$name === 'tokenThree').$deprecated).toBeUndefined();
    });
  });

  describe('source', () => {
    it('outputs token source as computed by Terrazzo', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);
      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].source).toEqual({
        resource: expect.any(String),
        loc: {
          start: { line: expect.any(Number), column: expect.any(Number), offset: expect.any(Number) },
          end: { line: expect.any(Number), column: expect.any(Number), offset: expect.any(Number) },
        },
      });
    });

    it('respects resourceRoot option as absolute path to compute root of source URLs', async () => {
      const options = {
        filename: 'actual.listing.json',
        resourceRoot: fileURLToPath(new URL('./fixtures/', import.meta.url)),
      };
      const output = await setupTest('./fixtures/build-default/', options);
      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].source).toEqual({
        resource: 'file://<root>/build-default/tokens.json',
        loc: {
          start: { line: expect.any(Number), column: expect.any(Number), offset: expect.any(Number) },
          end: { line: expect.any(Number), column: expect.any(Number), offset: expect.any(Number) },
        },
      });
    });
  });

  describe('originalValue', () => {
    it('outputs the original value of tokens', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options);
      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(listed.$extensions['app.terrazzo.listing'].originalValue).toEqual({
        alpha: 1,
        colorSpace: 'srgb',
        components: [0.12156862745098039, 0.13725490196078433, 0.1568627450980392],
        hex: '#1f2328',
      });
    });

    it('takes modes and aliases into account when computing original values', async () => {
      const options = { filename: 'actual.listing.json' };
      const output = await setupTest('./fixtures/build-default/', options, [], {
        color: {
          $type: 'color',
          black: {
            $value: {
              colorSpace: 'srgb',
              components: [0.12156862745098039, 0.13725490196078433, 0.1568627450980392],
              alpha: 1,
              hex: '#1f2328',
            },
          },
          white: {
            $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1, hex: '#ffffff' },
          },
          semantic: {
            $value: '{color.white}',
            $extensions: {
              mode: {
                light: '{color.white}',
                dark: '{color.black}',
              },
            },
          },
        },
      });

      const lightListed = output.data.find(
        (d: any) => d.$name === 'color.semantic' && d.$extensions['app.terrazzo.listing'].mode === 'light',
      );
      expect(lightListed.$extensions['app.terrazzo.listing'].originalValue).toEqual('{color.white}');
      const darkListed = output.data.find(
        (d: any) => d.$name === 'color.semantic' && d.$extensions['app.terrazzo.listing'].mode === 'dark',
      );
      expect(darkListed.$extensions['app.terrazzo.listing'].originalValue).toEqual('{color.black}');
    });
  });

  describe('sourceOfTruth', () => {
    it('outputs default sot in meta if set', async () => {
      const options = { filename: 'actual.listing.json', sourceOfTruth: 'figma' };
      const output = await setupTest('./fixtures/build-default/', options);
      const listed = output.data.find((d: any) => d.$name === 'base.color.black');
      expect(output.meta.sourceOfTruth).toBe('figma');
      expect(listed.$extensions['app.terrazzo.listing'].sourceOfTruth).toBeUndefined();
    });

    it('outputs custom sot only for tokens that have a custom sot', async () => {
      const custom = vi.fn().mockImplementation(({ token }: CustomFunctionParams) => {
        if (token.id === 'tokenOne') {
          return 'other';
        }
      });
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
    });
  });
});
