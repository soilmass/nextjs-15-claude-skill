---
id: m-state-nav-item
name: State Nav Item
version: 2.0.0
layer: L2
category: state
description: Complete state matrix for navigation item interactions and active states
tags: [state, navigation, menu, link, matrix]
formula: "StateNavItem = NavLink(m-nav-link) + ActiveIndicator(left|bottom|background|dot|pill) + ExpandIcon(a-display-icon) + NestedItems"
composes: []
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# State Nav Item

## Overview

The State Nav Item defines the complete visual and behavioral state matrix for navigation link molecules. It covers all interaction states including hover, focus, active (current page), expanded (for nested menus), and mobile variations with proper transitions and ARIA patterns.

## When to Use

Use this skill when:
- Implementing navigation components
- Building sidebar menus with nested items
- Ensuring consistent nav item behavior
- Debugging navigation accessibility issues

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      StateNavItem (L2)                           │
├─────────────────────────────────────────────────────────────────┤
│                    State Machine Controller                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │   default ──► hover ──► focus ──► active (current page)   │  │
│  │      │                               │                    │  │
│  │      ▼                               ▼                    │  │
│  │   expanded ◄──────────────────► active+hover              │  │
│  │      │                                                    │  │
│  │   disabled ◄── loading                                    │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   NavLink (m-nav-link)                     │  │
│  │                                                           │  │
│  │  ┌────────┐  ┌────────────────────────────┐  ┌─────────┐  │  │
│  │  │ Icon   │  │         Label              │  │ Chevron │  │  │
│  │  │(a-disp │  │    "Dashboard"             │  │ or Badge│  │  │
│  │  │ -icon) │  │                            │  │   ▶     │  │  │
│  │  │   🏠   │  │                            │  │         │  │  │
│  │  └────────┘  └────────────────────────────┘  └─────────┘  │  │
│  │                                                           │  │
│  │  Active Indicator (configurable):                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ ▌ left | ▁ bottom | ████ background | ● dot | pill  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Nested Items (when expanded)                  │  │
│  │  ├─ Drafts                                                │  │
│  │  ├─ Published                                             │  │
│  │  └─ Archived                                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## State Matrix

### Visual States

| State | Background | Text | Border/Indicator | Icon | Weight |
|-------|------------|------|------------------|------|--------|
| **Default** | transparent | muted-foreground | none | muted | normal |
| **Hover** | muted/50 | foreground | none | foreground | normal |
| **Focus** | transparent | foreground | ring | foreground | normal |
| **Active (current)** | primary/10 | primary | left-2 primary | primary | medium |
| **Active + Hover** | primary/15 | primary | left-2 primary | primary | medium |
| **Expanded** | muted/30 | foreground | none | rotated | normal |
| **Disabled** | transparent | muted/50 | none | muted/50 | normal |
| **Loading** | muted/30 | muted | none | spinner | normal |

### Indicator Styles

| Variant | Position | Size | Color | Animation |
|---------|----------|------|-------|-----------|
| **Left Border** | left | 2px full-height | primary | slide-in 150ms |
| **Bottom Border** | bottom | 2px full-width | primary | scale-x 200ms |
| **Background** | full | rounded | primary/10 | fade 150ms |
| **Dot** | right | 6px circle | primary | scale 150ms |
| **Pill** | full | rounded-full | primary/10 | fade 150ms |

### Icon Behaviors

| State | Rotation | Opacity | Color |
|-------|----------|---------|-------|
| Collapsed (chevron) | 0deg | 100% | muted |
| Expanded (chevron) | 90deg or 180deg | 100% | foreground |
| Loading | spin animation | 100% | muted |
| External link | 0deg | 70% → 100% on hover | muted → foreground |

### Transition Timings

| Property | Duration | Easing | Trigger |
|----------|----------|--------|---------|
| Background | 150ms | ease-out | hover/active |
| Text color | 150ms | ease | hover/active |
| Border/indicator | 200ms | ease-out | active |
| Icon rotation | 200ms | ease-in-out | expand |
| Icon color | 150ms | ease | hover |

## Implementation

```typescript
// components/ui/stateful-nav-item.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItemState = 
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "expanded"
  | "disabled"
  | "loading";

type IndicatorVariant = "left" | "bottom" | "background" | "dot" | "pill";

interface StatefulNavItemProps {
  /** Navigation label */
  label: string;
  /** Navigation URL */
  href?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether link is external */
  external?: boolean;
  /** Nested navigation items */
  children?: React.ReactNode;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is loading */
  loading?: boolean;
  /** Force active state (overrides URL matching) */
  forceActive?: boolean;
  /** Active indicator style */
  indicator?: IndicatorVariant;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Orientation (for indicator position) */
  orientation?: "horizontal" | "vertical";
  /** Click handler (for items without href) */
  onClick?: () => void;
  /** Badge content */
  badge?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

const sizeStyles = {
  sm: "h-8 px-2 text-sm gap-2",
  md: "h-10 px-3 text-sm gap-2.5",
  lg: "h-12 px-4 text-base gap-3",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const indicatorStyles: Record<IndicatorVariant, {
  active: string;
  position: string;
}> = {
  left: {
    active: "before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-primary before:rounded-full",
    position: "relative",
  },
  bottom: {
    active: "after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full",
    position: "relative",
  },
  background: {
    active: "bg-primary/10",
    position: "",
  },
  dot: {
    active: "after:absolute after:right-2 after:top-1/2 after:-translate-y-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary",
    position: "relative",
  },
  pill: {
    active: "bg-primary/10 rounded-full",
    position: "",
  },
};

export function StatefulNavItem({
  label,
  href,
  icon,
  external = false,
  children,
  disabled = false,
  loading = false,
  forceActive,
  indicator = "left",
  size = "md",
  orientation = "vertical",
  onClick,
  badge,
  className,
}: StatefulNavItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const hasChildren = React.Children.count(children) > 0;

  // Determine if current page
  const isActive = forceActive ?? (href ? pathname === href || pathname.startsWith(`${href}/`) : false);

  // Determine current state
  const currentState = React.useMemo((): NavItemState => {
    if (disabled) return "disabled";
    if (loading) return "loading";
    if (isActive) return "active";
    if (isExpanded) return "expanded";
    if (isHovered) return "hover";
    return "default";
  }, [disabled, loading, isActive, isExpanded, isHovered]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }

    onClick?.();
  };

  const indicatorConfig = indicatorStyles[indicator];

  const content = (
    <>
      {/* Icon */}
      {loading ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin text-muted-foreground")} />
      ) : icon ? (
        <span className={cn(
          iconSizes[size],
          "shrink-0 transition-colors duration-150",
          currentState === "active" ? "text-primary" : "text-muted-foreground",
          currentState === "hover" && "text-foreground"
        )}>
          {icon}
        </span>
      ) : null}

      {/* Label */}
      <span className="flex-1 truncate">{label}</span>

      {/* Badge */}
      {badge && (
        <span className="shrink-0">{badge}</span>
      )}

      {/* External indicator */}
      {external && !hasChildren && (
        <ExternalLink className={cn(
          iconSizes[size],
          "shrink-0 opacity-70 transition-opacity",
          isHovered && "opacity-100"
        )} />
      )}

      {/* Expand/collapse indicator */}
      {hasChildren && (
        <ChevronRight className={cn(
          iconSizes[size],
          "shrink-0 transition-transform duration-200",
          isExpanded && "rotate-90"
        )} />
      )}
    </>
  );

  const sharedStyles = cn(
    "flex items-center rounded-md font-medium",
    "transition-all duration-150",
    sizeStyles[size],
    indicatorConfig.position,
    
    // State styles
    currentState === "default" && "text-muted-foreground",
    currentState === "hover" && "bg-muted/50 text-foreground",
    currentState === "active" && [
      "text-primary font-medium",
      indicatorConfig.active,
    ],
    currentState === "expanded" && "bg-muted/30 text-foreground",
    currentState === "disabled" && "text-muted-foreground/50 cursor-not-allowed",
    currentState === "loading" && "bg-muted/30 text-muted-foreground cursor-wait",
    
    // Focus styles
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    
    className
  );

  // Render as button for expandable items
  if (hasChildren || !href) {
    return (
      <div>
        <button
          type="button"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={disabled || loading}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-current={isActive ? "page" : undefined}
          className={cn(sharedStyles, "w-full")}
        >
          {content}
        </button>
        
        {/* Nested items */}
        {hasChildren && isExpanded && (
          <div
            className={cn(
              "ml-4 mt-1 space-y-1 border-l border-border pl-3",
              "animate-in slide-in-from-top-2 duration-200"
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  // Render as link
  const LinkComponent = external ? "a" : Link;
  const linkProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <LinkComponent
      {...linkProps}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled}
      className={sharedStyles}
    >
      {content}
    </LinkComponent>
  );
}
```

```typescript
// components/ui/nav-group.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface NavGroupProps {
  /** Group label */
  label?: string;
  /** Navigation items */
  children: React.ReactNode;
  /** Collapsible group */
  collapsible?: boolean;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Additional class names */
  className?: string;
}

export function NavGroup({
  label,
  children,
  collapsible = false,
  defaultExpanded = true,
  className,
}: NavGroupProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        collapsible ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            aria-expanded={isExpanded}
          >
            {label}
            <ChevronRight className={cn(
              "h-3 w-3 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </button>
        ) : (
          <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </h3>
        )
      )}
      
      {(!collapsible || isExpanded) && (
        <nav className="space-y-1" role="navigation" aria-label={label}>
          {children}
        </nav>
      )}
    </div>
  );
}
```

### Key Implementation Notes

1. **URL Matching**: Auto-detects active state from current pathname
2. **Nested Support**: Handles expandable items with children
3. **External Links**: Proper handling with target and rel attributes
4. **Indicator Variants**: Multiple styles for active indication

## Interaction Flows

### Link Navigation

```
default → hover (mouse enter)
hover → focus (click)
focus → active (page loads, URL matches)
```

### Expandable Item

```
default → hover → click → expanded
expanded → hover → click → collapsed
```

### Keyboard Navigation

```
focus (Tab) → Enter (navigate/expand)
focus (Tab) → Space (expand only)
focus (Tab) → Arrow keys (roving tabindex in menu)
```

## Accessibility Patterns

### ARIA Mapping

| State | ARIA Attribute | Value |
|-------|----------------|-------|
| Current page | `aria-current` | "page" |
| Expanded | `aria-expanded` | "true" |
| Collapsed | `aria-expanded` | "false" |
| Disabled | `aria-disabled` | "true" |
| Has popup | `aria-haspopup` | "true" (for dropdowns) |

### Keyboard Support

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next item |
| `Shift+Tab` | Move focus to previous item |
| `Enter` | Navigate to link / expand item |
| `Space` | Expand/collapse (no navigation) |
| `Arrow Down` | Next item (in dropdown) |
| `Arrow Up` | Previous item (in dropdown) |
| `Escape` | Close expanded menu |

### Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Focus nav item | "[label], link" or "[label], button" |
| Active page | "[label], current page" |
| Expanded | "[label], expanded" |
| Collapsed | "[label], collapsed" |

## Examples

### Sidebar Navigation

```tsx
import { StatefulNavItem, NavGroup } from "@/components/ui/nav";
import { Home, Users, Settings, FileText } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <NavGroup label="Main">
        <StatefulNavItem
          label="Dashboard"
          href="/dashboard"
          icon={<Home />}
        />
        <StatefulNavItem
          label="Users"
          href="/users"
          icon={<Users />}
          badge={<Badge variant="secondary">12</Badge>}
        />
      </NavGroup>
      
      <NavGroup label="Content" className="mt-6">
        <StatefulNavItem
          label="Documents"
          icon={<FileText />}
        >
          <StatefulNavItem label="Drafts" href="/documents/drafts" />
          <StatefulNavItem label="Published" href="/documents/published" />
          <StatefulNavItem label="Archived" href="/documents/archived" />
        </StatefulNavItem>
      </NavGroup>
      
      <NavGroup label="System" className="mt-6">
        <StatefulNavItem
          label="Settings"
          href="/settings"
          icon={<Settings />}
        />
      </NavGroup>
    </aside>
  );
}
```

### Horizontal Navigation

```tsx
export function HeaderNav() {
  return (
    <nav className="flex items-center gap-1">
      <StatefulNavItem
        label="Home"
        href="/"
        indicator="bottom"
        orientation="horizontal"
        size="sm"
      />
      <StatefulNavItem
        label="Products"
        href="/products"
        indicator="bottom"
        orientation="horizontal"
        size="sm"
      />
      <StatefulNavItem
        label="About"
        href="/about"
        indicator="bottom"
        orientation="horizontal"
        size="sm"
      />
      <StatefulNavItem
        label="Docs"
        href="https://docs.example.com"
        external
        indicator="bottom"
        orientation="horizontal"
        size="sm"
      />
    </nav>
  );
}
```

### Mobile Navigation

```tsx
export function MobileNav({ isOpen, onClose }) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <nav className="space-y-2 mt-8">
          <StatefulNavItem
            label="Home"
            href="/"
            icon={<Home />}
            indicator="background"
            size="lg"
            onClick={onClose}
          />
          <StatefulNavItem
            label="Products"
            href="/products"
            icon={<Package />}
            indicator="background"
            size="lg"
            onClick={onClose}
          />
          <StatefulNavItem
            label="Settings"
            href="/settings"
            icon={<Settings />}
            indicator="background"
            size="lg"
            onClick={onClose}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

### Pill Indicator Style

```tsx
<nav className="flex gap-1 p-1 bg-muted rounded-lg">
  <StatefulNavItem
    label="All"
    href="/items"
    indicator="pill"
    size="sm"
  />
  <StatefulNavItem
    label="Active"
    href="/items?status=active"
    indicator="pill"
    size="sm"
  />
  <StatefulNavItem
    label="Archived"
    href="/items?status=archived"
    indicator="pill"
    size="sm"
  />
</nav>
```

## Anti-patterns

### Missing Current Page Indicator

```tsx
// Bad - no way to know current location
<nav>
  <Link href="/home">Home</Link>
  <Link href="/about">About</Link>
</nav>

// Good - clear active indication
<nav>
  <StatefulNavItem label="Home" href="/home" />
  <StatefulNavItem label="About" href="/about" />
</nav>
```

### Inconsistent Interaction Patterns

```tsx
// Bad - mixing different component types
<nav>
  <button onClick={handleDashboard}>Dashboard</button>
  <Link href="/users">Users</Link>
  <a href="/settings">Settings</a>
</nav>

// Good - consistent component usage
<nav>
  <StatefulNavItem label="Dashboard" href="/dashboard" />
  <StatefulNavItem label="Users" href="/users" />
  <StatefulNavItem label="Settings" href="/settings" />
</nav>
```

### Nested Items Without Indication

```tsx
// Bad - no visual hierarchy
<StatefulNavItem label="Documents">
  <StatefulNavItem label="All" href="/docs" />
</StatefulNavItem>

// Good - clear nesting with indentation
<StatefulNavItem label="Documents" icon={<FileText />}>
  <StatefulNavItem label="All" href="/docs" size="sm" />
  <StatefulNavItem label="Shared" href="/docs/shared" size="sm" />
</StatefulNavItem>
```

## Related Skills

### Implements States For
- [molecules/nav-link](./nav-link.md) - Base navigation link

### Pattern Used By
- [organisms/header](../organisms/header.md) - Site header
- [organisms/sidebar](../organisms/sidebar.md) - Sidebar navigation
- [organisms/mobile-menu](../organisms/mobile-menu.md) - Mobile navigation

### Related State Matrices
- [atoms/state-link](../atoms/state-link.md) - Link states
- [molecules/state-card](./state-card.md) - Card states

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- Multiple indicator variants
- Nested navigation support
- NavGroup component for sections
