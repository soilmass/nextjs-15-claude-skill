---
id: m-nav-link
name: Navigation Link
version: 2.0.0
layer: L2
category: navigation
description: Navigation link with active state detection and icon support
tags: [navigation, link, active, menu, sidebar]
formula: "NavLink = Link(a-interactive-link) + Icon(a-display-icon) + Badge(a-display-badge)"
composes:
  - ../atoms/interactive-link.md
  - ../atoms/display-icon.md
  - ../atoms/display-badge.md
dependencies:
  next: "^15.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Navigation Link

## Overview

The Navigation Link molecule combines a link with active state detection, optional icons, and proper ARIA attributes for navigation patterns. Automatically detects current page for active styling.

## When to Use

Use this skill when:
- Building navigation menus (header, sidebar, footer)
- Creating tabbed navigation
- Building breadcrumb trails
- Linking between app sections

## Composition Diagram

```
┌─────────────────────────────────────────────────┐
│                   NavLink                        │
├─────────────────────────────────────────────────┤
│  ┌──────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Icon │  │      Link       │  │    Badge    │ │
│  │(a-   │  │ (a-interactive- │  │(a-display-  │ │
│  │disp- │  │     link)       │  │   badge)    │ │
│  │lay-  │  │                 │  │             │ │
│  │icon) │  │   "Dashboard"   │  │    [3]      │ │
│  │  🏠  │  │                 │  │             │ │
│  └──────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────┘

Sidebar Variant:
┌─────────────────────────────────────────────────┐
│ 🏠  Dashboard                              [3]  │
├─────────────────────────────────────────────────┤
│ 📁  Projects                                    │
├─────────────────────────────────────────────────┤
│ ⚙️  Settings                                    │
└─────────────────────────────────────────────────┘
```

## Atoms Used

- [interactive-link](../atoms/interactive-link.md) - Base link component
- [display-icon](../atoms/display-icon.md) - Optional icons
- [display-badge](../atoms/display-badge.md) - Optional badges/counts

## Implementation

```typescript
// components/ui/nav-link.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const navLinkVariants = cva(
  [
    "inline-flex items-center gap-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "text-muted-foreground",
          "hover:text-foreground",
        ],
        pill: [
          "text-muted-foreground px-3 py-1.5 rounded-full",
          "hover:text-foreground hover:bg-accent",
        ],
        sidebar: [
          "text-muted-foreground w-full px-3 py-2 rounded-md",
          "hover:text-foreground hover:bg-accent",
        ],
        underline: [
          "text-muted-foreground py-2 border-b-2 border-transparent",
          "hover:text-foreground hover:border-primary",
        ],
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        active: true,
        className: "text-foreground",
      },
      {
        variant: "pill",
        active: true,
        className: "text-foreground bg-accent",
      },
      {
        variant: "sidebar",
        active: true,
        className: "text-primary bg-primary/10 font-semibold",
      },
      {
        variant: "underline",
        active: true,
        className: "text-foreground border-primary",
      },
    ],
    defaultVariants: {
      variant: "default",
      active: false,
    },
  }
);

export interface NavLinkProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href">,
    VariantProps<typeof navLinkVariants> {
  /** Link destination */
  href: string;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Icon to display after text */
  iconAfter?: React.ReactNode;
  /** Badge or count to display */
  badge?: React.ReactNode;
  /** Exact path matching (default: false for startsWith) */
  exact?: boolean;
  /** Force active state */
  forceActive?: boolean;
}

export function NavLink({
  href,
  icon,
  iconAfter,
  badge,
  variant,
  exact = false,
  forceActive,
  className,
  children,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  
  const isActive = forceActive ?? (exact
    ? pathname === href
    : pathname.startsWith(href) && (href !== "/" || pathname === "/"));

  return (
    <Link
      href={href}
      className={cn(navLinkVariants({ variant, active: isActive }), className)}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span className="flex-1">{children}</span>
      {badge && <span className="shrink-0">{badge}</span>}
      {iconAfter && <span className="shrink-0" aria-hidden="true">{iconAfter}</span>}
    </Link>
  );
}
```

```typescript
// components/ui/nav-group.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface NavGroupProps {
  /** Group label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Child navigation links */
  children: React.ReactNode;
  /** Start expanded */
  defaultOpen?: boolean;
  /** Collapsible or always expanded */
  collapsible?: boolean;
  className?: string;
}

export function NavGroup({
  label,
  icon,
  children,
  defaultOpen = true,
  collapsible = true,
  className,
}: NavGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
          {icon && <span aria-hidden="true">{icon}</span>}
          {label}
        </div>
        <div className="space-y-1">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={isOpen}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      {isOpen && <div className="space-y-1 pl-4">{children}</div>}
    </div>
  );
}
```

```typescript
// components/ui/mobile-nav-link.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileNavLinkProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onNavigate?: () => void;
}

export function MobileNavLink({
  href,
  icon,
  children,
  onNavigate,
}: MobileNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-base font-medium",
        "border-b transition-colors",
        isActive
          ? "bg-primary/10 text-primary border-primary/20"
          : "text-foreground border-border hover:bg-accent"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {icon && <span className="w-5 h-5" aria-hidden="true">{icon}</span>}
      {children}
    </Link>
  );
}
```

### Key Implementation Notes

1. **Active Detection**: Uses `usePathname()` from Next.js for client-side active state
2. **Exact Matching**: Use `exact` prop for root paths like `/` to avoid matching all routes

## Variants

### Default

```tsx
<NavLink href="/about">About</NavLink>
```

### Pill Style

```tsx
<nav className="flex gap-2">
  <NavLink href="/overview" variant="pill">Overview</NavLink>
  <NavLink href="/analytics" variant="pill">Analytics</NavLink>
  <NavLink href="/reports" variant="pill">Reports</NavLink>
</nav>
```

### Sidebar Style

```tsx
<nav className="flex flex-col gap-1">
  <NavLink href="/dashboard" variant="sidebar" icon={<Home className="h-4 w-4" />}>
    Dashboard
  </NavLink>
  <NavLink href="/projects" variant="sidebar" icon={<Folder className="h-4 w-4" />}>
    Projects
  </NavLink>
  <NavLink href="/settings" variant="sidebar" icon={<Settings className="h-4 w-4" />}>
    Settings
  </NavLink>
</nav>
```

### Underline Style

```tsx
<nav className="flex gap-4 border-b">
  <NavLink href="/profile" variant="underline">Profile</NavLink>
  <NavLink href="/account" variant="underline">Account</NavLink>
  <NavLink href="/billing" variant="underline">Billing</NavLink>
</nav>
```

### With Badge

```tsx
<NavLink
  href="/notifications"
  variant="sidebar"
  icon={<Bell className="h-4 w-4" />}
  badge={<Badge variant="destructive">3</Badge>}
>
  Notifications
</NavLink>
```

## States

| State | Text Color | Background | Border | Weight |
|-------|------------|------------|--------|--------|
| Default | muted-foreground | transparent | none | normal |
| Hover | foreground | accent (variants) | varies | normal |
| Focus | foreground | - | ring-2 | normal |
| Active | foreground/primary | accent/primary | varies | medium/semibold |
| Disabled | muted | transparent | none | normal |

## Accessibility

### Required ARIA Attributes

- `aria-current="page"` - Set automatically when link is active
- `aria-expanded` - On collapsible nav groups

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move between nav links |
| `Enter` | Activate link |
| `Arrow Down` | Next link (in vertical nav) |
| `Arrow Up` | Previous link (in vertical nav) |

### Screen Reader Announcements

- Link text announced with destination
- "Current page" announced for active links
- Expanded/collapsed state for nav groups

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install class-variance-authority lucide-react
```

## Examples

### Header Navigation

```tsx
import { NavLink } from "@/components/ui/nav-link";

export function HeaderNav() {
  return (
    <nav className="flex items-center gap-6">
      <NavLink href="/" exact>Home</NavLink>
      <NavLink href="/products">Products</NavLink>
      <NavLink href="/about">About</NavLink>
      <NavLink href="/contact">Contact</NavLink>
    </nav>
  );
}
```

### Sidebar Navigation

```tsx
import { NavLink, NavGroup } from "@/components/ui/nav-link";
import { Home, Users, Settings, FileText, BarChart } from "lucide-react";

export function SidebarNav() {
  return (
    <nav className="space-y-4 py-4">
      <NavLink href="/dashboard" variant="sidebar" icon={<Home className="h-4 w-4" />} exact>
        Dashboard
      </NavLink>
      
      <NavGroup label="Management" icon={<Users className="h-4 w-4" />}>
        <NavLink href="/users" variant="sidebar">Users</NavLink>
        <NavLink href="/teams" variant="sidebar">Teams</NavLink>
        <NavLink href="/roles" variant="sidebar">Roles</NavLink>
      </NavGroup>
      
      <NavGroup label="Reports" icon={<BarChart className="h-4 w-4" />}>
        <NavLink href="/reports/daily" variant="sidebar">Daily</NavLink>
        <NavLink href="/reports/weekly" variant="sidebar">Weekly</NavLink>
        <NavLink href="/reports/monthly" variant="sidebar">Monthly</NavLink>
      </NavGroup>
      
      <NavLink href="/settings" variant="sidebar" icon={<Settings className="h-4 w-4" />}>
        Settings
      </NavLink>
    </nav>
  );
}
```

### Tab-Style Navigation

```tsx
import { NavLink } from "@/components/ui/nav-link";

export function SettingsTabs() {
  return (
    <div className="border-b">
      <nav className="flex gap-4 -mb-px">
        <NavLink href="/settings/profile" variant="underline">Profile</NavLink>
        <NavLink href="/settings/account" variant="underline">Account</NavLink>
        <NavLink href="/settings/security" variant="underline">Security</NavLink>
        <NavLink href="/settings/notifications" variant="underline">Notifications</NavLink>
      </nav>
    </div>
  );
}
```

### Mobile Navigation

```tsx
import { MobileNavLink } from "@/components/ui/mobile-nav-link";
import { Home, Search, Heart, User } from "lucide-react";

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around">
      <MobileNavLink href="/" icon={<Home />}>Home</MobileNavLink>
      <MobileNavLink href="/search" icon={<Search />}>Search</MobileNavLink>
      <MobileNavLink href="/favorites" icon={<Heart />}>Favorites</MobileNavLink>
      <MobileNavLink href="/profile" icon={<User />}>Profile</MobileNavLink>
    </nav>
  );
}
```

## Anti-patterns

### Missing Active State

```tsx
// Bad - no active indication
<Link href="/about">About</Link>

// Good - visual active state
<NavLink href="/about">About</NavLink>
```

### Inconsistent Icon Usage

```tsx
// Bad - some with icons, some without
<NavLink href="/home" icon={<Home />}>Home</NavLink>
<NavLink href="/about">About</NavLink> {/* No icon */}
<NavLink href="/contact" icon={<Mail />}>Contact</NavLink>

// Good - consistent pattern
<NavLink href="/home" icon={<Home />}>Home</NavLink>
<NavLink href="/about" icon={<Info />}>About</NavLink>
<NavLink href="/contact" icon={<Mail />}>Contact</NavLink>
```

### Wrong Path Matching

```tsx
// Bad - "/" matches all routes without exact
<NavLink href="/">Home</NavLink> {/* Always active */}

// Good - use exact for root
<NavLink href="/" exact>Home</NavLink>
```

## Related Skills

### Composes From
- [atoms/interactive-link](../atoms/interactive-link.md) - Base link
- [atoms/display-icon](../atoms/display-icon.md) - Icons
- [atoms/state-link](../atoms/state-link.md) - State definitions

### Composes Into
- [organisms/header](../organisms/header.md) - Header navigation
- [organisms/sidebar](../organisms/sidebar.md) - Sidebar navigation
- [organisms/mobile-menu](../organisms/mobile-menu.md) - Mobile navigation

### Alternatives
- [molecules/breadcrumb](./breadcrumb.md) - For hierarchical navigation
- [molecules/tabs](./tabs.md) - For content switching

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with CVA variants
- NavGroup component for collapsible sections
- MobileNavLink for touch navigation
- Active state detection with usePathname
