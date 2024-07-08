import type { ColorInput, ColorOutput, Rgb } from './index.js';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Color } from 'culori';
import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import useColor, { createMemoizedColor, formatCss, parse } from './index.js';

type ColorType = ReturnType<typeof useColor>[0];

function UseColorTester({
  display,
  value,
  onChange,
  onRerender,
}: {
  display: keyof ColorType;
  value: ColorInput;
  onChange?: (value: ColorType) => void;
  onRerender?: () => void;
}) {
  onRerender?.();

  const [color, setColor] = useColor(value);

  useEffect(() => {
    onChange?.(color);
  }, [color, onChange]);

  return (
    <>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          setColor(
            // @ts-expect-error: TS has no clue what this is; this is in a test anyway
            evt.target.elements.color.value,
          );
        }}
      >
        <label htmlFor='color-input'>Update color</label>
        <input id='color-input' name='color' />
        <button type='submit'>Save</button>
      </form>

      <div data-testid='color-display'>{JSON.stringify(color[display])}</div>
    </>
  );
}

describe('useColor', () => {
  afterEach(() => {
    cleanup();
  });

  describe('parse', () => {
    const formatTests: [string, { given: any; want: Color }][] = [
      ['hex', { given: '#663399', want: { mode: 'rgb', r: 0.4, g: 0.2, b: 0.6, alpha: 1 } }],
      ['hsl', { given: 'hsl(270 50% 40%)', want: { mode: 'hsl', h: 270, s: 0.5, l: 0.4, alpha: 1 } }],
      ['oklab', { given: 'oklab(0.7 0.3 0.4)', want: { mode: 'oklab', l: 0.7, a: 0.3, b: 0.4, alpha: 1 } }],
      ['oklch', { given: 'oklch(0.7 0.2 150)', want: { mode: 'oklch', l: 0.7, c: 0.2, h: 150, alpha: 1 } }],
      ['okhsv', { given: 'color(--okhsv 150 0.6 0.8)', want: { mode: 'okhsv', h: 150, s: 0.6, v: 0.8, alpha: 1 } }],
      ['okhsl', { given: 'color(--okhsl 150 0.8 0.5)', want: { mode: 'okhsl', h: 150, s: 0.8, l: 0.5, alpha: 1 } }],
      [
        'display-p3',
        { given: 'color(display-p3 0.3 0.1 0.6)', want: { mode: 'p3', r: 0.3, g: 0.1, b: 0.6, alpha: 1 } },
      ],
      ['lrgb', { given: 'color(srgb-linear 0.3 0.1 0.6)', want: { mode: 'lrgb', r: 0.3, g: 0.1, b: 0.6, alpha: 1 } }],
      ['rgb', { given: 'rgb(30% 10% 60%)', want: { mode: 'rgb', r: 0.3, g: 0.1, b: 0.6, alpha: 1 } }],
      ['srgb', { given: 'color(srgb 0.3 0.1 0.6)', want: { mode: 'rgb', r: 0.3, g: 0.1, b: 0.6, alpha: 1 } }],
      ['xyz50', { given: 'color(xyz-d50 0.7 0.3 -0.05)', want: { mode: 'xyz50', x: 0.7, y: 0.3, z: -0.05, alpha: 1 } }],
      ['xyz65', { given: 'color(xyz-d65 0.7 0.3 -0.05)', want: { mode: 'xyz65', x: 0.7, y: 0.3, z: -0.05, alpha: 1 } }],
    ];

    it.each(formatTests)('%s', (_, { given, want }) => {
      expect(parse(given)).toEqual(want);
    });
  });

  describe('color', () => {
    it('preserves original color', () => {
      const color = 'color(srgb 0 0.3 1)';
      let renderCount = 0;

      render(
        <UseColorTester
          value={color}
          display='srgb'
          onChange={() => {}}
          onRerender={() => {
            renderCount++;
          }}
        />,
      );

      // assert color displays as-expected
      const displayedColor = JSON.parse(screen.getByTestId('color-display').innerHTML) as Rgb;
      expect(displayedColor).toEqual({
        mode: 'rgb',
        r: 0.00016175596675521153,
        g: 0.300082124265595,
        b: 0.9998580363472361,
        alpha: 1,
      });

      // assert only 1 render happened
      expect(renderCount).toBe(1);
    });

    it('returns undefined for unknown colorspaces', () => {
      const color = 'color(srgb 0 0.3 1)';

      render(
        <UseColorTester value={color} display={'foo' as keyof ColorOutput} onChange={() => {}} onRerender={() => {}} />,
      );

      // assert "undefined" is visible (no error)
      const displayedColor = screen.getByTestId('color-display').innerHTML;
      expect(displayedColor).toBe('');
    });

    it('allows updates', async () => {
      const user = userEvent.setup();
      let renderCount = 0;
      let onChangeCount = 0;
      let color = 'color(srgb 0.5 0.3 0.8)';
      const newColor = 'color(srgb 0.6 0.3 0.5)';

      render(
        <UseColorTester
          value={color}
          display='srgb'
          onChange={(value) => {
            color = value.css;
            onChangeCount++;
          }}
          onRerender={() => {
            renderCount++;
          }}
        />,
      );

      // update color
      await user.type(screen.getByLabelText('Update color'), newColor);
      await user.click(screen.getByRole('button'));

      // assert `setColor()` works
      const displayedColor = JSON.parse(screen.getByTestId('color-display').innerHTML) as Rgb;
      expect(displayedColor).toEqual({
        mode: 'rgb',
        r: 0.6000000000000005,
        g: 0.29999999999999954,
        b: 0.49999999999999994,
        alpha: 1,
      });

      // assert only 1 onChange happened (+1 first render)
      expect(onChangeCount).toBe(1 + 1);

      // assert only 1 rerender happened (+1 first render)
      expect(renderCount).toBe(1 + 1);
    });
  });

  describe('react', () => {
    it('color conversions don’t fire useEffect() hooks', () => {
      const color = 'color(srgb 0 0.3 1)';
      let rerenderCount = 0;
      let onChangeCount = 0;

      const props = {
        value: color,
        onChange: () => {
          onChangeCount++;
        },
        onRerender: () => {
          rerenderCount++;
        },
      };

      const { rerender } = render(<UseColorTester {...props} display='css' />);

      const colorspaces = ['original', 'css', 'a98', 'srgb', 'rgb', 'oklab', 'oklch', 'xyz', 'xyz50', 'xyz65'] as const;
      for (const c of colorspaces) {
        rerender(<UseColorTester {...props} display={c as keyof ColorType} />);
      }

      // assert onChange fired 0 times (+1 for first render)
      expect(onChangeCount).toBe(0 + 1);

      // assert rerendering happened once per colorspace (+1 for first render)
      expect(rerenderCount).toBe(colorspaces.length + 1);
    });
  });
});

describe('formatCss', () => {
  const source = createMemoizedColor('#663399');
  const tests: [string, string][] = [
    ['a98', 'color(a98-rgb 0.358 0.2123 0.5843)'],
    ['hsl', 'hsl(270 50% 40%)'],
    ['hsv', 'color(--hsv 270 0.6667 0.6)'],
    ['hwb', 'hwb(270 20% 40%)'],
    ['lab', 'lab(32.3927 38.423 -47.6911)'],
    ['lrgb', 'color(srgb-linear 0.1329 0.0331 0.3185)'],
    ['okhsl', 'color(--okhsl 303.373 0.7292 0.3533)'],
    ['okhsv', 'color(--okhsv 303.373 0.8057 0.6082)'],
    ['oklab', 'oklab(0.4403 0.0882 -0.1339)'],
    ['oklch', 'oklch(0.4403 0.1603 303.373)'],
    ['p3', 'color(display-p3 0.3737 0.2103 0.5791)'],
    ['prophoto', 'color(prophoto-rgb 0.3164 0.1913 0.4948)'],
    ['rec2020', 'color(rec2020 0.3046 0.1682 0.5309)'],
    ['rgb', 'color(srgb 0.4 0.2 0.6)'],
    ['srgb', 'color(srgb 0.4 0.2 0.6)'],
    ['xyz50', 'color(xyz-d50 0.1163 0.0726 0.2325)'],
    ['xyz65', 'color(xyz-d65 0.1241 0.0749 0.3093)'],
  ];
  it.each(tests)('%s', (key, want) => {
    expect(formatCss(source[key as keyof typeof source])).toBe(want);
  });
});
