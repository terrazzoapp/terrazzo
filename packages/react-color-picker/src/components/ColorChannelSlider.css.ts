import { globalStyle } from '@vanilla-extract/css';

globalStyle('.tz-color-channel-slider-wrapper', {
  height: 'var(--tz-color-channel-slider-track-height)',
  position: 'relative',
  transform: 'translate3d(0, 0, 0)',
  width: '100%',
});

globalStyle('.tz-color-channel-slider-wrapper::after', {
  borderRadius: 'var(--tz-color-channel-slider-track-height)',
  boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 0.2)',
  content: '""',
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 2,
});

globalStyle('.tz-color-channel-slider-bg', {
  height: '100%',
  width: '100%',
});

globalStyle('.tz-color-channel-slider-bg__alpha', {
  vars: {
    '--tz-square-color': 'var(--tz-color-base-gray-800)',
    '--tz-square-size': 'calc(0.625 * var(--tz-color-channel-slider-track-height))',
  },

  backgroundImage: `linear-gradient(to right, var(--left-color), var(--right-color)), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect fill='%23dad9d6' width='32' height='32'/><rect fill='%23dad9d6' x='32' y='32' width='32' height='32'/></svg>")`,
  backgroundRepeat: 'no-repeat, repeat',
  backgroundSize: '100% 100%, var(--tz-square-size) var(--tz-square-size)',
});

globalStyle('.tz-color-channel-slider-bg-wrapper', {
  borderRadius: 'var(--tz-radius-1000)',
  display: 'flex',
  height: '100%',
  left: 0,
  overflow: 'hidden',
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: 1,
});

globalStyle('.tz-color-channel-slider-overlay', {
  vars: {
    '--overlay-offset': 'calc(0.75 * var(--tz-color-channel-slider-track-height))',
  },

  backgroundColor: 'color(srgb 0 0 0 / 0.5)',
  display: 'flex',
  height: '100%',
  pointerEvents: 'none',
  position: 'absolute',
  width: 'calc(var(--width) - var(--overlay-offset))',
  zIndex: 2,
});

globalStyle('.tz-color-channel-slider-overlay__min', {
  left: 0,
});

globalStyle('.tz-color-channel-slider-overlay__min::after', {
  backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg"><path d="m256 512c-141.4 0-256-114.6-256-256s114.6-256 256-256h-256v512z" fill="rgb(0, 0, 0, 0.5)"/></svg>')`,
  backgroundRepeat: 'no-repeat',
  content: '""',
  display: 'block',
  flexShrink: 0,
  height: 'var(--tz-color-channel-slider-track-height)',
  left: '100%',
  position: 'absolute',
  top: 0,
  width: 'calc(0.5 * var(--tz-color-channel-slider-track-height))',
});

globalStyle('.tz-color-channel-slider-overlay__max', {
  right: 0,
});

globalStyle('.tz-color-channel-slider-overlay__max::before', {
  backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg"><path d="m0 0c141.4 0 256 114.6 256 256s-114.6 256-256 256h256v-512z" fill="rgb(0, 0, 0, 0.5)"/></svg>')`,
  backgroundRepeat: 'no-repeat',
  content: '""',
  display: 'block',
  flexShrink: 0,
  height: 'var(--tz-color-channel-slider-track-height)',
  position: 'absolute',
  right: '100%',
  top: 0,
  width: 'calc(0.5 * var(--tz-color-channel-slider-track-height))',
});
