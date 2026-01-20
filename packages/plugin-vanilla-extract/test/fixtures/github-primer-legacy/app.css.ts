import { style } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

export const btn = style({
  background: vars.base.color.blue[4],
  color: vars.base.color.white[1],
  fontFamily: vars.fontStack.system,
  ':hover': {
    background: vars.base.color.blue[4],
    color: vars.base.color.white[1],
  },
});
