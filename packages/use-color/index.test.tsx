import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ColorConstructor } from 'colorjs.io/fn';
import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import useColor, { type ColorInput, type ColorOutput, parse } from './index.js';

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

      <div data-testid='color-display'>
        {color[display]?.space
          ? JSON.stringify({
              ...color[display],
              space: { id: color[display].space.id }, // prevent circular JSON
            })
          : ''}
      </div>
    </>
  );
}

describe('useColor', () => {
  afterEach(() => {
    cleanup();
  });

  describe('parse', () => {
    const formatTests: [string, { given: any; want: ColorConstructor }][] = [
      [
        'hex',
        {
          given: '#663399',
          want: { spaceId: 'srgb', coords: [0.4, 0.2, 0.6], alpha: 1 },
        },
      ],
      [
        'hsl',
        {
          given: 'hsl(270 50% 40%)',
          want: { spaceId: 'hsl', coords: [270, 50, 40], alpha: 1 },
        },
      ],
      [
        'oklab',
        {
          given: 'oklab(0.7 0.3 0.4)',
          want: { spaceId: 'oklab', coords: [0.7, 0.3, 0.4], alpha: 1 },
        },
      ],
      [
        'oklch',
        {
          given: 'oklch(0.7 0.2 150)',
          want: { spaceId: 'oklch', coords: [0.7, 0.2, 150], alpha: 1 },
        },
      ],
      [
        'okhsv',
        {
          given: 'color(--okhsv 150 0.6 0.8)',
          want: { spaceId: 'okhsv', coords: [150, 0.6, 0.8], alpha: 1 },
        },
      ],
      [
        'okhsl',
        {
          given: 'color(--okhsl 150 0.8 0.5)',
          want: { spaceId: 'okhsl', coords: [150, 0.8, 0.5], alpha: 1 },
        },
      ],
      [
        'display-p3',
        {
          given: 'color(display-p3 0.3 0.1 0.6)',
          want: { spaceId: 'p3', coords: [0.3, 0.1, 0.6], alpha: 1 },
        },
      ],
      [
        'lrgb',
        {
          given: 'color(srgb-linear 0.3 0.1 0.6)',
          want: { spaceId: 'srgb-linear', coords: [0.3, 0.1, 0.6], alpha: 1 },
        },
      ],
      [
        'rgb',
        {
          given: 'rgb(30% 10% 60%)',
          want: { spaceId: 'srgb', coords: [0.3, 0.1, 0.6], alpha: 1 },
        },
      ],
      [
        'srgb',
        {
          given: 'color(srgb 0.3 0.1 0.6)',
          want: { spaceId: 'srgb', coords: [0.3, 0.1, 0.6], alpha: 1 },
        },
      ],
      [
        'xyz-d50',
        {
          given: 'color(xyz-d50 0.7 0.3 -0.05)',
          want: { spaceId: 'xyz-d50', coords: [0.7, 0.3, -0.05], alpha: 1 },
        },
      ],
      [
        'xyz-d65',
        {
          given: 'color(xyz-d65 0.7 0.3 -0.05)',
          want: { spaceId: 'xyz-d65', coords: [0.7, 0.3, -0.05], alpha: 1 },
        },
      ],
    ];

    it.each(formatTests)('%s', (_, { given, want }) => {
      const result = parse(given)!;
      for (const k of Object.keys(result)) {
        if (typeof (result as any)[k] === 'number') {
          expect((result as any)[k]).toBeCloseTo((want as any)[k]);
        } else {
          expect((result as any)[k]).toStrictEqual((want as any)[k]);
        }
      }
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
      const displayedColor = JSON.parse(screen.getByTestId('color-display').innerHTML);
      expect(displayedColor.space.id).toBe('srgb');
      expect(displayedColor.coords[0]).toBeCloseTo(0.0001617559902515342);
      expect(displayedColor.coords[1]).toBeCloseTo(0.30008212426886693);
      expect(displayedColor.coords[2]).toBeCloseTo(0.9998580363362607);
      expect(displayedColor.alpha).toBeCloseTo(1);

      // assert only 1 render happened
      expect(renderCount).toBe(1);
    });

    it('returns undefined for unknown color spaces', () => {
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
      const displayedColor = JSON.parse(screen.getByTestId('color-display').innerHTML);
      expect(displayedColor.space.id).toBe('srgb');
      expect(displayedColor.coords[0]).toBeCloseTo(0.6);
      expect(displayedColor.coords[1]).toBeCloseTo(0.3);
      expect(displayedColor.coords[2]).toBeCloseTo(0.5);
      expect(displayedColor.alpha).toBeCloseTo(1);

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

      const colorSpaces = ['original', 'css', 'a98', 'srgb', 'rgb', 'oklab', 'oklch', 'xyz', 'xyz50', 'xyz65'] as const;
      for (const c of colorSpaces) {
        rerender(<UseColorTester {...props} display={c as keyof ColorType} />);
      }

      // assert onChange fired 0 times (+1 for first render)
      expect(onChangeCount).toBe(0 + 1);

      // assert rerendering happened once per color space (+1 for first render)
      expect(rerenderCount).toBe(colorSpaces.length + 1);
    });
  });
});
