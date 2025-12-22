import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/theme.css';

export const button = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  ':focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${vars.color.white}, 0 0 0 4px ${vars.color.brandNavy}`,
  }
});

export const svg = style({
  transform: 'rotate(-90deg)',
});

export const progressCircle = style({
  transition: 'stroke 250ms linear',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    }
  }
});

export const innerButtonWrapper = style({
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
});

export const innerButton = recipe({
  base: {
    display: 'grid',
    height: '2.5rem',
    width: '2.5rem',
    placeItems: 'center',
    borderRadius: vars.borderRadius.full,
    boxShadow: vars.shadow.sm,
  },
  variants: {
    disabled: {
      true: {
        backgroundColor: vars.color.gray[200],
        color: vars.color.gray[700],
        cursor: 'not-allowed',
      },
      false: {
        backgroundColor: vars.color.brandNavy,
        color: vars.color.white,
      }
    }
  },
  defaultVariants: {
    disabled: false,
  }
});

export const playIcon = style({
  transform: 'translateX(1px)',
});

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
