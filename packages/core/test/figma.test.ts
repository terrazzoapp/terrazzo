import { rgb } from 'culori';
import { describe, it, expect } from 'vitest';
import { type FigmaColor, type FigmaVariableManifest } from '../src/parse/figma.js';
import { parse } from '../src/parse/index.js';

function hexToRgb(hex: string): FigmaColor {
  const c = rgb(hex);
  return c ? { r: c.r, g: c.g, b: c.b, a: c.alpha ?? 1 } : { r: 0, g: 0, b: 0, a: 0 };
}

const TOKENS: FigmaVariableManifest = {
  variables: {
    colorGray1ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray1ID',
      key: 'colorGray1Key',
      name: 'color/gray/1',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#fcfcfc'),
        darkModeID: hexToRgb('#111111'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray2ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray2ID',
      key: 'colorGray2Key',
      name: 'color/gray/2',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#f9f9f9'),
        darkModeID: hexToRgb('#191919'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray3ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray3ID',
      key: 'colorGray3Key',
      name: 'color/gray/3',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#f0f0f0'),
        darkModeID: hexToRgb('#222222'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray4ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray4ID',
      key: 'colorGray4Key',
      name: 'color/gray/4',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#e8e8e8'),
        darkModeID: hexToRgb('#2a2a2a'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray5ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray5ID',
      key: 'colorGray5Key',
      name: 'color/gray/5',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#e0e0e0'),
        darkModeID: hexToRgb('#313131'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray6ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray6ID',
      key: 'colorGray6Key',
      name: 'color/gray/6',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#d9d9d9'),
        darkModeID: hexToRgb('#3a3a3a'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray7ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray7ID',
      key: 'colorGray7Key',
      name: 'color/gray/7',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#cecece'),
        darkModeID: hexToRgb('#484848'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray8ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray8ID',
      key: 'color/gray/8',
      name: 'color/gray/8',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#bbbbbb'),
        darkModeID: hexToRgb('#606060'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray9ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray9ID',
      key: 'colorGray9Key',
      name: 'color/gray/9',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#8d8d8d'),
        darkModeID: hexToRgb('#6e6e6e'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray10ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray10ID',
      key: 'colorGray10Key',
      name: 'color/gray/10',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#838383'),
        darkModeID: hexToRgb('#7b7b7b'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray11ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray11ID',
      key: 'colorGray11Key',
      name: 'color/gray/11',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#646464'),
        darkModeID: hexToRgb('#b4b4b4'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorGray12ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'colorGray12ID',
      key: 'colorGray12Key',
      name: 'color/gray/12',
      remote: false,
      resolvedType: 'COLOR',
      valuesByMode: {
        lightModeID: hexToRgb('#202020'),
        darkModeID: hexToRgb('#eeeeee'),
      },
      variableCollectionId: 'defaultCollectionID',
    },
    colorUIBGID: {
      id: 'colorUIBGID',
      key: 'colorUIBGKey',
      name: 'color/ui/bg',
      description: '',
      resolvedType: 'COLOR',
      valuesByMode: { lightModeID: { type: 'VARIABLE_ALIAS', id: 'colorGray1ID' }, darkModeID: { type: 'VARIABLE_ALIAS', id: 'colorGray1ID' } },
      remote: false,
      hiddenFromPublishing: false,
      variableCollectionId: 'defaultCollectionID',
    },
    colorUITextID: {
      id: 'colorUITextID',
      key: 'colorUITextKey',
      name: 'color/ui/text',
      description: '',
      resolvedType: 'COLOR',
      valuesByMode: { lightModeID: { type: 'VARIABLE_ALIAS', id: 'colorGray12ID' }, darkModeID: { type: 'VARIABLE_ALIAS', id: 'colorGray12ID' } },
      remote: false,
      hiddenFromPublishing: false,
      variableCollectionId: 'defaultCollectionID',
    },
    space1ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space1ID',
      key: 'space1Key',
      name: 'space/1',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 2.0,
        darkModeID: 2.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space2ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space2ID',
      key: 'space2Key',
      name: 'space/2',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 4.0,
        darkModeID: 4.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space3ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space3ID',
      key: 'space3Key',
      name: 'space/3',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 8.0,
        darkModeID: 8.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space4ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space4ID',
      key: 'space4Key',
      name: 'space/4',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 12.0,
        darkModeID: 12.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space5ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space5ID',
      key: 'space5Key',
      name: 'space/5',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 16.0,
        darkModeID: 16.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space6ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space6ID',
      key: 'space6Key',
      name: 'space/6',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 24.0,
        darkModeID: 24.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space7ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space7ID',
      key: 'space7Key',
      name: 'space/7',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 32.0,
        darkModeID: 32.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space8ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space8ID',
      key: 'space8Key',
      name: 'space/8',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 40.0,
        darkModeID: 40.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space9ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space9ID',
      key: 'space9Key',
      name: 'space/9',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 48.0,
        darkModeID: 48.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
    space10ID: {
      description: '',
      hiddenFromPublishing: false,
      id: 'space10ID',
      key: 'space10Key',
      name: 'space/10',
      remote: false,
      resolvedType: 'FLOAT',
      valuesByMode: {
        lightModeID: 64.0,
        darkModeID: 64.0,
      },
      variableCollectionId: 'defaultCollectionID',
    },
  },
  variableCollections: {
    defaultCollectionID: {
      id: 'defaultCollectionID',
      name: 'Default',
      key: 'defaultCollectionKey',
      modes: [
        { modeId: 'lightModeID', name: 'light' },
        { modeId: 'darkModeID', name: 'dark' },
      ],
      defaultModeId: 'lightModeID',
      remote: false,
      hiddenFromPublishing: false,
      variableIds: [
        'colorGray1ID',
        'colorGray2ID',
        'colorGray3ID',
        'colorGray4ID',
        'colorGray5ID',
        'colorGray6ID',
        'colorGray7ID',
        'colorGray8ID',
        'colorGray9ID',
        'colorGray10ID',
        'colorGray11ID',
        'colorUIBGID',
        'colorUITextID',
        'space1ID',
        'space1ID',
        'space2ID',
        'space3ID',
        'space4ID',
        'space5ID',
        'space6ID',
        'space7ID',
        'space8ID',
        'space9ID',
        'space10ID',
      ],
    },
  },
};

describe('figma', () => {
  it('default values', () => {
    const { result, warnings, errors } = parse(TOKENS, { color: {} });

    expect(warnings).toBeUndefined();
    expect(errors).toBeUndefined();

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'color.gray.1',
          $type: 'color',
          $value: '#fcfcfc',
          $extensions: { mode: { dark: '#111111', light: '#fcfcfc' } },
        }),
        expect.objectContaining({
          id: 'color.ui.text',
          $type: 'color',
          $value: '#202020',
          $extensions: { mode: { dark: '#eeeeee', light: '#202020' } },
          _original: {
            $extensions: { mode: { dark: '{color.gray.12#dark}', light: '{color.gray.12#light}' } }, // check aliases generated correctly
            $type: 'color',
            $value: '{color.gray.12}',
          },
        }),
        expect.objectContaining({
          id: 'space.1',
          $type: 'number',
          $value: 2,
          $extensions: { mode: { dark: 2, light: 2 } },
        }),
      ]),
    );
  });

  it('transforming values', () => {
    const { result, warnings, errors } = parse(TOKENS, {
      color: {},
      figma: {
        overrides: {
          'space/*': {
            $type: 'dimension',
            transform({ variable, collection, mode }) {
              const rawValue = variable.valuesByMode[mode.modeId];
              if (typeof rawValue === 'number') {
                return `${rawValue / 16}rem`;
              }
            },
          },
        },
      },
    });

    expect(warnings).toBeUndefined();
    expect(errors).toBeUndefined();

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'space.5',
          $type: 'dimension',
          $value: '1rem',
          $extensions: { mode: { dark: '1rem', light: '1rem' } },
        }),
      ]),
    );
  });

  it('renaming values', () => {
    const { result, warnings, errors } = parse(TOKENS, {
      color: {},
      figma: {
        overrides: {
          'color/*': {
            rename(id) {
              if (id.includes('gray')) {
                return id.replace('gray', 'grey');
              }
            },
          },
        },
      },
    });

    expect(warnings).toBeUndefined();
    expect(errors).toBeUndefined();

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'color.grey.5',
          $type: 'color',
          $value: '#e0e0e0',
          $extensions: { mode: { dark: '#313131', light: '#e0e0e0' } },
        }),
      ]),
    );
  });
});
