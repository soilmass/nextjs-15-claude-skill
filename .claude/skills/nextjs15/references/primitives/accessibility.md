---
id: p-accessibility
name: Accessibility
version: 2.0.0
layer: L0
category: accessibility
composes: []
description: Touch targets, focus indicators, motion preferences
tags: [design-tokens, a11y, wcag, focus, keyboard]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AAA
  keyboard: true
  screen-reader: true
---

# Accessibility

## Overview

This skill defines accessibility-focused design tokens that ensure all users can interact with the interface. It covers touch targets, focus indicators, color contrast, and motion preferences as foundational requirements.

Key principles:
- WCAG 2.1 AA compliance minimum
- 44x44px minimum touch targets
- Visible focus indicators
- Respect user motion preferences

## When to Use

Use this skill when:
- Setting up a new project's accessibility foundation
- Defining focus ring styles
- Configuring touch target sizes
- Implementing reduced motion support

## Implementation

### globals.css

```css
@layer base {
  :root {
    /* Touch Target Sizes (WCAG 2.5.5) */
    --touch-target-min: 44px;     /* WCAG minimum */
    --touch-target-primary: 48px;  /* Primary actions */
    --touch-target-large: 56px;    /* Important CTAs */
    --touch-target-gap: 8px;       /* Between adjacent targets */
    
    /* Focus Ring (WCAG 2.4.7) */
    --focus-ring-width: 2px;
    --focus-ring-offset: 2px;
    --focus-ring-color: hsl(var(--ring));
    --focus-ring-style: solid;
    
    /* Alternative focus for high contrast */
    --focus-outline-width: 3px;
    --focus-outline-offset: 3px;
    
    /* Color Contrast Requirements */
    --contrast-text-normal: 4.5;    /* WCAG AA for normal text */
    --contrast-text-large: 3;       /* WCAG AA for large text (18px+) */
    --contrast-ui: 3;               /* WCAG AA for UI components */
  }
}

/* Default focus styles */
@layer base {
  /* Remove default focus, add custom */
  *:focus {
    outline: none;
  }
  
  /* Focus-visible for keyboard users only */
  *:focus-visible {
    outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  
  /* Alternative focus ring with box-shadow */
  .focus-ring:focus-visible {
    outline: none;
    box-shadow: 
      0 0 0 var(--focus-ring-offset) hsl(var(--background)),
      0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--focus-ring-color);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --focus-ring-width: 3px;
    --focus-outline-width: 4px;
  }
  
  *:focus-visible {
    outline-width: var(--focus-outline-width);
  }
}

/* Forced colors mode (Windows High Contrast) */
@media (forced-colors: active) {
  *:focus-visible {
    outline: 3px solid CanvasText;
  }
}
```

### lib/a11y.ts

```typescript
// Accessibility utilities

/**
 * Generate unique IDs for aria-labelledby/describedby
 */
export function useId(prefix: string = "id"): string {
  const id = React.useId();
  return `${prefix}-${id}`;
}

/**
 * Screen reader only content
 */
export const srOnly = 
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0";

/**
 * Focus trap for modals
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef]);
}

/**
 * Announce to screen readers
 */
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", priority);
  announcer.setAttribute("aria-atomic", "true");
  announcer.className = srOnly;
  document.body.appendChild(announcer);
  
  // Delay for screen reader to register
  setTimeout(() => {
    announcer.textContent = message;
    setTimeout(() => document.body.removeChild(announcer), 1000);
  }, 100);
}

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  
  return prefersReducedMotion;
}
```

### components/ui/visually-hidden.tsx

```typescript
import * as React from "react";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";

export const VisuallyHidden = VisuallyHiddenPrimitive.Root;

// Usage: <VisuallyHidden>Screen reader only text</VisuallyHidden>
```

## ARIA Patterns

### Landmark Roles

```tsx
<header role="banner">...</header>
<nav role="navigation" aria-label="Main">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### Live Regions

```tsx
// Polite announcements (wait for silence)
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Assertive announcements (interrupt)
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>
```

### Button with Label

```tsx
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
```

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-visually-hidden": "1.1.0"
  }
}
```

## Examples

### Accessible Button

```tsx
<button
  className="h-11 px-4 min-w-[44px] rounded-md bg-primary text-primary-foreground
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  aria-label={iconOnly ? "Action description" : undefined}
>
  {iconOnly ? <Icon aria-hidden="true" /> : "Button Text"}
</button>
```

### Accessible Form

```tsx
<form aria-labelledby="form-title">
  <h2 id="form-title">Contact Form</h2>
  
  <div className="space-y-4">
    <div>
      <label htmlFor="name" className="block text-sm font-medium">
        Name <span aria-hidden="true">*</span>
        <span className="sr-only">(required)</span>
      </label>
      <input
        id="name"
        name="name"
        required
        aria-required="true"
        aria-describedby="name-hint"
        className="mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-ring"
      />
      <p id="name-hint" className="mt-1 text-sm text-muted-foreground">
        Enter your full name
      </p>
    </div>
    
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        aria-invalid={hasError}
        aria-describedby={hasError ? "email-error" : undefined}
      />
      {hasError && (
        <p id="email-error" role="alert" className="text-destructive">
          Please enter a valid email
        </p>
      )}
    </div>
  </div>
</form>
```

### Skip Link

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
             focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground
             focus:rounded-md focus:ring-2"
>
  Skip to main content
</a>

<main id="main-content" tabIndex={-1}>
  {/* Main content */}
</main>
```

## Anti-patterns

### Relying on Color Alone

```tsx
// Bad - color only indicates state
<span className={isError ? "text-red-500" : "text-green-500"}>
  {message}
</span>

// Good - icon + color + text
<span className={isError ? "text-destructive" : "text-green-600"}>
  {isError ? <AlertIcon aria-hidden="true" /> : <CheckIcon aria-hidden="true" />}
  {message}
</span>
```

### Missing Focus Styles

```tsx
// Bad - removes focus without replacement
<button className="outline-none">Click</button>

// Good - uses focus-visible
<button className="focus-visible:ring-2 focus-visible:ring-ring">Click</button>
```

### Small Touch Targets

```tsx
// Bad - too small
<button className="h-6 w-6">...</button>

// Good - meets minimum
<button className="h-11 w-11 p-2">
  <span className="h-5 w-5">...</span>
</button>
```

## Related Skills

### Composes Into
- [input-button](../atoms/input-button.md) - Accessible buttons
- [input-text](../atoms/input-text.md) - Accessible inputs
- [dialog](../organisms/dialog.md) - Accessible modals

### Related
- [colors](./colors.md) - Contrast colors
- [motion](./motion.md) - Reduced motion

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
