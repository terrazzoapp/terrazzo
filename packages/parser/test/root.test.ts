import { describe, expect, it } from 'vitest';
import defineConfig from '../src/config.js';
import { parse } from '../src/index.js';

describe('$root tokens', () => {
  it('accepted alongside other properties', async () => {
    const filename = new URL('file:///');
    const src = {
      color: {
        background: {
          brand: {
            $root: { $type: 'color', $value: '{color.brand.800}' },
            hover: { $type: 'color', $value: '{color.brand.900}' },
            secondary: { $type: 'color', $value: '{color.brand.200}' },
            'secondary-hover': { $type: 'color', $value: '{color.brand.300}' },
            tertiary: { $type: 'color', $value: '{color.brand.100}' },
            'tertiary-hover': { $type: 'color', $value: '{color.brand.200}' },
          },
        },
        brand: {
          '100': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9607843137254902, 0.9607843137254902, 0.9607843137254902],
              alpha: 1,
              hex: '#f5f5f5',
            },
          },
          '200': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9019607843137255, 0.9019607843137255, 0.9019607843137255],
              alpha: 1,
              hex: '#e6e6e6',
            },
          },
          '300': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.8509803921568627, 0.8509803921568627, 0.8509803921568627],
              alpha: 1,
              hex: '#d9d9d9',
            },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.7019607843137254, 0.7019607843137254, 0.7019607843137254],
              alpha: 1,
              hex: '#b3b3b3',
            },
          },
          '500': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.4588235294117647, 0.4588235294117647, 0.4588235294117647],
              alpha: 1,
              hex: '#757575',
            },
          },
          '600': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.26666666666666666, 0.26666666666666666, 0.26666666666666666],
              alpha: 1,
              hex: '#444444',
            },
          },
          '700': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.2196078431372549, 0.2196078431372549, 0.2196078431372549],
              alpha: 1,
              hex: '#383838',
            },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.17254901960784313, 0.17254901960784313, 0.17254901960784313],
              alpha: 1,
              hex: '#2c2c2c',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.11764705882352941, 0.11764705882352941, 0.11764705882352941],
              alpha: 1,
              hex: '#1e1e1e',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.06666666666666667, 0.06666666666666667, 0.06666666666666667],
              alpha: 1,
              hex: '#111111',
            },
          },
        },
      },
    };
    const config = defineConfig({}, { cwd: new URL('file:///') });
    const { tokens } = await parse([{ filename, src }], { config });

    expect(Object.keys(tokens)).toContain('color.background.brand');

    expect(tokens['color.background.brand']).toEqual(
      expect.objectContaining({
        jsonID: '#/color/background/brand/$root',
        id: 'color.background.brand',
      }),
    );

    expect(tokens['color.brand.800']).toEqual(expect.objectContaining({ aliasedBy: ['color.background.brand'] }));
  });
});
