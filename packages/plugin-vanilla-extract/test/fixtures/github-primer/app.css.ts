import { style } from '@vanilla-extract/css';
import { light } from './theme.css.js';

export const btn = style({
  background: light.base.color.blue[4],
  color: light.base.color.white[1],
  fontFamily: light.fontStack.system,
  ':hover': {
    background: light.base.color.blue[4],
    color: light.base.color.white[1],
  },
});
