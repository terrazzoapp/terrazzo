import { globalStyle } from '@vanilla-extract/css';

globalStyle('.tz-color-picker', {
  backgroundColor: 'var(--tz-color-bg-1)',
  color: 'var(--tz-text-primary)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--tz-space-200)',
});

globalStyle('.tz-color-picker-code', {
  vars: {
    '--copy-btn-width': '2rem',
  },

  display: 'flex',
  padding: 0,
  position: 'relative',
});

globalStyle('.tz-color-picker-code-input', {
  vars: {
    '--tz-color-picker-input-bg': 'var(--tz-color-bg-1)',
    '--tz-color-picker-input-border': 'var(--tz-color-border-3)',
    '--tz-color-picker-input-text': 'var(--tz-color-text-1)',
  },

  backgroundColor: 'var(--tz-color-picker-input-bg)',
  border: '1px solid var(--tz-color-picker-input-border)',
  borderRadius: 'var(--tz-radius-300)',
  color: 'var(--tz-color-picker-input)',
  flex: '1 0 auto',
  fontFamily: 'var(--tz-font-mono)',
  fontSize: 'var(--tz-font-label-small-font-size)',
  fontVariantLigatures: 'none',
  fontWeight: 'var(--tz-font-label-small-font-weight)',
  height: 'var(--tz-space-control-m)',
  letterSpacing: 0,
  lineHeight: 'var(--tz-space-control-m)',
  outline: 'none',
  padding: 0,
  textIndent: 'var(--tz-space-200)',
});

globalStyle('.tz-color-picker-code-input:focus', {
  vars: {
    '--tz-color-picker-input-border': 'var(--tz-color-control-border-focus)',
  },
});

globalStyle('.tz-color-picker-preview', {
  border: '1px solid var(--tz-button-secondary-border)',
  borderRadius: 'var(--tz-radius-300)',
  display: 'flex',
  flexDirection: 'column',
});

globalStyle('.tz-color-picker-sliders', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--tz-space-200)',
});

globalStyle('.tz-color-picker-swatch', {
  backgroundImage: `linear-gradient(var(--current-color), var(--current-color)), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect fill='%23dad9d6' width='32' height='32'/><rect fill='%23dad9d6' x='32' y='32' width='32' height='32'/></svg>")`,
  backgroundRepeat: 'no-repeat, repeat',
  backgroundSize: '100% 100%, 10px',
  borderTopLeftRadius: 'var(--tz-radius-300)',
  borderTopRightRadius: 'var(--tz-radius-300)',
  height: '6rem',
});

globalStyle('.tz-color-picker-tooltip-icon', {
  color: 'var(--tz-color-base-gray-900)',
});
