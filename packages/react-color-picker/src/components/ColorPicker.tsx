import { ColorFilterOutline } from '@terrazzo/icons';
import { Select, SelectItem } from '@terrazzo/tiles';
import type useColor from '@terrazzo/use-color';
import clsx from 'clsx';
import { to as convert, serialize } from 'colorjs.io/fn';
import { type ComponentProps, useEffect, useMemo, useState } from 'react';
import ColorChannelSlider from './ColorChannelSlider.js';
import './ColorPicker.css.js';

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

export type ColorPickerSpace = keyof typeof COLOR_PICKER_SPACES;

export interface ColorPickerProps extends Omit<ComponentProps<'div'>, 'color'> {
  /** value from useColor() */
  color: ReturnType<typeof useColor>[0];
  colorSpaces?: ColorPickerSpace[];
  setColor: ReturnType<typeof useColor>[1];
}

export default function ColorPicker({ className, color, colorSpaces, setColor, ...rest }: ColorPickerProps) {
  const [codeColor, setCodeColor] = useState(color.css);
  const [maxGamut] = useState<Gamut>('srgb');
  const normalizedColorMode = useMemo(
    () => (['p3', 'rec2020', 'srgb-linear'].includes(color.original.space.id) ? 'srgb' : color.original.space.id),
    [color],
  );
  const selectableColorSpaces = useMemo(() => {
    if (!colorSpaces) {
      return Object.entries(COLOR_PICKER_SPACES);
    }
    return Object.entries(COLOR_PICKER_SPACES).filter(([id]) => colorSpaces.includes(id as ColorPickerSpace));
  }, [colorSpaces]);
  const selectedColorMode = useMemo(
    () =>
      selectableColorSpaces.some(([id]) => id === normalizedColorMode)
        ? normalizedColorMode
        : selectableColorSpaces[0]?.[0],
    [normalizedColorMode, selectableColorSpaces],
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
          value={selectedColorMode}
          trigger={color.original.space.id}
          onValueChange={(colorSpace) => {
            setColor(convert(color.original, colorSpace, { inGamut: { space: maxGamut } }) as any);
          }}
        >
          {selectableColorSpaces.map(([id, label]) => (
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
