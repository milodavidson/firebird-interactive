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

// Base resets (replaces Tailwind's @tailwind base)
// These are critical for consistent layout across browsers
globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
});

globalStyle('html', {
  lineHeight: 1.5,
  WebkitTextSizeAdjust: '100%',
  MozTabSize: '4',
  tabSize: 4,
  fontFamily: 'var(--font-cadiz), system-ui, sans-serif',
});

globalStyle('body', {
  margin: 0,
  lineHeight: 'inherit',
});

globalStyle('hr', {
  height: 0,
  color: 'inherit',
  borderTopWidth: '1px',
});

globalStyle('abbr:where([title])', {
  textDecoration: 'underline dotted',
});

globalStyle('h1, h2, h3, h4, h5, h6', {
  fontSize: 'inherit',
  fontWeight: 'inherit',
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'inherit',
});

globalStyle('b, strong', {
  fontWeight: 'bolder',
});

globalStyle('code, kbd, samp, pre', {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '1em',
});

globalStyle('small', {
  fontSize: '80%',
});

globalStyle('sub, sup', {
  fontSize: '75%',
  lineHeight: 0,
  position: 'relative',
  verticalAlign: 'baseline',
});

globalStyle('sub', {
  bottom: '-0.25em',
});

globalStyle('sup', {
  top: '-0.5em',
});

globalStyle('table', {
  textIndent: 0,
  borderColor: 'inherit',
  borderCollapse: 'collapse',
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

globalStyle('button, select', {
  textTransform: 'none',
});

globalStyle('button, [type="button"], [type="reset"], [type="submit"]', {
  WebkitAppearance: 'button',
  backgroundColor: 'transparent',
  backgroundImage: 'none',
});

globalStyle(':-moz-focusring', {
  outline: 'auto',
});

globalStyle(':-moz-ui-invalid', {
  boxShadow: 'none',
});

globalStyle('progress', {
  verticalAlign: 'baseline',
});

globalStyle('::-webkit-inner-spin-button, ::-webkit-outer-spin-button', {
  height: 'auto',
});

globalStyle('[type="search"]', {
  WebkitAppearance: 'textfield',
  outlineOffset: '-2px',
});

globalStyle('::-webkit-search-decoration', {
  WebkitAppearance: 'none',
});

globalStyle('::-webkit-file-upload-button', {
  WebkitAppearance: 'button',
  font: 'inherit',
});

globalStyle('summary', {
  display: 'list-item',
});

globalStyle('blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre', {
  margin: 0,
});

globalStyle('fieldset', {
  margin: 0,
  padding: 0,
});

globalStyle('legend', {
  padding: 0,
});

globalStyle('ol, ul, menu', {
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

globalStyle('textarea', {
  resize: 'vertical',
});

globalStyle('input::placeholder, textarea::placeholder', {
  opacity: 1,
  color: '#9ca3af',
});

globalStyle('button, [role="button"]', {
  cursor: 'pointer',
});

globalStyle(':disabled', {
  cursor: 'default',
});

globalStyle('img, svg, video, canvas, audio, iframe, embed, object', {
  display: 'block',
  verticalAlign: 'middle',
});

globalStyle('img, video', {
  maxWidth: '100%',
  height: 'auto',
});

globalStyle('[hidden]', {
  display: 'none',
});

// Mobile scroll smoothing
globalStyle('html, body', {
  WebkitOverflowScrolling: 'touch',
  overscrollBehaviorY: 'contain',
  touchAction: 'pan-y',
});

// Scoped base styles - ONLY apply these within .orchestraApp container
// This container will wrap the root of your app (in page.tsx or InteractiveListeningMap.tsx)
// NOT the body tag, since this app will be embedded in another site
export const orchestraAppContainer = 'orchestraApp';

// Remove the old scoped styles - we're using global resets above instead
// globalStyle(`.${orchestraAppContainer}`, {
//   boxSizing: 'border-box',
//   backgroundColor: vars.color.white,
//   color: vars.color.black,
// });

// globalStyle(`.${orchestraAppContainer} *, .${orchestraAppContainer} *::before, .${orchestraAppContainer} *::after`, {
//   boxSizing: 'border-box',
// });

// globalStyle(`.${orchestraAppContainer}`, {
//   WebkitOverflowScrolling: 'touch',
//   overscrollBehaviorY: 'contain',
//   touchAction: 'pan-y',
// });
