/**
 * Schema tests
 * tests support of the Design Tokens W3C spec
 */

import { expect } from 'chai';
import { FG_RED, RESET } from '@cobalt-ui/utils';
import { parse } from '../dist/index.js';

// parse schema and expect no errors
function getTokens(json) {
  const { errors, result } = parse(json);
  if (errors) errors.forEach((e) => console.error(`${FG_RED}${e}${RESET}`)); // eslint-disable-line no-console
  expect(errors).to.not.be.ok;
  return result.tokens;
}

describe('5. Group', () => {
  it('top-level metadata', () => {
    const json = {
      $name: 'My Schema',
      color: {
        blue: { $type: 'color', $value: '#00c0ff' },
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'color.blue')._group.$name).to.equal(json.$name);
  });

  it('inheritance', () => {
    const json = {
      color: {
        $type: 'color',
        blue: { $value: '#218bff' },
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'color.blue').$type).to.equal('color');
  });
});

describe('7. Alias', () => {
  it('mode', () => {
    const json = {
      color: {
        blue: { $type: 'color', $value: '#218bff', $extensions: { mode: { dark: '#388bfd' } } },
        darkBlue: { $type: 'color', $value: '{color.blue#dark}' },
      },
    };
    const tokens = getTokens(json);
    expect(tokens.find((t) => t.id === 'color.darkBlue').$value).to.equal(json.color.blue.$extensions.mode.dark);
  });

  it('missing', () => {
    const json = {
      color: {
        green: { $type: 'color', $value: '{color.emerald}' },
      },
    };
    const { errors } = parse(json);
    expect(errors).to.deep.equal(['color.green: can’t find {color.emerald}']);
  });

  it('circular', () => {
    const json = {
      a: { $type: 'color', $value: '{b}' },
      b: { $type: 'color', $value: '{c}' },
      c: { $type: 'color', $value: '{a}' },
    };
    const { errors } = parse(json);
    expect(errors).to.deep.equal(['c: can’t reference circular alias {a}']);
  });
});

describe('8. Type', () => {
  describe('8.1: Color', () => {
    it('hex', () => {
      const json = {
        color: {
          red: { $type: 'color', $value: '#ff0000' },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'color.red').$value).to.equal(json.color.red.$value);
    });

    it('CSS name', () => {
      const tokens = getTokens({
        color: {
          purple: { $type: 'color', $value: 'rebeccapurple' },
        },
      });
      expect(tokens.find((t) => t.id === 'color.purple').$value).to.equal('#663399');
    });

    it('P3', () => {
      const tokens = getTokens({
        color: {
          green: { $type: 'color', $value: 'color(display-p3 0 1 0)' },
        },
      });
      expect(tokens.find((t) => t.id === 'color.green').$value).to.equal('#00ff00');
    });

    it('alias', () => {
      const tokens = getTokens({
        color: {
          blue: { $type: 'color', $value: '#218bff' },
          active: { $type: 'color', $value: '{color.blue}' },
        },
      });
      expect(tokens.find((t) => t.id === 'color.active').$value).to.equal('#218bff');
    });

    it('invalid', () => {
      const { errors } = parse({ red: { $type: 'color', $value: 'NOT_A_COLOR' } });
      expect(errors).to.deep.equal(['red: invalid color "NOT_A_COLOR"']);
    });
  });

  describe('8.2: Dimension', () => {
    it('basic', () => {
      const json = {
        space: {
          metadata: { $type: 'dimension' },
          component: {
            xs: { $value: '0.5rem' },
            s: { $value: '1rem' },
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'space.component.xs').$value).to.equal('0.5rem');
    });

    it('allows zero', () => {
      const json = {
        lineHeight: { $type: 'dimension', $value: 0 },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'lineHeight').$value).to.equal('0');
    });

    it('normalizes zero', () => {
      const json = {
        lineHeight: { $type: 'dimension', $value: '0px' },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'lineHeight').$value).to.equal('0');
    });

    it('alias', () => {
      const json = {
        space: {
          m: { $type: 'dimension', $value: '1rem' },
        },
        layout: {
          m: { $type: 'dimension', $value: '{space.m}' },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'layout.m').$value).to.equal('1rem');
    });
  });

  describe('8.3: Font', () => {
    it('string', () => {
      const json = {
        typography: {
          body: { $type: 'font', $value: 'Helvetica' },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.body').$value).to.deep.equal([json.typography.body.$value]);
    });

    it('array', () => {
      const json = { typography: { body: { $type: 'font', $value: ['-system-ui', 'Helvetica'] } } };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.body').$value).to.deep.equal(json.typography.body.$value);
    });
  });

  describe('8.4: Duration', () => {
    it('basic', () => {
      const json = {
        duration: {
          short: { $type: 'duration', $value: '100ms' },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'duration.short').$value).to.equal('100ms');
    });

    it('alias', () => {
      const json = {
        duration: {
          short: { $type: 'duration', $value: '100ms' },
        },
        animation: {
          card: { $type: 'duration', $value: '{duration.short}' },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'animation.card').$value).to.equal('100ms');
    });
  });

  describe('8.5: Cubic Bézier', () => {
    it('basic', () => {
      const json = {
        easing: {
          sine: { $type: 'cubicBezier', $value: [0.4, 0, 0.6, 1] },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'easing.sine').$value).to.deep.equal(json.easing.sine.$value);
    });
  });
});

describe('9. Composite Type', () => {
  describe('9.4: Transition', () => {
    it('basic', () => {
      const json = {
        transition: {
          cubic: { $type: 'transition', $value: { duration: '100ms', delay: 0, timingFunction: [0.33, 1, 0.68, 1] } },
        },
      };
      const tokens = getTokens(json);
      expect(tokens[0].$value.timingFunction).to.deep.equal(json.transition.cubic.$value.timingFunction);
    });

    it('alias', () => {
      const json = {
        easing: {
          sine: { $type: 'cubicBezier', $value: [0.4, 0, 0.6, 1] },
        },
        transition: {
          sine: { $type: 'transition', $value: { duration: '100ms', delay: 0, timingFunction: '{easing.sine}' } },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find(({ id }) => id === 'transition.sine').$value.timingFunction).to.deep.equal(json.easing.sine.$value);
    });
  });

  describe('9.5: Shadow', () => {
    it('basic', () => {
      const json = {
        shadow: {
          simple: { $type: 'shadow', $value: { offsetX: 0, offsetY: '4px', blur: '8px', spread: 0, color: 'rgb(0, 0, 0, 0.15)' } },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'shadow.simple').$value).to.deep.equal({
        offsetX: '0',
        offsetY: '4px',
        blur: '8px',
        spread: '0',
        color: '#00000026',
      });
    });
  });

  describe('9.6: Gradient', () => {
    it('basic', () => {
      const json = {
        gradient: {
          roygbiv: {
            $type: 'gradient',
            $value: [
              { color: '#ff0000', position: 0 },
              { color: '#ff8000', position: 0.1 },
              { color: '#ffff00', position: 0.3 },
              { color: '#00ff00', position: 0.5 },
              { color: '#00ffff', position: 0.7 },
              { color: '#0000ff', position: 0.9 },
              { color: '#8000ff', position: 1 },
            ],
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'gradient.roygbiv').$value).to.deep.equal(json.gradient.roygbiv.$value);
    });

    it('alias: color', () => {
      const json = {
        color: { blue: { $type: 'color', $value: '#0000ff' }, green: { $type: 'color', $value: '#00ff00' }, yellow: { $type: 'color', $value: '#ffc000' } },
        gradient: {
          'b-g': {
            $type: 'gradient',
            $value: [
              { color: '{color.blue}', position: 0 },
              { color: '{color.green}', position: 1 },
            ],
            $extensions: {
              mode: {
                colorblind: [
                  { color: '{color.blue}', position: 0 },
                  { color: '{color.yellow}', position: 1 },
                ],
              },
            },
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'gradient.b-g').$value).to.deep.equal([
        { color: '#0000ff', position: 0 },
        { color: '#00ff00', position: 1 },
      ]);
      expect(tokens.find((t) => t.id === 'gradient.b-g').$extensions.mode.colorblind).to.deep.equal([
        { color: '#0000ff', position: 0 },
        { color: '#ffc000', position: 1 },
      ]);
    });

    it('alias: whole type', () => {
      const json = {
        gradient: {
          'b-g': {
            $type: 'gradient',
            $value: [
              { color: '#0000ff', position: 0 },
              { color: '#00ff00', position: 1 },
            ],
          },
        },
        ui: {
          bg: { $type: 'gradient', $value: '{gradient.b-g}' },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'ui.bg').$value).to.deep.equal(json.gradient['b-g'].$value);
    });
  });

  describe('9.7: Typography', () => {
    it('basic', () => {
      const json = {
        typography: {
          pageTitle: {
            $type: 'typography',
            $value: { fontFamily: ['Helvetica', '-system-ui'], fontSize: '64px', letterSpacing: '-0.01em', lineHeight: 1.25 },
          },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.pageTitle').$value).to.deep.equal(json.typography['pageTitle'].$value);
    });

    it('alias: property', () => {
      const json = {
        typography: {
          family: { heading: { $type: 'font', $value: ['Helvetica', '-system-ui'] } },
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
      expect(tokens.find((t) => t.id === 'typography.pageTitle').$value.fontFamily).to.deep.equal(json.typography.family.heading.$value);
    });

    it('alias: whole type', () => {
      const json = {
        typography: {
          pageTitle: {
            $type: 'typography',
            $value: { fontFamily: ['Helvetica', '-system-ui'], fontSize: '64px', letterSpacing: '-0.01em', lineHeight: 1.25 },
          },
          lgTitle: { $type: 'typography', $value: '{typography.pageTitle}' },
        },
      };
      const tokens = getTokens(json);
      expect(tokens.find((t) => t.id === 'typography.lgTitle').$value).to.deep.equal(json.typography['pageTitle'].$value);
    });
  });
});
