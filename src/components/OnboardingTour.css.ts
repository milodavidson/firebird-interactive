import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css';
import { button } from '@/styles/shared.css';

export const highlight = style({
  zIndex: 10000, // High z-index for spotlight overlay (above normal content, below tooltip)
});

export const modalOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 100000, // Very high z-index to ensure modal covers everything
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const modalBackdrop = style({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
});

export const modalDialog = style({
  position: 'relative',
  backgroundColor: vars.color.white,
  borderRadius: vars.borderRadius.lg,
  boxShadow: vars.shadow.lg,
  padding: vars.spacing[6],
  maxWidth: '32rem', // lg
  marginLeft: vars.spacing[4],
  marginRight: vars.spacing[4],
  zIndex: 100001,
});

export const modalTitle = style({
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  marginBottom: vars.spacing[2],
});

export const modalText = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.gray[700],
  marginBottom: vars.spacing[4],
});

export const modalActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.spacing[2],
});

export const tooltipContainer = style({
  position: 'fixed',
  zIndex: 10001, // Above the highlight overlay so tooltip is visible
});

export const tooltipContent = style({
  maxWidth: '100%',
  padding: vars.spacing[3],
  backgroundColor: vars.color.white,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.shadow.lg,
  fontSize: vars.fontSize.sm,
});

export const tooltipText = style({
  fontWeight: vars.fontWeight.semibold,
  marginBottom: vars.spacing[1],
});

export const tooltipActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
  justifyContent: 'flex-end',
});

// Re-export button variants from shared styles
export { button };
