import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';

// These values are extracted from tailwind.config.js and globals.css
// DO NOT modify these - they match the current design exactly
export const vars = createGlobalTheme(':root', {
  color: {
    brandRed: '#e22237',
    brandPink: '#ffc2d1',
    brandNavy: '#132067',
    brandNavyHover: '#0f1a53',
    white: '#ffffff',
    black: '#0a0a0a',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },
  spacing: {
    0: '0',
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  }
});

// Breakpoints for media queries (matches Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

// Base resets - minimal normalizations needed for consistent layout
// These are standard browser resets, NOT Tailwind-specific
globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
});

globalStyle('html', {
  lineHeight: 1.5,
  WebkitTextSizeAdjust: '100%',
  fontFamily: 'var(--font-cadiz), system-ui, sans-serif',
});

globalStyle('body', {
  margin: 0,
  lineHeight: 'inherit',
});

globalStyle('h1, h2, h3, h4, h5, h6', {
  fontSize: 'inherit',
  fontWeight: 'inherit',
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'inherit',
});

globalStyle('button, input, optgroup, select, textarea', {
  fontFamily: 'inherit',
  fontSize: '100%',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
  margin: 0,
  padding: 0,
});

globalStyle('button, [type="button"], [type="reset"], [type="submit"]', {
  WebkitAppearance: 'button',
  backgroundColor: 'transparent',
  backgroundImage: 'none',
});

globalStyle('blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre', {
  margin: 0,
});

globalStyle('ol, ul, menu', {
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

globalStyle('button, [role="button"]', {
  cursor: 'pointer',
});

globalStyle('img, svg, video', {
  display: 'block',
  verticalAlign: 'middle',
});

globalStyle('img, video', {
  maxWidth: '100%',
  height: 'auto',
});
