import { afterEach, describe, expect, it, vi } from 'vitest';

import { importFromFigma } from '../src/import/figma/index.js';

const FILE_KEY = 'AaAaAaAaAaAaAaAaAa';
const FILE_URL = `https://www.figma.com/design/${FILE_KEY}/Import-Options`;
const STYLE_ID = '1:1';
const logger = { error() {}, warn() {}, info() {}, success() {} } as never;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('importFromFigma options', () => {
  it('preserves an explicit resolution order', async () => {
    const resolutionOrder = [
      { $ref: '#/modifiers/theme' },
      { $ref: '#/sets/foundation' },
      { $ref: '#/sets/styles' },
    ];

    const result = await importFromFigma({
      url: FILE_URL,
      logger,
      resolutionOrder,
      skipStyles: true,
      skipVariables: true,
    });

    expect(result.code.resolutionOrder).toEqual(resolutionOrder);
  });

  it('regenerates discovery order when explicit resolution order is empty', async () => {
    vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const responses: Record<string, object> = {
        [`https://api.figma.com/v1/files/${FILE_KEY}/styles`]: {
          error: false,
          status: 200,
          meta: {
            styles: [
              {
                key: 'published-style-key',
                file_key: FILE_KEY,
                node_id: STYLE_ID,
                style_type: 'EFFECT',
                name: 'elevation/default',
                description: '',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                user: {},
              },
            ],
          },
        },
        [`https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${STYLE_ID}`]: {
          nodes: {
            [STYLE_ID]: {
              document: {
                effects: [
                  {
                    type: 'DROP_SHADOW',
                    visible: true,
                    color: { r: 0, g: 0, b: 0, a: 0.25 },
                    blendMode: 'NORMAL',
                    offset: { x: 0, y: 2 },
                    radius: 4,
                  },
                ],
              },
            },
          },
        },
      };
      return Promise.resolve(Response.json(responses[input.toString()]));
    });

    const result = await importFromFigma({
      url: FILE_URL,
      logger,
      resolutionOrder: [],
      skipVariables: true,
    });

    expect(result.code.resolutionOrder).toEqual([{ $ref: '#/sets/styles' }]);
  });

  it.each([
    {
      name: 'published',
      unpublished: false,
      expectedURL: `https://api.figma.com/v1/files/${FILE_KEY}/styles`,
      unexpectedURL: `https://api.figma.com/v1/files/${FILE_KEY}`,
    },
    {
      name: 'unpublished',
      unpublished: true,
      expectedURL: `https://api.figma.com/v1/files/${FILE_KEY}`,
      unexpectedURL: `https://api.figma.com/v1/files/${FILE_KEY}/styles`,
    },
  ])('uses the $name Styles endpoint', async ({ unpublished, expectedURL, unexpectedURL }) => {
    vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');
    const localStyle = {
      key: 'local-style-key',
      name: 'elevation/default',
      description: '',
      remote: false,
      styleType: 'EFFECT',
    };
    const publishedStyle = {
      key: 'published-style-key',
      file_key: FILE_KEY,
      node_id: STYLE_ID,
      style_type: 'EFFECT',
      name: 'elevation/default',
      description: '',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      user: {},
    };
    const responses: Record<string, object> = {
      [`https://api.figma.com/v1/files/${FILE_KEY}`]: {
        styles: { [STYLE_ID]: localStyle },
      },
      [`https://api.figma.com/v1/files/${FILE_KEY}/styles`]: {
        error: false,
        status: 200,
        meta: { styles: [publishedStyle] },
      },
      [`https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${STYLE_ID}`]: {
        nodes: {
          [STYLE_ID]: {
            document: {
              effects: [
                {
                  type: 'DROP_SHADOW',
                  visible: true,
                  color: { r: 0, g: 0, b: 0, a: 0.25 },
                  blendMode: 'NORMAL',
                  offset: { x: 0, y: 2 },
                  radius: 4,
                },
              ],
            },
          },
        },
      },
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const response = responses[input.toString()];
      return Promise.resolve(Response.json(response));
    });

    const result = await importFromFigma({
      url: FILE_URL,
      logger,
      unpublished,
      skipVariables: true,
    });

    expect(result.styleCount).toBe(1);
    expect(result.code.sets.styles.sources[0].elevation.default).toEqual(
      expect.objectContaining({ $type: 'shadow' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(expectedURL, expect.any(Object));
    expect(fetchMock).not.toHaveBeenCalledWith(unexpectedURL, expect.any(Object));
  });
});
