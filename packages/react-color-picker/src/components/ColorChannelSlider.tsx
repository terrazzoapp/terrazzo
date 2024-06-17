import { SubtleInput, clamp, zeroPad, snap } from '@terrazzo/tiles';
import {
  clampChroma,
  COLORSPACES,
  type Color,
  type default as useColor,
  formatCss,
  inGamut,
  type Oklch,
} from '@terrazzo/use-color';
import clsx from 'clsx';
import {
  type ComponentProps,
  type ReactElement,
  memo,
  useId,
  useRef,
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
} from 'react';
import HueWheel from './HueWheel.js';
import TrueGradient from './TrueGradient.js';
import type { WebGLColor } from '../lib/webgl.js';
import './ColorChannelSlider.css';

/** size, in px, to pad inner track */
export const TRACK_PADDING = 3;
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

/** Calculate min, max, displayMin, and displayMax for a given color/colorspace/gamut */
export function calculateBounds(color: Color, channel: string, gamut: 'rgb' | 'p3' | 'rec2020' = 'rgb') {
  let min = 0;
  let max = 1;
  let displayMin: number | undefined;
  let displayMax: number | undefined;
  switch (color.mode) {
    case 'hsl':
    case 'hwb':
    case 'okhsl':
    case 'okhsv':
    case 'hsv': {
      switch (channel) {
        case 'h': {
          max = 360;
        }
      }
      break;
    }
    case 'lab':
    case 'oklab': {
      if (channel === 'a' || channel === 'b') {
        min = -100;
        const clamped = clampChroma(color, color.mode, gamut);
        max = clamped[channel as keyof Omit<Color, 'mode'>] || 100;
        displayMax = 100;
      }
      break;
    }
    case 'lch':
    case 'oklch': {
      switch (channel) {
        case 'h': {
          max = 360;
          break;
        }
        case 'c': {
          const clamped = clampChroma({ ...color, c: 0.4 }, color.mode, gamut);
          max = (clamped as Oklch).c;
          displayMax = 0.4;
          break;
        }
      }
      break;
    }
    case 'xyz50':
    case 'xyz65': {
      min = -0.5;
      if (!inGamut(color, gamut)) {
        const clamped = clampChroma(color, color.mode, gamut);
        max = clamped[channel as keyof Omit<Color, 'mode'>] || 1;
        displayMax = 1;
      }
    }
  }

  const result: {
    min: number;
    max: number;
    range: number;
    displayMin?: number;
    displayMax?: number;
    displayRange?: number;
  } = { min, max, range: max - min };
  if (typeof displayMin === 'number') {
    result.displayMin = displayMin;
  }
  if (typeof displayMax === 'number') {
    result.displayMax = displayMax;
    result.displayRange = displayMax - (displayMin ?? min);
  }

  return result;
}

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

const ColorChannelBG = memo(function ColorChannelBG({
  channel,
  color,
  displayMin,
  displayMax,
  min,
  max,
}: ColorChannelBGProps) {
  if (channel === 'h') {
    return (
      <div className="tz-color-channel-slider-bg-wrapper">
        <HueWheel className="tz-color-channel-slider-bg" />
      </div>
    );
  }
  if (channel === 'alpha') {
    return (
      <div className="tz-color-channel-slider-bg-wrapper">
        <div
          className="tz-color-channel-slider-bg tz-color-channel-slider-bg__alpha"
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
    <div className="tz-color-channel-slider-bg-wrapper">
      <TrueGradient className="tz-color-channel-slider-bg" start={leftColor} end={rightColor} />
      {typeof displayMin === 'number' && displayMin < min && (
        <div
          className="tz-color-channel-slider-overlay tz-color-channel-slider-overlay__min"
          style={{ '--width': `${(100 * (min - displayMin)) / range}%` }}
        />
      )}
      {typeof displayMax === 'number' && displayMax > max && (
        <div
          className="tz-color-channel-slider-overlay tz-color-channel-slider-overlay__max"
          style={{ '--width': `${(100 * (displayMax - max)) / range}%` }}
        />
      )}
    </div>
  );
});

interface ColorChannelDragProps {
  channel: string;
  color: ReturnType<typeof useColor>[0];
  displayMax?: number;
  displayMin?: number;
  displayRange?: number;
  max: number;
  min: number;
  range: number;
  setColor: ReturnType<typeof useColor>[1];
}

const ColorChannelDrag = memo(function ColorChannelDrag({
  channel,
  color,
  displayMax,
  displayMin,
  displayRange,
  max,
  min,
  range,
  setColor,
}: ColorChannelDragProps) {
  const wrapperEl = useRef<HTMLDivElement | null>(null);
  const [wrapperLeft, setWrapperLeft] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(240);
  const isDragging = useRef(false);
  const isShifting = useRef(false);
  const dragOrigin = useRef(0);

  const value = color.original[channel as keyof typeof color.original] as number;

  // initial paint
  useLayoutEffect(() => {
    if (wrapperEl.current) {
      const { left, width } = wrapperEl.current.getBoundingClientRect();
      setWrapperWidth(width);
      setWrapperLeft(left);
    }
  }, [wrapperEl.current, setWrapperWidth]);

  // drag behavior
  useEffect(() => {
    function handlePointermove(evt: PointerEvent) {
      if (!isDragging.current || !setColor) {
        return;
      }
      evt.preventDefault();
      const x =
        ((evt.clientX - dragOrigin.current) * (isShifting.current ? SHIFT_FACTOR : 1) +
          (dragOrigin.current - wrapperLeft)) /
        wrapperWidth;
      setColor((value) => ({ ...value.original, [channel]: clamp(min + x * (max - min), min, max) }));
    }
    addEventListener('pointermove', handlePointermove);
    return () => removeEventListener('pointermove', handlePointermove);
  }, [channel, min, max, setColor, wrapperLeft, wrapperWidth]);
  useEffect(() => {
    function handlePointerup() {
      document.body.classList.remove(BODY_DRAGGING_CLASS);
      isDragging.current = false;
    }
    addEventListener('pointerup', handlePointerup);
    return () => removeEventListener('pointerup', handlePointerup);
  }, []);

  // Shift key behavior
  useEffect(() => {
    function handleKeydown(evt: KeyboardEvent) {
      if (isDragging.current && evt.key === 'Shift') {
        evt.preventDefault();
        isShifting.current = true;
      }
    }
    addEventListener('keydown', handleKeydown);
    return () => removeEventListener('keydown', handleKeydown);
  }, []);
  useEffect(() => {
    function handleKeyup() {
      isShifting.current = false;
    }
    addEventListener('keyup', handleKeyup);
    return () => removeEventListener('keyup', handleKeyup);
  }, []);

  return (
    <div className="tz-color-channel-slider-wrapper">
      <ColorChannelBG
        channel={channel}
        color={color}
        min={min}
        max={max}
        displayMin={displayMin}
        displayMax={displayMax}
      />
      <div
        ref={wrapperEl}
        className="tz-color-channel-slider-bounds"
        style={{ '--left': min, '--right': `${100 * (((displayMax ?? max) - max) / (displayRange ?? range))}%` }}
        onPointerDown={(evt) => {
          if (!setColor) {
            return;
          }
          setColor({ ...color.original, [channel]: (max * (evt.clientX - wrapperLeft)) / wrapperWidth + min });
        }}
      >
        <div
          className="tz-color-channel-slider-handle"
          // drag start
          onPointerDown={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            isDragging.current = true;
            if (wrapperEl.current) {
              const { left, width } = wrapperEl.current.getBoundingClientRect();
              if (width !== wrapperWidth) {
                setWrapperWidth(width);
              }
              if (left !== wrapperLeft) {
                setWrapperLeft(left);
              }
            }
            dragOrigin.current = evt.clientX;
            document.body.classList.add(BODY_DRAGGING_CLASS);
          }}
          style={{
            '--x': `${clamp(
              ((value - min) / range) * wrapperWidth,
              TRACK_PADDING,
              wrapperWidth - 2 * TRACK_PADDING,
            )}px`,
          }}
        />
      </div>
    </div>
  );
});

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
  const id = useId();
  const { min, max, range, displayMin, displayMax, displayRange } = useMemo(
    () => calculateBounds(color.original, channel, gamut),
    [color.original, gamut],
  );
  const showPerc = max === 1 && min === 0;

  // input
  const value = color.original[channel as keyof typeof color.original] as number;
  const displayValue = showPerc ? 100 * value : value;
  // desync input value so user can type (updates onBlur)
  const [inputBuffer, setInputBuffer] = useState(zeroPad(clamp(displayValue, min, max), 3));
  useEffect(() => {
    setInputBuffer(zeroPad(displayValue, 3)); // on upstream change, keep input updated
  }, [displayValue]);

  return (
    <div className={clsx('tz-color-channel-slider', className)} style={{ '--current-color': color.css }}>
      <ColorChannelDrag
        channel={channel}
        color={color}
        displayMax={displayMax}
        displayMin={displayMin}
        displayRange={displayRange}
        max={max}
        min={min}
        range={range}
        setColor={setColor}
      />
      <div className="tz-color-channel-slider-inputpair">
        <label className="tz-color-channel-slider-label" htmlFor={id}>
          {color.original.mode.includes('lab') && channel === 'b'
            ? 'B' // literally the one conflict: Lab vs RGB (blue)
            : CHANNEL_LABEL[channel] ?? channel.toUpperCase()}
        </label>
        <SubtleInput
          id={id}
          className="tz-color-channel-slider-input"
          // @ts-expect-error React was a mistake
          type="number"
          min={showPerc ? 100 * min : min}
          max={showPerc ? 100 * max : max}
          step={CHANNEL_STEP}
          value={inputBuffer}
          onChange={(evt) => {
            setInputBuffer(evt.currentTarget.value);
          }}
          onBlur={() => {
            const nextValue = clamp(showPerc ? Number(inputBuffer) / 100 : Number(inputBuffer), min, max);
            setColor({ ...color.original, [channel]: nextValue });
          }}
          onKeyUp={(evt) => {
            if (['Enter', 'Tab', 'ArrowUp', 'ArrowDown'].includes(evt.key)) {
              const nextValue = clamp(showPerc ? Number(inputBuffer) / 100 : Number(inputBuffer), min, max);
              setColor({
                ...color.original,
                [channel]: evt.key === 'ArrowUp' || evt.key === 'ArrowDown' ? snap(nextValue, CHANNEL_STEP) : nextValue,
              });
            }
          }}
          suffix={showPerc ? '%' : undefined}
          {...rest}
        />
      </div>
    </div>
  );
}
