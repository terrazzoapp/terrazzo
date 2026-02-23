import { style } from '@vanilla-extract/css';
import * as token from '../styles/tokens.js';

export const logo = style({
  height: '1rem',
  width: '1rem',
});

export const layout = style({
  display: 'grid',
  gridTemplateColumns: '12rem auto',
  minHeight: '100svh',
});

export const main = style({
  flex: '0 1 auto',
});

export const sidebar = style({
  background: token.color.bg[2],
  borderRight: token.border[3],
});

export const sidebarLink = style({
  alignItems: 'center',
  color: 'currentColor',
  display: 'flex',
  gap: token.space[200],
  minHeight: 32,
  paddingInline: token.space[400],
  textDecoration: 'none',
});

export const sidebarList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const sidebarListItem = style([sidebarList]);
