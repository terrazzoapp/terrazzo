import { ColorFilterOutline } from '@terrazzo/icons';
import { Select, SelectItem } from '@terrazzo/tiles';
import type useColor from '@terrazzo/use-color';
import clsx from 'clsx';
import { to as convert, serialize } from 'colorjs.io/fn';
import { type ComponentProps, useEffect, useMemo, useState } from 'react';
import ColorChannelSlider from './ColorChannelSlider.js';
import './ColorPicker.css';

/** sRGB → P3 → Rec2020 */
export type Gamut = 'srgb' | 'p3' | 'rec2020';

export const COLOR_PICKER_SPACES = {
  srgb: 'sRGB',
  oklab: 'Oklab',
  lab: 'Lab',
  oklch: 'OkLCh',
  lch: 'LCH',
  okhsl: 'Okhsl',
  'xyz-d50': 'XYZ (D50)',
  'xyz-d65': 'XYZ (D65)',
};

export interface ColorPickerProps extends Omit<ComponentProps<'div'>, 'color'> {
  /** value from useColor() */
  color: ReturnType<typeof useColor>[0];
  setColor: ReturnType<typeof useColor>[1];
}

export default function ColorPicker({ className, color, setColor, ...rest }: ColorPickerProps) {
  const [codeColor, setCodeColor] = useState(color.css);
  const [maxGamut] = useState<Gamut>('srgb');
  const normalizedColorMode = useMemo(
    () => (['p3', 'rec2020', 'srgb-linear'].includes(color.original.space.id) ? 'srgb' : color.original.space.id),
    [color],
  );
  useEffect(() => {
    setCodeColor(color.css);
  }, [color.css]);

  return (
    <div
      className={clsx('tz-color-picker', className)}
      style={{
        '--current-color': ['okhsl', 'okhsv'].includes(color.original.space.id) ? serialize(color.oklab)! : color.css,
      }}
      {...rest}
    >
      <div className='tz-color-picker-preview'>
        <div className='tz-color-picker-swatch' />
      </div>
      <div className='tz-color-picker-colorspace'>
        <Select
          value={normalizedColorMode}
          trigger={color.original.space.id}
          onValueChange={(colorSpace) => {
            setColor(convert(color.original, colorSpace, { inGamut: { space: maxGamut } }) as any);
          }}
        >
          {Object.entries(COLOR_PICKER_SPACES).map(([id, label]) => (
            <SelectItem key={id} value={id} icon={<ColorFilterOutline />}>
              {label}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className='tz-color-picker-sliders'>
        {Object.keys(color.original.space.coords).map((channel) => {
          return <ColorChannelSlider key={channel} channel={channel} color={color} setColor={setColor} />;
        })}
      </div>
      <div className='tz-color-picker-code'>
        <input
          type='text'
          className='tz-color-picker-code-input'
          value={codeColor}
          onChange={(evt) => setColor(evt.target.value)}
        />
      </div>
    </div>
  );
}
