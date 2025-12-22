import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars, breakpoints } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
});

export const helpText = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.gray[600],
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

export const list = style({
  margin: 0,
  padding: 0,
  marginTop: vars.spacing[3],
  paddingTop: vars.spacing[1],
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.spacing[3],
  overflow: 'visible',
  listStyle: 'none',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      display: 'block',
      gridTemplateColumns: 'none',
    }
  }
});

export const listItem = style({
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      selectors: {
        '& + &': {
          marginTop: vars.spacing[3],
        }
      }
    }
  }
});

export const instrumentButton = recipe({
  base: {
    width: '100%',
    borderRadius: vars.borderRadius.lg,
    border: '1px solid',
    paddingLeft: vars.spacing[4],
    paddingRight: vars.spacing[4],
    paddingTop: vars.spacing[3],
    paddingBottom: vars.spacing[3],
    textAlign: 'left',
    fontSize: vars.fontSize.sm,
    transition: `transform ${vars.transition.fast}, background-color ${vars.transition.fast}, box-shadow ${vars.transition.fast}, border-color ${vars.transition.fast}`,
    cursor: 'pointer',
    backgroundColor: vars.color.white,
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
  },
  variants: {
    selected: {
      true: {
        borderColor: vars.color.brandNavy,
        boxShadow: `0 0 0 1px ${vars.color.brandNavy}`,
      },
      false: {
        borderColor: vars.color.gray[300],
      }
    }
  },
  defaultVariants: {
    selected: false,
  }
});

export const buttonContent = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
});

export const icon = style({
  height: '1.25rem',
  width: 'auto',
  userSelect: 'none',
  flexShrink: 0,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      height: '1.5rem',
    }
  }
});
