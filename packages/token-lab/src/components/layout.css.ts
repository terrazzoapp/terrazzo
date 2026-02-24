import { style } from '@vanilla-extract/css';
import * as token from '../styles/tokens.js';

export const logo = style({
  height: '1.25rem',
  width: '1.25rem',
});

export const brand = style({
  ...token.font.bodyStrong,
  alignItems: 'center',
  borderBottom: token.border[3],
  color: 'currentColor',
  display: 'flex',
  gap: token.space[200],
  lineHeight: 1,
  height: '3rem',
  paddingInline: token.space[400],
  textDecoration: 'none',
  width: '100%',
});

export const layout = style({
  display: 'grid',
  gridTemplateColumns: '10rem auto',
  gridTemplateRows: '3rem auto',
  gridTemplateAreas: '"sidebar topnav" "sidebar main"',
  minHeight: '100svh',
});

export const main = style({
  flex: '0 1 auto',
  gridArea: 'main',
});

export const sidebar = style({
  background: token.color.bg[2],
  borderRight: token.border[3],
  display: 'flex',
  flexDirection: 'column',
  gridArea: 'sidebar',
  justifyContent: 'center',
});

export const sidebarNav = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingBlock: token.space[100],
});

export const sidebarNavSecondary = style([
  sidebarNav,
  {
    marginTop: 'auto',
  },
]);

export const sidebarLink = style({
  ...token.font.body,
  alignItems: 'center',
  border: '1px solid transparent',
  borderRadius: token.radius[300],
  color: token.color.text[2],
  display: 'flex',
  gap: token.space[200],
  minHeight: 32,
  lineHeight: 1,
  outline: '2px solid transparent',
  paddingInline: token.space[400],
  textDecoration: 'none',

  ':hover': {
    backgroundColor: token.color.bg.selectedHint,
  },

  ':focus-visible': {
    outlineColor: token.color.border.selected,
  },

  selectors: {
    '&[aria-current="page"]': {
      backgroundColor: token.color.bg.selected,
      borderColor: token.color.border.selected,
      color: token.color.text[1],
    },
  },
});

export const icon = style({
  color: token.color.icon[100],
  stroke: token.color.icon[100],

  selectors: {
    [`${sidebarLink}:hover &, ${sidebarLink}:focus &, ${sidebarLink}[aria-current="page"] &`]: {
      stroke: token.color.icon.selected,
    },
  },
});

export const sidebarList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const sidebarListItem = style([sidebarList]);

export const topNav = style({
  backgroundColor: token.color.bg[2],
  borderBottom: token.border[3],
  display: 'flex',
  gridArea: 'topnav',
  paddingInline: token.space[300],
});

export const topNavInner = style({
  alignItems: 'center',
  display: 'flex',
  flex: '0 1 auto',
  height: '100%',
  width: '100%',
});
