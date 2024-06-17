import { Check, ChevronDown, ColorFilterOutline, Copy, InfoCircled } from '@terrazzo/icons';
import { Fieldset, Select, SelectItem, Switch, Tooltip } from '@terrazzo/tiles';
import {
  clampChroma,
  COLORSPACES,
  type default as useColor,
  type ColorInput,
  type Color,
  parse,
  formatCss,
} from '@terrazzo/use-color';
import clsx from 'clsx';
import { useEffect, type ComponentProps, useState, useRef, useMemo } from 'react';
import ColorChannelSlider from './ColorChannelSlider.js';
import './ColorPicker.css';

/** sRGB → P3 → Rec2020 */
export type Gamut = 'rgb' | 'p3' | 'rec2020';

export interface ColorPickerProps extends Omit<ComponentProps<'div'>, 'color'> {
  /** value from useColor() */
  color: ReturnType<typeof useColor>[0];
  setColor: ReturnType<typeof useColor>[1];
}

/** Handle color gamut clamping */
function updateColor(color: Color, gamut: 'rgb' | 'p3' | 'rec2020' = 'rgb'): ColorInput {
  switch (gamut) {
    // encompasses P3
    case 'rec2020': {
      // no clamping necessary
      if (color.mode === 'rgb' || color.mode === 'p3' || color.mode === 'hsl' || color.mode === 'hsv') {
        return COLORSPACES.rec2020.converter(color); // if this is in a non-Rec2020-compatible colorspace, convert it
      }
      break;
    }
    case 'p3': {
      const clamped = clampChroma(color, color.mode, 'p3'); // clamp color to P3 gamut
      if (color.mode === 'rec2020' || color.mode === 'rgb' || color.mode === 'hsl' || color.mode === 'hsv') {
        return COLORSPACES.p3.converter(clamped); // if this is in a non-P3-compatible colorspace, convert it
      }
      break;
    }
    default: {
      const clamped = clampChroma(color, color.mode, 'rgb'); // clamp to sRGB gamut
      if (color.mode === 'a98' || color.mode === 'rec2020' || color.mode === 'p3' || color.mode === 'prophoto') {
        return COLORSPACES.srgb.converter(clamped); // if this is in a non-sRGB-compatible colorspace, convert it
      }
      break;
    }
  }
  return color;
}

/** Order color channels in proper order */
function channelOrder(color: Color): string[] {
  switch (color.mode) {
    case 'rgb':
    case 'rec2020':
    case 'lrgb':
    case 'a98':
    case 'prophoto': {
      return ['r', 'g', 'b', 'alpha'];
    }
    case 'hsl':
    case 'okhsl': {
      return ['h', 's', 'l', 'alpha'];
    }
    case 'hsv':
    case 'okhsv': {
      return ['h', 's', 'v', 'alpha'];
    }
    case 'hwb': {
      return ['h', 'w', 'b', 'alpha'];
    }
    case 'lab':
    case 'oklab': {
      return ['l', 'a', 'b', 'alpha'];
    }
    case 'lch':
    case 'oklch': {
      return ['l', 'c', 'h', 'alpha'];
    }
    case 'xyz50':
    case 'xyz65': {
      return ['x', 'y', 'z', 'alpha'];
    }
    default: {
      return Object.keys(color).filter((k) => k !== 'mode');
    }
  }
}

export default function ColorPicker({ className, color, setColor, ...rest }: ColorPickerProps) {
  const [inputBuffer, setInputBuffer] = useState(color.css);
  const [maxGamut, setMaxGamut] = useState<Gamut>('rgb');
  const [copied, setCopied] = useState(false);
  const copiedTO = useRef<number | undefined>();
  const normalizedColorMode = useMemo(
    () => (['p3', 'rec2020', 'lrgb'].includes(color.original.mode) ? 'rgb' : color.original.mode),
    [color],
  );

  useEffect(() => {
    if (inputBuffer !== color.css) {
      setInputBuffer(color.css);
    }
  }, [color.css, inputBuffer]);

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
        <div className='tz-color-picker-code'>
          <input
            type='text'
            className='tz-color-picker-code-input'
            value={inputBuffer}
            onChange={(evt) => {
              setInputBuffer(evt.target.value);
              const result = parse(evt.currentTarget.value);
              if (result) {
                setColor(updateColor(result, maxGamut));
              }
            }}
          />
          <button
            type='button'
            className='tz-color-picker-code-copy-btn'
            onClick={async () => {
              await navigator.clipboard.writeText(color.css);
              clearTimeout(copiedTO.current);
              setCopied(true);
              copiedTO.current = window.setTimeout(() => {
                setCopied(false);
              }, 1000);
            }}
          >
            {copied ? <Check /> : <Copy aria-label='Copy value' />}
          </button>
        </div>
      </div>
      <details className='tz-color-picker-colorspace'>
        <summary className='tz-color-picker-colorspace-summary'>
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
            <SelectItem value='rgb' icon={<ColorFilterOutline />}>
              RGB
            </SelectItem>
            <SelectItem value='oklab' icon={<ColorFilterOutline />}>
              Oklab
            </SelectItem>
            <SelectItem value='oklch' icon={<ColorFilterOutline />}>
              Oklch
            </SelectItem>
            <SelectItem value='okhsl' icon={<ColorFilterOutline />}>
              Okhsl
            </SelectItem>
            <SelectItem value='okhsv' icon={<ColorFilterOutline />}>
              Okhsv
            </SelectItem>
            <SelectItem value='xyz65' icon={<ColorFilterOutline />}>
              XYZ
            </SelectItem>
          </Select>
          <span className='tz-color-picker-colorspace-chevron'>
            <ChevronDown aria-hidden />
          </span>
        </summary>
        <div className='tz-color-picker-colorspace-gamut'>
          <Fieldset label='Colorspace options'>
            <Switch
              label={
                <span className='tz-color-picker-colorspace-gamut-label'>
                  P3
                  <Tooltip
                    content={
                      <span className='tz-color-picker-colorspace-gamut-tooltip'>
                        P3 is supported in all major browsers, but your users may not have P3-capable monitors (
                        <a href='https://terrazzo.ds/docs/colorspaces#p3' target='_blank' rel='noopener noreferrer'>
                          docs
                        </a>
                        )
                      </span>
                    }
                  >
                    <InfoCircled className='tz-color-picker-tooltip-icon' />
                  </Tooltip>
                </span>
              }
              checked={maxGamut === 'p3' || maxGamut === 'rec2020'}
              onChange={({ currentTarget: { checked } }) => {
                const gamut = checked ? 'p3' : 'rgb';
                setMaxGamut(gamut);
                setColor(updateColor(color.original, gamut));
              }}
            />
            <Switch
              label={
                <span className='tz-color-picker-colorspace-gamut-label'>
                  Rec2020
                  <Tooltip
                    content={
                      <span className='tz-color-picker-colorspace-gamut-tooltip'>
                        Rec2020 is the current standard for TV & movies, but isn’t supported for the web yet (
                        <a href='https://terrazzo.ds/docs/colorspaces#p3' target='_blank' rel='noopener noreferrer'>
                          docs
                        </a>
                        )
                      </span>
                    }
                  >
                    <InfoCircled className='tz-color-picker-tooltip-icon' />
                  </Tooltip>
                </span>
              }
              checked={maxGamut === 'rec2020'}
              onChange={({ currentTarget: { checked } }) => {
                const gamut = checked ? 'rec2020' : 'p3';
                setMaxGamut(gamut);
                setColor(updateColor(color.original, gamut));
              }}
            />
          </Fieldset>
        </div>
      </details>
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
    </div>
  );
}
