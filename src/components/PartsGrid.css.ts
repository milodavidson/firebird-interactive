import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css';

export const grid = style({
  display: 'grid',
  minHeight: 0,
  gridTemplateColumns: '1fr',
  gap: vars.spacing[3],
  gridAutoRows: 'auto',
  '@media': {
    'screen and (min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr',
      gridAutoRows: '1fr',
      height: '100%',
    }
  }
});

export const gridItem = style({
  height: '100%',
  minWidth: 0,
});
