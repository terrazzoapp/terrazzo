import { style } from '@vanilla-extract/css';
import { light } from './theme.css.js';

export const btn = style({
  background: light.color.background.brand.default,
  color: light.color.text.brand.default,
  fontFamily: light.typography.family.sans,
  ':hover': {
    background: light.color.background.brand.default,
    color: light.color.text.brand.default,
  },
});
