/**
 * Tokens Studio for Figma format
 */
import {FG_RED, RESET} from '@cobalt-ui/utils';
import {describe, expect, test} from 'vitest';
import {parse, ParseOptions} from '../src/index.js';

/** parse schema and expect no errors */
function getTokens(json, parseOptions: ParseOptions = {color: {}}) {
  // the presence of top-level "$themes" and "$metadata" is necessary to detect
  // Tokens Studio format, as it always outputs these, and these are invalid
  // for the W3C format)
  if (!('$themes' in json)) json.$themes = [];
  if (!('$metadata' in json)) json.$metadata = {};

  const {errors, result} = parse(json, parseOptions);
  if (errors) {
    for (const err of errors) {
      console.error(`${FG_RED}${err}${RESET}`); // eslint-disable-line no-console
    }
  }
  expect(errors).to.not.be.ok;

  return result.tokens;
}

describe('Sizing', () => {
  test('basic', () => {
    const json = {
      global: {
        sizing: {
          s: {type: 'sizing', value: '8px'},
          m: {type: 'sizing', value: '16'},
          l: {type: 'sizing', value: '2rem'},
        },
      },
    };
    const tokens = getTokens(json);

    expect(tokens.find((t) => t.id === 'global.sizing.s')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
    expect(tokens.find((t) => t.id === 'global.sizing.m')).toEqual(expect.objectContaining({$type: 'number', $value: 16}));
    expect(tokens.find((t) => t.id === 'global.sizing.l')).toEqual(expect.objectContaining({$type: 'dimension', $value: '2rem'}));
  });
});

describe('Spacing', () => {
  test('single', () => {
    const json = {
      global: {
        spacing: {type: 'spacing', value: '8px'},
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'global.spacing')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
  });

  test('multi', () => {
    const json = {
      global: {
        spacing: {
          xy: {type: 'spacing', value: '8px 16px'},
          txb: {type: 'spacing', value: '6px 16px 8px'},
          trbl: {type: 'spacing', value: '6px 16px 8px 12px'},
        },
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'global.spacing.xyTop')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.xyRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.xyBottom')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.xyLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));

    expect(tokens.find((t) => t.id === 'global.spacing.txbTop')).toEqual(expect.objectContaining({$type: 'dimension', $value: '6px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.txbRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.txbBottom')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.txbLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));

    expect(tokens.find((t) => t.id === 'global.spacing.trblTop')).toEqual(expect.objectContaining({$type: 'dimension', $value: '6px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.trblRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.trblBottom')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
    expect(tokens.find((t) => t.id === 'global.spacing.trblLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '12px'}));
  });
});

describe('Color', () => {
  test('CSS color', () => {
    const json = {
      global: {
        color: {
          red: {
            60: {type: 'color', value: '#ef4c43'},
          },
          ui: {
            danger: {
              60: {type: 'color', value: '{color.red.60}'},
            },
          },
        },
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'global.color.red.60')).toEqual(expect.objectContaining({$type: 'color', $value: '#ef4c43'}));
    expect(tokens.find((t) => t.id === 'global.color.ui.danger.60')).toEqual(expect.objectContaining({$type: 'color', $value: '#ef4c43'}));
  });

  test('Gradient', () => {
    const json = {
      global: {
        color: {
          blue: {
            30: {type: 'color', value: '#002466'},
          },
          green: {
            60: {type: 'color', value: '#00b98a'},
            80: {type: 'color', value: '#83e4be'},
          },
        },
        gradient: {
          base: {type: 'color', value: 'linear-gradient(45deg, #002466 0%, #00b98a 45%, #83e4be 100%)'},
          alias: {type: 'color', value: 'linear-gradient(45deg, $color.blue.30 0%, $color.green.60 45%, $color.green.80 100%'},
        },
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'global.gradient.base')).toEqual(
      expect.objectContaining({
        $type: 'gradient',
        $value: [
          {color: '#002466', position: 0},
          {color: '#00b98a', position: 0.45},
          {color: '#83e4be', position: 1},
        ],
      }),
    );
    expect(tokens.find((t) => t.id === 'global.gradient.alias')).toEqual(
      expect.objectContaining({
        $type: 'gradient',
        $value: [
          {color: '#002466', position: 0},
          {color: '#00b98a', position: 0.45},
          {color: '#83e4be', position: 1},
        ],
      }),
    );
  });

  describe('Border Radius', () => {
    test('single', () => {
      const json = {
        global: {
          radius: {s: {type: 'borderRadius', value: '0.25rem'}},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'global.radius.s')).toEqual(expect.objectContaining({$type: 'dimension', $value: '0.25rem'}));
    });

    test('multi', () => {
      const json = {
        global: {
          radius: {
            xy: {type: 'borderRadius', value: '8px 16px'},
            txb: {type: 'borderRadius', value: '6px 16px 8px'},
            trbl: {type: 'borderRadius', value: '6px 16px 8px 12px'},
          },
        },
      };
      const tokens = getTokens(json);

      expect(tokens.find((t) => t.id === 'global.radius.xyTopLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
      expect(tokens.find((t) => t.id === 'global.radius.xyTopRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));
      expect(tokens.find((t) => t.id === 'global.radius.xyBottomRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
      expect(tokens.find((t) => t.id === 'global.radius.xyBottomLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));

      expect(tokens.find((t) => t.id === 'global.radius.txbTopLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '6px'}));
      expect(tokens.find((t) => t.id === 'global.radius.txbTopRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));
      expect(tokens.find((t) => t.id === 'global.radius.txbBottomRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
      expect(tokens.find((t) => t.id === 'global.radius.txbBottomLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));

      expect(tokens.find((t) => t.id === 'global.radius.trblTopLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '6px'}));
      expect(tokens.find((t) => t.id === 'global.radius.trblTopRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '16px'}));
      expect(tokens.find((t) => t.id === 'global.radius.trblBottomRight')).toEqual(expect.objectContaining({$type: 'dimension', $value: '8px'}));
      expect(tokens.find((t) => t.id === 'global.radius.trblBottomLeft')).toEqual(expect.objectContaining({$type: 'dimension', $value: '12px'}));
    });
  });

  describe('Border Width', () => {
    test('basic', () => {
      const json = {
        global: {
          borderWidth: {type: 'borderWidth', value: '1px'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'global.borderWidth')).toEqual(expect.objectContaining({$type: 'dimension', $value: '1px'}));
    });
  });

  describe('Opacity', () => {
    test('basic', () => {
      const json = {
        global: {
          opacity: {50: {type: 'opacity', value: 0.5}},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'global.opacity.50')).toEqual(expect.objectContaining({$type: 'number', $value: 0.5}));
    });
  });

  describe('Typography', () => {
    test('basic', () => {
      const json = {
        global: {
          typography: {
            family: {
              sans: {type: 'fontFamilies', value: 'Helvetica'},
              mono: {type: 'fontFamilies', value: 'JetBrains Mono'},
            },
            weight: {
              base: {type: 'fontWeights', value: '400'},
              bold: {type: 'fontWeights', value: '700'},
            },
            size: {
              s: {type: 'fontSizes', value: '11px'},
              m: {type: 'fontSizes', value: '14px'},
              l: {type: 'fontSizes', value: '18px'},
            },
            lineHeight: {
              s: {type: 'lineHeights', value: '1em'},
              m: {type: 'lineHeights', value: '1.4em'},
              l: {type: 'lineHeights', value: '1.75em'},
            },
            letterSpacing: {
              base: {type: 'letterSpacing', value: '0'},
              s: {type: 'letterSpacing', value: '0.03125em'},
              m: {type: 'letterSpacing', value: '0.0625em'},
              l: {type: 'letterSpacing', value: '0.125em'},
            },
            textDecoration: {
              base: {type: 'textDecoration', value: 'none'},
              underline: {type: 'textDecoration', value: 'underline'},
              lineThrough: {type: 'textDecoration', value: 'line-through'},
            },
            textCase: {
              base: {type: 'textCase', value: 'none'},
              upper: {type: 'textCase', value: 'uppercase'},
              lower: {type: 'textCase', value: 'lowercase'},
              caps: {type: 'textCase', value: 'capitalize'},
            },
            base: {
              value: {
                fontFamily: '{typography.family.sans}',
                fontSize: '{typography.size.m}',
                fontWeight: '{typography.weight.base}',
                letterSpacing: '{typography.letterSpacing.base}',
                lineHeight: '{typography.lineHeight.m}',
                textCase: '{typography.textCase.base}',
                textDecoration: '{typography.textDecoration.base}',
              },
              type: 'typography',
            },
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'global.typography.base')).toEqual(
        expect.objectContaining({
          $type: 'typography',
          $value: {
            fontFamily: ['Helvetica'],
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: 0,
            lineHeight: '1.4em',
            textCase: 'none',
            textDecoration: 'none',
          },
        }),
      );
    });
  });
});
