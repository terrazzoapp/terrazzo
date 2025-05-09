import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Color } from 'culori';
import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import useColor, {
  type ColorInput,
  type ColorOutput,
  createMemoizedColor,
  formatCss,
  parse,
  type Rgb,
} from './index.js';

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
      [
        'hex',
        {
          given: '#663399',
          want: {
            mode: 'rgb',
            r: 0.40000000000000013,
            g: 0.20000000000000018,
            b: 0.5999999999999999,
            alpha: 1,
          },
        },
      ],
      [
        'hsl',
        {
          given: 'hsl(270 50% 40%)',
          want: { mode: 'hsl', h: 270, s: 0.5, l: 0.4, alpha: 1 },
        },
      ],
      [
        'oklab',
        {
          given: 'oklab(0.7 0.3 0.4)',
          want: { mode: 'oklab', l: 0.7, a: 0.3, b: 0.4, alpha: 1 },
        },
      ],
      [
        'oklch',
        {
          given: 'oklch(0.7 0.2 150)',
          want: { mode: 'oklch', l: 0.7, c: 0.2, h: 150, alpha: 1 },
        },
      ],
      [
        'okhsv',
        {
          given: 'color(--okhsv 150 0.6 0.8)',
          want: { mode: 'okhsv', h: 150, s: 0.6, v: 0.8, alpha: 1 },
        },
      ],
      [
        'okhsl',
        {
          given: 'color(--okhsl 150 0.8 0.5)',
          want: { mode: 'okhsl', h: 150, s: 0.8, l: 0.5, alpha: 1 },
        },
      ],
      [
        'display-p3',
        {
          given: 'color(display-p3 0.3 0.1 0.6)',
          want: {
            mode: 'p3',
            r: 0.29999999999999977,
            g: 0.10000000000000009,
            b: 0.6000000000000002,
            alpha: 1,
          },
        },
      ],
      [
        'lrgb',
        {
          given: 'color(srgb-linear 0.3 0.1 0.6)',
          want: { mode: 'lrgb', r: 0.3, g: 0.1, b: 0.6, alpha: 1 },
        },
      ],
      [
        'rgb',
        {
          given: 'rgb(30% 10% 60%)',
          want: {
            mode: 'rgb',
            r: 0.30000000000000027,
            g: 0.0999999999999994,
            b: 0.6,
            alpha: 1,
          },
        },
      ],
      [
        'srgb',
        {
          given: 'color(srgb 0.3 0.1 0.6)',
          want: {
            mode: 'rgb',
            r: 0.30000000000000027,
            g: 0.0999999999999994,
            b: 0.6,
            alpha: 1,
          },
        },
      ],
      [
        'xyz50',
        {
          given: 'color(xyz-d50 0.7 0.3 -0.05)',
          want: { mode: 'xyz50', x: 0.7, y: 0.3, z: -0.05, alpha: 1 },
        },
      ],
      [
        'xyz65',
        {
          given: 'color(xyz-d65 0.7 0.3 -0.05)',
          want: { mode: 'xyz65', x: 0.7, y: 0.3, z: -0.05, alpha: 1 },
        },
      ],
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
        r: 0.6000000000000015,
        g: 0.2999999999999985,
        b: 0.4999999999999997,
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
    ['a98', 'color(a98-rgb 0.35800 0.21232 0.58434)'],
    ['hsl', 'hsl(270.00 50.00% 40.00%)'],
    ['hsv', 'color(--hsv 270.00 0.66667 0.60000)'],
    ['hwb', 'hwb(270.00 20.00% 40.00%)'],
    ['lab', 'lab(32.39 38.42 -47.69)'],
    ['lrgb', 'color(srgb-linear 0.13287 0.03310 0.31855)'],
    ['okhsl', 'color(--okhsl 303.37 0.72916 0.35328)'],
    ['okhsv', 'color(--okhsv 303.37 0.80572 0.60825)'],
    ['oklab', 'oklab(0.44027 0.08818 -0.13386)'],
    ['oklch', 'oklch(0.44027 0.16030 303.37)'],
    ['p3', 'color(display-p3 0.37367 0.21033 0.57911)'],
    ['prophoto', 'color(prophoto-rgb 0.31642 0.19133 0.49481)'],
    ['rec2020', 'color(rec2020 0.30459 0.16817 0.53086)'],
    ['rgb', 'color(srgb 0.40000 0.20000 0.60000)'],
    ['srgb', 'color(srgb 0.40000 0.20000 0.60000)'],
    ['xyz50', 'color(xyz-d50 0.11627 0.07260 0.23254)'],
    ['xyz65', 'color(xyz-d65 0.12412 0.07493 0.30930)'],
  ];
  it.each(tests)('%s', (key, want) => {
    expect(formatCss(source[key as keyof typeof source])).toBe(want);
  });
});
