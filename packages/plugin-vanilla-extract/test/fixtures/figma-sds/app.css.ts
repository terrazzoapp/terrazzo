import { style } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

export const btn = style({
  background: vars.color.background.brand.default,
  color: vars.color.text.brand.default,
  fontFamily: vars.typography.family.sans,
  ':hover': {
    background: vars.color.background.brand.default,
    color: vars.color.text.brand.default,
  },
});
