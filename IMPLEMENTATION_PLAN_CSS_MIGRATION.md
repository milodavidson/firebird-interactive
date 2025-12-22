# CSS Migration Implementation Plan: Tailwind → vanilla-extract

## ⚠️ CRITICAL: Phased Approach

**DO NOT try to convert everything at once.** Follow these phases in order, verifying perfect visual parity after EACH phase before proceeding.

## Context

This project needs to be embedded in an organization's website (different backend, same Vercel hosting). The current Tailwind CSS setup includes global resets (`@tailwind base`) that conflict with the parent site's styles. We need to convert to scoped CSS-in-JS to ensure complete style isolation.

**Problem:** `@tailwind base` in `src/app/globals.css` includes global element selectors (`body`, `h1`, `p`, etc.) that affect the entire parent site.

**Solution:** Convert to vanilla-extract, which generates scoped class names and avoids global element selectors.

## Why vanilla-extract?

- **Zero runtime overhead** - generates static CSS at build time
- **TypeScript-first** - autocomplete for style properties
- **Next.js native support** - first-class integration
- **Perfect for embedded contexts** - no style injection issues
- **Scoped by default** - generates unique class names automatically

## Prerequisites

Read these files first to understand the current structure:
- `src/app/globals.css` - Current Tailwind setup with custom classes and animations
- `tailwind.config.js` - Tailwind config with brand colors
- `src/app/layout.tsx` - Where globals.css is imported
- `.github/copilot-instructions.md` - Project architecture overview

---

# PHASE 1: Setup Infrastructure (No Visual Changes)

**Goal:** Install vanilla-extract and create theme files WITHOUT touching any components or layout. Tailwind still works.

**Time estimate:** 30 minutes

## Steps

### 1.1: Install Dependencies

```bash
npm install @vanilla-extract/css @vanilla-extract/next @vanilla-extract/recipes
```

**DO NOT uninstall Tailwind yet.** Both will coexist during migration.

### 1.2: Configure Next.js

### 1.2: Configure Next.js

**File:** `next.config.js`

Add vanilla-extract plugin while keeping existing config:

```javascript
const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // existing config stays
};

module.exports = withVanillaExtract(nextConfig);
```

### 1.3: Create Theme File

**Create:** `src/styles/theme.css.ts`

```typescript
import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: {
    brandRed: '#e22237',
    brandPink: '#ffc2d1',
    brandNavy: '#132067',
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
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  }
});

// Scoped base styles - ONLY apply these within .orchestraApp container
// This container will wrap the root of your app (in page.tsx or InteractiveListeningMap.tsx)
// NOT the body tag, since this app will be embedded in another site
export const orchestraAppContainer = 'orchestraApp';

globalStyle(`.${orchestraAppContainer}`, {
  boxSizing: 'border-box',
  backgroundColor: vars.color.white,
  color: vars.color.black,
});

globalStyle(`.${orchestraAppContainer} *, .${orchestraAppContainer} *::before, .${orchestraAppContainer} *::after`, {
  boxSizing: 'border-box',
});

// Mobile scroll smoothing
globalStyle(`.${orchestraAppContainer}`, {
  WebkitOverflowScrolling: 'touch',
  overscrollBehaviorY: 'contain',
  touchAction: 'pan-y',
});
```

### 1.3: Create Theme File

**Create:** `src/styles/theme.css.ts`

```typescript
import { createGlobalTheme } from '@vanilla-extract/css';

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
```

**DO NOT add globalStyle() calls yet.** Theme only in Phase 1.

### 1.4: Create Shared Styles File

**Create:** `src/styles/shared.css.ts`

This file extracts the `.card`, `.btn`, `.pressable`, and animation classes from `globals.css`.

```typescript
import { style, styleVariants, keyframes, globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars, breakpoints } from './theme.css';

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
```

## ✅ PHASE 1 VERIFICATION

Run these commands:

```bash
npm run build
npm run dev
```

**Expected result:**
- Build succeeds with no errors
- Dev server runs
- App looks EXACTLY the same (Tailwind still active)
- No visual changes at all

**If anything breaks, STOP and fix before proceeding.**

---

# PHASE 2: Convert PartsGrid Only (Proof of Concept)

**Goal:** Convert ONE simple component to validate the pattern works. All other components still use Tailwind.

**Time estimate:** 20 minutes

## Steps

### 2.1: Create PartsGrid Styles

**Create:** `src/components/PartsGrid.css.ts`

```typescript
import { style, styleVariants, keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from './theme.css';

// Card component
export const card = style({
  borderRadius: vars.borderRadius.xl,
  border: `1px solid ${vars.color.gray[200]}`,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.sm,
});

// Button base and variants
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
          backgroundColor: '#0f1a53',
        }
      },
      outline: {
        border: `1px solid ${vars.color.gray[300]}`,
        backgroundColor: vars.color.white,
        ':hover': {
          backgroundColor: vars.color.gray[50],
        }
      }
    }
  },
  defaultVariants: {
    variant: 'outline'
  }
});

// Pressable effect (active state scale)
export const pressable = style({
  transition: `transform ${vars.transition.fast}`,
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

// Animations
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

export const shimmerAnimation = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(100%)' },
});

export const shimmer = style({
  position: 'relative',
  overflow: 'hidden',
  ':before': {
    content: '',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
    animation: `${shimmerAnimation} 700ms ease-out forwards`,
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      ':before': {
        animation: 'none !important',
      }
    }
  }
});

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

// Screen reader only
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
```

---

### Step 4: Update Layout (~15 min)

**File:** `src/app/layout.tsx`

Remove globals.css import (keep body clean since this will be embedded):

```tsx
import React from 'react'
// REMOVE: import './globals.css'
import localFont from 'next/font/local'

const cadiz = localFont({
  src: [
    { path: './fonts/Cadiz-Regular.otf', weight: '400', style: 'normal' },
    { path: './fonts/Cadiz-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: './fonts/Cadiz-Black.otf', weight: '900', style: 'normal' },
    { path: './fonts/Cadiz-BlackItalic.otf', weight: '900', style: 'italic' }
  ],
  variable: '--font-cadiz'
})

export const metadata = {
  title: 'Orchestra Sandbox',
  description: 'Build and play parts together with beat-aligned loops and tempo switching'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cadiz.variable}>
      <body className={cadiz.className} style={{ minHeight: '100svh' }}>
        {children}
      </body>
    </html>
  )
}
```

**File:** `src/app/page.tsx` OR `src/components/InteractiveListeningMap.tsx`

Add the container class to the root div of your app:

```tsx
import { orchestraAppContainer } from '@/styles/theme.css'

// In your root component, wrap everything in the container:
export default function Page() {
  return (
    <div className={orchestraAppContainer}>
      {/* Your app content */}
    </div>
  )
}
```

**Delete:** `src/app/globals.css`

**Create:** `src/components/PartsGrid.css.ts`

```typescript
import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css';

export const grid = style({
  display: 'grid',
  minHeight: 0,
  gridTemplateColumns: '1fr',
  gap: vars.spacing[3],
  autoRows: 'auto',
  '@media': {
    'screen and (min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr',
      autoRows: 'fr',
      height: '100%',
    }
  }
});

export const gridItem = style({
  height: '100%',
});
```

### 2.2: Update PartsGrid Component

**File:** `src/components/PartsGrid.tsx`

```tsx
import React from 'react'
import PartCard from './PartCard'
import { usePartsStore } from '@/hooks/usePartsStore'
import * as styles from './PartsGrid.css'

export default function PartsGrid() {
  const allParts = usePartsStore((state) => state.parts)
  return (
    <div className={styles.grid}>
      {allParts.map((p) => (
        <div key={p.id} className={styles.gridItem}><PartCard partId={p.id} /></div>
      ))}
    </div>
  )
}
```

## ✅ PHASE 2 VERIFICATION

```bash
npm run dev
```

**Visual check:**
- Open app in browser
- PartsGrid should look IDENTICAL to before
- 2x2 grid on large screens
- 1 column on mobile
- Spacing matches exactly

**Screenshot comparison recommended.** Compare before/after.

**If PartsGrid looks different, STOP and fix before proceeding.**

---

# PHASE 3: Convert Simple Components (One at a Time)

**Goal:** Convert InstrumentList and QuickMixes, verifying after each one.

**Time estimate:** 2-3 hours total

## 3.1: Convert InstrumentList

⚠️ **CRITICAL: Read the actual component file first!**

**Process:**
1. Open `src/components/InstrumentList.tsx`
2. Read all className values currently in the file
3. Create `src/components/InstrumentList.css.ts` with style equivalents
4. Update InstrumentList.tsx to use the new styles

**Translation guidance:**
- `className="flex items-center gap-2"` becomes a style with `display: 'flex', alignItems: 'center', gap: vars.spacing[2]`
- `className="text-xs text-gray-600"` becomes `fontSize: vars.fontSize.xs, color: vars.color.gray[600]`
- For conditional classes like `${selected ? 'border-navy' : 'border-gray'}`, use `recipe()` with variants
- Grid layouts: `grid grid-cols-2 gap-3 md:block md:space-y-3` translates to media queries
- Hover states: `:hover` pseudo-selector
- Focus states: `:focus-visible` pseudo-selector with ring styles

**DO NOT guess the styles. Read the actual file and translate what's there.**

### ✅ Verify InstrumentList

```bash
npm run dev
```

**Check:**
- Instrument list renders correctly
- Grid layout (2 columns on mobile, list on desktop)
- Hover effects work
- Selected instrument highlights correctly
- Focus states work (keyboard navigation)

**Take screenshot. Compare. If different, fix before continuing.**

---

## 3.2: Convert QuickMixes

⚠️ **Read `src/components/QuickMixes.tsx` first!**

**Process:**
1. Read all className values in QuickMixes.tsx
2. Create `src/components/QuickMixes.css.ts`
3. Translate each className to vanilla-extract equivalent
4. Update QuickMixes.tsx

**Key patterns in this component:**
- Chevron rotation: use `transform: 'rotate(180deg)'` with transition
- Expand/collapse: `max-height` and `opacity` transitions
- Conditional opacity: `opacity: ${play ? 0.5 : 1}`
- Grid: `display: 'grid', gridTemplateColumns: '1fr 1fr'`

**Update:** `src/components/QuickMixes.tsx` with imported styles

### ✅ Verify QuickMixes

**Check:**
- Expand/collapse animation works
- Grid layout correct (2 columns)
- Button hover states work
- Icons display correctly
- Spacing matches

---

# PHASE 4: Convert Medium Components (One at a Time)

**Goal:** Convert PlayerControls, LoopProgress, PartCard, InteractiveListeningMap

**Time estimate:** 6-8 hours total (verify after EACH component)

## 4.1: Convert PlayerControls

⚠️ **Read `src/components/PlayerControls.tsx` first!**

**Process:**
1. Read all className values
2. Create `src/components/PlayerControls.css.ts`
3. Pay special attention to the tempo toggle switch - it has a sliding background animation
4. Translate and update

**Complex element: Tempo toggle**
- The background slide uses `transform` with transition
- Active state changes text color
- Uses `will-change-transform` for performance

### ✅ Verify PlayerControls

**Check:**
- Layout correct (centered on mobile, spread on desktop)
- Tempo switch animation smooth
- Hover/focus states work
- Loop progress displays correctly

---

## 4.2: Convert LoopProgress

⚠️ **Read `src/components/LoopProgress.tsx` first!**

**Process:**
1. Read all className values
2. Create `src/components/LoopProgress.css.ts`
3. SVG styling may need special handling
4. Update component

### ✅ Verify LoopProgress

**Check:**
- Circular progress animates correctly
- Play/pause button works
- Colors match (navy background, pink progress)

---

## 4.3: Convert PartCard

⚠️ **Read `src/components/PartCard.tsx` first!**

**Process:**
1. Read all className values
2. Create `src/components/PartCard.css.ts`
3. Note the conditional border/styling based on drop target state
4. Update component

### ✅ Verify PartCard

**Check:**
- Card border and shadow correct
- Empty state message displays
- Drop target styling works
- Assigned instruments list correctly

---

## 4.4: Convert InteractiveListeningMap

⚠️ **Read `src/components/InteractiveListeningMap.tsx` first!**

**Process:**
1. Read all className values - this is the main layout component
2. Create `src/components/InteractiveListeningMap.css.ts`
3. Pay attention to responsive grid changes, sticky positioning
4. Update component

### ✅ Verify InteractiveListeningMap

**Check:**
- Overall layout correct
- Sticky header works
- Sidebar positioning correct
- Responsive breakpoints work

---

# PHASE 5: Convert Complex Components (One at a Time)

**Goal:** Convert AssignedInstrument, FirebirdProgressChip, OnboardingTour, FirebirdVideoModal

**Time estimate:** 8-10 hours total

## 5.1: Convert AssignedInstrument

⚠️ **MOST COMPLEX COMPONENT - Read `src/components/AssignedInstrument.tsx` carefully!**

**Special considerations:**
1. Custom range slider styling - currently uses `.range--pink` class from globals.css
2. The range slider uses a CSS variable `--range-progress` for the gradient
3. Lots of responsive order changes (`.order-1`, `.order-2`, etc.)
4. Progress bar and shimmer animation
5. Conditional button states (solo, mute)

**Range slider translation:**

The current globals.css has this:
```css
input[type="range"].range--pink::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    var(--color-brand-pink) 0%,
    var(--color-brand-pink) var(--range-progress, 0%),
    #e5e7eb var(--range-progress, 0%),
    #e5e7eb 100%
  );
}
```

In vanilla-extract, you'll need to:
1. Create a style for the base range input
2. Use globalStyle or complex selectors for pseudo-elements
3. Keep the inline CSS variable `--range-progress` as-is (it's dynamic)

**Process:**
1. Read AssignedInstrument.tsx thoroughly
2. Create `src/components/AssignedInstrument.css.ts`
3. Translate each className, paying attention to responsive variants
4. For the range slider, you may need `globalStyle()` for webkit pseudo-elements
5. Update component

**Tip:** Use `recipe()` for the button variants (solo active/inactive, mute active/inactive)

### ✅ Verify AssignedInstrument

**Check:**
- Layout correct (icon, controls, slider)
- Solo/mute buttons toggle correctly
- Volume slider works and looks correct (pink accent)
- Queued shimmer animation works
- Progress bar animates during playback
- Responsive layout (slider moves to bottom on small screens)

---

## 5.2: Convert FirebirdProgressChip

⚠️ **Read `src/components/FirebirdProgressChip.tsx` first!**

**Process:**
1. Read all className values
2. Create `src/components/FirebirdProgressChip.css.ts`
3. Note the progress bar animation and shimmer effect
4. Update component

### ✅ Verify FirebirdProgressChip

**Check:**
- Progress bar animates smoothly
- Completion animations work
- Colors match

---

## 5.3: Convert OnboardingTour

⚠️ **Read `src/components/OnboardingTour.tsx` first!**

**Process:**
1. Read all className values
2. Create `src/components/OnboardingTour.css.ts`
3. Pay attention to z-index values (very high for modal overlay)
4. Backdrop and positioning styles
5. Update component

### ✅ Verify OnboardingTour

**Check:**
- Tour highlights work
- Modal displays correctly
- Backdrop works
- Tour progression works

---

## 5.4: Convert FirebirdVideoModal

⚠️ **Read `src/components/FirebirdVideoModal.tsx` first!**

**Process:**
1. Read all className values
2. Create `src/components/FirebirdVideoModal.css.ts`
3. Modal backdrop, centering, aspect ratio handling
4. Update component

### ✅ Verify FirebirdVideoModal

**Check:**
- Modal opens/closes
- Video player displays
- Backdrop works

---

# PHASE 6: Update Layout and Remove Tailwind

**Goal:** Remove globals.css and all Tailwind dependencies

**Time estimate:** 1 hour

## 6.1: Update Layout

**File:** `src/app/layout.tsx`

Remove globals.css import:

```tsx
import React from 'react'
// REMOVE: import './globals.css'
import localFont from 'next/font/local'

// ... rest stays the same
```

**Verify the orchestraAppContainer class is applied to your root app component:**

In `src/app/page.tsx` or `src/components/InteractiveListeningMap.tsx`, make sure you have:

```tsx
import { orchestraAppContainer } from '@/styles/theme.css'

export default function YourRootComponent() {
  return (
    <div className={orchestraAppContainer}>
      {/* All app content */}
    </div>
  )
}
```

This ensures styles are scoped to your app and won't affect the parent site.

## 6.2: Delete Tailwind Files

```bash
rm src/app/globals.css
rm tailwind.config.js
rm postcss.config.js
```

## 6.3: Remove Tailwind from package.json

**File:** `package.json`

Remove:
- `tailwindcss`
- `autoprefixer`  
- `postcss`

Run:
```bash
npm install
```

## ✅ PHASE 6 VERIFICATION

```bash
npm run build
npm run dev
```

**Check:**
- Build succeeds with no Tailwind warnings
- App looks identical
- All components still work

---

# PHASE 7: Final Testing

**Time estimate:** 2-3 hours

## 7.1: E2E Tests

```bash
npm run test:e2e
```

Fix any test failures (likely selector issues).

## 7.2: Unit Tests

```bash
npm run test:unit
```

Should pass unchanged.

## 7.3: Full Manual Test

Go through every feature:
- [ ] Add instruments
- [ ] Remove instruments
- [ ] Play/pause
- [ ] Tempo switch
- [ ] Solo/mute
- [ ] Volume sliders
- [ ] Quick mixes
- [ ] Queueing during playback
- [ ] All responsive breakpoints
- [ ] Keyboard navigation
- [ ] Screen reader (if applicable)

---

# Success Criteria

Migration complete when:

1. **All components converted** - No Tailwind classes remain
2. **Tailwind removed** - Not in package.json or config
3. **Visual parity** - App looks identical (screenshot comparison)
4. **All tests pass** - E2E and unit
5. **Build succeeds** - `npm run build` works
6. **Production verified** - `npm run build && npm run start` looks correct

---

# Rollback Plan

If any phase fails catastrophically:

```bash
git stash
git reset --hard HEAD
npm install
```

Start that phase over with a different approach.

# Rollback Plan

If any phase fails catastrophically:

```bash
git stash
git reset --hard HEAD
npm install
```

Start that phase over with a different approach.

---

# Reference: Common Patterns

## Pattern 1: Simple static classes

```tsx
// Before:
<div className="flex items-center gap-2">

// After (in .css.ts):
export const container = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
});

// In component:
<div className={styles.container}>
```

## Pattern 2: Conditional classes with recipe

**Tailwind example:**
```tsx
<button className={`btn ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}>
```

**vanilla-extract translation:**

In `.css.ts`:
```typescript
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/theme.css';

export const button = recipe({
  base: {
    padding: vars.spacing[2],
    borderRadius: vars.borderRadius.md,
    // ... shared styles
  },
  variants: {
    active: {
      true: { backgroundColor: vars.color.brandNavy },
      false: { backgroundColor: vars.color.gray[200] },
    }
  }
});
```

In component:
```tsx
import * as styles from './MyComponent.css';

<button className={styles.button({ active: isActive })}>
```

## Pattern 3: Combining multiple classes

**Tailwind example:**
```tsx
<button className="btn btn-primary pressable">
```

**vanilla-extract translation:**

```tsx
import { button, pressable } from '@/styles/shared.css';

// Combine with string interpolation:
<button className={`${button({ variant: 'primary' })} ${pressable}`}>
```

## Pattern 4: Media queries

**Tailwind example:**
```tsx
<div className="text-sm md:text-base lg:text-lg">
```

**vanilla-extract translation:**

In `.css.ts`:
```typescript
import { style } from '@vanilla-extract/css';
import { vars, breakpoints } from '@/styles/theme.css';

export const responsiveText = style({
  fontSize: vars.fontSize.sm,
  '@media': {
    [`screen and (min-width: ${breakpoints.md})`]: {
      fontSize: vars.fontSize.base,
    },
    [`screen and (min-width: ${breakpoints.lg})`]: {
      fontSize: vars.fontSize.lg,
    }
  }
});
```

## Pattern 5: Dynamic inline values

**Keep these as inline styles:**

```tsx
// Dynamic values that change at runtime stay inline
<div style={{ width: `${progress * 100}%` }}>
<div style={{ transform: `translateX(${offset}px)` }}>
```

## Pattern 6: Pseudo-selectors

**Tailwind example:**
```tsx
<div className="hover:bg-gray-100 focus:outline-none">
```

**vanilla-extract translation:**

```typescript
export const hoverableDiv = style({
  ':hover': {
    backgroundColor: vars.color.gray[100],
  },
  ':focus': {
    outline: 'none',
  }
});
```

## Tailwind to CSS Property Quick Reference

| Tailwind | CSS Property | Example |
|----------|--------------|---------|
| `flex` | `display: 'flex'` | |
| `items-center` | `alignItems: 'center'` | |
| `justify-between` | `justifyContent: 'space-between'` | |
| `gap-2` | `gap: vars.spacing[2]` | |
| `p-4` | `padding: vars.spacing[4]` | |
| `px-3` | `padding: '0 ${vars.spacing[3]}'` or `paddingLeft/Right` | |
| `py-2` | `padding: '${vars.spacing[2]} 0'` or `paddingTop/Bottom` | |
| `mt-4` | `marginTop: vars.spacing[4]` | |
| `text-sm` | `fontSize: vars.fontSize.sm` | |
| `font-medium` | `fontWeight: vars.fontWeight.medium` | |
| `text-gray-600` | `color: vars.color.gray[600]` | |
| `bg-white` | `backgroundColor: vars.color.white` | |
| `border` | `border: '1px solid'` | Need color too |
| `border-gray-300` | `borderColor: vars.color.gray[300]` | |
| `rounded-lg` | `borderRadius: vars.borderRadius.lg` | |
| `shadow-sm` | `boxShadow: vars.shadow.sm` | |
| `grid` | `display: 'grid'` | |
| `grid-cols-2` | `gridTemplateColumns: '1fr 1fr'` | |
| `absolute` | `position: 'absolute'` | |
| `inset-0` | `inset: 0` (or top/right/bottom/left: 0) | |
| `z-50` | `zIndex: 50` (or use vars.zIndex) | |
| `opacity-50` | `opacity: 0.5` | |
| `transition` | `transition: 'all 150ms'` | Specify properties |
| `transform` | Use specific transform properties | |
| `translate-x-2` | `transform: 'translateX(0.5rem)'` | |
| `scale-95` | `transform: 'scale(0.95)'` | |
| `rotate-180` | `transform: 'rotate(180deg)'` | |

---

# Appendix: Full Theme Code

(Copy from original plan - the createGlobalTheme block with all vars)

# Appendix: Full Shared Styles Code

(Copy from original plan - card, button recipe, animations, etc.)
