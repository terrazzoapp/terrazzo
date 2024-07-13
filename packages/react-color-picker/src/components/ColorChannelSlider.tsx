import {  clamp,  } from '@terrazzo/tiles';
import { COLORSPACES, type default as useColor, formatCss } from '@terrazzo/use-color';
import { useDrag } from '@use-gesture/react';
import { type ComponentProps, type ReactElement,  useRef, useState, useEffect, useMemo } from 'react';
import { calculateBounds } from '../lib/color.js';
import type { WebGLColor } from '../lib/webgl.js';
import './ColorChannelSlider.css';
import HueWheel from './HueWheel.js';
import TrueGradient from './TrueGradient.js';

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

const CHANNEL_STEP = 0.001; // TODO: do some colorspaces/channels need different values?

const RGB_COLORSPACES = ['a98', 'lrgb', 'p3', 'rgb', 'prophoto', 'rec2020'];
// const SRGB_COLORSPACES = ['rgb', 'hsv', 'hsl', 'hwb'];
// const P3_COLORSPACES = ['p3'];

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
  let leftColor = { ...color.original, [channel]: min, alpha: 1 } as WebGLColor;
  if (!RGB_COLORSPACES.includes(color.original.mode)) {
    leftColor = COLORSPACES.p3.converter(leftColor);
  }
  let rightColor = { ...color.original, [channel]: max, alpha: 1 } as WebGLColor;
  if (!RGB_COLORSPACES.includes(color.original.mode)) {
    rightColor = COLORSPACES.p3.converter(rightColor);
  }

  return (
    <div className='tz-color-channel-slider-bg-wrapper'>
      <TrueGradient className='tz-color-channel-slider-bg' start={leftColor} end={rightColor} />
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

interface ColorChannelDragProps {
  channel: string;
  color: ReturnType<typeof useColor>[0];
  displayMax?: number;
  displayMin?: number;
  max: number;
  min: number;
  setColor: ReturnType<typeof useColor>[1];
}

function ColorChannelDrag({ channel, color, displayMax, displayMin, max, min, setColor }: ColorChannelDragProps) {
  const wrapperEl = useRef<HTMLDivElement | null>(null);
  const [wrapperWidth, setWrapperWidth] = useState(240);
  const [innerValue, setInnerValue] = useState(color.original[channel as keyof typeof color.original] as number);
  const prevValue = useRef(innerValue);
  const range = (displayMax ?? max) - (displayMin ?? min);
  const draggable = useDrag(({ first, last, movement, shiftKey }) => {
    if (first) {
      prevValue.current = innerValue;
      document.body.classList.add(BODY_DRAGGING_CLASS);
      if (wrapperEl.current) {
        const { width } = wrapperEl.current.getBoundingClientRect();
        setWrapperWidth(width);
      }
    }
    if (last) {
      document.body.classList.remove(BODY_DRAGGING_CLASS);
    }
    const [movementX] = movement;
    const xRaw = (movementX * (shiftKey ? SHIFT_FACTOR : 1)) / wrapperWidth;
    const nextValue = clamp(prevValue.current + xRaw * range, min, max);
    if (nextValue !== innerValue) {
      setInnerValue(nextValue);
      setColor((value) => ({ ...value.original, [channel]: nextValue }));
    }
  });

  // bubble up updates
  useEffect(() => {
    setColor((value) => ({ ...value.original, [channel]: innerValue }));
  }, [innerValue]);

  // update inner value (safely) on channel, mode, or min/max change
  useEffect(() => {
    setInnerValue(clamp(color.original[channel as keyof typeof color.original] as number, min, max));
  }, [channel, color.original.mode, min, max]);
  // update inner value (dangerously) if > CHANNEL_STEP
  useEffect(() => {
    if (Math.abs((color.original[channel as keyof typeof color.original] as number) - innerValue) > CHANNEL_STEP) {
      setInnerValue(color.original[channel as keyof typeof color.original] as number);
    }
  }, [color.original[channel as keyof typeof color.original]]);

  return (
    <div className='tz-color-channel-slider-wrapper'>
      <ColorChannelBG
        channel={channel}
        color={color}
        min={min}
        max={max}
        displayMin={displayMin}
        displayMax={displayMax}
      />
      <div ref={wrapperEl} className='tz-color-channel-slider-bounds'>
        <div
          className='tz-color-channel-slider-track'
          onPointerDown={(evt) => {
            const { left, width } = evt.currentTarget.getBoundingClientRect();
            const nextValue = clamp((displayMin ?? min) + ((evt.clientX - left) / width) * range, min, max);
            if (nextValue !== innerValue) {
              setInnerValue(nextValue);
              prevValue.current = nextValue;
            }
          }}
        />
        <div
          {...draggable()}
          className='tz-color-channel-slider-handle'
          style={{
            '--x': `${clamp(
              ((innerValue - (displayMin ?? min)) / range) * wrapperWidth,
              TRACK_PADDING,
              wrapperWidth - 2 * TRACK_PADDING,
            )}px`,
          }}
        />
      </div>
    </div>
  );
}

export interface ColorChannelSliderProps extends Omit<ComponentProps<'input'>, 'color' | 'onChange' | 'value'> {
  channel: string;
  color: ReturnType<typeof useColor>[0];
  gamut?: 'rgb' | 'p3' | 'rec2020';
  setColor: ReturnType<typeof useColor>[1];
}

export default function ColorChannelSlider({
  channel,
  className,
  color,
  gamut = 'rgb',
  setColor,
  ...rest
}: ColorChannelSliderProps): ReactElement {
  const { min, max, displayMin, displayMax } = useMemo(
    () => calculateBounds(color.original, channel, gamut),
    [color.original, channel, gamut],
  );

  return (
    <Slider
      bg={
        <ColorChannelBG
          channel={channel}
          color={color}
          min={min}
          max={max}
          displayMin={displayMin}
          displayMax={displayMax}
        />
      }
      {...rest}
    />
  );
}
