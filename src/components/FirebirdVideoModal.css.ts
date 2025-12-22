import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css';

export const modalOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: vars.zIndex.modal,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing[4],
});

export const backdrop = style({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
});

export const dialog = style({
  position: 'relative',
  width: '100%',
  maxWidth: '48rem', // 3xl
  maxHeight: '90vh',
  borderRadius: vars.borderRadius.lg,
  border: `1px solid ${vars.color.gray[200]}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.xl,
  padding: vars.spacing[4],
  overflow: 'auto',
  zIndex: 60,
  '@media': {
    'screen and (min-width: 768px)': {
      padding: vars.spacing[6],
    },
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.spacing[4],
});

export const title = style({
  fontWeight: vars.fontWeight.semibold,
  fontSize: vars.fontSize.lg,
});

export const closeButton = style({
  color: vars.color.gray[500],
  cursor: 'pointer',
  border: 'none',
  backgroundColor: 'transparent',
  padding: 0,
  ':hover': {
    color: vars.color.gray[700],
  },
});

export const videoContainer = style({
  marginTop: vars.spacing[4],
  width: '100%',
  backgroundColor: vars.color.black,
});

export const videoAspect = style({
  aspectRatio: '16 / 9',
  width: '100%',
});

export const iframe = style({
  width: '100%',
  height: '100%',
  borderRadius: vars.borderRadius.md,
});

export const placeholder = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.fontSize.sm,
  color: vars.color.gray[400],
});
