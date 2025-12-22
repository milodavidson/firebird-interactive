import { style, keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from './theme.css';

// Card component (matches .card in globals.css)
export const card = style({
  borderRadius: vars.borderRadius['2xl'],
  border: `1px solid ${vars.color.gray[200]}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
});

// Button recipe (matches .btn, .btn-primary, .btn-outline in globals.css)
export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.borderRadius.md,
    padding: `${vars.spacing[2]} ${vars.spacing[3]}`,
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    transition: `color ${vars.transition.fast}, background-color ${vars.transition.fast}, border-color ${vars.transition.fast}`,
    cursor: 'pointer',
    border: 'none',
    ':focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.white}, 0 0 0 4px ${vars.color.brandNavy}`,
    }
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: vars.color.brandNavy,
        color: vars.color.white,
        ':hover': {
          backgroundColor: vars.color.brandNavyHover,
        }
      },
      outline: {
        border: `1px solid ${vars.color.gray[300]}`,
        backgroundColor: vars.color.white,
        ':hover': {
          backgroundColor: vars.color.gray[50],
        }
      }
    },
    size: {
      sm: {
        padding: `${vars.spacing[1]} ${vars.spacing[2]}`,
        fontSize: vars.fontSize.xs,
      },
      md: {
        padding: `${vars.spacing[2]} ${vars.spacing[3]}`,
        fontSize: vars.fontSize.sm,
      }
    }
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  }
});

// Pressable effect (matches .pressable in globals.css)
export const pressable = style({
  transition: `transform ${vars.transition.fast}, box-shadow ${vars.transition.fast}, background-color ${vars.transition.fast}, color ${vars.transition.fast}, border-color ${vars.transition.fast}`,
  selectors: {
    '&:active': {
      transform: 'scale(0.97)',
    }
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
      selectors: {
        '&:active': {
          transform: 'none',
        }
      }
    }
  }
});

// Shake animation (matches .animate-shake-x in globals.css)
export const shakeX = keyframes({
  '0%, 100%': { transform: 'translateX(0)' },
  '25%': { transform: 'translateX(-2px)' },
  '75%': { transform: 'translateX(2px)' },
});

export const animateShakeX = style({
  animation: `${shakeX} 180ms ease-in-out`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none !important',
    }
  }
});

// Shimmer animation (matches .shimmer in globals.css)
export const shimmerAnimation = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(100%)' },
});

export const shimmer = style({
  position: 'relative',
  overflow: 'hidden',
  '::before': {
    content: '',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
    animation: `${shimmerAnimation} 700ms ease-out forwards`,
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      '::before': {
        animation: 'none !important',
      }
    }
  }
});

// Glow pulse animation (matches .glow-pulse in globals.css)
export const glowPulse = keyframes({
  '0%, 100%': { boxShadow: '0 0 0 0 rgba(226,34,55,0.0)' },
  '50%': { boxShadow: '0 0 0 6px rgba(226,34,55,0.25)' },
});

export const glowPulseAnimation = style({
  animation: `${glowPulse} 1200ms ease-out 1`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    }
  }
});

// Screen reader only (matches .sr-only from Tailwind)
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
