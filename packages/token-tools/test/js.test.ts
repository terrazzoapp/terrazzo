import { describe, expect, it } from 'vitest';
import { transformJSValue } from '../src/js/index.js';
import type {
  BooleanTokenNormalized,
  ColorTokenNormalized,
  DimensionTokenNormalized,
  GradientTokenNormalized,
  NumberTokenNormalized,
  TypographyTokenNormalized,
} from '../src/types.js';

describe('transformJSValue', () => {
  it('string', () => {
    const dimension = {
      id: 'space.00',
      $type: 'dimension',
      $value: '1rem',
    } as unknown as DimensionTokenNormalized;
    dimension.mode = { '.': { $value: dimension.$value, originalValue: dimension.$value, source: {} as any } };

    expect(transformJSValue(dimension, { mode: '.' })).toMatchInlineSnapshot(`
      ""1rem""
    `);
  });

  it('boolean', () => {
    const bool = {
      id: 'bool.false',
      $type: 'boolean',
      $value: false,
    } as unknown as BooleanTokenNormalized;
    bool.mode = { '.': { $value: bool.$value, originalValue: bool.$value, source: {} as any } };

    expect(transformJSValue(bool, { mode: '.' })).toMatchInlineSnapshot(`
      "false"
    `);
  });

  it('number', () => {
    const num = {
      id: 'number.500',
      $type: 'number',
      $value: 500,
    } as unknown as NumberTokenNormalized;
    num.mode = { '.': { $value: num.$value, originalValue: num.$value, source: {} as any } };

    expect(transformJSValue(num, { mode: '.' })).toMatchInlineSnapshot(`
      "500"
    `);
  });

  it('color', () => {
    const color = {
      id: 'color.blue.600',
      $type: 'color',
      $value: { colorSpace: 'srgb', components: [0.02, 0.53, 0.94], alpha: 1 },
    } as unknown as ColorTokenNormalized;
    color.mode = { '.': { $value: color.$value, originalValue: color.$value, source: {} as any } };

    expect(transformJSValue(color, { mode: '.' })).toMatchInlineSnapshot(`
      "{
        "colorSpace": "srgb",
        "components": [
          0.02,
          0.53,
          0.94
        ],
        "alpha": 1
      }"
    `);
  });

  it('gradient', () => {
    const gradient = {
      $type: 'gradient',
      $value: [
        { color: { colorSpace: 'srgb', components: [0.02, 0.53, 0.94], alpha: 1 }, position: 0 },
        { color: { colorSpace: 'srgb', components: [0.51, 0.28, 0.73], alpha: 1 }, position: 100 },
      ],
    } as unknown as GradientTokenNormalized;
    gradient.mode = { '.': { $value: gradient.$value, originalValue: gradient.$value, source: {} as any } };

    expect(transformJSValue(gradient, { mode: '.' })).toMatchInlineSnapshot(`
      "[
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0.02,
              0.53,
              0.94
            ],
            "alpha": 1
          },
          "position": 0
        },
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0.51,
              0.28,
              0.73
            ],
            "alpha": 1
          },
          "position": 100
        }
      ]"
    `);
  });

  it('typography object', () => {
    const typography = {
      id: 'typography.default',
      $type: 'typography',
      $value: {
        fontFamily: ['Inter'],
        fontSize: '1rem',
        fontStyle: 'normal',
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 1.5,
        textDecoration: 'none',
        textTranssform: 'none',
      },
    } as unknown as TypographyTokenNormalized;
    typography.mode = { '.': { $value: typography.$value, originalValue: typography.$value, source: {} as any } };

    expect(transformJSValue(typography, { mode: '.' })).toMatchInlineSnapshot(`
      "{
        "fontFamily": [
          "Inter"
        ],
        "fontSize": "1rem",
        "fontStyle": "normal",
        "fontWeight": 400,
        "letterSpacing": 0,
        "lineHeight": 1.5,
        "textDecoration": "none",
        "textTranssform": "none"
      }"
    `);
  });
});
