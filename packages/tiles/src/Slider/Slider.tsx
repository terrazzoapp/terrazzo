import { useDrag } from '@use-gesture/react';
import clsx from 'clsx';
import { type ComponentProps, type ReactElement, useId, useRef, useState, useLayoutEffect, useEffect } from 'react';
import { clamp, snap } from '../lib/number.js';
import SubtleInput from '../SubtleInput/SubtleInput.js';
import './Slider.css';

/** size, in px, to pad inner track */
export const TRACK_PADDING = 4;
/** CSS class to add to body */
export const BODY_DRAGGING_CLASS = 'tz-slider-is-grabbing';
/** Amount Shift key affects drag rate */
export const SHIFT_FACTOR = 0.25;

interface SliderHandleProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  handleColor: SliderProps['handleColor'];
  max: NonNullable<SliderProps['max']>;
  min: NonNullable<SliderProps['min']>;
  step: NonNullable<SliderProps['step']>;
  orientation: NonNullable<SliderProps['orientation']>;
  value: SliderProps['value'];
  onChange: SliderProps['onChange'];
  containerRect: DOMRect;
}

function SliderHandle({
  containerRect,
  handleColor,
  max,
  min,
  orientation,
  step,
  value,
  onChange,
  ...rest
}: SliderHandleProps) {
  const containerSize = orientation === 'vertical' ? containerRect.height : containerRect.width;
  const range = max - min;
  // note: `prevValue` locks into the initial value on drag start, which makes
  // the interaction smoother because it avoids snapping and rounding errors.
  const prevValue = useRef(value);
  const draggable = useDrag(
    ({ first, last, movement, shiftKey }) => {
      if (first) {
        prevValue.current = value; // if beginning of drag, take snapshot of starting value
        document.body.classList.add(BODY_DRAGGING_CLASS);
      }
      if (last) {
        document.body.classList.remove(BODY_DRAGGING_CLASS);
      }
      const [movementX, movementY] = movement;
      const rawValue =
        ((orientation === 'vertical' ? -movementY : movementX) * (shiftKey ? SHIFT_FACTOR : 1)) / containerSize;
      const nextValue = clamp(prevValue.current + rawValue * range, min, max);
      onChange(nextValue);
    },
    { preventDefault: true },
  );

  const position = clamp(
    TRACK_PADDING + ((value - min) / range) * (containerSize - TRACK_PADDING),
    TRACK_PADDING,
    containerSize - TRACK_PADDING,
  );
  return (
    <div
      {...rest}
      {...draggable()}
      className='tz-slider-handle'
      data-orientation={orientation}
      data-variant={handleColor ? 'color' : undefined}
      style={{ '--tz-slider-handle-position': `${position}px`, '--tz-slider-handle-color': handleColor }}
    />
  );
}

export interface SliderProps extends Omit<ComponentProps<'input'>, 'max' | 'min' | 'onChange' | 'step'> {
  value: number;
  onChange: (newValue: number) => void;
  /** Accessible label for this slider */
  label: string | ReactElement;
  /** @default "horizontal" */
  orientation?: 'horizontal' | 'vertical';
  /** @default 0 */
  min?: number;
  /** @default 1 */
  max?: number;
  /** @default 0.01 */
  step?: number;
  /** Render a custom element for the slider’s background */
  bg?: ReactElement;
  /** Does this represent a percentage? @default false */
  percentage?: boolean;
  /** Show units or symbol after input (note: will be overridden for `percentage: true`) */
  suffix?: string;
  /** (Optional) Color the slider handle any CSS-compatible color */
  handleColor?: string;
}

export default function Slider({
  bg,
  className,
  handleColor,
  label,
  min = 0,
  max = 1,
  ref,
  step = 0.01,
  onChange,
  orientation = 'horizontal',
  percentage = false,
  suffix,
  value,
  ...rest
}: SliderProps): ReactElement {
  const id = useId();
  const trackEl = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<DOMRect>(
    typeof DOMRect !== 'undefined'
      ? new DOMRect(0, 0, 240, 10)
      : ({ left: 0, top: 0, width: 240, height: 10 } as DOMRect),
  );
  const [intermediaryInputValue, setIntermediaryInputValue] = useState(value);
  const percModifier = percentage ? 100 / Math.max(max - min, 0.0001) : 1;

  // effect 1: update containerRect periodically
  useLayoutEffect(() => {
    if (trackEl.current) {
      setContainerRect(trackEl.current.getBoundingClientRect());
    }
  }, [value, orientation]);
  // effect 2: update intermediaryInputValue when value changes
  useEffect(() => {
    setIntermediaryInputValue(percentage ? snap(percModifier * value, step)! : value);
  }, [max, min, percentage, value]);

  const range = max - min;
  const minNorm = min * percModifier;
  const maxNorm = max * percModifier;
  const precision = Math.log10((percentage ? 0.01 : 1) / step) || 1;

  return (
    <div className={clsx('tz-slider', className)} data-orientation={orientation}>
      <div ref={trackEl} className='tz-slider-track-wrapper'>
        <div className='tz-slider-track'>
          <div
            className='tz-slider-track-bg'
            onPointerDown={(evt) => {
              const { left, width } = evt.currentTarget.getBoundingClientRect();
              const nextValue = clamp(min + ((evt.clientX - left) / width) * range, min, max);
              if (nextValue !== value) {
                onChange(nextValue);
              }
            }}
          >
            {bg}
          </div>
          <SliderHandle
            containerRect={containerRect}
            max={max}
            min={min}
            handleColor={handleColor}
            step={step}
            onChange={onChange}
            orientation={orientation}
            value={value}
          />
        </div>
      </div>
      <label className='tz-slider-label' htmlFor={id}>
        {label}
      </label>
      <SubtleInput
        id={id}
        className='tz-slider-input'
        // @ts-expect-error React was a mistake
        type='number'
        min={minNorm}
        max={maxNorm}
        step={step}
        value={intermediaryInputValue.toPrecision(precision)}
        onChange={(evt) => setIntermediaryInputValue(clamp(Number(evt.currentTarget.value), minNorm, maxNorm))}
        onBlur={() => onChange(clamp(Number(intermediaryInputValue) / percModifier, min, max))}
        onKeyUp={(evt) => {
          if (['Enter', 'Tab', 'ArrowUp', 'ArrowDown'].includes(evt.key)) {
            onChange(clamp(Number(intermediaryInputValue) / percModifier, min, max));
          }
        }}
        suffix={percentage ? '%' : suffix}
        {...rest}
      />
    </div>
  );
}
