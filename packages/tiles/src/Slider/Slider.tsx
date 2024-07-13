import { useDrag } from '@use-gesture/react';
import clsx from 'clsx';
import { type ComponentProps, type ReactElement, useId, useRef, useState, useLayoutEffect } from 'react';
import { clamp } from '../lib/number.js';
import SubtleInput from '../SubtleInput/SubtleInput.js';
import './Slider.css';

/** size, in px, to pad inner track */
export const TRACK_PADDING = 4;
/** CSS class to add to body */
export const BODY_DRAGGING_CLASS = 'tz-slider-is-grabbing';
/** Amount Shift key affects drag rate */
export const SHIFT_FACTOR = 0.25;

interface SliderHandleProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  max: NonNullable<SliderProps['max']>;
  min: NonNullable<SliderProps['min']>;
  orientation: NonNullable<SliderProps['orientation']>;
  value: SliderProps['value'];
  onChange: SliderProps['onChange'];
  containerRect: DOMRect;
}

function SliderHandle({ containerRect, max, min, orientation, value, onChange }: SliderHandleProps) {
  const containerSize = orientation === 'horizontal' ? containerRect.width : containerRect.height;
  const range = max - min;
  const draggable = useDrag(
    ({ first, last, movement, shiftKey }) => {
      if (first) {
        document.body.classList.add(BODY_DRAGGING_CLASS);
      }
      if (last) {
        document.body.classList.remove(BODY_DRAGGING_CLASS);
      }
      const [movementX, movementY] = movement;
      const rawValue =
        ((orientation === 'horizontal' ? -movementY : movementX) * (shiftKey ? SHIFT_FACTOR : 1)) / containerSize;
      const nextValue = clamp(value + rawValue * range, min, max);
      if (nextValue !== value) {
        onChange(nextValue);
      }
    },
    { preventDefault: true },
  );

  const position = clamp(((value - min) / range) * containerSize, TRACK_PADDING, containerSize - 2 * TRACK_PADDING);

  return (
    <div
      {...draggable()}
      className='tz-slider-handle'
      data-orientation={orientation}
      style={{ '--tz-slider-handle-position': `${orientation === 'vertical' ? -position : position}px` }}
    />
  );
}

export interface SliderProps extends Omit<ComponentProps<'input'>, 'onChange'> {
  value: number;
  onChange: (newValue: number) => void;
  /** Accessible label for this slider */
  label: ReactElement;
  /** @default "horizontal" */
  orientation?: 'horizontal' | 'vertical';
  /** @default 0 */
  min?: number;
  /** @default 1 */
  max?: number;
  /** @default 0.01 */
  step?: number;
  /** Render a custom element for the slider’s background */
  bg: ReactElement;
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
  const [containerRect, setContainerRect] = useState<DOMRect>({ width: 200, top: 0, left: 0, height: 32 } as DOMRect);
  const [innerValue, setInnerValue] = useState(value);
  useLayoutEffect(() => {
    if (trackEl.current) {
      setContainerRect(trackEl.current.getBoundingClientRect());
    }
  }, []);

  const range = max - min;

  return (
    <div className={clsx('tz-slider', className)} data-orientation={orientation}>
      <div ref={trackEl} className='tz-slider-track-wrapper'>
        <div
          className='tz-slider-track'
          onPointerDown={(evt) => {
            const { left, width } = evt.currentTarget.getBoundingClientRect();
            const nextValue = clamp(min + ((evt.clientX - left) / width) * range, min, max);
            if (nextValue !== value) {
              onChange(nextValue);
            }
          }}
        >
          <div className='tz-slider-track-bg'>{bg}</div>
          <SliderHandle
            containerRect={containerRect}
            data-color={handleColor || undefined}
            max={max}
            min={min}
            onChange={onChange}
            orientation={orientation}
            style={{ '--tz-slider-handle-color': handleColor }}
            value={value}
          />
        </div>
      </div>
      <div className='tz-slider-inputpair'>
        <label className='tz-slider-label' htmlFor={id}>
          {label}
        </label>
        <SubtleInput
          id={id}
          className='tz-slider-input'
          // @ts-expect-error React was a mistake
          type='number'
          min={(percentage ? 100 : 1) * min}
          max={(percentage ? 100 : 1) * max}
          step={step}
          value={innerValue}
          onChange={(evt) => setInnerValue(Number(evt.currentTarget.value))}
          onBlur={() => onChange(clamp(percentage ? Number(innerValue) / 100 : Number(innerValue), min, max))}
          onKeyUp={(evt) => {
            if (['Enter', 'Tab', 'ArrowUp', 'ArrowDown'].includes(evt.key)) {
              onChange(clamp(percentage ? Number(innerValue) / 100 : Number(innerValue), min, max));
            }
          }}
          suffix={percentage ? '%' : suffix}
          {...rest}
        />
      </div>
    </div>
  );
}
