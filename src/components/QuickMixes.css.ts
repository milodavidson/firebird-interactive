import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars, breakpoints } from '@/styles/theme.css';

export const container = recipe({
  base: {
    marginTop: vars.spacing[3],
    transition: `opacity ${vars.transition.base}`,
  },
  variants: {
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
      },
      false: {
        opacity: 1,
      }
    }
  },
  defaultVariants: {
    disabled: false,
  }
});

export const divider = style({
  borderTop: `1px solid ${vars.color.gray[200]}`,
  paddingTop: vars.spacing[2],
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const title = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
});

export const toggleButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing[1],
  borderRadius: vars.borderRadius.md,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  ':focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${vars.color.white}, 0 0 0 4px ${vars.color.brandNavy}`,
  }
});

export const chevron = recipe({
  base: {
    height: '1rem',
    width: '1rem',
    transition: `transform ${vars.transition.base}`,
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      }
    }
  },
  variants: {
    open: {
      true: {
        transform: 'rotate(180deg)',
      },
      false: {
        transform: 'rotate(0deg)',
      }
    }
  },
  defaultVariants: {
    open: false,
  }
});

export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

export const panel = recipe({
  base: {
    marginTop: vars.spacing[1],
    overflow: 'hidden',
    transition: `max-height ${vars.transition.base}, opacity ${vars.transition.base}, padding ${vars.transition.base}`,
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      }
    }
  },
  variants: {
    open: {
      true: {
        maxHeight: '24rem',
        opacity: 1,
        paddingTop: vars.spacing[2],
      },
      false: {
        maxHeight: 0,
        opacity: 0,
        paddingTop: 0,
      }
    }
  },
  defaultVariants: {
    open: false,
  }
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.spacing[3],
  overflow: 'visible',
});

export const mixButton = style({
  width: '100%',
  borderRadius: vars.borderRadius.lg,
  border: `1px solid ${vars.color.gray[300]}`,
  paddingLeft: vars.spacing[4],
  paddingRight: vars.spacing[4],
  paddingTop: vars.spacing[3],
  paddingBottom: vars.spacing[3],
  textAlign: 'left',
  fontSize: vars.fontSize.sm,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  transition: `transform ${vars.transition.fast}, background-color ${vars.transition.fast}, box-shadow ${vars.transition.fast}`,
  ':hover': {
    transform: 'translateY(-1px)',
    backgroundColor: vars.color.gray[50],
    boxShadow: vars.shadow.sm,
  },
  ':active': {
    transform: 'scale(0.97)',
  },
  ':focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${vars.color.white}, 0 0 0 4px ${vars.color.brandNavy}`,
  },
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      fontSize: vars.fontSize.base,
    },
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
      ':active': {
        transform: 'none',
      }
    }
  }
});

export const buttonContent = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
});

export const icon = style({
  flexShrink: 0,
  color: vars.color.brandNavy,
});

export const label = style({
  fontWeight: vars.fontWeight.medium,
});
