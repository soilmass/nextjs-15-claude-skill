---
id: p-container-queries
name: Container Queries
version: 2.0.0
layer: L0
category: layout
composes: []
description: Container query primitives for component-level responsive design
tags: [container-queries, responsive, cqw, cqh, containment, component-responsive]
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Container Queries

## Overview

Container queries enable components to respond to their container's size rather than the viewport. This allows truly reusable components that adapt to their context. CSS Container Queries are fully supported in all modern browsers as of 2023.

## Design Tokens

```css
/* Container Query Tokens */
:root {
  /* Container breakpoints (based on container width) */
  --cq-xs: 12rem;    /* 192px */
  --cq-sm: 20rem;    /* 320px */
  --cq-md: 28rem;    /* 448px */
  --cq-lg: 36rem;    /* 576px */
  --cq-xl: 48rem;    /* 768px */
  --cq-2xl: 64rem;   /* 1024px */
  
  /* Named container sizes for common use cases */
  --cq-card-sm: 16rem;   /* 256px - Small card */
  --cq-card-md: 24rem;   /* 384px - Medium card */
  --cq-card-lg: 32rem;   /* 512px - Large card */
  
  --cq-sidebar: 16rem;   /* 256px - Sidebar width */
  --cq-content: 48rem;   /* 768px - Content area */
}
```

## Core Concepts

### Containment Context

```css
/* Define a containment context */
.container {
  container-type: inline-size; /* Query width only (most common) */
}

.container-block {
  container-type: size; /* Query both width and height */
}

/* Named containers for specific queries */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Shorthand */
.sidebar-container {
  container: sidebar / inline-size;
}
```

### Container Query Syntax

```css
/* Basic container query */
@container (min-width: 400px) {
  .card-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}

/* Named container query */
@container card (min-width: 500px) {
  .card-title {
    font-size: 1.5rem;
  }
}

/* Range syntax */
@container (400px <= width <= 800px) {
  .card {
    padding: 1.5rem;
  }
}

/* Height queries (requires container-type: size) */
@container (min-height: 300px) {
  .panel {
    display: flex;
    flex-direction: column;
  }
}
```

## Container Query Units

```css
/* Container query length units */
.responsive-element {
  /* cqw - 1% of container's width */
  font-size: clamp(1rem, 4cqw, 2rem);
  
  /* cqh - 1% of container's height */
  padding-block: 5cqh;
  
  /* cqi - 1% of container's inline size */
  margin-inline: 2cqi;
  
  /* cqb - 1% of container's block size */
  margin-block: 2cqb;
  
  /* cqmin - smaller of cqi or cqb */
  border-radius: 2cqmin;
  
  /* cqmax - larger of cqi or cqb */
  gap: 1cqmax;
}
```

## Component Patterns

### Responsive Card

```css
/* Card that adapts to its container */
.card-container {
  container-type: inline-size;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.card-image {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}

/* Horizontal layout in wider containers */
@container (min-width: 400px) {
  .card {
    flex-direction: row;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .card-image {
    width: 40%;
    aspect-ratio: 1;
  }
  
  .card-content {
    flex: 1;
  }
}

/* Enhanced layout in large containers */
@container (min-width: 600px) {
  .card {
    padding: 2rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
  
  .card-description {
    font-size: 1.125rem;
  }
}
```

### Responsive Navigation

```css
.nav-container {
  container-type: inline-size;
  container-name: nav;
}

/* Compact: Icon only */
.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
}

.nav-label {
  display: none;
}

/* Medium: Icon + label stacked */
@container nav (min-width: 180px) {
  .nav-item {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .nav-label {
    display: block;
    font-size: 0.75rem;
  }
}

/* Wide: Icon + label inline */
@container nav (min-width: 240px) {
  .nav-item {
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.75rem;
  }
  
  .nav-label {
    font-size: 0.875rem;
  }
}
```

### Responsive Data Table

```css
.table-container {
  container-type: inline-size;
}

/* Stacked layout for narrow containers */
.data-table {
  display: block;
}

.data-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.data-cell {
  display: flex;
  justify-content: space-between;
}

.data-cell::before {
  content: attr(data-label);
  font-weight: 600;
}

/* Traditional table layout for wider containers */
@container (min-width: 600px) {
  .data-table {
    display: table;
    width: 100%;
  }
  
  .data-row {
    display: table-row;
  }
  
  .data-cell {
    display: table-cell;
    padding: 0.75rem 1rem;
  }
  
  .data-cell::before {
    display: none;
  }
}
```

## React Integration

```tsx
// components/ui/container.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Container name for named queries */
  name?: string;
  /** Container type */
  type?: 'inline-size' | 'size' | 'normal';
  /** Element to render as */
  as?: React.ElementType;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, name, type = 'inline-size', as: Component = 'div', style, ...props }, ref) => {
    const containerStyle: React.CSSProperties = {
      containerType: type,
      containerName: name,
      ...style,
    };

    return (
      <Component
        ref={ref}
        className={cn(className)}
        style={containerStyle}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

export { Container };
```

```tsx
// components/responsive-card.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';
import styles from './responsive-card.module.css';

interface ResponsiveCardProps {
  title: string;
  description: string;
  image: string;
  className?: string;
}

export function ResponsiveCard({
  title,
  description,
  image,
  className,
}: ResponsiveCardProps) {
  return (
    <Container name="card" className={cn(styles.container, className)}>
      <article className={styles.card}>
        <div className={styles.imageWrapper}>
          <Image
            src={image}
            alt={title}
            fill
            className={styles.image}
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </article>
    </Container>
  );
}
```

```css
/* responsive-card.module.css */
.container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--card);
  border: 1px solid var(--border);
}

.imageWrapper {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.375rem;
}

.image {
  object-fit: cover;
}

.title {
  font-size: 1rem;
  font-weight: 600;
}

.description {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

/* Horizontal layout */
@container card (min-width: 400px) {
  .card {
    flex-direction: row;
    gap: 1.5rem;
  }
  
  .imageWrapper {
    width: 40%;
    flex-shrink: 0;
    aspect-ratio: 1;
  }
  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .title {
    font-size: 1.25rem;
  }
}

/* Large container */
@container card (min-width: 600px) {
  .card {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .description {
    font-size: 1rem;
  }
}
```

## Tailwind CSS Integration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import containerQueries from '@tailwindcss/container-queries';

const config: Config = {
  plugins: [
    containerQueries,
  ],
  theme: {
    extend: {
      // Custom container sizes
      containers: {
        'xs': '12rem',
        'sm': '20rem',
        'md': '28rem',
        'lg': '36rem',
        'xl': '48rem',
        '2xl': '64rem',
        'card-sm': '16rem',
        'card-md': '24rem',
        'card-lg': '32rem',
      },
    },
  },
};

export default config;
```

```tsx
// Usage with Tailwind Container Queries plugin
function ResponsiveCard() {
  return (
    <div className="@container">
      <article className="flex flex-col gap-3 p-4 @md:flex-row @md:gap-6 @lg:p-6">
        <div className="aspect-video @md:w-2/5 @md:aspect-square">
          <img src="..." className="object-cover" />
        </div>
        <div className="@md:flex-1">
          <h3 className="text-base @md:text-lg @lg:text-xl">Title</h3>
          <p className="text-sm @lg:text-base">Description</p>
        </div>
      </article>
    </div>
  );
}
```

## Style Queries (Experimental)

```css
/* Query container's custom property values */
.theme-container {
  container-type: inline-size;
  --theme: light;
}

.theme-container.dark {
  --theme: dark;
}

/* Style query (experimental - Chrome 111+) */
@container style(--theme: dark) {
  .card {
    background: #1a1a1a;
    color: white;
  }
}
```

## Browser Support and Fallbacks

```css
/* Feature detection */
@supports (container-type: inline-size) {
  .container {
    container-type: inline-size;
  }
}

/* Fallback for older browsers */
@supports not (container-type: inline-size) {
  /* Use viewport-based media queries as fallback */
  @media (min-width: 640px) {
    .card {
      flex-direction: row;
    }
  }
}
```

## Anti-patterns

### Avoid Over-Containment

```css
/* Bad - Every element is a container */
.card, .card-header, .card-body, .card-footer {
  container-type: inline-size;
}

/* Good - Contain at logical boundaries */
.card-container {
  container-type: inline-size;
}
```

### Avoid Nested Height Queries

```css
/* Bad - Nested height containment causes layout issues */
.outer {
  container-type: size;
}
.inner {
  container-type: size; /* Can break height calculation */
}

/* Good - Use inline-size for nested containers */
.outer {
  container-type: size;
}
.inner {
  container-type: inline-size;
}
```

## Related Primitives

- [breakpoints](./breakpoints.md) - Viewport breakpoints
- [grid-systems](./grid-systems.md) - Grid layouts
- [fluid-design](./fluid-design.md) - Fluid typography and spacing

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
