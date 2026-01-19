---
id: pt-parallel-routes
name: Parallel Routes
version: 2.1.0
layer: L5
category: routing
description: Simultaneously render multiple pages in the same layout with independent loading and error states
tags: [routing, parallel-routes, slots, modals, split-views, next15]
composes: []
dependencies: []
formula: "Parallel Route = @slot/ + layout.tsx slots + default.tsx + independent loading/error"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Parallel Routes

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Parallel Routes Layout                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  app/dashboard/layout.tsx                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  export default function Layout({                    │   │
│  │    children,     ◄── Implicit slot (page.tsx)       │   │
│  │    analytics,    ◄── @analytics/                    │   │
│  │    notifications,◄── @notifications/                │   │
│  │    modal,        ◄── @modal/                        │   │
│  │  }) { ... }                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Directory Structure:                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ app/dashboard/                                       │   │
│  │  ├── layout.tsx                                     │   │
│  │  ├── page.tsx        ──► {children}                │   │
│  │  │                                                  │   │
│  │  ├── @analytics/                                    │   │
│  │  │   ├── page.tsx    ──► {analytics}               │   │
│  │  │   ├── loading.tsx ──► Independent loading       │   │
│  │  │   └── error.tsx   ──► Independent error         │   │
│  │  │                                                  │   │
│  │  ├── @notifications/                                │   │
│  │  │   ├── page.tsx    ──► {notifications}           │   │
│  │  │   └── default.tsx ──► Fallback when unmatch     │   │
│  │  │                                                  │   │
│  │  └── @modal/                                        │   │
│  │      ├── default.tsx ──► null (no modal active)    │   │
│  │      └── (.)item/[id]/                             │   │
│  │          └── page.tsx ──► Intercepted modal        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Rendered Layout:                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ┌───────────────────────┐ ┌───────────────────────┐│   │
│  │ │                       │ │  @analytics           ││   │
│  │ │    {children}         │ │  (loading/ready)      ││   │
│  │ │    Main Content       │ ├───────────────────────┤│   │
│  │ │                       │ │  @notifications       ││   │
│  │ │                       │ │  (loading/ready)      ││   │
│  │ └───────────────────────┘ └───────────────────────┘│   │
│  │           ┌───────────────────────────┐            │   │
│  │           │      @modal (overlay)     │            │   │
│  │           │      when active          │            │   │
│  │           └───────────────────────────┘            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Parallel Routes allow you to simultaneously render one or more pages within the same layout. They're defined using named "slots" with the `@folder` convention and are useful for highly dynamic sections like dashboards, modals, and split views.

## When to Use

- Dashboard layouts with multiple independent sections
- Modal overlays that need their own URL
- Split views (list + detail)
- Conditional content based on user state
- A/B testing different UI sections

## Basic Implementation

### Directory Structure

```
app/
├── layout.tsx
├── page.tsx
├── @analytics/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── @notifications/
│   ├── page.tsx
│   └── loading.tsx
└── @team/
    └── page.tsx
```

### Layout with Slots

```typescript
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  notifications,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  notifications: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main content - implicit slot */}
      <main className="col-span-8">
        {children}
      </main>
      
      {/* Sidebar with parallel slots */}
      <aside className="col-span-4 space-y-6">
        {analytics}
        {notifications}
        {team}
      </aside>
    </div>
  );
}
```

### Individual Slot Components

```typescript
// app/@analytics/page.tsx
import { Suspense } from "react";
import { AnalyticsChart } from "@/components/analytics-chart";

export default async function AnalyticsSlot() {
  const data = await getAnalytics();
  
  return (
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold mb-4">Analytics</h2>
      <AnalyticsChart data={data} />
    </div>
  );
}

// app/@analytics/loading.tsx
export default function AnalyticsLoading() {
  return (
    <div className="rounded-lg border p-4">
      <Skeleton className="h-6 w-24 mb-4" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
```

## Modal Pattern with Parallel Routes

### Directory Structure for Modals

```
app/
├── layout.tsx
├── page.tsx
├── @modal/
│   ├── default.tsx       # Required: shows when no modal
│   ├── (.)photo/[id]/
│   │   └── page.tsx      # Intercepts /photo/[id]
│   └── login/
│       └── page.tsx      # /login as modal
└── photo/
    └── [id]/
        └── page.tsx      # Full /photo/[id] page
```

### Modal Layout

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
```

### Default Slot (No Modal)

```typescript
// app/@modal/default.tsx
// IMPORTANT: Required to prevent 404 when no modal is active

export default function Default() {
  return null; // Render nothing when no modal
}
```

### Modal Component

```typescript
// app/@modal/(.)photo/[id]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PhotoDetail } from "@/components/photo-detail";

export default function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <PhotoDetail id={id} />
      </DialogContent>
    </Dialog>
  );
}
```

## Conditional Slots

```typescript
// app/layout.tsx
import { getSession } from "@/lib/auth";

export default async function Layout({
  children,
  dashboard,
  login,
}: {
  children: React.ReactNode;
  dashboard: React.ReactNode;
  login: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div>
      {children}
      {session ? dashboard : login}
    </div>
  );
}
```

## Dashboard with Multiple Slots

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  stats,
  activity,
  quickActions,
}: {
  children: React.ReactNode;
  stats: React.ReactNode;
  activity: React.ReactNode;
  quickActions: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Stats row - 4 cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main content */}
        <div className="col-span-8">
          {children}
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          {quickActions}
          {activity}
        </div>
      </div>
    </div>
  );
}
```

### Independent Loading States

```typescript
// app/dashboard/@stats/loading.tsx
export default function StatsLoading() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </Card>
      ))}
    </>
  );
}

// app/dashboard/@activity/loading.tsx
export default function ActivityLoading() {
  return (
    <Card className="p-4">
      <Skeleton className="h-6 w-32 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
    </Card>
  );
}
```

### Independent Error States

```typescript
// app/dashboard/@stats/error.tsx
"use client";

export default function StatsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Card className="col-span-4 p-6 bg-destructive/10">
      <p className="text-destructive mb-2">Failed to load stats</p>
      <Button variant="outline" size="sm" onClick={reset}>
        Retry
      </Button>
    </Card>
  );
}
```

## Sub-navigation with Parallel Routes

```
app/
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx           # Default view
│   ├── @nav/
│   │   └── default.tsx    # Navigation tabs
│   └── @content/
│       ├── default.tsx    # Overview content
│       ├── analytics/
│       │   └── page.tsx   # /dashboard (shows analytics)
│       └── settings/
│           └── page.tsx   # /dashboard (shows settings)
```

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  nav,
  content,
}: {
  nav: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <div>
      <div className="border-b">{nav}</div>
      <div className="p-6">{content}</div>
    </div>
  );
}

// app/dashboard/@nav/default.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 p-4">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-3 py-2 rounded-md transition-colors",
            pathname === tab.href
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
```

## Default.tsx Explained

```typescript
// The default.tsx file serves as a fallback when Next.js
// cannot determine what to render for a slot after navigation.

// Scenarios where default.tsx is used:
// 1. Full page load - matches current URL to slots
// 2. Soft navigation - keeps previous slot state OR uses default

// app/@sidebar/default.tsx
export default function SidebarDefault() {
  return (
    <aside className="w-64 border-r p-4">
      <p className="text-muted-foreground">
        Select an item to view details
      </p>
    </aside>
  );
}
```

## Anti-patterns

### Don't Overuse Parallel Routes

```typescript
// BAD - Using parallel routes for simple static content
app/
├── @header/page.tsx
├── @footer/page.tsx
└── @content/page.tsx

// GOOD - Use regular components for static content
// app/layout.tsx
export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
```

### Don't Forget default.tsx

```typescript
// BAD - Missing default.tsx causes 404 on certain navigations
app/@modal/
└── login/
    └── page.tsx

// GOOD - Always include default.tsx
app/@modal/
├── default.tsx  // Returns null or fallback
└── login/
    └── page.tsx
```

## Performance Considerations

- Each slot streams independently
- Error in one slot doesn't affect others
- Loading states are isolated
- Use Suspense for granular loading

## Related Skills

- [intercepting-routes](./intercepting-routes.md)
- [app-router](./app-router.md)
- [route-groups](./route-groups.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Modal pattern documentation
- Dashboard slots example
- Default.tsx explanation
