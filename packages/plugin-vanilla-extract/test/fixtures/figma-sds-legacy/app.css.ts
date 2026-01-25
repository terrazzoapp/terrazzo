import { style } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

export const btn = style({
  background: vars.color.background.brand.$root,
  color: vars.color.text.brand.$root,
  fontFamily: vars.typography.family.sans,
  ':hover': {
    background: vars.color.background.brand.$root,
    color: vars.color.text.brand.$root,
  },
});
