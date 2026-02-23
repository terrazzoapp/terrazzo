import { Slider } from '@terrazzo/tiles';
import type { default as useColor } from '@terrazzo/use-color';
import { type ColorSpace, to as convert, get, serialize, set } from 'colorjs.io/fn';
import { type ReactElement, useMemo } from 'react';
import HueWheel from './HueWheel.js';
import TrueGradient from './TrueGradient.js';
import './ColorChannelSlider.css';

/** size, in px, to pad inner track */
export const TRACK_PADDING = 4;
/** CSS class to add to body */
export const BODY_DRAGGING_CLASS = 'tz-color-channel-slider-is-grabbing';
/** Amount Shift key affects drag rate */
export const SHIFT_FACTOR = 0.25;

const CHANNEL_PRECISION = 5;

function isPerc(color: ColorSpace, channel: string | 'alpha'): boolean {
  if (channel === 'alpha') {
    return true;
  }
  const lower = color.coords[channel]?.range?.[0];
  const upper = color.coords[channel]?.range?.[1];
  return lower === 0 && (upper === 1 || upper === 100);
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
  if (['hsl', 'lch', 'okhsl', 'okhsv', 'oklch'].includes(color.original.space.id) && channel === 'h') {
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
            // don’t use "transparent" to prevent the “fade to black” problem that could exist in some browsers in higher color spaces
            '--left-color': serialize({ ...color.oklab, alpha: 0 }),
            '--right-color': serialize({ ...color.oklab, alpha: 1 }),
          }}
        />
      </div>
    );
  }

  const range = (displayMax ?? max) - (displayMin ?? min);
  const leftOklab = useMemo(() => {
    const minColor = set(
      { space: color.original.space, coords: [...color.original.coords], alpha: 1 },
      channel,
      displayMin ?? min,
    );
    return convert(minColor, 'oklab', { inGamut: { space: 'p3' } });
  }, [color, channel, displayMin, min]);
  const rightOklab = useMemo(() => {
    const maxColor = set(
      { space: color.original.space, coords: [...color.original.coords], alpha: 1 },
      channel,
      displayMax ?? max,
    );
    return convert(maxColor, 'oklab', { inGamut: { space: 'p3' } });
  }, [color, channel, displayMax, max]);

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
  setColor: ReturnType<typeof useColor>[1];
}

export default function ColorChannelSlider({
  channel,
  className,
  color,
  setColor,
}: ColorChannelSliderProps): ReactElement {
  const [min, max] = color.original.space.coords[channel]?.range ??
    color.original.space.coords[channel]?.refRange ?? [0, 1];

  return (
    <Slider
      bg={<ColorChannelBG channel={channel} color={color} min={min} max={max} />}
      className={className}
      handleColor={color.css}
      label={color.original.space.coords[channel]?.name ?? channel}
      max={max}
      min={min}
      onChange={(newValue) => {
        setColor(set(color.original, channel, newValue));
      }}
      percentage={isPerc(color.original.space, channel)}
      step={1 / 10 ** CHANNEL_PRECISION}
      value={get(color.original, channel)}
    />
  );
}
