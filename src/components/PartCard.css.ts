import { style } from '@vanilla-extract/css';
import { vars, breakpoints } from '@/styles/theme.css';
import { animateShakeX } from '@/styles/shared.css';

export const card = style({
  borderRadius: vars.borderRadius.lg,
  border: `1px solid ${vars.color.gray[300]}`,
  padding: vars.spacing[4],
  transition: `all ${vars.transition.base}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  ':focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${vars.color.white}, 0 0 0 4px ${vars.color.brandNavy}`,
  },
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      padding: vars.spacing[5],
    }
  }
});

export const cardDragOver = style({
  boxShadow: `0 0 0 2px ${vars.color.brandNavy}, ${vars.shadow.md}`,
  transform: 'scale(1.01)',
});

export const shake = animateShakeX;

export const header = style({
  marginBottom: vars.spacing[2],
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      fontSize: vars.fontSize.lg,
    }
  }
});

export const headerInner = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing[2],
});

export const list = style({
  listStyle: 'none',
  paddingLeft: 0,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  gap: vars.spacing[1],
});

export const placeholderItem = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.gray[600],
  overflow: 'hidden',
});

export const placeholderItemHidden = style({
  pointerEvents: 'none',
});

export const assignedItem = style({
  flexShrink: 0,
  overflow: 'visible',
});

export const iconBase = style({
  height: '1.25rem',
  width: '1.25rem',
  color: vars.color.brandNavy,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      height: '1.5rem',
      width: '1.5rem',
    }
  }
});
