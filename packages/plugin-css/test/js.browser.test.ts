import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import css from '../src/index.js';

describe('Browser', () => {
  it('generates correct CSS ', async () => {
    const config = defineConfig(
      {
        lint: { rules: { 'core/consistent-naming': 'off' } },
        plugins: [
          css({
            permutations: [
              {
                prepare: (css) => `[data-color-theme="light"] {\n  ${css}\n}`,
                input: { theme: 'light' },
              },
              {
                prepare: (css) => `@media (prefers-color-scheme: dark) {\n  :root {\n    ${css}\n  }\n}`,
                input: { theme: 'dark' },
              },
              {
                prepare: (css) => `[data-color-theme="dark"] {\n  ${css}\n}`,
                input: { theme: 'dark' },
              },
            ],
          }),
        ],
      },
      { cwd: new URL('http://localhost:8080') },
    );

    const { tokens, resolver, sources } = await parse(
      { filename: new URL(`fs://github-primer.resolver.json`), src: FIGMA_SDS },
      { config },
    );
    const result = await build(tokens, { resolver, sources, config });
    await expect(result.outputFiles.find((f) => f.filename === 'index.css')?.contents).toMatchSnapshot();
  });
});

const FIGMA_SDS = {
  $schema: 'https://www.designtokens.org/schemas/2025.10/resolver.json',
  name: 'Figma Simple Design System',
  version: '2025.10',
  resolutionOrder: [
    { $ref: '#/sets/color' },
    { $ref: '#/modifiers/theme' },
    { $ref: '#/sets/size' },
    { $ref: '#/sets/typography' },
  ],
  sets: {
    color: {
      sources: [{ $ref: '#/$defs/color.tokens.json' }],
    },
    size: {
      sources: [{ $ref: '#/$defs/size.tokens.json' }],
    },
    typography: {
      sources: [{ $ref: '#/$defs/typography.tokens.json' }],
    },
  },
  modifiers: {
    theme: {
      contexts: {
        light: [{ $ref: '#/$defs/theme-light.tokens.json' }],
        dark: [{ $ref: '#/$defs/theme-dark.tokens.json' }],
      },
      default: 'light',
    },
  },
  $defs: {
    'color.tokens.json': {
      $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
      color: {
        black: {
          '50': { $type: 'color' },
          '100': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.050980392156862744,
              hex: '#0c0c0d',
            },
          },
          '200': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.10196078431372549,
              hex: '#0c0c0d',
            },
          },
          '300': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.2,
              hex: '#0c0c0d',
            },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.4,
              hex: '#0c0c0d',
            },
          },
          '500': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.6980392156862745,
              hex: '#0c0c0d',
            },
          },
          '600': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.8,
              hex: '#0c0c0d',
            },
          },
          '700': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.8509803921568627,
              hex: '#0c0c0d',
            },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.8980392156862745,
              hex: '#0c0c0d',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              alpha: 0.9490196078431372,
              hex: '#0c0c0d',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.047058823529411764, 0.047058823529411764, 0.050980392156862744],
              hex: '#0c0c0d',
            },
          },
        },
        brand: {
          '100': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9607843137254902, 0.9607843137254902, 0.9607843137254902],
              hex: '#f5f5f5',
            },
          },
          '200': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9019607843137255, 0.9019607843137255, 0.9019607843137255],
              hex: '#e6e6e6',
            },
          },
          '300': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.8509803921568627, 0.8509803921568627, 0.8509803921568627],
              hex: '#d9d9d9',
            },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.7019607843137254, 0.7019607843137254, 0.7019607843137254],
              hex: '#b3b3b3',
            },
          },
          '500': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.4588235294117647, 0.4588235294117647, 0.4588235294117647],
              hex: '#757575',
            },
          },
          '600': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.26666666666666666, 0.26666666666666666, 0.26666666666666666],
              hex: '#444444',
            },
          },
          '700': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.2196078431372549, 0.2196078431372549, 0.2196078431372549],
              hex: '#383838',
            },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.17254901960784313, 0.17254901960784313, 0.17254901960784313],
              hex: '#2c2c2c',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.11764705882352941, 0.11764705882352941, 0.11764705882352941],
              hex: '#1e1e1e',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.06666666666666667, 0.06666666666666667, 0.06666666666666667],
              hex: '#111111',
            },
          },
        },
        gray: {
          '100': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9607843137254902, 0.9607843137254902, 0.9607843137254902],
              hex: '#f5f5f5',
            },
          },
          '200': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9019607843137255, 0.9019607843137255, 0.9019607843137255],
              hex: '#e6e6e6',
            },
          },
          '300': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.8509803921568627, 0.8509803921568627, 0.8509803921568627],
              hex: '#d9d9d9',
            },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.7019607843137254, 0.7019607843137254, 0.7019607843137254],
              hex: '#b3b3b3',
            },
          },
          '500': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.4588235294117647, 0.4588235294117647, 0.4588235294117647],
              hex: '#757575',
            },
          },
          '600': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.26666666666666666, 0.26666666666666666, 0.26666666666666666],
              hex: '#444444',
            },
          },
          '700': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.2196078431372549, 0.2196078431372549, 0.2196078431372549],
              hex: '#383838',
            },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.17254901960784313, 0.17254901960784313, 0.17254901960784313],
              hex: '#2c2c2c',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.11764705882352941, 0.11764705882352941, 0.11764705882352941],
              hex: '#1e1e1e',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.06666666666666667, 0.06666666666666667, 0.06666666666666667],
              hex: '#111111',
            },
          },
        },
        green: {
          '100': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [0.9215686274509803, 1, 0.9333333333333333], hex: '#ebffee' },
          },
          '200': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.8117647058823529, 0.9686274509803922, 0.8274509803921568],
              hex: '#cff7d3',
            },
          },
          '300': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.6862745098039216, 0.9568627450980393, 0.7764705882352941],
              hex: '#aff4c6',
            },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.5215686274509804, 0.8784313725490196, 0.6392156862745098],
              hex: '#85e0a3',
            },
          },
          '500': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.0784313725490196, 0.6823529411764706, 0.3607843137254902],
              hex: '#14ae5c',
            },
          },
          '600': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [0, 0.6, 0.3176470588235294], hex: '#009951' },
          },
          '700': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [0, 0.5019607843137255, 0.2627450980392157], hex: '#008043' },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.00784313725490196, 0.32941176470588235, 0.17647058823529413],
              hex: '#02542d',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.00784313725490196, 0.25098039215686274, 0.13725490196078433],
              hex: '#024023',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.023529411764705882, 0.17647058823529413, 0.10588235294117647],
              hex: '#062d1b',
            },
          },
        },
        pink: {
          '100': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9882352941176471, 0.9450980392156862, 0.9921568627450981],
              hex: '#fcf1fd',
            },
          },
          '200': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9803921568627451, 0.8823529411764706, 0.9803921568627451],
              hex: '#fae1fa',
            },
          },
          '300': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9607843137254902, 0.7529411764705882, 0.9372549019607843],
              hex: '#f5c0ef',
            },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9450980392156862, 0.6196078431372549, 0.8627450980392157],
              hex: '#f19edc',
            },
          },
          '500': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9176470588235294, 0.24705882352941178, 0.7215686274509804],
              hex: '#ea3fb8',
            },
          },
          '600': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.8431372549019608, 0.19607843137254902, 0.6588235294117647],
              hex: '#d732a8',
            },
          },
          '700': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.7294117647058823, 0.16470588235294117, 0.5725490196078431],
              hex: '#ba2a92',
            },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.5411764705882353, 0.13333333333333333, 0.43529411764705883],
              hex: '#8a226f',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.3411764705882353, 0.09411764705882353, 0.2901960784313726],
              hex: '#57184a',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.24705882352941178, 0.08235294117647059, 0.21176470588235294],
              hex: '#3f1536',
            },
          },
        },
        red: {
          '100': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.996078431372549, 0.9137254901960784, 0.9058823529411765],
              hex: '#fee9e7',
            },
          },
          '200': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9921568627450981, 0.8274509803921568, 0.8156862745098039],
              hex: '#fdd3d0',
            },
          },
          '300': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9882352941176471, 0.7019607843137254, 0.6784313725490196],
              hex: '#fcb3ad',
            },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9568627450980393, 0.4666666666666667, 0.41568627450980394],
              hex: '#f4776a',
            },
          },
          '500': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9254901960784314, 0.13333333333333333, 0.12156862745098039],
              hex: '#ec221f',
            },
          },
          '600': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.7529411764705882, 0.058823529411764705, 0.047058823529411764],
              hex: '#c00f0c',
            },
          },
          '700': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.5647058823529412, 0.043137254901960784, 0.03529411764705882],
              hex: '#900b09',
            },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.4117647058823529, 0.03137254901960784, 0.027450980392156862],
              hex: '#690807',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.30196078431372547, 0.043137254901960784, 0.0392156862745098],
              hex: '#4d0b0a',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.18823529411764706, 0.023529411764705882, 0.011764705882352941],
              hex: '#300603',
            },
          },
        },
        slate: {
          '100': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9529411764705882, 0.9529411764705882, 0.9529411764705882],
              hex: '#f3f3f3',
            },
          },
          '200': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.8901960784313725, 0.8901960784313725, 0.8901960784313725],
              hex: '#e3e3e3',
            },
          },
          '300': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.803921568627451, 0.803921568627451, 0.803921568627451],
              hex: '#cdcdcd',
            },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.6980392156862745, 0.6980392156862745, 0.6980392156862745],
              hex: '#b2b2b2',
            },
          },
          '500': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.5803921568627451, 0.5803921568627451, 0.5803921568627451],
              hex: '#949494',
            },
          },
          '600': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.4627450980392157, 0.4627450980392157, 0.4627450980392157],
              hex: '#767676',
            },
          },
          '700': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.35294117647058826, 0.35294117647058826, 0.35294117647058826],
              hex: '#5a5a5a',
            },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.2627450980392157, 0.2627450980392157, 0.2627450980392157],
              hex: '#434343',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.18823529411764706, 0.18823529411764706, 0.18823529411764706],
              hex: '#303030',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.1411764705882353, 0.1411764705882353, 0.1411764705882353],
              hex: '#242424',
            },
          },
        },
        white: {
          '100': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.050980392156862744, hex: '#ffffff' },
          },
          '200': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.10196078431372549, hex: '#ffffff' },
          },
          '300': { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.2, hex: '#ffffff' } },
          '400': { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.4, hex: '#ffffff' } },
          '500': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.6980392156862745, hex: '#ffffff' },
          },
          '600': { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.8, hex: '#ffffff' } },
          '700': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.8509803921568627, hex: '#ffffff' },
          },
          '800': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.8980392156862745, hex: '#ffffff' },
          },
          '900': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.9490196078431372, hex: '#ffffff' },
          },
          '1000': { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 1, 1], hex: '#ffffff' } },
        },
        yellow: {
          '100': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 0.984313725490196, 0.9215686274509803], hex: '#fffbeb' },
          },
          '200': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 0.9450980392156862, 0.7607843137254902], hex: '#fff1c2' },
          },
          '300': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 0.9098039215686274, 0.6392156862745098], hex: '#ffe8a3' },
          },
          '400': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.9098039215686274, 0.7254901960784313, 0.19215686274509805],
              hex: '#e8b931',
            },
          },
          '500': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [0.8980392156862745, 0.6274509803921569, 0], hex: '#e5a000' },
          },
          '600': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.7490196078431373, 0.41568627450980394, 0.00784313725490196],
              hex: '#bf6a02',
            },
          },
          '700': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.592156862745098, 0.3176470588235294, 0.00784313725490196],
              hex: '#975102',
            },
          },
          '800': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.40784313725490196, 0.17647058823529413, 0.011764705882352941],
              hex: '#682d03',
            },
          },
          '900': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.3215686274509804, 0.1450980392156863, 0.01568627450980392],
              hex: '#522504',
            },
          },
          '1000': {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.25098039215686274, 0.10588235294117647, 0.00392156862745098],
              hex: '#401b01',
            },
          },
        },
      },
    },
    'size.tokens.json': {
      $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
      size: {
        blur: { '100': { $type: 'dimension', $value: { value: 0.25, unit: 'rem' } } },
        depth: {
          '0': { $type: 'dimension', $value: { value: 0, unit: 'rem' } },
          '025': { $type: 'dimension', $value: { value: 0.0625, unit: 'rem' } },
          '100': { $type: 'dimension', $value: { value: 0.25, unit: 'rem' } },
          '200': { $type: 'dimension', $value: { value: 0.5, unit: 'rem' } },
          '400': { $type: 'dimension', $value: { value: 1, unit: 'rem' } },
          '800': { $type: 'dimension', $value: { value: 2, unit: 'rem' } },
          '1200': { $type: 'dimension', $value: { value: 3, unit: 'rem' } },
          'negative-025': { $type: 'dimension', $value: { value: -0.0625, unit: 'rem' } },
          'negative-100': { $type: 'dimension', $value: { value: -0.25, unit: 'rem' } },
          'negative-200': { $type: 'dimension', $value: { value: -0.5, unit: 'rem' } },
          'negative-400': { $type: 'dimension', $value: { value: -1, unit: 'rem' } },
          'negative-800': { $type: 'dimension', $value: { value: -2, unit: 'rem' } },
          'negative-1200': { $type: 'dimension', $value: { value: -3, unit: 'rem' } },
        },
        icon: {
          small: { $type: 'dimension', $value: { value: 1.5, unit: 'rem' } },
          medium: { $type: 'dimension', $value: { value: 2, unit: 'rem' } },
          large: { $type: 'dimension', $value: { value: 2.5, unit: 'rem' } },
        },
        radius: {
          '100': { $type: 'dimension', $value: { value: 0.25, unit: 'rem' } },
          '200': { $type: 'dimension', $value: { value: 0.5, unit: 'rem' } },
          '400': { $type: 'dimension', $value: { value: 1, unit: 'rem' } },
          full: { $type: 'dimension', $value: { value: 624.9375, unit: 'rem' } },
        },
        space: {
          '0': { $type: 'dimension', $value: { value: 0, unit: 'rem' } },
          '050': { $type: 'dimension', $value: { value: 0.125, unit: 'rem' } },
          '100': { $type: 'dimension', $value: { value: 0.25, unit: 'rem' } },
          '150': { $type: 'dimension', $value: { value: 0.375, unit: 'rem' } },
          '200': { $type: 'dimension', $value: { value: 0.5, unit: 'rem' } },
          '300': { $type: 'dimension', $value: { value: 0.75, unit: 'rem' } },
          '400': { $type: 'dimension', $value: { value: 1, unit: 'rem' } },
          '600': { $type: 'dimension', $value: { value: 1.5, unit: 'rem' } },
          '800': { $type: 'dimension', $value: { value: 2, unit: 'rem' } },
          '1200': { $type: 'dimension', $value: { value: 3, unit: 'rem' } },
          '1600': { $type: 'dimension', $value: { value: 4, unit: 'rem' } },
          '2400': { $type: 'dimension', $value: { value: 6, unit: 'rem' } },
          '4000': { $type: 'dimension', $value: { value: 0, unit: 'rem' } },
          'negative-100': { $type: 'dimension', $value: { value: -0.25, unit: 'rem' } },
          'negative-200': { $type: 'dimension', $value: { value: -0.5, unit: 'rem' } },
          'negative-300': { $type: 'dimension', $value: { value: -0.75, unit: 'rem' } },
          'negative-400': { $type: 'dimension', $value: { value: -1, unit: 'rem' } },
          'negative-600': { $type: 'dimension', $value: { value: -1.5, unit: 'rem' } },
        },
        stroke: {
          border: { $type: 'dimension', $value: { value: 0.0625, unit: 'rem' } },
          'focus-ring': { $type: 'dimension', $value: { value: 0.125, unit: 'rem' } },
        },
      },
    },
    'theme-dark.tokens.json': {
      $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
      color: {
        background: {
          brand: {
            $root: { $type: 'color', $value: '{color.white.100}' },
            hover: { $type: 'color', $value: '{color.brand.300}' },
            secondary: { $type: 'color', $value: '{color.brand.600}' },
            'secondary-hover': { $type: 'color', $value: '{color.brand.500}' },
            tertiary: { $type: 'color', $value: '{color.brand.600}' },
            'tertiary-hover': { $type: 'color', $value: '{color.brand.800}' },
          },
          danger: {
            $root: { $type: 'color', $value: '{color.red.600}' },
            hover: { $type: 'color', $value: '{color.red.700}' },
            secondary: { $type: 'color', $value: '{color.red.800}' },
            'secondary-hover': { $type: 'color', $value: '{color.red.900}' },
            tertiary: { $type: 'color', $value: '{color.red.900}' },
            'tertiary-hover': { $type: 'color', $value: '{color.red.1000}' },
          },
          default: {
            $root: { $type: 'color', $value: '{color.gray.900}' },
            hover: { $type: 'color', $value: '{color.gray.700}' },
            secondary: { $type: 'color', $value: '{color.gray.800}' },
            'secondary-hover': { $type: 'color', $value: '{color.gray.900}' },
            tertiary: { $type: 'color', $value: '{color.gray.600}' },
            'tertiary-hover': { $type: 'color', $value: '{color.gray.700}' },
          },
          disabled: { $root: { $type: 'color', $value: '{color.brand.700}' } },
          neutral: {
            $root: { $type: 'color', $value: '{color.slate.400}' },
            hover: { $type: 'color', $value: '{color.slate.500}' },
            secondary: { $type: 'color', $value: '{color.slate.900}' },
            'secondary-hover': { $type: 'color', $value: '{color.slate.1000}' },
            tertiary: { $type: 'color', $value: '{color.slate.900}' },
            'tertiary-hover': { $type: 'color', $value: '{color.slate.1000}' },
          },
          positive: {
            $root: { $type: 'color', $value: '{color.green.700}' },
            hover: { $type: 'color', $value: '{color.green.800}' },
            secondary: { $type: 'color', $value: '{color.green.800}' },
            'secondary-hover': { $type: 'color', $value: '{color.green.900}' },
            tertiary: { $type: 'color', $value: '{color.green.900}' },
            'tertiary-hover': { $type: 'color', $value: '{color.green.1000}' },
          },
          warning: {
            $root: { $type: 'color', $value: '{color.yellow.400}' },
            hover: { $type: 'color', $value: '{color.yellow.500}' },
            secondary: { $type: 'color', $value: '{color.yellow.800}' },
            'secondary-hover': { $type: 'color', $value: '{color.yellow.900}' },
            tertiary: { $type: 'color', $value: '{color.yellow.900}' },
            'tertiary-hover': { $type: 'color', $value: '{color.yellow.1000}' },
          },
        },
        border: {
          brand: {
            $root: { $type: 'color', $value: '{color.brand.100}' },
            secondary: { $type: 'color', $value: '{color.brand.300}' },
            tertiary: { $type: 'color', $value: '{color.brand.400}' },
          },
          danger: {
            $root: { $type: 'color', $value: '{color.red.200}' },
            secondary: { $type: 'color', $value: '{color.red.400}' },
            tertiary: { $type: 'color', $value: '{color.red.500}' },
          },
          default: {
            $root: { $type: 'color', $value: '{color.gray.600}' },
            secondary: { $type: 'color', $value: '{color.gray.500}' },
            tertiary: { $type: 'color', $value: '{color.gray.400}' },
          },
          disabled: { $root: { $type: 'color', $value: '{color.brand.600}' } },
          neutral: {
            $root: { $type: 'color', $value: '{color.slate.100}' },
            secondary: { $type: 'color', $value: '{color.slate.500}' },
            tertiary: { $type: 'color', $value: '{color.slate.600}' },
          },
          positive: {
            $root: { $type: 'color', $value: '{color.green.200}' },
            secondary: { $type: 'color', $value: '{color.green.400}' },
            tertiary: { $type: 'color', $value: '{color.green.600}' },
          },
          warning: {
            $root: { $type: 'color', $value: '{color.yellow.200}' },
            secondary: { $type: 'color', $value: '{color.yellow.400}' },
            tertiary: { $type: 'color', $value: '{color.yellow.600}' },
          },
        },
        icon: {
          brand: {
            $root: { $type: 'color', $value: '{color.brand.100}' },
            secondary: { $type: 'color', $value: '{color.brand.300}' },
            tertiary: { $type: 'color', $value: '{color.brand.400}' },
            'on-brand': { $type: 'color', $value: '{color.brand.900}' },
            'on-brand-secondary': { $type: 'color', $value: '{color.brand.100}' },
            'on-brand-tertiary': { $type: 'color', $value: '{color.brand.100}' },
          },
          danger: {
            $root: { $type: 'color', $value: '{color.red.200}' },
            secondary: { $type: 'color', $value: '{color.red.400}' },
            tertiary: { $type: 'color', $value: '{color.red.500}' },
            'on-danger': { $type: 'color', $value: '{color.red.100}' },
            'on-danger-secondary': { $type: 'color', $value: '{color.red.100}' },
            'on-danger-tertiary': { $type: 'color', $value: '{color.red.100}' },
          },
          default: {
            $root: { $type: 'color', $value: '{color.white.1000}' },
            secondary: { $type: 'color', $value: '{color.white.500}' },
            tertiary: { $type: 'color', $value: '{color.white.400}' },
          },
          disabled: {
            $root: { $type: 'color', $value: '{color.brand.500}' },
            'on-disabled': { $type: 'color', $value: '{color.brand.400}' },
          },
          neutral: {
            $root: { $type: 'color', $value: '{color.slate.200}' },
            secondary: { $type: 'color', $value: '{color.slate.300}' },
            tertiary: { $type: 'color', $value: '{color.slate.400}' },
            'on-neutral': { $type: 'color', $value: '{color.slate.1000}' },
            'on-neutral-secondary': { $type: 'color', $value: '{color.slate.100}' },
            'on-neutral-tertiary': { $type: 'color', $value: '{color.slate.100}' },
          },
          positive: {
            $root: { $type: 'color', $value: '{color.green.200}' },
            secondary: { $type: 'color', $value: '{color.green.400}' },
            tertiary: { $type: 'color', $value: '{color.green.600}' },
            'on-positive': { $type: 'color', $value: '{color.green.100}' },
            'on-positive-secondary': { $type: 'color', $value: '{color.green.100}' },
            'on-positive-tertiary': { $type: 'color', $value: '{color.green.100}' },
          },
          warning: {
            $root: { $type: 'color', $value: '{color.yellow.200}' },
            secondary: { $type: 'color', $value: '{color.yellow.400}' },
            tertiary: { $type: 'color', $value: '{color.yellow.600}' },
            'on-warning': { $type: 'color', $value: '{color.yellow.1000}' },
            'on-warning-secondary': { $type: 'color', $value: '{color.yellow.100}' },
            'on-warning-tertiary': { $type: 'color', $value: '{color.yellow.100}' },
          },
        },
        text: {
          brand: {
            $root: { $type: 'color', $value: '{color.brand.100}' },
            secondary: { $type: 'color', $value: '{color.brand.300}' },
            tertiary: { $type: 'color', $value: '{color.brand.400}' },
            'on-brand': { $type: 'color', $value: '{color.brand.900}' },
            'on-brand-secondary': { $type: 'color', $value: '{color.brand.100}' },
            'on-brand-tertiary': { $type: 'color', $value: '{color.brand.100}' },
          },
          danger: {
            $root: { $type: 'color', $value: '{color.red.200}' },
            secondary: { $type: 'color', $value: '{color.red.400}' },
            tertiary: { $type: 'color', $value: '{color.red.500}' },
            'on-danger': { $type: 'color', $value: '{color.red.100}' },
            'on-danger-secondary': { $type: 'color', $value: '{color.red.100}' },
            'on-danger-tertiary': { $type: 'color', $value: '{color.red.100}' },
          },
          default: {
            $root: { $type: 'color', $value: '{color.white.1000}' },
            secondary: { $type: 'color', $value: '{color.white.500}' },
            tertiary: { $type: 'color', $value: '{color.white.400}' },
          },
          disabled: {
            $root: { $type: 'color', $value: '{color.brand.500}' },
            'on-disabled': { $type: 'color', $value: '{color.brand.400}' },
          },
          neutral: {
            $root: { $type: 'color', $value: '{color.slate.200}' },
            'on-neutral': { $type: 'color', $value: '{color.slate.1000}' },
            'on-neutral-secondary': { $type: 'color', $value: '{color.slate.100}' },
            'on-neutral-tertiary': { $type: 'color', $value: '{color.slate.100}' },
            secondary: { $type: 'color', $value: '{color.slate.300}' },
            tertiary: { $type: 'color', $value: '{color.slate.400}' },
          },
          positive: {
            $root: { $type: 'color', $value: '{color.green.200}' },
            secondary: { $type: 'color', $value: '{color.green.400}' },
            tertiary: { $type: 'color', $value: '{color.green.600}' },
            'on-positive': { $type: 'color', $value: '{color.green.100}' },
            'on-positive-secondary': { $type: 'color', $value: '{color.green.100}' },
            'on-positive-tertiary': { $type: 'color', $value: '{color.green.100}' },
          },
          warning: {
            $root: { $type: 'color', $value: '{color.yellow.200}' },
            secondary: { $type: 'color', $value: '{color.yellow.400}' },
            tertiary: { $type: 'color', $value: '{color.yellow.600}' },
            'on-warning': { $type: 'color', $value: '{color.yellow.1000}' },
            'on-warning-secondary': { $type: 'color', $value: '{color.yellow.100}' },
            'on-warning-tertiary': { $type: 'color', $value: '{color.yellow.100}' },
          },
        },
      },
    },
    'theme-light.tokens.json': {
      $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
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
          danger: {
            $root: { $type: 'color', $value: '{color.red.500}' },
            hover: { $type: 'color', $value: '{color.red.600}' },
            secondary: { $type: 'color', $value: '{color.red.200}' },
            'secondary-hover': { $type: 'color', $value: '{color.red.300}' },
            tertiary: { $type: 'color', $value: '{color.red.100}' },
            'tertiary-hover': { $type: 'color', $value: '{color.red.200}' },
          },
          default: {
            $root: { $type: 'color', $value: '{color.white.1000}' },
            hover: { $type: 'color', $value: '{color.gray.100}' },
            secondary: { $type: 'color', $value: '{color.gray.100}' },
            'secondary-hover': { $type: 'color', $value: '{color.gray.200}' },
            tertiary: { $type: 'color', $value: '{color.gray.300}' },
            'tertiary-hover': { $type: 'color', $value: '{color.gray.400}' },
          },
          disabled: { $root: { $type: 'color', $value: '{color.brand.300}' } },
          neutral: {
            $root: { $type: 'color', $value: '{color.slate.700}' },
            hover: { $type: 'color', $value: '{color.slate.800}' },
            secondary: { $type: 'color', $value: '{color.slate.300}' },
            'secondary-hover': { $type: 'color', $value: '{color.slate.400}' },
            tertiary: { $type: 'color', $value: '{color.slate.200}' },
            'tertiary-hover': { $type: 'color', $value: '{color.slate.300}' },
          },
          positive: {
            $root: { $type: 'color', $value: '{color.green.500}' },
            hover: { $type: 'color', $value: '{color.green.600}' },
            secondary: { $type: 'color', $value: '{color.green.200}' },
            'secondary-hover': { $type: 'color', $value: '{color.green.300}' },
            tertiary: { $type: 'color', $value: '{color.green.100}' },
            'tertiary-hover': { $type: 'color', $value: '{color.green.200}' },
          },
          warning: {
            $root: { $type: 'color', $value: '{color.yellow.400}' },
            hover: { $type: 'color', $value: '{color.yellow.500}' },
            secondary: { $type: 'color', $value: '{color.yellow.200}' },
            'secondary-hover': { $type: 'color', $value: '{color.yellow.300}' },
            tertiary: { $type: 'color', $value: '{color.yellow.100}' },
            'tertiary-hover': { $type: 'color', $value: '{color.yellow.200}' },
          },
        },
        border: {
          brand: {
            $root: { $type: 'color', $value: '{color.brand.800}' },
            secondary: { $type: 'color', $value: '{color.brand.600}' },
            tertiary: { $type: 'color', $value: '{color.brand.500}' },
          },
          danger: {
            $root: { $type: 'color', $value: '{color.red.700}' },
            secondary: { $type: 'color', $value: '{color.red.600}' },
            tertiary: { $type: 'color', $value: '{color.red.500}' },
          },
          default: {
            $root: { $type: 'color', $value: '{color.gray.300}' },
            secondary: { $type: 'color', $value: '{color.gray.500}' },
            tertiary: { $type: 'color', $value: '{color.gray.700}' },
          },
          disabled: { $root: { $type: 'color', $value: '{color.brand.400}' } },
          neutral: {
            $root: { $type: 'color', $value: '{color.slate.900}' },
            secondary: { $type: 'color', $value: '{color.slate.600}' },
            tertiary: { $type: 'color', $value: '{color.slate.400}' },
          },
          positive: {
            $root: { $type: 'color', $value: '{color.green.800}' },
            secondary: { $type: 'color', $value: '{color.green.600}' },
            tertiary: { $type: 'color', $value: '{color.green.500}' },
          },
          warning: {
            $root: { $type: 'color', $value: '{color.yellow.900}' },
            secondary: { $type: 'color', $value: '{color.yellow.700}' },
            tertiary: { $type: 'color', $value: '{color.yellow.600}' },
          },
        },
        icon: {
          brand: {
            $root: { $type: 'color', $value: '{color.brand.800}' },
            secondary: { $type: 'color', $value: '{color.brand.600}' },
            tertiary: { $type: 'color', $value: '{color.brand.500}' },
            'on-brand': { $type: 'color', $value: '{color.brand.100}' },
            'on-brand-secondary': { $type: 'color', $value: '{color.brand.900}' },
            'on-brand-tertiary': { $type: 'color', $value: '{color.brand.800}' },
          },
          danger: {
            $root: { $type: 'color', $value: '{color.red.700}' },
            secondary: { $type: 'color', $value: '{color.red.600}' },
            tertiary: { $type: 'color', $value: '{color.red.500}' },
            'on-danger': { $type: 'color', $value: '{color.red.100}' },
            'on-danger-secondary': { $type: 'color', $value: '{color.red.700}' },
            'on-danger-tertiary': { $type: 'color', $value: '{color.red.700}' },
          },
          default: {
            $root: { $type: 'color', $value: '{color.gray.900}' },
            secondary: { $type: 'color', $value: '{color.gray.500}' },
            tertiary: { $type: 'color', $value: '{color.gray.400}' },
          },
          disabled: {
            $root: { $type: 'color', $value: '{color.brand.400}' },
            'on-disabled': { $type: 'color', $value: '{color.brand.400}' },
          },
          neutral: {
            $root: { $type: 'color', $value: '{color.slate.900}' },
            secondary: { $type: 'color', $value: '{color.slate.700}' },
            tertiary: { $type: 'color', $value: '{color.slate.600}' },
            'on-neutral': { $type: 'color', $value: '{color.slate.100}' },
            'on-neutral-secondary': { $type: 'color', $value: '{color.slate.900}' },
            'on-neutral-tertiary': { $type: 'color', $value: '{color.slate.800}' },
          },
          positive: {
            $root: { $type: 'color', $value: '{color.green.800}' },
            secondary: { $type: 'color', $value: '{color.green.600}' },
            tertiary: { $type: 'color', $value: '{color.green.500}' },
            'on-positive': { $type: 'color', $value: '{color.green.100}' },
            'on-positive-secondary': { $type: 'color', $value: '{color.green.800}' },
            'on-positive-tertiary': { $type: 'color', $value: '{color.green.500}' },
          },
          warning: {
            $root: { $type: 'color', $value: '{color.yellow.900}' },
            secondary: { $type: 'color', $value: '{color.yellow.700}' },
            tertiary: { $type: 'color', $value: '{color.yellow.600}' },
            'on-warning': { $type: 'color', $value: '{color.yellow.1000}' },
            'on-warning-secondary': { $type: 'color', $value: '{color.yellow.800}' },
            'on-warning-tertiary': { $type: 'color', $value: '{color.yellow.900}' },
          },
        },
        text: {
          brand: {
            $root: { $type: 'color', $value: '{color.brand.800}' },
            secondary: { $type: 'color', $value: '{color.brand.600}' },
            tertiary: { $type: 'color', $value: '{color.brand.500}' },
            'on-brand': { $type: 'color', $value: '{color.brand.100}' },
            'on-brand-secondary': { $type: 'color', $value: '{color.brand.900}' },
            'on-brand-tertiary': { $type: 'color', $value: '{color.brand.800}' },
          },
          danger: {
            $root: { $type: 'color', $value: '{color.red.700}' },
            secondary: { $type: 'color', $value: '{color.red.600}' },
            tertiary: { $type: 'color', $value: '{color.red.500}' },
            'on-danger': { $type: 'color', $value: '{color.red.100}' },
            'on-danger-secondary': { $type: 'color', $value: '{color.red.700}' },
            'on-danger-tertiary': { $type: 'color', $value: '{color.red.700}' },
          },
          default: {
            $root: { $type: 'color', $value: '{color.gray.900}' },
            secondary: { $type: 'color', $value: '{color.gray.500}' },
            tertiary: { $type: 'color', $value: '{color.gray.400}' },
          },
          disabled: {
            $root: { $type: 'color', $value: '{color.brand.400}' },
            'on-disabled': { $type: 'color', $value: '{color.brand.400}' },
          },
          neutral: {
            $root: { $type: 'color', $value: '{color.slate.900}' },
            'on-neutral': { $type: 'color', $value: '{color.slate.100}' },
            'on-neutral-secondary': { $type: 'color', $value: '{color.slate.900}' },
            'on-neutral-tertiary': { $type: 'color', $value: '{color.slate.800}' },
            secondary: { $type: 'color', $value: '{color.slate.700}' },
            tertiary: { $type: 'color', $value: '{color.slate.600}' },
          },
          positive: {
            $root: { $type: 'color', $value: '{color.green.800}' },
            secondary: { $type: 'color', $value: '{color.green.600}' },
            tertiary: { $type: 'color', $value: '{color.green.500}' },
            'on-positive': { $type: 'color', $value: '{color.green.100}' },
            'on-positive-secondary': { $type: 'color', $value: '{color.green.800}' },
            'on-positive-tertiary': { $type: 'color', $value: '{color.green.800}' },
          },
          warning: {
            $root: { $type: 'color', $value: '{color.yellow.900}' },
            secondary: { $type: 'color', $value: '{color.yellow.700}' },
            tertiary: { $type: 'color', $value: '{color.yellow.600}' },
            'on-warning': { $type: 'color', $value: '{color.yellow.1000}' },
            'on-warning-secondary': { $type: 'color', $value: '{color.yellow.800}' },
            'on-warning-tertiary': { $type: 'color', $value: '{color.yellow.900}' },
          },
        },
      },
    },
    'typography.tokens.json': {
      $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
      typography: {
        titleHero: {
          $type: 'typography',
          $value: {
            fontFamily: '{typography.family.sans}',
            fontSize: '{typography.scale.10}',
            fontWeight: '{typography.weight.bold}',
            letterSpacing: { value: 0, unit: 'em' },
            lineHeight: 1,
          },
        },
        titlePage: {
          small: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.07}',
              fontWeight: '{typography.weight.bold}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          base: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.08}',
              fontWeight: '{typography.weight.bold}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          large: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.09}',
              fontWeight: '{typography.weight.bold}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
        },
        subtitle: {
          small: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.05}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          base: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.06}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          large: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.07}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
        },
        heading: {
          small: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.04}',
              fontWeight: '{typography.weight.semibold}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          base: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.05}',
              fontWeight: '{typography.weight.semibold}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          large: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.06}',
              fontWeight: '{typography.weight.semibold}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
        },
        subheading: {
          small: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.03}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          base: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.04}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          large: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.05}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
        },
        body: {
          small: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.02}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          medium: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.03}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          large: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.sans}',
              fontSize: '{typography.scale.04}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
        },
        code: {
          small: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.mono}',
              fontSize: '{typography.scale.02}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          medium: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.mono}',
              fontSize: '{typography.scale.03}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
          large: {
            $type: 'typography',
            $value: {
              fontFamily: '{typography.family.mono}',
              fontSize: '{typography.scale.04}',
              fontWeight: '{typography.weight.regular}',
              letterSpacing: { value: 0, unit: 'em' },
              lineHeight: 1,
            },
          },
        },
        family: {
          mono: { $type: 'fontFamily', $value: ['roboto mono', 'monospace'] },
          sans: { $type: 'fontFamily', $value: ['inter', 'sans-serif'] },
          serif: { $type: 'fontFamily', $value: ['noto serif', 'serif'] },
        },
        scale: {
          '01': { $type: 'dimension', $value: { value: 0.75, unit: 'rem' } },
          '02': { $type: 'dimension', $value: { value: 0.875, unit: 'rem' } },
          '03': { $type: 'dimension', $value: { value: 1, unit: 'rem' } },
          '04': { $type: 'dimension', $value: { value: 1.25, unit: 'rem' } },
          '05': { $type: 'dimension', $value: { value: 1.5, unit: 'rem' } },
          '06': { $type: 'dimension', $value: { value: 2, unit: 'rem' } },
          '07': { $type: 'dimension', $value: { value: 2.5, unit: 'rem' } },
          '08': { $type: 'dimension', $value: { value: 3, unit: 'rem' } },
          '09': { $type: 'dimension', $value: { value: 4, unit: 'rem' } },
          '10': { $type: 'dimension', $value: { value: 4.5, unit: 'rem' } },
        },
        weight: {
          thin: { $type: 'fontWeight', $value: 100 },
          extralight: { $type: 'fontWeight', $value: 200 },
          light: { $type: 'fontWeight', $value: 300 },
          regular: { $type: 'fontWeight', $value: 400 },
          medium: { $type: 'fontWeight', $value: 500 },
          semibold: { $type: 'fontWeight', $value: 600 },
          bold: { $type: 'fontWeight', $value: 700 },
          extrabold: { $type: 'fontWeight', $value: 800 },
          black: { $type: 'fontWeight', $value: 900 },
        },
      },
    },
  },
};
