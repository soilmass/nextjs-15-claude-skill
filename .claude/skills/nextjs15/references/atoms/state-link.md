---
id: a-state-link
name: Link State Matrix
version: 2.0.0
layer: L1
category: state
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Complete link state definitions for navigation and inline links
tags: [link, anchor, states, hover, focus, visited, active]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Link State Matrix

## Overview

This state matrix defines the visual and behavioral states for link components including navigation links, inline content links, and external links. Use this reference for consistent, accessible link implementations.

## State Definitions

### Inline Link States

| State | Color | Decoration | Opacity | Cursor |
|-------|-------|------------|---------|--------|
| **Default** | primary | underline (offset-4) | 100% | pointer |
| **Hover** | primary/80 | underline | 100% | pointer |
| **Focus** | primary | underline | 100% | pointer |
| **Active** | primary/70 | underline | 100% | pointer |
| **Visited** | primary (or violet) | underline | 90% | pointer |
| **Disabled** | muted-foreground | none | 50% | not-allowed |

### Navigation Link States

| State | Color | Background | Border | Weight |
|-------|-------|------------|--------|--------|
| **Default** | muted-foreground | transparent | none | normal |
| **Hover** | foreground | accent | none | normal |
| **Focus** | foreground | transparent | ring-2 | normal |
| **Active (current)** | primary | primary/10 | primary (left) | medium |
| **Disabled** | muted-foreground | transparent | none | normal |

### External Link States

| State | Color | Decoration | Icon | Gap |
|-------|-------|------------|------|-----|
| **Default** | primary | underline | external-link | 4px |
| **Hover** | primary/80 | underline | external-link | 4px |
| **Focus** | primary | underline | external-link | 4px |

## Transition Specifications

```css
/* Link transitions */
.link {
  transition-property: color, text-decoration-color, opacity;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

/* Navigation link transitions */
.nav-link {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

/* Focus ring */
.link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring);
  border-radius: 2px;
}

/* Underline animation (optional) */
.link-animated {
  text-decoration: none;
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-position: 0% 100%;
  background-repeat: no-repeat;
  transition: background-size 300ms ease;
}

.link-animated:hover {
  background-size: 100% 1px;
}
```

## Implementation

```typescript
// Link variants
const linkVariants = cva(
  [
    "inline-flex items-center gap-1",
    "font-medium",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "text-primary underline underline-offset-4",
          "hover:text-primary/80",
        ],
        muted: [
          "text-muted-foreground no-underline",
          "hover:text-foreground",
        ],
        ghost: [
          "text-foreground no-underline",
          "hover:text-primary",
        ],
        nav: [
          "text-muted-foreground no-underline",
          "hover:text-foreground hover:bg-accent px-3 py-2 rounded-md",
        ],
        navActive: [
          "text-primary bg-primary/10 font-medium",
          "px-3 py-2 rounded-md border-l-2 border-primary",
        ],
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

## Navigation Active State Detection

```typescript
// Active link detection using Next.js
"use client";

import { usePathname } from "next/navigation";
import { Link } from "./link";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}

function NavLink({ href, children, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  
  const isActive = exact
    ? pathname === href
    : pathname.startsWith(href);
  
  return (
    <Link
      href={href}
      variant={isActive ? "navActive" : "nav"}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
```

## Underline Styles

### Static Underline

```css
/* Always visible underline */
.link-underline {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  text-decoration-color: currentColor;
}
```

### Hover Underline

```css
/* Underline only on hover */
.link-hover-underline {
  text-decoration: none;
}

.link-hover-underline:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

### Animated Underline

```css
/* Expanding underline from left */
.link-animated-underline {
  position: relative;
  text-decoration: none;
}

.link-animated-underline::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: currentColor;
  transition: width 300ms ease;
}

.link-animated-underline:hover::after {
  width: 100%;
}
```

### Fading Underline

```css
/* Underline that fades in */
.link-fade-underline {
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: text-decoration-color 200ms ease;
}

.link-fade-underline:hover {
  text-decoration-color: currentColor;
}
```

## External Link Patterns

```typescript
// External link with icon
function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
    >
      {children}
      <ExternalLinkIcon className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">(opens in new tab)</span>
    </a>
  );
}
```

## Skip Link States

```typescript
// Skip link for accessibility
const skipLinkStyles = {
  default: [
    "sr-only",
    "focus:not-sr-only",
    "focus:fixed focus:top-4 focus:left-4 focus:z-50",
    "focus:bg-background focus:text-foreground",
    "focus:px-4 focus:py-2 focus:rounded-md",
    "focus:border focus:shadow-lg",
    "focus:ring-2 focus:ring-ring",
  ].join(" "),
};
```

## Touch Optimizations

```css
/* Touch device adjustments */
@media (pointer: coarse) {
  .nav-link {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
  }
  
  /* Larger tap target for inline links */
  .inline-link {
    padding: 4px 0;
    margin: -4px 0;
  }
}
```

## Accessibility Requirements

### ARIA Attributes

| Context | Required Attributes |
|---------|---------------------|
| Current page | `aria-current="page"` |
| Current section | `aria-current="true"` |
| External link | Visible indicator or `aria-label` with "(opens in new tab)" |
| Disabled | `aria-disabled="true"` (not `disabled` attribute) |
| Downloads | `aria-label` with file type and size |

### Screen Reader Considerations

```typescript
// Good link text patterns
<Link href="/docs">Read the documentation</Link>

// Include context for external links
<Link href="https://github.com" external>
  GitHub
  <span className="sr-only">(opens in new tab)</span>
</Link>

// Describe downloads
<Link href="/report.pdf">
  Download annual report
  <span className="sr-only">(PDF, 2.4 MB)</span>
</Link>

// Avoid
<Link href="/docs">Click here</Link> // Vague
<Link href="/docs">Read more</Link>  // Out of context
```

### Keyboard Interactions

| Key | Action |
|-----|--------|
| `Enter` | Activate link |
| `Tab` | Move focus to next focusable element |
| `Shift+Tab` | Move focus to previous element |

## Visited State Handling

```css
/* Distinguish visited links (content sites) */
.content-link:visited {
  color: var(--visited); /* typically purple/violet */
}

/* Don't show visited state (apps/nav) */
.nav-link:visited {
  color: inherit;
}
```

## Dark Mode Adjustments

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary Link | primary | primary (lighter) |
| Muted Link | slate-500 | slate-400 |
| Hover BG (nav) | slate-100 | slate-800 |
| Active BG | primary/10 | primary/20 |
| Visited | violet-700 | violet-400 |

## Animation Tokens

```typescript
const linkAnimations = {
  // Color transition
  colorTransition: {
    duration: 150,
    easing: "ease-out",
  },
  
  // Underline expand
  underlineExpand: {
    duration: 300,
    easing: "ease",
  },
  
  // Underline fade
  underlineFade: {
    duration: 200,
    easing: "ease",
  },
  
  // Focus ring
  focusRing: {
    duration: 100,
    easing: "ease-out",
  },
  
  // Active state
  activePress: {
    duration: 50,
    opacity: 0.7,
  },
};
```

## Breadcrumb Link Pattern

```typescript
interface BreadcrumbItemProps {
  href?: string;
  current?: boolean;
  children: React.ReactNode;
}

function BreadcrumbItem({ href, current, children }: BreadcrumbItemProps) {
  if (current || !href) {
    return (
      <span
        className="text-foreground font-medium"
        aria-current={current ? "page" : undefined}
      >
        {children}
      </span>
    );
  }
  
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}
```

## Related Skills

### Composes From
- [primitives/colors](../primitives/colors.md) - Link colors
- [primitives/typography](../primitives/typography.md) - Text styles

### Composes Into
- [interactive-link](./interactive-link.md) - Link component
- [molecules/nav-link](../molecules/nav-link.md) - Navigation links
- [molecules/breadcrumb](../molecules/breadcrumb.md) - Breadcrumb navigation
- [organisms/header](../organisms/header.md) - Header navigation

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- Inline and navigation link states
- Underline animation patterns
- Accessibility and external link patterns
