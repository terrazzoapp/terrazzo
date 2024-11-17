import { Slider } from '@terrazzo/tiles';
import { type ColorOutput, type Oklab, formatCss, type default as useColor, withAlpha } from '@terrazzo/use-color';
import { modeLrgb, modeOklab, modeRgb, useMode } from 'culori';
import { type ReactElement, useMemo } from 'react';
import { calculateBounds } from '../lib/color.js';
import HueWheel from './HueWheel.js';
import TrueGradient from './TrueGradient.js';
import './ColorChannelSlider.css';

useMode(modeRgb);
useMode(modeLrgb);
const toOklab = useMode(modeOklab);

/** size, in px, to pad inner track */
export const TRACK_PADDING = 4;
/** CSS class to add to body */
export const BODY_DRAGGING_CLASS = 'tz-color-channel-slider-is-grabbing';
/** Amount Shift key affects drag rate */
export const SHIFT_FACTOR = 0.25;

const CHANNEL_LABEL: Record<string, string | undefined> = {
  alpha: 'Alpha',
  b: 'Blue', // note: conflicts with Lab “B”! Handle conditionally though
  c: 'Chroma',
  g: 'Green',
  h: 'Hue',
  l: 'Lightness',
  r: 'Red',
  s: 'Saturation',
  v: 'Value',
};

const CHANNEL_PRECISION = 5;

const RGB_COLORSPACES = ['a98', 'lrgb', 'p3', 'rgb', 'prophoto', 'rec2020'];
// const SRGB_COLORSPACES = ['rgb', 'hsv', 'hsl', 'hwb'];
// const P3_COLORSPACES = ['p3'];

function isPerc(color: ColorOutput, channel: string): boolean {
  if (RGB_COLORSPACES.includes(color.original.mode)) {
    return true;
  }
  if (channel === 'l' || channel === 'c' || channel === 's' || channel === 'v' || channel === 'alpha') {
    return true;
  }
  if (channel === 'h') {
    return false;
  }
  return false;
}

export interface ColorChannelBGProps {
  channel: string;
  color: ReturnType<typeof useColor>[0];
  min: number;
  displayMin?: number;
  max: number;
  displayMax?: number;
}

function ColorChannelBG({ channel, color, displayMin, displayMax, min, max }: ColorChannelBGProps) {
  if (channel === 'h') {
    return (
      <div className='tz-color-channel-slider-bg-wrapper'>
        <HueWheel className='tz-color-channel-slider-bg' />
      </div>
    );
  }
  if (channel === 'alpha') {
    return (
      <div className='tz-color-channel-slider-bg-wrapper'>
        <div
          className='tz-color-channel-slider-bg tz-color-channel-slider-bg__alpha'
          style={{
            // don’t use "transparent" to prevent the “fade to black” problem that could exist in some browsers in higher colorspaces
            '--left-color': formatCss({
              ...(RGB_COLORSPACES.includes(color.original.mode) ? color.original : color.oklab),
              alpha: 0,
            })!,
            '--right-color': formatCss({
              ...(RGB_COLORSPACES.includes(color.original.mode) ? color.original : color.oklab),
              alpha: 1,
            })!,
          }}
        />
      </div>
    );
  }

  const range = (displayMax ?? max) - (displayMin ?? min);
  const leftColor = { ...color.original, [channel]: displayMin ?? min };
  const rightColor = { ...color.original, [channel]: displayMax ?? max };
  const leftOklab = useMemo(() => withAlpha(toOklab(leftColor) as Oklab) as Oklab, [color.css]);
  const rightOklab = useMemo(() => withAlpha(toOklab(rightColor) as Oklab) as Oklab, [color.css]);

  return (
    <div className='tz-color-channel-slider-bg-wrapper'>
      <TrueGradient className='tz-color-channel-slider-bg' start={leftOklab} end={rightOklab} />
      {typeof displayMin === 'number' && displayMin < min && (
        <div
          className='tz-color-channel-slider-overlay tz-color-channel-slider-overlay__min'
          style={{ '--width': `${(100 * (min - displayMin)) / range}%` }}
        />
      )}
      {typeof displayMax === 'number' && displayMax > max && (
        <div
          className='tz-color-channel-slider-overlay tz-color-channel-slider-overlay__max'
          style={{ '--width': `${(100 * (displayMax - max)) / range}%` }}
        />
      )}
    </div>
  );
}

export interface ColorChannelSliderProps {
  channel: string;
  className?: string;
  color: ReturnType<typeof useColor>[0];
  gamut?: 'rgb' | 'p3' | 'rec2020';
  setColor: ReturnType<typeof useColor>[1];
}

export default function ColorChannelSlider({
  channel,
  className,
  color,
  // gamut = 'rgb',
  setColor,
}: ColorChannelSliderProps): ReactElement {
  const { min, max } = useMemo(() => calculateBounds(color.original, channel), [color.original, channel]);

  return (
    <Slider
      bg={<ColorChannelBG channel={channel} color={color} min={min} max={max} />}
      className={className}
      handleColor={color.css}
      label={CHANNEL_LABEL[channel] ?? channel}
      max={max}
      min={min}
      onChange={(newValue: number) => setColor({ ...color.original, [channel]: newValue })}
      percentage={isPerc(color, channel)}
      step={1 / 10 ** CHANNEL_PRECISION}
      value={color.original[channel as keyof typeof color.original] as number}
    />
  );
}
