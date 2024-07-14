import { ColorFilterOutline } from '@terrazzo/icons';
import { Select, SelectItem } from '@terrazzo/tiles';
import { type default as useColor, formatCss, COLORSPACES, parse } from '@terrazzo/use-color';
import clsx from 'clsx';
import { type ComponentProps, useState, useMemo, useEffect } from 'react';
import { channelOrder, updateColor } from '../lib/color.js';
import ColorChannelSlider from './ColorChannelSlider.js';
import './ColorPicker.css';

/** sRGB → P3 → Rec2020 */
export type Gamut = 'rgb' | 'p3' | 'rec2020';

export const COLOR_PICKER_SPACES = {
  rgb: 'RGB',
  oklab: 'Oklab',
  lab: 'Lab',
  oklch: 'Oklch',
  lch: 'Lch',
  okhsl: 'Okhsl',
  xyz50: 'XYZ (D50)',
  xyz65: 'XYZ (D65)',
};

export interface ColorPickerProps extends Omit<ComponentProps<'div'>, 'color'> {
  /** value from useColor() */
  color: ReturnType<typeof useColor>[0];
  setColor: ReturnType<typeof useColor>[1];
}

export default function ColorPicker({ className, color, setColor, ...rest }: ColorPickerProps) {
  const [codeColor, setCodeColor] = useState(color.css);
  const [maxGamut] = useState<Gamut>('rgb');
  const normalizedColorMode = useMemo(
    () => (['p3', 'rec2020', 'lrgb'].includes(color.original.mode) ? 'rgb' : color.original.mode),
    [color],
  );
  useEffect(() => {
    setCodeColor(color.css);
  }, [...Object.values(color.original)]);

  return (
    <div
      className={clsx('tz-color-picker', className)}
      style={{
        '--current-color': ['okhsl', 'okhsv'].includes(color.original.mode) ? formatCss(color.oklab)! : color.css,
      }}
      {...rest}
    >
      <div className='tz-color-picker-preview'>
        <div className='tz-color-picker-swatch' />
      </div>
      <div className='tz-color-picker-colorspace'>
        <Select
          value={normalizedColorMode}
          trigger={color.original.mode}
          onValueChange={(newValue: keyof typeof COLORSPACES) => {
            if (newValue in COLORSPACES) {
              setColor(updateColor(COLORSPACES[newValue].converter(color.original)!, maxGamut));
            } else {
              // eslint-disable-next-line no-console
              console.warn(`[@terrazzo/react-color-picker] unsupported colorspace "${newValue}"`);
            }
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
        {channelOrder(color.original).map((channel) => {
          if (channel === 'mode') {
            return null;
          }
          return (
            <ColorChannelSlider key={channel} channel={channel} color={color} gamut={maxGamut} setColor={setColor} />
          );
        })}
      </div>
      <div className='tz-color-picker-code'>
        <input
          type='text'
          className='tz-color-picker-code-input'
          value={codeColor}
          onChange={(evt) => {
            setCodeColor(evt.target.value);
            const parsed = parse(evt.currentTarget.value);
            if (parsed) {
              setColor(updateColor(parsed, maxGamut));
            }
          }}
        />
      </div>
    </div>
  );
}
