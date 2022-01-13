import { expect } from 'chai';
import fs from 'fs';
import co from '../dist/index.js';

describe('tokens.json', () => {
  it('basic', () => {
    let result = {};
    const json = JSON.parse(fs.readFileSync(new URL('./fixtures/basic.json', import.meta.url), 'utf8'));

    // no errors
    result = co.parse(json);
    expect(result.errors).to.not.be.ok;

    // tokens parsed correctly
    expect(result.result.tokens).to.deep.equal([
      { id: 'color.blue', type: 'color', value: '#218bff', mode: {} },
      { id: 'font.family', type: 'font', value: ['IBM Plex Sans'], mode: {} },
      { id: 'space.s', type: 'dimension', value: '4px', mode: {} },
      { id: 'easing.sine', type: 'cubic-bezier', value: [0.5, 0, 0.5, 1], mode: {} },
      { id: 'icon.local', type: 'file', value: './icons/alert.svg', mode: {} },
      { id: 'icon.remote', type: 'url', value: 'https://my-cdn.com/github.svg', mode: {} },
      { id: 'shadow.near', type: 'shadow', value: ['0 2px #00000040'], mode: {} },
      { id: 'shadow.far', type: 'shadow', value: ['0 1px 1px #0000000c', '0 2px 2px #0000000c', '0 4px 4px #0000000c', '0 8px 8px #0000000c'], mode: {} },
      { id: 'gradient.linear', type: 'linear-gradient', value: 'to right top, #000000 15%, #00000000 92%', mode: {} },
      { id: 'gradient.radial', type: 'radial-gradient', value: 'ellipse at 75% 25%, #ff0000, #0000ff', mode: {} },
      {
        id: 'gradient.conic',
        type: 'conic-gradient',
        value: 'from -225deg at 50% 50%, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff',
        mode: {},
      },
    ]);
  });

  it('modes', () => {
    let result = {};
    const json = JSON.parse(fs.readFileSync('./test/fixtures/modes.json', 'utf8'));

    // no errors
    result = co.parse(json);
    expect(result.errors).to.not.be.ok;

    // tokens parsed correctly
    expect(result.result.tokens).to.deep.equal([
      {
        id: 'color.blue',
        mode: {
          dark: '#388bfd',
          dark_colorblind: '#388bfd',
          dark_dimmed: '#4184e4',
          dark_high_contrast: '#409eff',
          light: '#218bff',
          light_colorblind: '#218bff',
          light_high_contrast: '#1168e3',
        },
        type: 'color',
        value: '#218bff',
      },
    ]);
  });

  it('alias', () => {
    let result = {};
    const json = JSON.parse(fs.readFileSync('./test/fixtures/alias.json', 'utf8'));

    // no errors
    result = co.parse(json);
    expect(result.errors).to.not.be.ok;

    // tokens parsed correctly
    expect(result.result.tokens).to.deep.equal([
      { id: 'color.blue', type: 'color', value: '#218bff', mode: { dark: '#388bfd' } },
      { id: 'color.active', type: 'color', value: '#218bff', mode: {} },
      { id: 'color.highlight', type: 'color', value: '#218bff', mode: {} },
      { id: 'color.brand', type: 'color', value: '#218bff', mode: {} },
      { id: 'color.dark-blue', type: 'color', value: '#388bfd', mode: {} },
      { id: 'font.family.base', type: 'font', value: ['Helvetica'], mode: {} },
      { id: 'font.family.button', type: 'font', value: ['Helvetica'], mode: {} },
      { id: 'size.m', type: 'dimension', value: '1rem', mode: {} },
      { id: 'size.margin_m', type: 'dimension', value: '1rem', mode: {} },
    ]);
  });

  it('inheritance', () => {
    let json = {
      tokens: {
        color: {
          metadata: { type: 'color' },
          red: { value: '#f00' },
          green: { value: '#0f0' },
          gradient: {
            metadata: { type: 'linear-gradient' },
            blue: { value: 'blue, cyan' },
          },
        },
        font: {
          metadata: { type: 'font' },
          heading: {
            metadata: { type: 'dimension' },
            size: { value: '12rem' },
            font: {
              type: 'font',
              value: 'Helvetica',
            },
          },
        },
      },
    };
    let result = co.parse(json);
    expect(result.result.tokens.find((t) => t.id === 'color.red')).to.deep.equal({ id: 'color.red', type: 'color', value: '#f00', mode: {} });
    expect(result.result.tokens.find((t) => t.id === 'color.green')).to.deep.equal({ id: 'color.green', type: 'color', value: '#0f0', mode: {} });
    expect(result.result.tokens.find((t) => t.id === 'color.gradient.blue')).to.deep.equal({
      id: 'color.gradient.blue',
      type: 'linear-gradient',
      value: 'blue, cyan',
      mode: {},
    });
  });

  describe('errors', () => {
    it('unknown top-level property', () => {
      const json = {
        foo: 'bar',
        tokens: {
          blue: {
            type: 'color',
            value: '#0000ff',
          },
        },
      };
      const { errors } = co.parse(json);
      expect(errors).to.deep.equal(['Invalid top-level name "foo". Place arbitrary data inside "metadata".']);
    });

    it('missing tokens', () => {
      const json = { name: 'My Tokens' };
      const { errors } = co.parse(json);
      expect(errors).to.deep.equal(['"tokens" is empty!']);
    });

    it('missing value', () => {
      const json = {
        tokens: {
          easing: {
            sine: {
              type: 'cubic-bezier',
            },
          },
        },
      };
      const { errors } = co.parse(json);
      expect(errors).to.deep.equal(['easing.sine: missing value']);
    });

    it('bad value', () => {
      const json = {
        tokens: {
          font: {
            family: {
              base: {
                type: 'font',
                value: { helvetica: true },
              },
            },
          },
        },
      };
      const { errors } = co.parse(json);
      expect(errors).to.deep.equal(['font.family.base: expected string or array of strings, received object']);
    });

    it('bad token value', () => {
      const json = {
        tokens: {
          group: [true],
        },
      };
      const { errors } = co.parse(json);
      expect(errors).to.deep.equal(['group: unexpected token format "true"']);
    });

    it('alias missing', () => {
      const json = {
        tokens: {
          color: {
            green: {
              type: 'color',
              value: '{color.emerald}',
            },
          },
        },
      };

      const { errors } = co.parse(json);
      expect(errors).to.deep.equal(['color.green: can’t find {color.emerald}']);
    });

    it('circular alias', () => {
      const json = {
        tokens: {
          a: {
            type: 'color',
            value: '{b}',
          },
          b: {
            type: 'color',
            value: '{c}',
          },
          c: {
            type: 'color',
            value: '{a}',
          },
        },
      };

      const { errors } = co.parse(json);
      expect(errors).to.deep.equal(['a: can’t reference circular alias {c}']);
    });

    it('missing modes', () => {
      const json = {
        tokens: {
          font: {
            size: {
              metadata: { modes: ['desktop', 'mobile'] },
              text: {
                type: 'font',
                value: '16px',
                mode: {
                  desktop: '16px',
                },
              },
            },
          },
        },
      };

      const { errors } = co.parse(json);
      expect(errors).to.deep.equal(['font.size.text: missing mode "mobile" set on parent group']);
    });
  });
});
