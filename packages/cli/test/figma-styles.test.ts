import { defineConfig, parse } from '@terrazzo/parser';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { effectStyle, getStyles, gridStyles, textStyle } from '../src/import/figma/styles.js';

const baseTextStyle = {
  fontFamily: 'Inter',
  fontStyle: 'Regular',
  fontWeight: 400,
  fontSize: 16,
  letterSpacing: 0,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('textStyle', () => {
  it.each([
    {
      name: 'pixels',
      style: {
        ...baseTextStyle,
        fontSize: 14,
        lineHeightUnit: 'PIXELS',
        lineHeightPx: 20,
        lineHeightPercentFontSize: 142.857,
      },
      expected: 20 / 14,
    },
    {
      name: 'font-size percent',
      style: {
        ...baseTextStyle,
        lineHeightUnit: 'FONT_SIZE_%',
        lineHeightPx: 24,
        lineHeightPercentFontSize: 150,
      },
      expected: 1.5,
    },
    {
      name: 'automatic',
      style: {
        ...baseTextStyle,
        lineHeightUnit: 'INTRINSIC_%',
        lineHeightPx: 24,
        lineHeightPercentFontSize: 150,
      },
      expected: 1.5,
    },
  ])('uses the $name line-height representation', ({ style, expected }) => {
    expect(textStyle({ style } as never)?.lineHeight).toBeCloseTo(expected);
  });

  it('omits Figma text semantics outside the DTCG typography contract', () => {
    const value = textStyle({
      style: {
        ...baseTextStyle,
        fontStyle: 'Semi Bold Italic',
        lineHeightUnit: 'PIXELS',
        lineHeightPx: 24,
        paragraphSpacing: 12,
        paragraphIndent: 4,
        listSpacing: 8,
        textCase: 'UPPER',
        textDecoration: 'STRIKETHROUGH',
      },
    } as never);

    expect(value).toEqual({
      fontFamily: ['Inter'],
      fontWeight: 400,
      fontSize: { value: 16, unit: 'px' },
      letterSpacing: { value: 0, unit: 'px' },
      lineHeight: 1.5,
    });
    expect(Object.keys(value!).toSorted()).toEqual(
      ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'].toSorted(),
    );
  });
});

describe('effectStyle', () => {
  it('keeps shadow effects and ignores valueless blur effects', () => {
    const value = effectStyle({
      effects: [
        { type: 'LAYER_BLUR', visible: true, radius: 8 },
        {
          type: 'DROP_SHADOW',
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 0.2 },
          blendMode: 'NORMAL',
          offset: { x: 0, y: 2 },
          radius: 4,
        },
      ],
    } as never);

    expect(value).toHaveLength(1);
    expect(value?.[0]).toEqual(
      expect.objectContaining({
        inset: false,
        blur: { value: 4, unit: 'px' },
      }),
    );
    expect(
      effectStyle({ effects: [{ type: 'LAYER_BLUR', visible: true, radius: 8 }] } as never),
    ).toBe(undefined);
  });
});

describe('gridStyles', () => {
  it('keeps section and gutter sizes distinct', () => {
    const value = gridStyles({
      layoutGrids: [
        {
          pattern: 'COLUMNS',
          sectionSize: 4,
          gutterSize: 20,
          visible: true,
          color: { r: 1, g: 0, b: 0, a: 0.1 },
          alignment: 'STRETCH',
          offset: 0,
          count: 5,
        },
      ],
    } as never);

    expect(value?.columns).toEqual({
      sectionSize: { $type: 'dimension', $value: { value: 4, unit: 'px' } },
      gutterSize: { $type: 'dimension', $value: { value: 20, unit: 'px' } },
      count: { $type: 'number', $value: 5 },
    });
  });
});

describe('getStyles', () => {
  it('omits styles that cannot produce a value', async () => {
    const fileKey = 'AaAaAaAaAaAaAaAaAa';
    const styleID = '1:1';
    vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const responses: Record<string, object> = {
        [`https://api.figma.com/v1/files/${fileKey}/styles`]: {
          error: false,
          status: 200,
          meta: {
            styles: [
              {
                key: 'blur-key',
                file_key: fileKey,
                node_id: styleID,
                style_type: 'EFFECT',
                name: 'blur/default',
                description: '',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                user: {},
              },
            ],
          },
        },
        [`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${styleID}`]: {
          nodes: {
            [styleID]: {
              document: {
                effects: [{ type: 'LAYER_BLUR', visible: true, radius: 8 }],
              },
            },
          },
        },
      };
      return Promise.resolve(Response.json(responses[input.toString()]));
    });
    const logger = {
      error: vi.fn(),
      warn() {},
      info() {},
      success() {},
    };

    const result = await getStyles(fileKey, { logger: logger as never });

    expect(result.code.sets.styles.sources[0]).toEqual({});
    expect(result.count).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Could not parse effect for blur/default' }),
    );
  });

  it('imports TEXT styles with the exact DTCG 2025.10 typography shape', async () => {
    const fileKey = 'BbBbBbBbBbBbBbBbBb';
    const styleID = '2:2';
    vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const responses: Record<string, object> = {
        [`https://api.figma.com/v1/files/${fileKey}/styles`]: {
          error: false,
          status: 200,
          meta: {
            styles: [
              {
                key: 'text-key',
                file_key: fileKey,
                node_id: styleID,
                style_type: 'TEXT',
                name: 'text/body',
                description: '',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                user: {},
              },
            ],
          },
        },
        [`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${styleID}`]: {
          nodes: {
            [styleID]: {
              document: {
                style: {
                  ...baseTextStyle,
                  fontStyle: 'Italic',
                  lineHeightUnit: 'PIXELS',
                  lineHeightPx: 24,
                  paragraphSpacing: 12,
                  paragraphIndent: 4,
                  listSpacing: 8,
                  textCase: 'UPPER',
                  textDecoration: 'UNDERLINE',
                },
              },
            },
          },
        },
      };
      return Promise.resolve(Response.json(responses[input.toString()]));
    });
    const logger = {
      error: vi.fn(),
      warn() {},
      info() {},
      success() {},
    };

    const result = await getStyles(fileKey, { logger: logger as never });
    const token = result.code.sets.styles.sources[0].text.body;

    expect(token.$type).toBe('typography');
    expect(token.$value).toEqual({
      fontFamily: ['Inter'],
      fontSize: { value: 16, unit: 'px' },
      fontWeight: 400,
      letterSpacing: { value: 0, unit: 'px' },
      lineHeight: 1.5,
    });
    expect(Object.keys(token.$value).toSorted()).toEqual(
      ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'].toSorted(),
    );
    expect(result.count).toBe(1);
  });
});

describe('DTCG validation', () => {
  it('produces parser-valid typography and shadow tokens', async () => {
    const typography = textStyle({
      style: {
        ...baseTextStyle,
        fontStyle: 'Italic',
        lineHeightUnit: 'FONT_SIZE_%',
        lineHeightPercentFontSize: 150,
        paragraphSpacing: 12,
        textCase: 'UPPER',
        textDecoration: 'UNDERLINE',
      },
    } as never);
    const shadow = effectStyle({
      effects: [
        {
          type: 'DROP_SHADOW',
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 0.2 },
          blendMode: 'NORMAL',
          offset: { x: 0, y: 2 },
          radius: 4,
        },
      ],
    } as never);

    const result = await parse(
      {
        filename: new URL('./figma-styles.tokens.json', import.meta.url),
        src: {
          typography: { $type: 'typography', $value: typography },
          shadow: { $type: 'shadow', $value: shadow },
        },
      },
      { config: defineConfig({}, { cwd: new URL(import.meta.url) }), skipLint: true },
    );

    expect(Object.keys(typography!).toSorted()).toEqual(
      ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'].toSorted(),
    );
    expect(result.tokens.typography?.$value).toEqual(typography);
    expect(result.tokens.shadow?.$value).toEqual(shadow);
  });
});
