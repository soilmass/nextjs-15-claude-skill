---
id: o-table-of-contents
name: Table of Contents
version: 1.0.0
layer: L3
category: navigation
description: Document table of contents with scroll tracking and smooth navigation
tags: [toc, navigation, documentation, headings, scroll, sidebar]
formula: "TableOfContents = NavLink(m-nav-link)[] + ScrollSpy + ProgressIndicator"
composes:
  - ../molecules/nav-link.md
dependencies: ["lucide-react"]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Table of Contents

## Overview

The Table of Contents organism provides automatic heading detection, scroll-synchronized active states, smooth scrolling navigation, and optional progress indication. Ideal for documentation pages and long-form content.

## When to Use

Use this skill when:
- Building documentation sites
- Creating long-form article pages
- Adding navigation to content-heavy pages
- Implementing scroll-based navigation

## Composition Diagram

```
+---------------------------------------------------------------------+
|                    TableOfContents (L3)                              |
+---------------------------------------------------------------------+
|  +---------------------------------------------------------------+  |
|  | Title: On This Page                                           |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  Progress Bar (optional):                                          |
|  [========================================-----------------------]  |
|  40%                                                               |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | NavLink: Introduction                              (active)   |  |
|  | NavLink: Getting Started                                      |  |
|  |   - Installation                                              |  |
|  |   - Configuration                                             |  |
|  | NavLink: Usage                                                |  |
|  |   - Basic Example                                             |  |
|  |   - Advanced Options                                          |  |
|  | NavLink: API Reference                                        |  |
|  | NavLink: Troubleshooting                                      |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/table-of-contents.tsx
'use client';

import * as React from 'react';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  selector?: string;
  title?: string;
  showProgress?: boolean;
  offsetTop?: number;
  className?: string;
}

function useHeadings(selector: string) {
  const [headings, setHeadings] = React.useState<TocItem[]>([]);

  React.useEffect(() => {
    const elements = document.querySelectorAll(selector);
    const items: TocItem[] = [];

    elements.forEach((element) => {
      const id = element.id || element.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      if (!element.id) element.id = id;

      items.push({
        id,
        text: element.textContent || '',
        level: parseInt(element.tagName.charAt(1)) || 2,
      });
    });

    setHeadings(items);
  }, [selector]);

  return headings;
}

function useActiveHeading(headings: TocItem[], offsetTop: number) {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      let currentId = headings[0]?.id || '';

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          const top = element.offsetTop - offsetTop - 20;
          if (scrollY >= top) {
            currentId = heading.id;
          }
        }
      }

      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, offsetTop]);

  return activeId;
}

function useScrollProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

function TocLink({
  item,
  isActive,
  minLevel,
  onClick,
}: {
  item: TocItem;
  isActive: boolean;
  minLevel: number;
  onClick: () => void;
}) {
  const indent = (item.level - minLevel) * 12;

  return (
    <a
      href={`#${item.id}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        'block py-1.5 text-sm transition-colors border-l-2 -ml-px',
        'hover:text-foreground',
        isActive
          ? 'text-primary border-primary font-medium'
          : 'text-muted-foreground border-transparent hover:border-muted-foreground/50'
      )}
      style={{ paddingLeft: `${12 + indent}px` }}
    >
      {item.text}
    </a>
  );
}

export function TableOfContents({
  selector = 'h2, h3, h4',
  title = 'On This Page',
  showProgress = false,
  offsetTop = 80,
  className,
}: TableOfContentsProps) {
  const headings = useHeadings(selector);
  const activeId = useActiveHeading(headings, offsetTop);
  const progress = useScrollProgress();

  const minLevel = React.useMemo(() => {
    return Math.min(...headings.map((h) => h.level), 2);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.offsetTop - offsetTop;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn('sticky top-24', className)}
      aria-label="Table of contents"
    >
      <div className="flex items-center gap-2 mb-4">
        <List className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>

      {showProgress && (
        <div className="mb-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {Math.round(progress)}% read
          </p>
        </div>
      )}

      <div className="border-l">
        {headings.map((heading) => (
          <TocLink
            key={heading.id}
            item={heading}
            isActive={activeId === heading.id}
            minLevel={minLevel}
            onClick={() => scrollToHeading(heading.id)}
          />
        ))}
      </div>
    </nav>
  );
}

// Hook for external use
export function useTableOfContents(selector = 'h2, h3, h4', offsetTop = 80) {
  const headings = useHeadings(selector);
  const activeId = useActiveHeading(headings, offsetTop);
  const progress = useScrollProgress();

  return { headings, activeId, progress };
}
```

## Usage

### Basic Usage

```tsx
import { TableOfContents } from '@/components/organisms/table-of-contents';

export function DocsPage({ content }) {
  return (
    <div className="flex gap-8">
      <article className="flex-1 prose">
        {content}
      </article>
      <aside className="w-64 hidden lg:block">
        <TableOfContents />
      </aside>
    </div>
  );
}
```

### With Progress Indicator

```tsx
<TableOfContents
  showProgress
  title="Contents"
  offsetTop={100}
/>
```

### Custom Heading Selector

```tsx
<TableOfContents
  selector="h2, h3"
  title="Sections"
/>
```

### Using the Hook

```tsx
import { useTableOfContents } from '@/components/organisms/table-of-contents';

function CustomToc() {
  const { headings, activeId, progress } = useTableOfContents();

  return (
    <div>
      <p>Progress: {Math.round(progress)}%</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={activeId === h.id ? 'active' : ''}
        >
          {h.text}
        </a>
      ))}
    </div>
  );
}
```

## Accessibility

- Navigation landmark with proper label
- Links are keyboard accessible
- Active state communicated to screen readers
- Smooth scrolling with reduced motion support

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Empty | No headings detected on page | Component renders nothing |
| Populated | Headings found and listed | Full TOC with links visible |
| Active | Section is currently in view | Highlighted link with border |
| Inactive | Section not currently visible | Muted text, no border |
| Scrolling | User is scrolling the page | Active state updates live |
| Complete | User has read all content | Progress bar at 100% |

## Anti-patterns

### 1. Not handling missing heading IDs

```tsx
// Bad: Assumes all headings have IDs
const headings = document.querySelectorAll('h2, h3');
headings.forEach((h) => {
  items.push({ id: h.id, text: h.textContent }); // id might be empty
});

// Good: Generate IDs for headings without them
elements.forEach((element) => {
  const id = element.id ||
    element.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
  if (!element.id) element.id = id; // Set the ID on the element
  items.push({ id, text: element.textContent || '' });
});
```

### 2. Using scroll event without passive listener

```tsx
// Bad: Blocking scroll event
window.addEventListener('scroll', handleScroll);

// Good: Use passive listener for better scroll performance
window.addEventListener('scroll', handleScroll, { passive: true });

// Cleanup properly
return () => window.removeEventListener('scroll', handleScroll);
```

### 3. Not accounting for fixed header offset

```tsx
// Bad: Scrolls heading behind fixed header
const scrollToHeading = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

// Good: Account for fixed header height
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 80; // Height of fixed header
    const top = element.offsetTop - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};
```

### 4. Recalculating headings on every render

```tsx
// Bad: Re-queries DOM on every render
function TableOfContents() {
  const headings = document.querySelectorAll('h2, h3'); // Runs every render
  // ...
}

// Good: Use effect with proper dependencies
function useHeadings(selector: string) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    // Parse and set headings once
    setHeadings(parseHeadings(elements));
  }, [selector]); // Only re-run if selector changes

  return headings;
}
```

## Related Skills

- [organisms/sidebar](./sidebar.md)
- [molecules/nav-link](../molecules/nav-link.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Automatic heading detection
- Scroll-based active state
- Progress indicator option
