import { style, globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars, breakpoints } from '@/styles/theme.css';
import { pressable, shimmer } from '@/styles/shared.css';

export const container = style({
  position: 'relative',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '0.375rem', // gap-x-1.5
  rowGap: '0.125rem',    // gap-y-0.5
  paddingTop: vars.spacing[1],
  paddingBottom: vars.spacing[1],
  overflow: 'visible',
  minHeight: 'clamp(48px, 6vh, 140px)',
  maxHeight: '120px',
  '@media': {
    [`screen and (min-width: ${breakpoints.lg})`]: {
      columnGap: '0.375rem', // lg:gap-x-1.5
    },
    [`screen and (min-width: ${breakpoints.xl})`]: {
      flexWrap: 'nowrap',
    },
  },
});

export const iconBlock = style({
  display: 'flex',
  minWidth: 0,
  alignItems: 'center',
  gap: vars.spacing[2],
  order: 1,
  '@media': {
    [`screen and (min-width: ${breakpoints.xl})`]: {
      width: '64px',
      flexShrink: 0,
    },
  },
});

export const iconImage = style({
  height: vars.spacing[6],
  width: 'auto',
  minWidth: '24px',
  maxWidth: 'none',
  userSelect: 'none',
  flexShrink: 0,
  objectFit: 'contain',
});

export const controlsBlock = style({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[1],
  flexShrink: 0,
  order: 2,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      gap: '0.375rem', // md:gap-1.5
    },
    [`screen and (min-width: ${breakpoints.lg})`]: {
      order: 3,
    },
    [`screen and (min-width: ${breakpoints.xl})`]: {
      marginLeft: 0,
      width: '128px',
      justifyContent: 'flex-end',
    },
  },
});

export const controlButton = recipe({
  base: {
    paddingLeft: '0.375rem', // px-1.5
    paddingRight: '0.375rem',
    paddingTop: vars.spacing[1], // py-1
    paddingBottom: vars.spacing[1],
    fontSize: '11px',
    border: `1px solid ${vars.color.gray[300]}`,
    borderRadius: vars.borderRadius.md,
    backgroundColor: vars.color.white,
    cursor: 'pointer',
    transition: `transform ${vars.transition.fast}, box-shadow ${vars.transition.fast}, background-color ${vars.transition.fast}, color ${vars.transition.fast}, border-color ${vars.transition.fast}`,
    ':active': {
      transform: 'scale(0.97)',
    },
    '@media': {
      [`screen and (min-width: ${breakpoints.md})`]: {
        paddingLeft: '0.625rem', // md:px-2.5
        paddingRight: '0.625rem',
        paddingTop: '0.375rem', // md:py-1.5
        paddingBottom: '0.375rem',
        fontSize: vars.fontSize.sm,
      },
      '(prefers-reduced-motion: reduce)': {
        transition: `background-color ${vars.transition.fast}, color ${vars.transition.fast}, border-color ${vars.transition.fast}`,
        ':active': {
          transform: 'none',
        },
      },
    },
  },
  variants: {
    active: {
      solo: {
        backgroundColor: vars.color.brandNavy,
        color: vars.color.white,
        borderColor: vars.color.brandNavy,
      },
      mute: {
        backgroundColor: vars.color.brandRed,
        color: vars.color.white,
        borderColor: vars.color.brandRed,
      },
      false: {
        // Default outline style
      },
    },
  },
});

export const slider = style({
  order: 999, // order-last
  flexBasis: '100%',
  width: '100%',
  marginLeft: 0,
  height: '7px',
  minWidth: '80px',
  // No flex-grow on mobile - let basis-full force wrapping
  '@media': {
    [`screen and (min-width: ${breakpoints.xl})`]: {
      order: 2,
      flexBasis: 'auto',
      width: 'auto',
      flex: 1, // xl:flex-1
    },
  },
});

// Custom range slider styling (pink variant)
// This needs to use globalStyle because pseudo-elements require it
globalStyle(`input[type="range"].${slider}`, {
  WebkitAppearance: 'none',
  appearance: 'none',
  background: 'transparent',
  cursor: 'pointer',
});

globalStyle(`input[type="range"].${slider}::-webkit-slider-runnable-track`, {
  height: '7px',
  borderRadius: vars.borderRadius.full,
  background: `linear-gradient(
    to right,
    ${vars.color.brandPink} 0%,
    ${vars.color.brandPink} var(--range-progress, 0%),
    ${vars.color.gray[200]} var(--range-progress, 0%),
    ${vars.color.gray[200]} 100%
  )`,
});

globalStyle(`input[type="range"].${slider}::-moz-range-track`, {
  height: '7px',
  borderRadius: vars.borderRadius.full,
  background: vars.color.gray[200],
});

globalStyle(`input[type="range"].${slider}::-moz-range-progress`, {
  height: '7px',
  borderRadius: vars.borderRadius.full,
  background: vars.color.brandPink,
});

globalStyle(`input[type="range"].${slider}::-webkit-slider-thumb`, {
  WebkitAppearance: 'none',
  appearance: 'none',
  height: '14px',
  width: '14px',
  borderRadius: '50%',
  background: vars.color.brandNavy,
  border: `2px solid ${vars.color.white}`,
  boxShadow: vars.shadow.sm,
  marginTop: '-3.5px',
  cursor: 'grab',
});

globalStyle(`input[type="range"].${slider}::-moz-range-thumb`, {
  height: '14px',
  width: '14px',
  borderRadius: '50%',
  background: vars.color.brandNavy,
  border: `2px solid ${vars.color.white}`,
  boxShadow: vars.shadow.sm,
  cursor: 'grab',
});

globalStyle(`input[type="range"].${slider}:active::-webkit-slider-thumb`, {
  cursor: 'grabbing',
});

globalStyle(`input[type="range"].${slider}:active::-moz-range-thumb`, {
  cursor: 'grabbing',
});

export const queuedProgressContainer = style({
  position: 'relative',
  display: 'inline-block',
  overflow: 'hidden',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.gray[200],
});

export const queuedProgressFill = style({
  display: 'block',
  height: '100%',
  backgroundColor: vars.color.gray[500],
  transition: 'width 75ms',
});

export const queuedStripContainer = style({
  pointerEvents: 'none',
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  height: '2px',
  overflow: 'hidden',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.color.gray[200],
  transformOrigin: 'top',
});

export const queuedStripFill = style({
  position: 'absolute',
  insetBlock: 0,
  left: 0,
  width: '100%',
  backgroundColor: vars.color.gray[500],
  boxShadow: '0 0 8px rgba(19, 32, 103, 0.35)',
  willChange: 'transform',
  transform: 'scaleX(0)',
});

export const tooltip = style({
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

// Re-export shimmer from shared styles
export { shimmer, pressable };
