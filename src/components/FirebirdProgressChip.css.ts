import { style, keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars, breakpoints } from '@/styles/theme.css';

export const container = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  width: '100%',
});

export const button = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing[2],
  borderRadius: vars.borderRadius.full,
  border: `1px solid ${vars.color.gray[300]}`,
  backgroundColor: vars.color.white,
  paddingLeft: vars.spacing[2],
  paddingRight: vars.spacing[2],
  height: '2rem', // 8 (32px)
  flexShrink: 0,
  width: '100%',
  transition: 'transform 150ms ease-out, box-shadow 150ms ease-out, max-width 220ms ease',
  cursor: 'pointer',
  ':hover': {
    transform: 'scale(1.02)',
    boxShadow: vars.shadow.sm,
  },
  ':focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${vars.color.white}, 0 0 0 4px ${vars.color.brandNavy}`,
  },
  '@media': {
    [`screen and (min-width: ${breakpoints.sm})`]: {
      paddingLeft: vars.spacing[3],
      paddingRight: vars.spacing[3],
      height: '2.25rem', // 9 (36px)
    },
    [`screen and (min-width: ${breakpoints.md})`]: {
      height: '2.25rem', // 9 (36px)
    },
    [`screen and (min-width: ${breakpoints.xl})`]: {
      height: '2.25rem', // 9 (36px)
    },
    '(prefers-reduced-motion: reduce)': {
      transition: 'max-width 220ms ease', // keep max-width transition, remove scale
      ':hover': {
        transform: 'none',
      },
    },
  },
});

export const icon = style({
  height: '1rem', // 4 (16px)
  width: 'auto',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      height: '1.25rem', // 5 (20px)
    },
    [`screen and (min-width: ${breakpoints.xl})`]: {
      height: '1.25rem', // 5 (20px)
    },
  },
});

export const progressBar = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
  height: '0.375rem', // 1.5 (6px)
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.color.gray[200],
  overflow: 'hidden',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      minWidth: '160px',
      height: '0.5rem', // 2 (8px)
    },
    [`screen and (min-width: ${breakpoints.xl})`]: {
      height: '0.5rem', // 2 (8px)
    },
  },
});

export const progressFill = recipe({
  base: {
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    transition: 'width 200ms linear',
  },
  variants: {
    complete: {
      true: {
        backgroundColor: vars.color.brandRed,
      },
      false: {
        backgroundColor: vars.color.brandNavy,
      },
    },
  },
});

export const shimmerOverlay = style({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(90deg, transparent 0%, #FFFFFF80 50%, transparent 100%)',
});

export const congratsMessage = style({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  top: '100%',
  marginTop: vars.spacing[1],
  fontSize: vars.fontSize.xs,
  whiteSpace: 'nowrap',
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.brandNavy,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      fontSize: vars.fontSize.sm,
    },
  },
});

export const tooltip = style({
  zIndex: vars.zIndex.tooltip,
  borderRadius: vars.borderRadius.md,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  paddingLeft: vars.spacing[2],
  paddingRight: vars.spacing[2],
  paddingTop: vars.spacing[1],
  paddingBottom: vars.spacing[1],
  fontSize: vars.fontSize.xs,
  color: vars.color.white,
  boxShadow: vars.shadow.md,
});

export const tooltipArrow = style({
  fill: 'rgba(0, 0, 0, 0.9)',
});
