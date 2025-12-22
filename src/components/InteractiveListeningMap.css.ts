import { style } from '@vanilla-extract/css';
import { vars, breakpoints } from '@/styles/theme.css';
import { card, srOnly } from '@/styles/shared.css';

export const container = style({
  margin: '0 auto',
  maxWidth: '72rem',
  paddingTop: 0,
  paddingBottom: vars.spacing[4],
  paddingLeft: vars.spacing[4],
  paddingRight: vars.spacing[4],
  minHeight: '100svh',
  display: 'flex',
  flexDirection: 'column',
});

export const skipLink = style([
  srOnly,
  {
    ':focus': {
      position: 'absolute',
      top: vars.spacing[2],
      left: vars.spacing[2],
      zIndex: vars.zIndex.tooltip,
      backgroundColor: vars.color.white,
      border: `1px solid ${vars.color.gray[300]}`,
      borderRadius: vars.borderRadius.md,
      paddingLeft: vars.spacing[2],
      paddingRight: vars.spacing[2],
      paddingTop: vars.spacing[1],
      paddingBottom: vars.spacing[1],
      clip: 'auto',
      height: 'auto',
      width: 'auto',
      overflow: 'visible',
      whiteSpace: 'normal',
    }
  }
]);

export const header = style({
  marginBottom: vars.spacing[2],
  paddingTop: vars.spacing[2],
  paddingBottom: vars.spacing[2],
  display: 'grid',
  alignItems: 'center',
  gap: vars.spacing[1],
  gridTemplateColumns: '1fr auto',
  position: 'sticky',
  top: 0,
  zIndex: 40,
  backgroundColor: vars.color.white,
  backdropFilter: 'blur(8px)',
  borderBottom: '0',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      gap: vars.spacing[2],
      gridTemplateColumns: 'auto 1fr auto',
    },
    [`screen and (min-width: ${breakpoints.lg})`]: {
      paddingTop: 0,
      paddingBottom: 0,
    },
    [`screen and (min-width: ${breakpoints.xl})`]: {
      gridTemplateColumns: 'auto 1fr auto',
    }
  }
});

export const titleSection = style({
  justifySelf: 'center',
  gridColumnStart: 1,
  gridColumnEnd: 2,
  gridRowStart: 1,
  minWidth: 0,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      justifySelf: 'start',
    }
  }
});

export const titleInner = style({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      display: 'block',
    }
  }
});

export const title = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.tight,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.brandNavy,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      fontSize: vars.fontSize.lg,
    }
  }
});

export const subtitle = style({
  fontSize: '11px',
  lineHeight: vars.lineHeight.snug,
  color: vars.color.gray[600],
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      fontSize: vars.fontSize.sm,
    }
  }
});

export const chipSection = style({
  gridColumn: '1 / span 2',
  gridRowStart: 2,
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      gridRow: 'auto',
      gridColumn: 'auto',
      gridColumnStart: 2,
      gridColumnEnd: 3,
      display: 'block',
      justifySelf: 'stretch',
    }
  }
});

export const controlsSection = style({
  gridColumn: '1 / span 2',
  gridRowStart: 3,
  width: '100%',
  justifySelf: 'stretch',
  marginTop: 0,
  marginBottom: 0,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      gridRow: 'auto',
      gridColumn: 'auto',
      gridColumnStart: 3,
      gridColumnEnd: 4,
      width: 'auto',
      justifySelf: 'end',
    }
  }
});

export const contentGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: vars.spacing[4],
  flex: 1,
  minHeight: 0,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      gridTemplateColumns: '320px 1fr',
      alignItems: 'start',
    }
  }
});

export const aside = style([
  card,
  {
    padding: vars.spacing[4],
    position: 'sticky',
    top: '5rem',
    zIndex: 30,
    alignSelf: 'start',
    maxHeight: 'calc(100vh - 5rem)',
    overflowY: 'auto',
    overflowX: 'hidden',
  }
]);

export const asideTitle = style({
  marginBottom: vars.spacing[2],
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.gray[700],
});

export const main = style([
  card,
  {
    padding: vars.spacing[4],
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 0,
  }
]);

export const mainInner = style({
  height: '100%',
  minHeight: 0,
});
