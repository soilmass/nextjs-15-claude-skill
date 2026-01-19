# Next.js 15 Atomic Skills Repository
## Complete Implementation Guide for A+++ Grade Websites

**Version:** 1.0.0  
**Total Skills:** 338  
**Last Updated:** January 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Reference Sites Analysis](#reference-sites-analysis)
4. [Layer 0: Primitives (15 Skills)](#layer-0-primitives)
5. [Layer 1: Atoms (30 Skills)](#layer-1-atoms)
6. [Layer 2: Molecules (25 Skills)](#layer-2-molecules)
7. [Layer 3: Organisms (33 Skills)](#layer-3-organisms)
8. [Layer 4: Templates (17 Skills)](#layer-4-templates)
9. [Layer 5: Patterns (211 Skills)](#layer-5-patterns)
10. [Layer 6: Recipes (7 Skills)](#layer-6-recipes)
11. [Implementation Strategy](#implementation-strategy)
12. [Appendix: Dependencies](#appendix-dependencies)

---

## Executive Summary

This document represents the complete specification for building **world-class Next.js 15 websites** using an atomic design methodology. It synthesizes research from:

- **Vercel's official showcase** of top Next.js sites
- **Next.js 15 documentation** and breaking changes
- **Top 10 Web Designers** perspective (Stripe, Linear, Vercel design teams)
- **Top 10 Backend Developers** perspective (infrastructure, data, security)
- **Top 10 Full-Stack Developers** perspective (integration, DX, deployment)

### Key Metrics for A+++ Sites

| Metric | Target | Excellent |
|--------|--------|-----------|
| **LCP (Largest Contentful Paint)** | < 1.2s | < 1.0s |
| **INP (Interaction to Next Paint)** | < 100ms | < 50ms |
| **CLS (Cumulative Layout Shift)** | < 0.05 | < 0.02 |
| **Lighthouse Score** | 95+ | 100 |
| **Time to Interactive** | < 2.5s | < 2.0s |
| **First Contentful Paint** | < 1.0s | < 0.8s |

### Technology Stack

```json
{
  "core": {
    "next": "15.0.0",
    "react": "19.0.0",
    "typescript": "5.6.0"
  },
  "styling": {
    "tailwindcss": "4.0.0",
    "class-variance-authority": "0.7.1",
    "tailwind-merge": "2.5.5"
  },
  "ui-primitives": {
    "@radix-ui/react-*": "latest",
    "lucide-react": "0.460.0",
    "framer-motion": "11.0.0"
  },
  "data": {
    "prisma": "6.0.0",
    "drizzle-orm": "0.35.0",
    "@tanstack/react-query": "5.60.0",
    "zod": "3.23.0"
  },
  "auth": {
    "next-auth": "5.0.0",
    "@upstash/ratelimit": "2.0.0"
  }
}
```

---

## Architecture Overview

### Atomic Design Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         L6: RECIPES (7)                              │
│        Complete site implementations (Marketing, E-commerce, etc.)   │
├─────────────────────────────────────────────────────────────────────┤
│                        L5: PATTERNS (211)                            │
│   Architectural patterns (routing, data, auth, caching, etc.)        │
├─────────────────────────────────────────────────────────────────────┤
│                       L4: TEMPLATES (17)                             │
│              Page layouts and page compositions                       │
├─────────────────────────────────────────────────────────────────────┤
│                       L3: ORGANISMS (33)                             │
│         Complex feature blocks (headers, heroes, forms)              │
├─────────────────────────────────────────────────────────────────────┤
│                       L2: MOLECULES (25)                             │
│          Composed units (form fields, nav links, cards)              │
├─────────────────────────────────────────────────────────────────────┤
│                        L1: ATOMS (30)                                │
│           Base components (buttons, inputs, text)                    │
├─────────────────────────────────────────────────────────────────────┤
│                      L0: PRIMITIVES (15)                             │
│              Design tokens (colors, typography, spacing)             │
└─────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
.claude/
├── settings.json
├── commands/
│   └── build-nextjs.md              # Orchestrator slash command
│
└── skills/
    └── nextjs15/
        ├── skill.json               # Master manifest
        ├── registry.json            # All 338 skills with git hashes
        │
        └── references/
            ├── _sections.md         # Section ordering & impact
            ├── _template.md         # Skill file template
            │
            ├── primitives/          # L0: 15 design token skills
            ├── atoms/               # L1: 30 base components
            ├── molecules/           # L2: 25 composed units
            ├── organisms/           # L3: 33 feature blocks
            ├── templates/           # L4: 17 layouts/pages
            ├── patterns/            # L5: 211 architectural patterns
            └── recipes/             # L6: 7 site type blueprints
```

---

## Reference Sites Analysis

### Top 10 Next.js 15 Sites Studied

| # | Site | Type | Key Patterns |
|---|------|------|--------------|
| 1 | **Vercel.com** | Marketing/SaaS | Edge rendering, ISR, gradient animations |
| 2 | **Nike.com** | E-commerce | Composable commerce, SSR, media-rich |
| 3 | **OpenAI.com** | AI/Marketing | Static + Dynamic, API routes |
| 4 | **Claude.ai** | AI Web App | Real-time streaming, auth |
| 5 | **NerdWallet** | Content/Finance | SEO-optimized, ISR, data-heavy |
| 6 | **Netflix Jobs** | Marketing/Jobs | Dynamic routing, CMS integration |
| 7 | **Sonos** | E-commerce/Marketing | Performance, media optimization |
| 8 | **Stripe Docs** | Documentation | MDX, search, navigation |
| 9 | **Linear** | SaaS Dashboard | Real-time, optimistic UI, command palette |
| 10 | **Hashnode** | Content Platform | Multi-tenant, edge rendering |

### Common Patterns Across Top Sites

1. **Streaming SSR** with granular Suspense boundaries
2. **Optimistic UI** for all user interactions
3. **Command palette** (Cmd+K) for power users
4. **Dark mode** with proper shadow/image handling
5. **Micro-interactions** on every interactive element
6. **Edge caching** with smart invalidation
7. **Type-safe APIs** end-to-end (tRPC or validated REST)

---

## Layer 0: Primitives

**Total Skills: 15**

Primitives are the foundational design tokens that define the visual language. They never contain logic—only values.

### 0.1 Colors

```css
/* Color System - OKLCH for perceptual uniformity */

/* Palette: 22 hues × 11 steps (50-950) */
--color-blue-50:  oklch(0.97 0.014 254.604);
--color-blue-100: oklch(0.932 0.032 255.585);
--color-blue-200: oklch(0.882 0.059 254.128);
--color-blue-300: oklch(0.809 0.105 251.813);
--color-blue-400: oklch(0.707 0.165 254.624);
--color-blue-500: oklch(0.623 0.214 259.815);
--color-blue-600: oklch(0.546 0.245 262.881);
--color-blue-700: oklch(0.488 0.243 264.376);
--color-blue-800: oklch(0.424 0.199 265.638);
--color-blue-900: oklch(0.379 0.146 265.522);
--color-blue-950: oklch(0.282 0.091 267.935);

/* Semantic Tokens (shadcn/ui pattern) */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
}
```

### 0.2 Typography

```css
/* Typography Scale - Musical ratio (1.25 Major Third) */

/* Font Sizes */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
--text-7xl:  4.5rem;    /* 72px */
--text-8xl:  6rem;      /* 96px */
--text-9xl:  8rem;      /* 128px */

/* Font Weights */
--font-thin:       100;
--font-extralight: 200;
--font-light:      300;
--font-normal:     400;
--font-medium:     500;
--font-semibold:   600;
--font-bold:       700;
--font-extrabold:  800;
--font-black:      900;

/* Line Heights */
--leading-none:    1;
--leading-tight:   1.25;
--leading-snug:    1.375;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
--leading-loose:   2;

/* Letter Spacing */
--tracking-tighter: -0.05em;
--tracking-tight:   -0.025em;
--tracking-normal:  0em;
--tracking-wide:    0.025em;
--tracking-wider:   0.05em;
--tracking-widest:  0.1em;

/* Font Families */
--font-sans:  ui-sans-serif, system-ui, sans-serif;
--font-serif: ui-serif, Georgia, serif;
--font-mono:  ui-monospace, SFMono-Regular, monospace;

/* Fluid Typography (clamp) */
--text-fluid-sm:   clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
--text-fluid-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--text-fluid-lg:   clamp(1.125rem, 1rem + 0.5vw, 1.5rem);
--text-fluid-xl:   clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
--text-fluid-2xl:  clamp(2rem, 1.5rem + 2vw, 3.5rem);
--text-fluid-3xl:  clamp(2.5rem, 2rem + 3vw, 5rem);
```

### 0.3 Spacing

```css
/* Spacing Scale - 4px base unit */
--spacing: 0.25rem;  /* 4px */

/* Scale: multiply by n */
--space-0:   0;
--space-px:  1px;
--space-0.5: 0.125rem;  /* 2px */
--space-1:   0.25rem;   /* 4px */
--space-1.5: 0.375rem;  /* 6px */
--space-2:   0.5rem;    /* 8px */
--space-2.5: 0.625rem;  /* 10px */
--space-3:   0.75rem;   /* 12px */
--space-3.5: 0.875rem;  /* 14px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-7:   1.75rem;   /* 28px */
--space-8:   2rem;      /* 32px */
--space-9:   2.25rem;   /* 36px */
--space-10:  2.5rem;    /* 40px */
--space-11:  2.75rem;   /* 44px */
--space-12:  3rem;      /* 48px */
--space-14:  3.5rem;    /* 56px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
--space-24:  6rem;      /* 96px */
--space-28:  7rem;      /* 112px */
--space-32:  8rem;      /* 128px */
--space-36:  9rem;      /* 144px */
--space-40:  10rem;     /* 160px */
--space-44:  11rem;     /* 176px */
--space-48:  12rem;     /* 192px */
--space-52:  13rem;     /* 208px */
--space-56:  14rem;     /* 224px */
--space-60:  15rem;     /* 240px */
--space-64:  16rem;     /* 256px */
--space-72:  18rem;     /* 288px */
--space-80:  20rem;     /* 320px */
--space-96:  24rem;     /* 384px */

/* Semantic Spacing */
--space-page-margin: clamp(1rem, 5vw, 4rem);
--space-section-gap: clamp(3rem, 8vw, 8rem);
--space-component-gap: clamp(1.5rem, 3vw, 3rem);
```

### 0.4 Shadows

```css
/* Shadow Scale - Elevation system */
--shadow-2xs: 0 1px rgb(0 0 0 / 0.05);
--shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Inset Shadows */
--inset-shadow-2xs: inset 0 1px rgb(0 0 0 / 0.05);
--inset-shadow-xs:  inset 0 1px 1px rgb(0 0 0 / 0.05);
--inset-shadow-sm:  inset 0 2px 4px rgb(0 0 0 / 0.05);

/* Dark Mode Shadows (lighter, glow effect) */
.dark {
  --shadow-sm: 0 1px 3px 0 rgb(255 255 255 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(255 255 255 / 0.05);
  /* Or use borders instead */
}
```

### 0.5 Borders

```css
/* Border Radius */
--radius-none: 0;
--radius-xs:   0.125rem;  /* 2px */
--radius-sm:   0.25rem;   /* 4px */
--radius-md:   0.375rem;  /* 6px */
--radius-lg:   0.5rem;    /* 8px */
--radius-xl:   0.75rem;   /* 12px */
--radius-2xl:  1rem;      /* 16px */
--radius-3xl:  1.5rem;    /* 24px */
--radius-4xl:  2rem;      /* 32px */
--radius-full: 9999px;    /* Pill shape */

/* shadcn default */
--radius: 0.625rem;       /* 10px */

/* Border Widths */
--border-0: 0;
--border-1: 1px;
--border-2: 2px;
--border-4: 4px;
--border-8: 8px;
```

### 0.6 Breakpoints

```css
/* Responsive Breakpoints */
--breakpoint-sm:  640px;   /* Phones landscape */
--breakpoint-md:  768px;   /* Tablets */
--breakpoint-lg:  1024px;  /* Laptops */
--breakpoint-xl:  1280px;  /* Desktops */
--breakpoint-2xl: 1536px;  /* Large displays */

/* Container Sizes */
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;
```

### 0.7 Z-Index

```css
/* Z-Index Scale */
--z-base:     0;
--z-docked:   10;
--z-dropdown: 1000;
--z-sticky:   1100;
--z-banner:   1200;
--z-overlay:  1300;
--z-modal:    1400;
--z-popover:  1500;
--z-tooltip:  1600;
```

### 0.8 Motion

```css
/* Duration Scale */
--duration-0:    0ms;
--duration-75:   75ms;
--duration-100:  100ms;
--duration-150:  150ms;   /* Quick micro-interactions */
--duration-200:  200ms;   /* Standard UI transitions */
--duration-300:  300ms;   /* Default, most uses */
--duration-500:  500ms;   /* Larger transitions */
--duration-700:  700ms;   /* Emphasis animations */
--duration-1000: 1000ms;  /* Dramatic reveals */

/* Easing Functions */
--ease-linear:   linear;
--ease-in:       cubic-bezier(0.4, 0, 1, 1);
--ease-out:      cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-elastic:  cubic-bezier(0.68, -0.6, 0.32, 1.6);

/* Spring Physics (for Framer Motion) */
--spring-snappy: { stiffness: 400, damping: 30 };
--spring-gentle: { stiffness: 200, damping: 20 };
--spring-bouncy: { stiffness: 300, damping: 10 };

/* Built-in Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes pulse {
  50% { opacity: 0.5; }
}
@keyframes bounce {
  0%, 100% { 
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% { 
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
```

### 0.9 Interaction Timing (NEW - From Designers)

```css
/* Interaction Timing - When animations happen */

/* Micro-interaction timings */
--timing-instant:   50ms;   /* Button press feedback */
--timing-fast:      100ms;  /* Tooltips, small reveals */
--timing-normal:    200ms;  /* Standard transitions */
--timing-slow:      300ms;  /* Page transitions */
--timing-slower:    500ms;  /* Complex choreography */
--timing-slowest:   800ms;  /* Dramatic reveals */

/* Stagger timings */
--stagger-list:     30ms;   /* List items (max 50ms) */
--stagger-grid:     20ms;   /* Grid items */
--stagger-max:      400ms;  /* Maximum total stagger */

/* Delay patterns */
--delay-tooltip:    700ms;  /* Before tooltip shows */
--delay-hover:      150ms;  /* Before hover state activates */
--delay-focus:      0ms;    /* Immediate focus feedback */
```

### 0.10 Visual Hierarchy (NEW - From Designers)

```css
/* Text Contrast Levels */
--text-contrast-primary:   90%;  /* Headlines, body */
--text-contrast-secondary: 70%;  /* Descriptions */
--text-contrast-tertiary:  50%;  /* Captions, hints */
--text-contrast-disabled:  35%;  /* Disabled states */

/* Size Hierarchy (Musical Third - 1.25) */
--size-body:    16px;
--size-large:   20px;   /* 16 × 1.25 */
--size-xlarge:  25px;   /* 20 × 1.25 */
--size-h3:      31px;   /* 25 × 1.25 */
--size-h2:      39px;   /* 31 × 1.25 */
--size-h1:      49px;   /* 39 × 1.25 */
--size-display: 61px;   /* 49 × 1.25 */

/* Whitespace Rhythm */
--rhythm-tight:    0.5;   /* Compact UI */
--rhythm-normal:   1;     /* Standard */
--rhythm-relaxed:  1.5;   /* Breathing room */
--rhythm-loose:    2;     /* Luxurious */

/* Reading Width */
--measure-min:     45ch;
--measure-optimal: 65ch;
--measure-max:     85ch;
```

### 0.11 Accessibility Design (NEW - From Designers)

```css
/* Touch Target Sizes */
--touch-target-min:     44px;  /* WCAG minimum */
--touch-target-primary: 48px;  /* Primary actions */
--touch-target-gap:     8px;   /* Between adjacent targets */

/* Focus Indicators */
--focus-ring-width:  2px;
--focus-ring-offset: 2px;
--focus-ring-color:  var(--ring);

/* Motion Preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 0.12 Dark Mode Design (NEW - From Designers)

```css
/* Dark Mode Background Layers */
.dark {
  --bg-base:     #0a0a0a;  /* Not pure black - reduces halation */
  --bg-subtle:   #141414;  /* Raised surface */
  --bg-muted:    #1f1f1f;  /* Cards, inputs */
  --bg-elevated: #292929;  /* Modals, popovers */
  --bg-accent:   #333333;  /* Hover states */
}

/* Dark Mode Text */
.dark {
  --text-primary:   #fafafa;  /* Not pure white */
  --text-secondary: #a1a1aa;
  --text-muted:     #71717a;
}

/* Dark Mode Shadows → Borders/Glows */
.dark .card {
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Image Treatment */
.dark img {
  filter: brightness(0.9);
}
```

### 0.13 Fluid Design (NEW - From Designers)

```css
/* Fluid Typography */
--fluid-xs:   clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--fluid-sm:   clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--fluid-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--fluid-lg:   clamp(1.125rem, 1rem + 0.5vw, 1.5rem);
--fluid-xl:   clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
--fluid-2xl:  clamp(2rem, 1.5rem + 2vw, 3.5rem);
--fluid-3xl:  clamp(2.5rem, 2rem + 3vw, 5rem);

/* Fluid Spacing */
--fluid-space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 1rem);
--fluid-space-md: clamp(1rem, 0.75rem + 1vw, 2rem);
--fluid-space-lg: clamp(2rem, 1.5rem + 2vw, 4rem);
--fluid-space-xl: clamp(4rem, 3rem + 4vw, 8rem);

/* Container Queries */
@container (min-width: 400px) { /* ... */ }
@container (min-width: 600px) { /* ... */ }
@container (min-width: 800px) { /* ... */ }

/* Aspect Ratios */
--ratio-square:    1 / 1;
--ratio-landscape: 16 / 9;
--ratio-portrait:  3 / 4;
--ratio-wide:      21 / 9;
--ratio-card:      4 / 3;
--ratio-hero:      2 / 1;
```

### 0.14 Brand Expression (NEW - From Designers)

```css
/* Brand Accent System */
--brand-hue: 220;        /* Base hue for brand */
--brand-sat: 90%;        /* Saturation */
--brand-light: 50%;      /* Lightness */

--accent-primary: hsl(var(--brand-hue), var(--brand-sat), var(--brand-light));
--accent-hover:   hsl(var(--brand-hue), var(--brand-sat), calc(var(--brand-light) - 10%));
--accent-subtle:  hsl(var(--brand-hue), calc(var(--brand-sat) - 40%), 95%);

/* Icon System */
--icon-stroke-width: 1.5px;
--icon-size-xs: 12px;
--icon-size-sm: 16px;
--icon-size-md: 20px;
--icon-size-lg: 24px;
--icon-size-xl: 32px;

/* Illustration Variables */
--illustration-stroke-width: 2px;
--illustration-corner-radius: 8px;
--illustration-primary: var(--accent-primary);
--illustration-secondary: var(--muted);
```

### 0.15 Token System (NEW - From Designers)

```css
/* Primitive → Semantic → Component Token Flow */

/* Level 1: Primitive (raw values) */
--color-gray-500: oklch(0.5 0 0);
--space-4: 1rem;

/* Level 2: Semantic (meaning) */
--color-text-primary: var(--color-gray-900);
--color-text-muted: var(--color-gray-500);
--space-component-gap: var(--space-4);

/* Level 3: Component (specific use) */
--button-color-text: var(--color-text-primary);
--button-padding-x: var(--space-4);
--card-gap: var(--space-component-gap);

/* Contextual Tokens (mode-aware) */
--surface-primary: light-dark(white, var(--bg-base));
--surface-raised: light-dark(var(--color-gray-50), var(--bg-subtle));
```

---

## Layer 1: Atoms

**Total Skills: 30** (24 components + 6 state matrices)

Atoms are the smallest UI components that cannot be broken down further while remaining useful.

### Component Inventory

| Category | Components |
|----------|------------|
| **Display (8)** | Text, Heading, Code, Badge, Avatar, Icon, Image, Skeleton |
| **Input (9)** | Button, Input, Textarea, Checkbox, Radio, Switch, Select, Slider, File Upload |
| **Feedback (4)** | Spinner, Progress, Toast, Alert |
| **Layout/Interactive (3)** | Divider, Link, Tooltip |
| **State Matrices (6)** | Button States, Input States, Checkbox States, Toggle States, Select States, Link States |

### Core Implementation Pattern

```typescript
// lib/utils.ts - Utility function for class merging
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 1.1 Button Atom

```typescript
// components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="opacity-70">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 1.2 Button State Matrix (NEW - From Designers)

```markdown
## Button State Matrix

| State | Background | Border | Text | Shadow | Scale | Cursor | ARIA |
|-------|------------|--------|------|--------|-------|--------|------|
| **Default** | primary | none | primary-foreground | sm | 1 | pointer | - |
| **Hover** | primary/90 | none | primary-foreground | md | 1.02 | pointer | - |
| **Focus** | primary | ring | primary-foreground | sm | 1 | pointer | - |
| **Active** | primary/80 | none | primary-foreground | none | 0.98 | pointer | - |
| **Loading** | primary/70 | none | primary-foreground | sm | 1 | wait | aria-busy="true" |
| **Disabled** | primary/50 | none | primary-foreground/50 | none | 1 | not-allowed | aria-disabled="true" |
| **Success** | success | none | success-foreground | sm | 1 | default | aria-live="polite" |
| **Error** | destructive | none | destructive-foreground | sm | 1 (shake) | pointer | aria-live="assertive" |

### Micro-interaction Timings
- Hover → 150ms ease-out
- Active → 50ms ease-in
- Focus ring → 100ms ease-out
- Loading spinner → continuous
- Success state → 2000ms before revert
- Error shake → 300ms (translateX: -4px, 4px, -4px, 0)
```

### 1.3 Input Atom

```typescript
// components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        aria-invalid={error}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

### 1.4 Input State Matrix (NEW - From Designers)

```markdown
## Input State Matrix

| State | Border | Background | Label | Icon | Ring | Placeholder |
|-------|--------|------------|-------|------|------|-------------|
| **Empty** | input | background | muted | none | none | visible |
| **Hover** | input-darker | subtle | muted | none | none | visible |
| **Focus** | primary 2px | background | primary | none | primary/25 | hidden |
| **Filled** | input | background | muted (elevated) | clear | none | hidden |
| **Validating** | input | background | muted | spinner | none | hidden |
| **Valid** | success (flash) | background | muted | checkmark | none | hidden |
| **Invalid** | destructive | destructive/5 | destructive | warning | destructive/25 | hidden |
| **Disabled** | dashed | muted | muted | lock | none | visible |
| **ReadOnly** | none | subtle | muted | none | none | hidden |

### Transitions
- Border color: 150ms ease
- Label position: 200ms ease-out
- Error message: slide-down 200ms
- Validation icon: fade-in 150ms
```

### Complete Atom List

| # | Atom | Dependencies | Key Features |
|---|------|--------------|--------------|
| 1 | `display-text` | - | Sizes, weights, colors, truncation |
| 2 | `display-heading` | - | H1-H6, scroll margin, balance |
| 3 | `display-code` | shiki | Inline/block, syntax highlighting |
| 4 | `display-badge` | cva | Variants, sizes |
| 5 | `display-avatar` | @radix-ui/react-avatar | Fallback, sizes, shapes |
| 6 | `display-icon` | lucide-react | Sizes, colors, accessibility |
| 7 | `display-image` | next/image | Loading states, aspect ratios |
| 8 | `display-skeleton` | - | Pulse animation, shapes |
| 9 | `input-button` | @radix-ui/react-slot, cva | 6 variants, 4 sizes, loading |
| 10 | `input-text` | - | Error state, prefix/suffix |
| 11 | `input-textarea` | - | Auto-grow, character count |
| 12 | `input-checkbox` | @radix-ui/react-checkbox | Indeterminate, error |
| 13 | `input-radio` | @radix-ui/react-radio-group | Groups, orientation |
| 14 | `input-switch` | @radix-ui/react-switch | On/off states |
| 15 | `input-select` | @radix-ui/react-select | Groups, search, portal |
| 16 | `input-slider` | @radix-ui/react-slider | Range, steps, marks |
| 17 | `input-file` | - | Dropzone, preview |
| 18 | `feedback-spinner` | - | Sizes, colors |
| 19 | `feedback-progress` | @radix-ui/react-progress | Determinate/indeterminate |
| 20 | `feedback-toast` | sonner | Variants, actions, stacking |
| 21 | `feedback-alert` | - | Variants, dismissible |
| 22 | `layout-divider` | @radix-ui/react-separator | Horizontal/vertical |
| 23 | `interactive-link` | next/link | External detection, prefetch |
| 24 | `interactive-tooltip` | @radix-ui/react-tooltip | Delay, positioning |

---

## Layer 2: Molecules

**Total Skills: 25** (22 components + 3 state matrices)

Molecules combine 2-5 atoms into functional units with specific behavior.

### Molecule Inventory

| Category | Molecules |
|----------|-----------|
| **Navigation (5)** | Nav Link, Breadcrumb, Pagination, Tabs, Stepper |
| **Forms (6)** | Form Field, Search Input, Password Input, Date Picker, Combobox, Rating |
| **Data Display (5)** | Table Row, Stat Card, Avatar Group, Key-Value, Timeline Item |
| **Content (4)** | Card, List Item, Accordion Item, Callout |
| **Feedback (2)** | Empty State, Error Boundary |
| **State Matrices (3)** | Card States, Form Field States, Nav Item States |

### 2.1 Form Field Molecule

```typescript
// components/ui/form-field.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  description,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  const id = React.useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn(error && "text-destructive")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        "aria-describedby": cn(
          description && descriptionId,
          error && errorId
        ) || undefined,
        "aria-invalid": !!error,
      })}
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### 2.2 Card Molecule

```typescript
// components/ui/card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean;
  }
>(({ className, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      interactive && "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### Molecule Composition Patterns

| Molecule | Atoms Used | Key Behavior |
|----------|------------|--------------|
| **Nav Link** | Text + Icon + Box | Active state detection, keyboard nav |
| **Breadcrumb** | Text + Icon + Button | Auto-collapse, ARIA navigation |
| **Pagination** | Button + Text + Icon | URL sync, edge detection |
| **Tabs** | Button + Text + Box | Roving tabindex, arrow keys |
| **Stepper** | Text + Icon + Button + Box | Step validation, linear/non-linear |
| **Form Field** | Label + Input + Text | Error propagation, aria-describedby |
| **Search Input** | Input + Icon + Button | Debounce, Cmd+K trigger |
| **Password Input** | Input + Button + Icon | Visibility toggle, strength |
| **Date Picker** | Input + Button + Calendar | react-day-picker integration |
| **Combobox** | Input + Button + Popover | cmdk integration, typeahead |
| **Rating** | Icon + Button | Half-star support, hover preview |
| **Table Row** | Text + Checkbox + Actions | Selection, expansion |
| **Stat Card** | Text + Icon + Badge | Trend calculation, formatting |
| **Avatar Group** | Avatar + Text | Overflow count, stacking |
| **Key-Value** | Text + Icon | Copy to clipboard, truncation |
| **Timeline Item** | Icon + Text + Line | Connector lines, relative time |
| **Card** | Text + Box + Button | Interactive states, link wrapping |
| **List Item** | Text + Icon + Actions | Swipe actions, reordering |
| **Accordion Item** | Text + Icon + Button | Expand/collapse animation |
| **Callout** | Icon + Text + Box | Variant colors, dismissible |
| **Empty State** | Icon + Text + Button | Centered layout, actions |
| **Error Boundary** | Icon + Text + Button | React error boundary, retry |

---

## Layer 3: Organisms

**Total Skills: 33** (32 components + 1 scroll animations)

Organisms are complex, standalone feature blocks that form distinct sections of a page.

### Organism Inventory

| Category | Organisms |
|----------|-----------|
| **Navigation (6)** | Header, Footer, Sidebar, Mobile Menu, Command Palette, Mega Menu |
| **Forms (6)** | Auth Form, Contact Form, Checkout Form, Settings Form, Multi-step Form, File Uploader |
| **Data Display (6)** | Data Table, Kanban Board, Calendar, Chart, Timeline, Comparison Table |
| **Content (8)** | Hero, Features, Testimonials, Pricing, FAQ, CTA, Blog Post, Team |
| **Commerce (3)** | Product Card, Cart, Checkout Summary |
| **Modals (3)** | Dialog, Drawer, Sheet |
| **Animations (1)** | Scroll Animations |

### 3.1 Header Organism

```typescript
// components/organisms/header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface HeaderProps {
  logo: React.ReactNode;
  navItems: NavItem[];
  actions?: React.ReactNode;
}

export function Header({ logo, navItems, actions }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-sticky w-full transition-all duration-200",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {logo}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <CommandPalette />
          <ThemeToggle />
          {actions}
          <MobileMenu navItems={navItems} className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
```

### 3.2 Hero Organism

```typescript
// components/organisms/hero.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeroProps {
  badge?: string;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  image?: React.ReactNode;
  variant?: "centered" | "split" | "background";
}

export function Hero({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  image,
  variant = "centered",
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        variant === "centered" && "text-center py-24 lg:py-32",
        variant === "split" && "py-16 lg:py-24",
        variant === "background" && "min-h-[80vh] flex items-center"
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.1),transparent)]" />

      <div className="container">
        <div
          className={cn(
            variant === "split" && "grid lg:grid-cols-2 gap-12 items-center"
          )}
        >
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
              variant === "centered" && "max-w-3xl mx-auto",
              "space-y-6"
            )}
          >
            {badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
                  {badge}
                </span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" asChild>
                <a href={primaryAction.href}>{primaryAction.label}</a>
              </Button>
              {secondaryAction && (
                <Button size="lg" variant="outline" asChild>
                  <a href={secondaryAction.href}>{secondaryAction.label}</a>
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Image */}
          {image && variant === "split" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {image}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
```

### 3.3 Data Table Organism

```typescript
// components/organisms/data-table.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Organism Complexity Matrix

| Organism | Complexity | State Management | Key Dependencies |
|----------|------------|-----------------|------------------|
| Header | Medium | Scroll state, menu open | - |
| Footer | Low | Newsletter form | - |
| Sidebar | High | Collapsed/expanded | shadcn Sidebar |
| Mobile Menu | Medium | Open state | Sheet/Drawer |
| Command Palette | High | Query, selection | cmdk |
| Mega Menu | High | Active dropdown | Radix Navigation |
| Auth Form | Medium | Form state, loading | react-hook-form, zod |
| Contact Form | Low | Form state | react-hook-form |
| Checkout Form | High | Multi-step, validation | Stripe Elements |
| Settings Form | Medium | Per-section state | react-hook-form |
| Multi-step Form | High | Step state, validation | Custom stepper |
| File Uploader | Medium | Upload progress | Native File API |
| Data Table | Very High | Sort, filter, select | TanStack Table |
| Kanban Board | High | Drag state | dnd-kit |
| Calendar | High | Date selection | react-day-picker |
| Chart | High | Data state | Recharts |
| Timeline | Medium | - | Custom |
| Comparison Table | Medium | - | Custom |
| Hero | Low | Animation state | Framer Motion |
| Features | Low | - | Framer Motion |
| Testimonials | Medium | Carousel state | Embla Carousel |
| Pricing | Medium | Toggle state | - |
| FAQ | Low | Accordion state | Radix Accordion |
| CTA | Low | - | - |
| Blog Post | Medium | Reading progress | - |
| Team | Low | - | - |
| Product Card | Medium | Hover, variant state | - |
| Cart | High | Cart state | - |
| Checkout Summary | Medium | - | - |
| Dialog | Medium | Open state | Radix Dialog |
| Drawer | Medium | Open state | Vaul |
| Sheet | Medium | Open state | Radix Dialog |

---

## Layer 4: Templates

**Total Skills: 17**

Templates define the structure of entire pages without specific content.

### Template Inventory

| Category | Templates |
|----------|-----------|
| **Layouts (6)** | Root, Marketing, Dashboard, Auth, Documentation, Checkout |
| **Pages (11)** | Landing, About, Blog Index, Blog Post, Product Listing, Product Detail, Cart, Checkout, Dashboard Home, Settings, 404 |

### 4.1 Root Layout Template

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Site Name",
    template: "%s | Site Name",
  },
  description: "Site description",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Site Name",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@handle",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 4.2 Dashboard Layout Template

```typescript
// app/(dashboard)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### 4.3 Landing Page Template

```typescript
// app/(marketing)/page.tsx
import { Suspense } from "react";
import { Hero } from "@/components/organisms/hero";
import { Features } from "@/components/organisms/features";
import { Testimonials } from "@/components/organisms/testimonials";
import { Pricing } from "@/components/organisms/pricing";
import { FAQ } from "@/components/organisms/faq";
import { CTA } from "@/components/organisms/cta";
import { Skeleton } from "@/components/ui/skeleton";

export default function LandingPage() {
  return (
    <>
      <Hero
        badge="Now in Beta"
        title="Build faster with our platform"
        description="The modern way to build web applications. Ship in days, not months."
        primaryAction={{ label: "Get Started", href: "/signup" }}
        secondaryAction={{ label: "Learn More", href: "/docs" }}
        variant="centered"
      />

      <Features
        title="Everything you need"
        description="All the tools to build, deploy, and scale your application."
        features={[
          {
            icon: "Zap",
            title: "Lightning Fast",
            description: "Built for speed from the ground up.",
          },
          // ... more features
        ]}
      />

      <Suspense fallback={<Skeleton className="h-96" />}>
        <Testimonials />
      </Suspense>

      <Pricing
        title="Simple pricing"
        description="Choose the plan that works for you."
        plans={[/* ... */]}
      />

      <FAQ
        title="Frequently asked questions"
        items={[/* ... */]}
      />

      <CTA
        title="Ready to get started?"
        description="Join thousands of developers building with our platform."
        primaryAction={{ label: "Start Free Trial", href: "/signup" }}
      />
    </>
  );
}
```

### Template Data Requirements

| Template | Data Fetching | Rendering | Caching |
|----------|---------------|-----------|---------|
| Landing | CMS content | Static | ISR 1h |
| About | CMS content | Static | ISR 1d |
| Blog Index | Posts list | Static | ISR 1h |
| Blog Post | Single post | generateStaticParams | ISR 1h |
| Product Listing | Products + filters | Dynamic | none |
| Product Detail | Product + reviews | Static shell | ISR 15m |
| Cart | User cart | Dynamic | none |
| Checkout | User data | Dynamic | none |
| Dashboard | User metrics | Dynamic | none |
| Settings | User settings | Dynamic | none |
| 404 | - | Static | infinite |

---

## Layer 5: Patterns

**Total Skills: 211**

Patterns are architectural guidelines and code patterns specific to Next.js 15.

### Pattern Categories

| Category | Skills | Focus |
|----------|--------|-------|
| **Routing** | 6 | App Router, parallel, intercepting |
| **Data** | 20 | Fetching, mutations, caching |
| **State** | 14 | URL, server, client, form |
| **Auth** | 15 | Sessions, RBAC, API keys |
| **Cache** | 15 | Redis, edge, invalidation |
| **Render** | 5 | Static, dynamic, PPR, streaming |
| **Performance** | 13 | Code splitting, images, fonts |
| **SEO** | 4 | Metadata, OG, sitemap |
| **Testing** | 14 | Unit, integration, E2E |
| **Deployment** | 9 | Preview, feature flags, rollback |
| **API** | 8 | REST, tRPC, GraphQL |
| **Real-time** | 8 | WebSocket, SSE, presence |
| **Jobs** | 6 | Queues, cron, webhooks |
| **Observability** | 6 | Logging, tracing, metrics |
| **Security** | 6 | XSS, CSRF, rate limiting |
| **Edge** | 6 | Edge functions, KV, geolocation |
| **Types** | 12 | End-to-end type safety |
| **Fetching** | 8 | React Query, SWR, prefetching |
| **Forms** | 10 | Server Actions, multi-step |
| **Errors** | 8 | Boundaries, recovery |
| **DX** | 6 | Environment, debugging |
| **Monitoring** | 8 | Web Vitals, analytics |
| **Design** | 4 | Animation, delight |

### 5.1 Next.js 15 Breaking Changes

```typescript
// CRITICAL: Next.js 15 Breaking Changes

// 1. Async Request APIs
// BEFORE (Next.js 14):
export default function Page({ params, searchParams }) {
  const id = params.id;
  const query = searchParams.q;
}

// AFTER (Next.js 15):
export default async function Page({ 
  params, 
  searchParams 
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
}

// 2. cookies() and headers() are now async
// BEFORE:
import { cookies } from "next/headers";
const cookieStore = cookies();

// AFTER:
import { cookies } from "next/headers";
const cookieStore = await cookies();

// 3. Fetch is NO LONGER cached by default
// BEFORE (cached by default):
const data = await fetch(url);

// AFTER (must opt-in to caching):
const data = await fetch(url, { cache: 'force-cache' });
// Or use the new 'use cache' directive:
async function getData() {
  'use cache';
  return fetch(url);
}

// 4. New 'use cache' directive
import { cacheLife, cacheTag } from 'next/cache';

async function getProducts() {
  'use cache';
  cacheLife('hours');
  cacheTag('products');
  return prisma.product.findMany();
}

// 5. Partial Prerendering (PPR)
// next.config.ts
export default {
  experimental: {
    ppr: true,
  },
};

// In component:
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      {/* Static shell */}
      <Header />
      <Suspense fallback={<Skeleton />}>
        {/* Dynamic content */}
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

### 5.2 Server Actions Pattern

```typescript
// app/actions/users.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function createUser(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await prisma.user.create({
      data: parsed.data,
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      errors: { _form: ["Failed to create user"] },
    };
  }
}

// With useActionState (React 19)
// components/create-user-form.tsx
"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function CreateUserForm() {
  const [state, action, isPending] = useActionState(createUser, null);

  return (
    <form action={action} className="space-y-4">
      <FormField
        label="Email"
        error={state?.errors?.email?.[0]}
      >
        <Input name="email" type="email" required />
      </FormField>

      <FormField
        label="Name"
        error={state?.errors?.name?.[0]}
      >
        <Input name="name" required />
      </FormField>

      {state?.errors?._form && (
        <p className="text-destructive text-sm">{state.errors._form[0]}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
```

### 5.3 Optimistic Updates Pattern

```typescript
// hooks/use-optimistic-action.ts
"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

export function useOptimisticAction<T, P>(
  currentState: T,
  serverAction: (payload: P) => Promise<T>,
  optimisticUpdate: (state: T, payload: P) => T
) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, addOptimistic] = useOptimistic(
    currentState,
    optimisticUpdate
  );

  const execute = async (payload: P) => {
    startTransition(() => {
      addOptimistic(payload);
    });

    try {
      const result = await serverAction(payload);
      return result;
    } catch (error) {
      toast.error("Action failed. Changes have been reverted.");
      throw error;
    }
  };

  return {
    state: optimisticState,
    execute,
    isPending,
  };
}

// Usage: Like button with optimistic update
// components/like-button.tsx
"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleLike } from "@/app/actions/likes";
import { useOptimisticAction } from "@/hooks/use-optimistic-action";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const { state, execute, isPending } = useOptimisticAction(
    { liked: initialLiked, count: initialCount },
    () => toggleLike(postId),
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  );

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => execute({ postId })}
      disabled={isPending}
      className="gap-2"
    >
      <Heart
        className={state.liked ? "fill-red-500 text-red-500" : ""}
      />
      {state.count}
    </Button>
  );
}
```

### 5.4 URL State Pattern

```typescript
// Using nuqs for type-safe URL state
// hooks/use-search-params.ts
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export function useTableParams() {
  return useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
    sort: parseAsString.withDefault("createdAt"),
    order: parseAsString.withDefault("desc"),
    search: parseAsString.withDefault(""),
  });
}

// Usage in component
// components/users-table.tsx
"use client";

import { useTableParams } from "@/hooks/use-search-params";
import { DataTable } from "@/components/organisms/data-table";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

export function UsersTable({ initialData }) {
  const [params, setParams] = useTableParams();

  const handleSearch = useDebouncedCallback((value: string) => {
    setParams({ search: value, page: 1 });
  }, 300);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        defaultValue={params.search}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <DataTable
        data={initialData}
        sorting={[{ id: params.sort, desc: params.order === "desc" }]}
        onSortingChange={(sorting) => {
          const [sort] = sorting;
          if (sort) {
            setParams({
              sort: sort.id,
              order: sort.desc ? "desc" : "asc",
            });
          }
        }}
        pagination={{
          pageIndex: params.page - 1,
          pageSize: params.limit,
        }}
        onPaginationChange={(pagination) => {
          setParams({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
          });
        }}
      />
    </div>
  );
}
```

### 5.5 Authentication Middleware Pattern

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

// Define route protection rules
const publicRoutes = ["/", "/login", "/register", "/api/auth"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if route is auth-specific (login/register)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get token from cookies
  const token = request.cookies.get("access_token")?.value;
  const session = token ? await verifyToken(token) : null;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect non-public routes
  if (!isPublicRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add user info to headers for downstream use
  const response = NextResponse.next();
  if (session) {
    response.headers.set("x-user-id", session.userId);
    response.headers.set("x-user-role", session.role);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
```

### 5.6 Streaming SSR Pattern

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";
import { StatsCards, StatsCardsSkeleton } from "@/components/stats-cards";
import { RecentActivity, RecentActivitySkeleton } from "@/components/recent-activity";
import { Charts, ChartsSkeleton } from "@/components/charts";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats load first - highest priority */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Charts and activity load in parallel */}
        <Suspense fallback={<ChartsSkeleton />}>
          <Charts />
        </Suspense>
        
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}

// components/stats-cards.tsx
async function getStats() {
  // Simulate slow query
  await new Promise((r) => setTimeout(r, 1000));
  return prisma.stats.findFirst();
}

export async function StatsCards() {
  const stats = await getStats();
  
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Revenue" value={stats.revenue} />
      <StatCard title="Orders" value={stats.orders} />
      <StatCard title="Customers" value={stats.customers} />
      <StatCard title="Conversion" value={stats.conversion} />
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}
```

---

## Layer 6: Recipes

**Total Skills: 7**

Recipes are complete site implementation guides that combine all layers.

### Recipe Inventory

| Recipe | Type | Pages | Key Integrations |
|--------|------|-------|-----------------|
| **Marketing Site** | Corporate | 20+ | Motion, CMS, Analytics |
| **E-commerce** | Online Store | 25+ | Shopify, Stripe, Algolia |
| **SaaS Dashboard** | Web App | 15+ | Auth, Prisma, Stripe |
| **Documentation** | Docs | Dynamic | MDX, Shiki, DocSearch |
| **Blog Platform** | Content | 15+ | CMS, RSS, Social |
| **AI Application** | AI Chat | 10+ | AI SDK, Streaming |
| **Realtime App** | Collaborative | 8+ | Liveblocks, Yjs |

### 6.1 Marketing Site Recipe

```markdown
## Marketing Site Recipe

### Pages Required
- / (Landing)
- /about
- /pricing
- /features
- /blog
- /blog/[slug]
- /contact
- /careers
- /legal/privacy
- /legal/terms

### Skills Used
**Primitives:** All 15
**Atoms:** Button, Text, Heading, Badge, Image, Icon, Link
**Molecules:** Nav Link, Card, Callout, Form Field
**Organisms:** Header, Footer, Hero, Features, Testimonials, Pricing, FAQ, CTA, Blog Post
**Templates:** Marketing Layout, Landing Page, Blog Index, Blog Post
**Patterns:** Static rendering, ISR, Metadata API, Structured Data

### Key Integrations
- **CMS:** Sanity or Contentful
- **Analytics:** Vercel Analytics + Plausible
- **Forms:** Formspree or custom Server Actions
- **Newsletter:** ConvertKit or Resend

### Performance Targets
- LCP: < 1.0s
- CLS: < 0.02
- Lighthouse: 100

### Polish Features
- Gradient mesh backgrounds
- Scroll-triggered animations
- Page transitions
- Easter eggs
```

### 6.2 E-commerce Recipe

```markdown
## E-commerce Recipe

### Pages Required
- / (Landing)
- /products
- /products/[category]
- /products/[category]/[slug]
- /cart
- /checkout
- /checkout/success
- /account
- /account/orders
- /account/orders/[id]
- /search

### Skills Used
**Organisms:** Product Card, Cart, Checkout Form, Checkout Summary
**Templates:** Product Listing, Product Detail, Cart Page, Checkout
**Patterns:** URL state, Optimistic updates, Streaming, Webhook handling

### Key Integrations
- **Commerce:** Shopify Storefront API or Medusa
- **Payments:** Stripe
- **Search:** Algolia or Meilisearch
- **Inventory:** Real-time stock updates

### Performance Targets
- LCP: < 1.2s (product images)
- INP: < 50ms (add to cart)

### Polish Features
- Optimistic cart updates
- Quick view modals
- Recently viewed
- Wishlists
```

### 6.3 SaaS Dashboard Recipe

```markdown
## SaaS Dashboard Recipe

### Pages Required
- /dashboard
- /dashboard/[workspace]
- /dashboard/[workspace]/settings
- /dashboard/[workspace]/team
- /dashboard/[workspace]/billing
- /projects
- /projects/[id]
- /analytics
- /settings
- /settings/profile
- /settings/security
- /settings/notifications

### Skills Used
**Organisms:** Sidebar, Data Table, Charts, Settings Form, Multi-step Form
**Templates:** Dashboard Layout, Dashboard Home, Settings Page
**Patterns:** Auth middleware, RBAC, Multi-tenant, Feature flags

### Key Integrations
- **Auth:** Auth.js v5
- **Database:** PostgreSQL + Prisma
- **Payments:** Stripe Subscriptions
- **Analytics:** Custom events + Mixpanel

### Performance Targets
- TTI: < 2.0s
- INP: < 100ms

### Polish Features
- Command palette (Cmd+K)
- Keyboard shortcuts
- Real-time collaboration indicators
- Dark mode
```

---

## Implementation Strategy

### Phase 1: Foundation (Week 1-2)
1. Create directory structure
2. Write manifests (skill.json, registry.json)
3. Create templates and section definitions
4. Implement orchestrator slash command

### Phase 2: Primitives (Week 2-3)
5. All 15 primitive skills with Tailwind config
6. Dark mode system
7. Fluid design tokens

### Phase 3: Atoms (Week 3-4)
8. All 24 atom components
9. All 6 state matrices
10. Complete accessibility testing

### Phase 4: Molecules (Week 4-5)
11. All 22 molecule components
12. All 3 state matrices
13. Composition documentation

### Phase 5: Organisms (Week 5-7)
14. All 32 organism components
15. Scroll animations
16. Complex state management

### Phase 6: Templates (Week 7-8)
17. All 6 layouts
18. All 11 pages
19. Responsive testing

### Phase 7: Patterns (Week 8-12)
20. All 211 pattern skills
21. Code examples for each
22. Anti-pattern documentation

### Phase 8: Recipes (Week 12-14)
23. All 7 recipe guides
24. Skill mapping for each

### Phase 9: Examples (Week 14-20)
25. 7 showcase-quality projects
26. Full implementations
27. Deployment guides

---

## Appendix: Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "5.6.0"
  }
}
```

### Styling

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.5"
  }
}
```

### UI Primitives (Radix)

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "1.2.0",
    "@radix-ui/react-alert-dialog": "1.1.0",
    "@radix-ui/react-avatar": "1.1.0",
    "@radix-ui/react-checkbox": "1.1.0",
    "@radix-ui/react-collapsible": "1.1.0",
    "@radix-ui/react-dialog": "1.1.0",
    "@radix-ui/react-dropdown-menu": "2.1.0",
    "@radix-ui/react-label": "2.1.0",
    "@radix-ui/react-navigation-menu": "1.2.0",
    "@radix-ui/react-popover": "1.1.0",
    "@radix-ui/react-progress": "1.1.0",
    "@radix-ui/react-radio-group": "1.2.0",
    "@radix-ui/react-scroll-area": "1.1.0",
    "@radix-ui/react-select": "2.1.0",
    "@radix-ui/react-separator": "1.1.0",
    "@radix-ui/react-slider": "1.2.0",
    "@radix-ui/react-slot": "1.1.0",
    "@radix-ui/react-switch": "1.1.0",
    "@radix-ui/react-tabs": "1.1.0",
    "@radix-ui/react-toast": "1.2.0",
    "@radix-ui/react-tooltip": "1.1.0"
  }
}
```

### Icons & Animation

```json
{
  "dependencies": {
    "lucide-react": "0.460.0",
    "framer-motion": "11.0.0"
  }
}
```

### Data & Forms

```json
{
  "dependencies": {
    "@prisma/client": "6.0.0",
    "zod": "3.23.0",
    "react-hook-form": "7.53.0",
    "@hookform/resolvers": "3.9.0",
    "@tanstack/react-query": "5.60.0",
    "@tanstack/react-table": "8.20.0"
  },
  "devDependencies": {
    "prisma": "6.0.0"
  }
}
```

### Authentication

```json
{
  "dependencies": {
    "next-auth": "5.0.0-beta.25",
    "@auth/prisma-adapter": "2.7.0"
  }
}
```

### Additional Utilities

```json
{
  "dependencies": {
    "sonner": "1.7.0",
    "cmdk": "1.0.0",
    "vaul": "1.0.0",
    "nuqs": "2.0.0",
    "date-fns": "4.0.0",
    "react-day-picker": "9.0.0",
    "recharts": "2.13.0",
    "embla-carousel-react": "8.3.0",
    "@upstash/redis": "1.34.0",
    "@upstash/ratelimit": "2.0.0"
  }
}
```

---

## Conclusion

This guide represents the most comprehensive specification for building world-class Next.js 15 websites. With **338 skills** across **7 layers**, it covers:

- **Design Excellence**: From primitives to micro-interactions
- **Engineering Quality**: Type-safe, performant, accessible
- **Production Readiness**: Auth, caching, monitoring, deployment
- **Developer Experience**: Clear patterns, copy-paste code

The atomic approach ensures that every piece is modular, versioned, and reusable across any project type.

---

*This document was compiled through collaboration with simulated top-tier web designers, backend developers, and full-stack developers, representing collective best practices from Stripe, Linear, Vercel, and other industry leaders.*
