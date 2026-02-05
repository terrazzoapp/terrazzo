import { Slider } from '@terrazzo/tiles';
import type { default as useColor } from '@terrazzo/use-color';
import { type ColorConstructor, type ColorSpace, to as convert, serialize } from 'colorjs.io/fn';
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

// Note: this is deep within Color.js but it’s too annoying to fish out, just make it simple
const CHANNEL_ORDER: Record<string, Record<string, number | undefined>> = {
  a98: { r: 0, g: 1, b: 2 },
  hsl: { h: 0, s: 1, l: 2 },
  hsv: { h: 0, s: 1, v: 2 },
  hwb: { h: 0, w: 1, b: 2 },
  lab: { l: 0, a: 1, b: 2 },
  'lab-d65': { l: 0, a: 1, b: 2 },
  lch: { l: 0, c: 1, h: 2 },
  okhsl: { h: 0, s: 1, l: 2 },
  okhsv: { h: 0, s: 1, v: 2 },
  oklab: { l: 0, a: 1, b: 2 },
  oklch: { l: 0, c: 1, h: 2 },
  prophoto: { r: 0, g: 1, b: 2 },
  rec2020: { r: 0, g: 1, b: 2 },
  srgb: { r: 0, g: 1, b: 2 },
  'srgb-linear': { r: 0, g: 1, b: 2 },
  'xyz-d50': { x: 0, y: 1, z: 2 },
  'xyz-d65': { x: 0, y: 1, z: 2 },
};

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
  if (['hsl', 'okhsl'].includes(color.original.spaceId) && channel === 'h') {
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
    const leftColor: ColorConstructor = { ...color.original, coords: [...color.original.coords] };
    leftColor.coords[CHANNEL_ORDER[color.original.spaceId]?.[channel] ?? -1] = displayMin ?? min;
    return convert(leftColor, 'oklab');
  }, [color, channel, displayMin, min]);
  const rightOklab = useMemo(() => {
    const rightColor: ColorConstructor = { ...color.original, coords: [...color.original.coords] };
    rightColor.coords[CHANNEL_ORDER[color.original.spaceId]?.[channel] ?? -1] = displayMax ?? max;
    return convert(rightColor, 'oklab');
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
  const coordI = CHANNEL_ORDER[color.original.spaceId]?.[channel] ?? -1;

  return (
    <Slider
      bg={<ColorChannelBG channel={channel} color={color} min={min} max={max} />}
      className={className}
      handleColor={color.css}
      label={color.original.space.coords[channel]?.name ?? channel}
      max={max}
      min={min}
      onChange={(newValue: number) => {
        if (channel === 'alpha') {
          setColor({ ...color.original, alpha: newValue });
          return;
        }
        const next: ColorConstructor = { ...color.original, coords: [...color.original.coords] };
        next.coords[coordI] = newValue;
        setColor(next);
      }}
      percentage={isPerc(color.original.space, channel)}
      step={1 / 10 ** CHANNEL_PRECISION}
      value={channel === 'alpha' ? (color.original.alpha ?? 1) : color.original.coords[coordI] || 0}
    />
  );
}
