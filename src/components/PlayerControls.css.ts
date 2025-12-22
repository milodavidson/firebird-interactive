import { style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars, breakpoints } from '@/styles/theme.css';
import { button, pressable } from '@/styles/shared.css';

export const container = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  width: '100%',
  gap: vars.spacing[2],
  paddingTop: vars.spacing[2],
  paddingBottom: vars.spacing[2],
  '@media': {
    [`screen and (min-width: ${breakpoints.sm})`]: {
      gap: vars.spacing[3],
    },
    [`screen and (min-width: ${breakpoints.md})`]: {
      width: 'auto',
      gap: vars.spacing[4],
    }
  }
});

export const loopProgressWrapper = style({
  justifySelf: 'center',
  transform: 'translateY(4px)',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      justifySelf: 'start',
      transform: 'translateY(4px) translateX(4px)',
    }
  }
});

export const tempoWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const tempoGroup = style({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  height: '2.5rem',
  borderRadius: vars.borderRadius.full,
  border: `1px solid ${vars.color.gray[300]}`,
  backgroundColor: vars.color.gray[100],
  overflow: 'hidden',
  width: '100%',
  minWidth: 0,
  maxWidth: '220px',
  '@media': {
    [`screen and (min-width: ${breakpoints.sm})`]: {
      maxWidth: '240px',
    }
  }
});

export const tempoSlider = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  width: '50%',
  borderRadius: vars.borderRadius.full,
  willChange: 'transform',
  transition: 'transform 250ms linear, background-color 250ms linear',
});

export const tempoSliderFast = style({
  backgroundColor: vars.color.brandRed,
  transform: 'translateX(0%)',
});

export const tempoSliderSlow = style({
  backgroundColor: vars.color.brandNavy,
  transform: 'translateX(100%)',
});

export const tempoButton = recipe({
  base: {
    position: 'relative',
    zIndex: 10,
    height: '100%',
    paddingLeft: vars.spacing[3],
    paddingRight: vars.spacing[3],
    fontSize: '13px',
    fontWeight: vars.fontWeight.medium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    ':focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.white}, 0 0 0 4px ${vars.color.brandNavy}`,
    },
    '@media': {
      [`screen and (min-width: ${breakpoints.sm})`]: {
        fontSize: vars.fontSize.sm,
      }
    }
  },
  variants: {
    active: {
      true: {
        color: vars.color.white,
      },
      false: {
        color: vars.color.gray[800],
      }
    }
  },
  defaultVariants: {
    active: false,
  }
});

export const clearButtonWrapper = style({
  justifySelf: 'center',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      justifySelf: 'end',
    }
  }
});

export const clearButton = style([
  button({ variant: 'outline' }),
  pressable,
  {
    height: '2.5rem',
    width: '2.5rem',
    padding: 0,
  }
]);

export const tooltipContent = style({
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
