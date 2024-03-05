/**
 * W3C Design Tokens specification
 */
import {FG_RED, RESET} from '@cobalt-ui/utils';
import {describe, expect, test} from 'vitest';
import {ParseOptions, parse} from '../src/index.js';

const DEFAULT_PARSE_OPTIONS: ParseOptions = {color: {}};

/** parse schema and expect no errors */
function getTokens(json: any, parseOptions: ParseOptions = DEFAULT_PARSE_OPTIONS) {
  const {errors, result} = parse(json, parseOptions);
  if (errors) {
    for (const err of errors) {
      console.error(`${FG_RED}${err}${RESET}`); // eslint-disable-line no-console
    }
  }
  expect(errors).to.not.be.ok;

  return result.tokens;
}

describe('5. Group', () => {
  test('top-level metadata', () => {
    const json = {
      $name: 'My Schema',
      color: {
        blue: {$type: 'color', $value: '#00c0ff'},
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'color.blue')!._group.$name).toBe(json.$name);
  });

  test('inheritance', () => {
    const json = {
      color: {
        $type: 'color',
        blue: {$value: '#218bff'},
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'color.blue')!.$type).toBe('color');
  });

  test('allow empty', () => {
    const json = {
      color: {
      },
    };
    const tokens = getTokens(json);
    expect(tokens.length).toBe(0);
  });
});

describe('7. Alias', () => {
  test('top-level', () => {
    const json = {
      a: {$type: 'number', $value: 2},
      b: {$type: 'number', $value: '{a}'},
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'a')?.$value).toBe(json.a.$value);
    expect(tokens.find((t) => t.id === 'b')?.$value).toBe(json.a.$value);
  });

  test('mode', () => {
    const json = {
      color: {
        blue: {$type: 'color', $value: '#218bff', $extensions: {mode: {dark: '#388bfd'}}},
        darkBlue: {$type: 'color', $value: '{color.blue#dark}'},
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'color.darkBlue')?.$value).toBe(json.color.blue.$extensions.mode.dark);
  });

  test('missing', () => {
    const json = {
      color: {
        green: {$type: 'color', $value: '{color.emerald}'},
      },
    };
    const {errors} = parse(json, DEFAULT_PARSE_OPTIONS);
    expect(errors).to.deep.equal(['color.green: can’t find {color.emerald}']);
  });

  test('circular', () => {
    const json = {
      a: {$type: 'color', $value: '{b}'},
      b: {$type: 'color', $value: '{c}'},
      c: {$type: 'color', $value: '{a}'},
    };
    const {errors} = parse(json, DEFAULT_PARSE_OPTIONS);
    expect(errors).to.deep.equal(['c: can’t reference circular alias {a}']);
  });
});

describe('8. Type', () => {
  describe('8.1: Color', () => {
    test('hex', () => {
      const json = {
        color: {
          red: {$type: 'color', $value: '#ff0000'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'color.red')?.$value).toBe(json.color.red.$value);
    });

    test('CSS name', () => {
      const tokens = getTokens({
        color: {
          purple: {$type: 'color', $value: 'rebeccapurple'},
        },
      });
      expect(tokens.find((t) => t.id === 'color.purple')?.$value).toBe('rebeccapurple');
    });

    test('P3', () => {
      const tokens = getTokens({
        color: {
          green: {$type: 'color', $value: 'color(display-p3 0 1 0)'},
        },
      });
      expect(tokens.find((t) => t.id === 'color.green')?.$value).toBe('color(display-p3 0 1 0)');
    });

    test('alias', () => {
      const tokens = getTokens({
        color: {
          blue: {$type: 'color', $value: '#218bff'},
          active: {$type: 'color', $value: '{color.blue}'},
        },
      });
      expect(tokens.find((t) => t.id === 'color.active')?.$value).toBe('#218bff');
    });

    test('transform disabled', () => {
      const tokens = getTokens(
        {
          color: {
            blue: {$type: 'color', $value: 'oklch(60% 0.17 250)'},
          },
        },
        {color: {convertToHex: false}},
      );
      expect(tokens.find((t) => t.id === 'color.blue')?.$value).toBe('oklch(60% 0.17 250)');
    });

    test('invalid', () => {
      const {errors} = parse(
        {
          red: {$type: 'color', $value: 'NOT_A_COLOR'},
        },
        {...DEFAULT_PARSE_OPTIONS, color: {...DEFAULT_PARSE_OPTIONS.color, convertToHex: true}},
      );
      expect(errors).toEqual(['red: invalid color "NOT_A_COLOR"']);
    });
  });

  describe('8.2: Dimension', () => {
    test('basic', () => {
      const json = {
        space: {
          metadata: {$type: 'dimension'},
          component: {
            xs: {$value: '0.5rem'},
            s: {$value: '1rem'},
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'space.component.xs')?.$value).toBe('0.5rem');
    });

    test('allows zero', () => {
      const json = {
        lineHeight: {$type: 'dimension', $value: 0},
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'lineHeight')?.$value).toBe('0');
    });

    test('normalizes zero', () => {
      const json = {
        lineHeight: {$type: 'dimension', $value: '0px'},
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'lineHeight')?.$value).toBe('0');
    });

    test('alias', () => {
      const json = {
        space: {
          m: {$type: 'dimension', $value: '1rem'},
        },
        layout: {
          m: {$type: 'dimension', $value: '{space.m}'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'layout.m')?.$value).toBe('1rem');
    });
  });

  describe('8.3: Font Family', () => {
    test('string', () => {
      const json = {
        typography: {
          body: {$type: 'fontFamily', $value: 'Helvetica'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.body')?.$value).toEqual([json.typography.body.$value]);
    });

    test('array', () => {
      const json = {typography: {body: {$type: 'fontFamily', $value: ['system-ui', 'Helvetica']}}};
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.body')?.$value).toEqual(json.typography.body.$value);
    });

    test('alias', () => {
      const json = {
        typography: {
          family: {
            base: {$type: 'fontFamily', $value: ['Helvetica', 'system-ui']},
            heading: {$type: 'fontFamily', $value: '{typography.family.base}'},
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.family.heading')?.$value).toEqual(json.typography.family.base.$value);
    });
  });

  describe('8.4: Font Weight', () => {
    test('string', () => {
      const json = {
        typography: {
          body: {$type: 'fontWeight', $value: 'hairline'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.body')?.$value).toBe(100);
    });

    test('number', () => {
      const json = {typography: {body: {$type: 'fontWeight', $value: 100}}};
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.body')?.$value).toEqual(json.typography.body.$value);
    });
  });

  describe('8.5: Duration', () => {
    test('basic', () => {
      const json = {
        duration: {
          short: {$type: 'duration', $value: '100ms'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'duration.short')?.$value).toBe('100ms');
    });

    test('alias', () => {
      const json = {
        duration: {
          short: {$type: 'duration', $value: '100ms'},
        },
        animation: {
          card: {$type: 'duration', $value: '{duration.short}'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'animation.card')?.$value).toBe('100ms');
    });
  });

  describe('8.6: Cubic Bézier', () => {
    test('basic', () => {
      const json = {
        ease: {
          sine: {$type: 'cubicBezier', $value: [0.4, 0, 0.6, 1]},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'ease.sine')?.$value).toEqual(json.ease.sine.$value);
    });
  });

  describe('8.7: Number', () => {
    test('basic', () => {
      const json = {
        size: {
          large: {$type: 'number', $value: 57},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'size.large')?.$value).toEqual(json.size.large.$value);
    });
  });
});

describe('9. Composite Type', () => {
  describe('9.2: Stroke Style', () => {
    test('9.2.1 string value', () => {
      const json = {
        stroke: {$type: 'strokeStyle', $value: 'solid'},
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'stroke')?.$value).toBe('solid');
    });

    test('9.2.2 object value', () => {
      const json = {
        stroke: {
          $type: 'strokeStyle',
          $value: {
            dashArray: ['10px', '0.25rem'],
            lineCap: 'butt',
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'stroke')?.$value).toEqual({dashArray: ['10px', '0.25rem'], lineCap: 'butt'});
    });

    test('validates', () => {
      const json = {
        stroke: {$type: 'strokeStyle', $value: 'foo'},
      };
      const {errors} = parse(json, DEFAULT_PARSE_OPTIONS);
      expect(errors?.length).toBe(1);
    });
  });

  describe('9.3: Border', () => {
    test('basic', () => {
      const json = {
        heavy: {
          $type: 'border',
          $value: {color: '#363636', width: '3px', style: 'solid'},
        },
      };
      const tokens = getTokens(json, DEFAULT_PARSE_OPTIONS);
      expect(tokens.find((t) => t.id === 'heavy')?.$value).to.deep.equal({color: '#363636', width: '3px', style: 'solid'});
    });

    test('validates', () => {
      const json = {
        border: {$type: 'border', $value: {color: '#363636'}},
      };
      const {errors} = parse(json, DEFAULT_PARSE_OPTIONS);
      expect(errors?.length).toBe(1);
    });
  });

  describe('9.4: Transition', () => {
    test('basic', () => {
      const json = {
        transition: {
          cubic: {$type: 'transition', $value: {duration: '100ms', delay: 0, timingFunction: [0.33, 1, 0.68, 1]}},
        },
      };
      const tokens = getTokens(json);
      expect(
        // @ts-expect-error it doesn’t know what token type this is
        tokens.find((t) => t.id === 'transition.cubic')?.$value.timingFunction,
      ).to.deep.equal(json.transition.cubic.$value.timingFunction);
    });

    describe('validation', () => {
      test('missing duration', () => {
        expect(
          parse(
            {
              transition: {
                cubic: {$type: 'transition', $value: {delay: 0, timingFunction: [0.33, 1, 0.68, 1]}},
              },
            },
            DEFAULT_PARSE_OPTIONS,
          ).errors?.length,
        ).toBeGreaterThan(0);
      });

      test('missing timingFunction', () => {
        expect(
          parse(
            {
              transition: {
                cubic: {$type: 'transition', $value: {duration: '100ms', delay: 0}},
              },
            },
            DEFAULT_PARSE_OPTIONS,
          ).errors?.length,
        ).toBeGreaterThan(0);
      });
    });

    test('alias', () => {
      const json = {
        easing: {
          sine: {$type: 'cubicBezier', $value: [0.4, 0, 0.6, 1]},
        },
        transition: {
          sine: {$type: 'transition', $value: {duration: '100ms', delay: 0, timingFunction: '{easing.sine}'}},
        },
      };
      const tokens = getTokens(json);
      expect(
        // @ts-expect-error it doesn’t know what token type this is
        tokens.find(({id}) => id === 'transition.sine')?.$value.timingFunction,
      ).to.deep.equal(json.easing.sine.$value);
    });
  });

  describe('9.5: Shadow', () => {
    test('basic', () => {
      const json = {
        shadow: {
          simple: {
            $type: 'shadow',
            $value: {offsetX: 0, offsetY: '4px', blur: '8px', spread: 0, color: 'rgb(0, 0, 0, 0.15)'},
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'shadow.simple')?.$value).to.deep.equal([{offsetX: '0', offsetY: '4px', blur: '8px', spread: '0', color: 'rgb(0, 0, 0, 0.15)', inset: false}]);
    });

    test('shadows (community spec)', () => {
      const json = {
        shadow: {
          layered: {
            $type: 'shadow',
            $value: [
              {offsetX: 0, offsetY: '1px', blur: '1px', color: 'rgba(0, 0, 0, 0.12)'},
              {offsetX: 0, offsetY: '2px', blur: '2px', color: 'rgba(0, 0, 0, 0.12)'},
              {offsetX: 0, offsetY: '4px', blur: '4px', color: 'rgba(0, 0, 0, 0.12)'},
              {offsetX: 0, offsetY: '8px', blur: '8px', color: 'rgba(0, 0, 0, 0.12)'},
              {offsetX: 0, offsetY: '16px', blur: '16px', color: 'rgba(0, 0, 0, 0.12)'},
            ],
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'shadow.layered')?.$value).to.deep.equal([
        {blur: '1px', color: 'rgba(0, 0, 0, 0.12)', inset: false, offsetX: '0', offsetY: '1px', spread: '0'},
        {blur: '2px', color: 'rgba(0, 0, 0, 0.12)', inset: false, offsetX: '0', offsetY: '2px', spread: '0'},
        {blur: '4px', color: 'rgba(0, 0, 0, 0.12)', inset: false, offsetX: '0', offsetY: '4px', spread: '0'},
        {blur: '8px', color: 'rgba(0, 0, 0, 0.12)', inset: false, offsetX: '0', offsetY: '8px', spread: '0'},
        {blur: '16px', color: 'rgba(0, 0, 0, 0.12)', inset: false, offsetX: '0', offsetY: '16px', spread: '0'},
      ]);
    });
  });

  describe('9.6: Gradient', () => {
    test('basic', () => {
      const json = {
        gradient: {
          roygbiv: {
            $type: 'gradient',
            $value: [
              {color: '#ff0000', position: 0},
              {color: '#ff8000', position: 0.1},
              {color: '#ffff00', position: 0.3},
              {color: '#00ff00', position: 0.5},
              {color: '#00ffff', position: 0.7},
              {color: '#0000ff', position: 0.9},
              {color: '#8000ff', position: 1},
            ],
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'gradient.roygbiv')?.$value).to.deep.equal(json.gradient.roygbiv.$value);
    });

    test('alias: color', () => {
      const json = {
        color: {blue: {$type: 'color', $value: '#0000ff'}, green: {$type: 'color', $value: '#00ff00'}, yellow: {$type: 'color', $value: '#ffc000'}},
        gradient: {
          'b-g': {
            $type: 'gradient',
            $value: [
              {color: '{color.blue}', position: 0},
              {color: '{color.green}', position: 1},
            ],
            $extensions: {
              mode: {
                colorblind: [
                  {color: '{color.blue}', position: 0},
                  {color: '{color.yellow}', position: 1},
                ],
              },
            },
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'gradient.b-g')?.$value).to.deep.equal([
        {color: '#0000ff', position: 0},
        {color: '#00ff00', position: 1},
      ]);
      expect(
        // @ts-expect-error it doesn’t know what token type this is
        tokens.find((t) => t.id === 'gradient.b-g').$extensions.mode.colorblind,
      ).to.deep.equal([
        {color: '#0000ff', position: 0},
        {color: '#ffc000', position: 1},
      ]);
    });

    test('alias: whole type', () => {
      const json = {
        gradient: {
          'b-g': {
            $type: 'gradient',
            $value: [
              {color: '#0000ff', position: 0},
              {color: '#00ff00', position: 1},
            ],
          },
        },
        ui: {
          bg: {$type: 'gradient', $value: '{gradient.b-g}'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'ui.bg')?.$value).to.deep.equal(json.gradient['b-g'].$value);
    });
  });

  describe('9.7: Typography', () => {
    test('basic', () => {
      const json = {
        typography: {
          pageTitle: {
            $type: 'typography',
            $value: {fontFamily: ['Helvetica', 'system-ui'], fontSize: '64px', letterSpacing: '-0.01em', lineHeight: 1.25},
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.pageTitle')?.$value).to.deep.equal(json.typography['pageTitle'].$value);
    });

    test('fontWeight: string', () => {
      const json = {
        typography: {
          heading: {
            $type: 'typography',
            $value: {
              fontWeight: 'black',
            },
          },
        },
      };
      const tokens = getTokens(json);
      expect(
        // @ts-expect-error it doesn’t know what token type this is
        tokens.find((t) => t.id === 'typography.heading')!.$value.fontWeight,
      ).toBe(900);
    });

    test('alias: property', () => {
      const json = {
        typography: {
          family: {heading: {$type: 'fontFamily', $value: ['Helvetica', 'system-ui']}},
          pageTitle: {
            $type: 'typography',
            $value: {
              'font-family': '{typography.family.heading}',
              'font-size': '64px',
              'letter-spacing': '-0.01em',
              'line-height': 1.25,
            },
          },
        },
      };
      const tokens = getTokens(json);
      expect(
        // @ts-expect-error it doesn’t know what token type this is
        tokens.find((t) => t.id === 'typography.pageTitle').$value.fontFamily,
      ).to.deep.equal(json.typography.family.heading.$value);
    });

    test('alias: whole type', () => {
      const json = {
        typography: {
          pageTitle: {
            $type: 'typography',
            $value: {fontFamily: ['Helvetica', '-system-ui'], fontSize: '64px', letterSpacing: '-0.01em', lineHeight: 1.25},
          },
          lgTitle: {$type: 'typography', $value: '{typography.pageTitle}'},
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.lgTitle')?.$value).to.deep.equal(json.typography['pageTitle'].$value);
    });
  });
});
