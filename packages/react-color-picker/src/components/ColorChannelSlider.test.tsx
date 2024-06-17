import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ColorChannelSlider, { calculateBounds, type ColorChannelSliderProps } from './ColorChannelSlider';
import useColor from '@terrazzo/use-color';

function ColorChannelTest({
  defaultColor,
  ...rest
}: Omit<ColorChannelSliderProps, 'color' | 'setColor'> & { defaultColor: string }) {
  const [color, setColor] = useColor(defaultColor);

  return <ColorChannelSlider {...rest} color={color} setColor={setColor} />;
}

describe('ColorChannelSlider', () => {
  describe('display', () => {
    it('percentage', () => {
      render(<ColorChannelTest defaultColor='#663399' channel='r' min={0} max={1} />);
      expect(screen.getByRole<HTMLInputElement>('spinbutton').value).toBe('40.000');
    });

    it('nonpercentange', () => {
      render(<ColorChannelTest defaultColor='oklch(0.5 0.2 120)' channel='c' min={0} max={0.4} />);
      expect(screen.getByRole<HTMLInputElement>('spinbutton').value).toBe('0.200');
    });
  });
});

describe('calculateBounds', () => {
  const tests: [string, { given: Parameters<typeof calculateBounds>; want: ReturnType<typeof calculateBounds> }][] = [
    [
      'srgb',
      { given: [{ mode: 'rgb', r: 0.3, g: 0.1, b: 0.6, alpha: 1 }, 'r', 'rgb'], want: { min: 0, max: 1, range: 1 } },
    ],
    [
      'oklch',
      {
        given: [{ mode: 'oklch', l: 0.7, c: 0.2, h: 150, alpha: 1 }, 'c', 'rgb'],
        want: {
          min: 0,
          max: 0.19277343750000003,
          range: 0.19277343750000003,
          displayMax: 0.4,
          displayRange: 0.4,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, { given, want }) => {
    expect(calculateBounds(...given)).toEqual(want);
  });
});
