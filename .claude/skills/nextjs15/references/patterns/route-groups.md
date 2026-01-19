---
id: pt-route-groups
name: Route Groups
version: 2.1.0
layer: L5
category: routing
description: Organize routes without affecting URL structure using parentheses-wrapped folder names
tags: [routing, route-groups, layouts, organization, next15]
composes: []
dependencies: []
formula: "Route Groups = (folderName) + layout.tsx + Shared UI Components"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Route Groups

## When to Use

- **Multiple layouts**: Different sections need distinct layouts (marketing vs dashboard)
- **Logical organization**: Group related routes without URL impact
- **Access control**: Separate public, authenticated, and admin sections
- **Feature isolation**: Keep feature-related routes together
- **Team organization**: Different teams own different route groups

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        app/                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │   (marketing)/    │  │   (dashboard)/    │                │
│  │  ┌────────────┐  │  │  ┌────────────┐  │                 │
│  │  │ layout.tsx │  │  │  │ layout.tsx │  │                 │
│  │  │ ┌────────┐ │  │  │  │ ┌────────┐ │  │                 │
│  │  │ │ Header │ │  │  │  │ │Sidebar │ │  │                 │
│  │  │ └────────┘ │  │  │  │ └────────┘ │  │                 │
│  │  │ {children} │  │  │  │ {children} │  │                 │
│  │  │ ┌────────┐ │  │  │  │ ┌────────┐ │  │                 │
│  │  │ │ Footer │ │  │  │  │ │  Nav   │ │  │                 │
│  │  │ └────────┘ │  │  │  │ └────────┘ │  │                 │
│  │  └────────────┘  │  │  └────────────┘  │                 │
│  │                  │  │                  │                 │
│  │  /about          │  │  /dashboard      │                 │
│  │  /pricing        │  │  /settings       │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                             │
│  ┌──────────────────┐                                       │
│  │     (auth)/       │                                       │
│  │  ┌────────────┐  │                                       │
│  │  │ layout.tsx │  │                                       │
│  │  │  Split UI  │  │                                       │
│  │  └────────────┘  │                                       │
│  │  /login          │                                       │
│  │  /register       │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Route Groups allow you to organize your routes into logical sections without adding segments to the URL path. They're created by wrapping a folder name in parentheses: `(folderName)`. This is essential for applying different layouts to different sections of your application.

## Convention

```
app/
├── (marketing)/        # No URL impact
│   ├── layout.tsx      # Marketing layout
│   ├── page.tsx        # Still maps to /
│   ├── about/
│   │   └── page.tsx    # /about
│   └── pricing/
│       └── page.tsx    # /pricing
│
├── (dashboard)/        # No URL impact  
│   ├── layout.tsx      # Dashboard layout
│   └── dashboard/
│       └── page.tsx    # /dashboard
│
└── (auth)/             # No URL impact
    ├── layout.tsx      # Auth layout
    ├── login/
    │   └── page.tsx    # /login
    └── register/
        └── page.tsx    # /register
```

## Multiple Layouts

### Marketing Layout

```typescript
// app/(marketing)/layout.tsx
import { Header } from "@/components/organisms/header";
import { Footer } from "@/components/organisms/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        navItems={[
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "About", href: "/about" },
        ]}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </>
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### Dashboard Layout

```typescript
// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { DashboardHeader } from "@/components/organisms/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar user={session.user} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={session.user} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
```

### Auth Layout

```typescript
// app/(auth)/layout.tsx
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="inline-block mb-8">
            <Logo />
          </Link>
          {children}
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary">
        <div className="flex flex-col justify-center p-12 text-primary-foreground">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back
          </h1>
          <p className="text-lg opacity-90">
            Sign in to access your dashboard and continue where you left off.
          </p>
        </div>
      </div>
    </div>
  );
}
```

## Organizing by Feature

```
app/
├── (shop)/
│   ├── layout.tsx           # Shop layout with categories sidebar
│   ├── products/
│   │   ├── page.tsx         # /products
│   │   └── [slug]/
│   │       └── page.tsx     # /products/:slug
│   ├── cart/
│   │   └── page.tsx         # /cart
│   └── checkout/
│       └── page.tsx         # /checkout
│
├── (blog)/
│   ├── layout.tsx           # Blog layout with sidebar
│   ├── blog/
│   │   ├── page.tsx         # /blog
│   │   └── [slug]/
│   │       └── page.tsx     # /blog/:slug
│   └── categories/
│       └── [category]/
│           └── page.tsx     # /categories/:category
│
└── (account)/
    ├── layout.tsx           # Account layout with navigation
    ├── settings/
    │   └── page.tsx         # /settings
    └── orders/
        ├── page.tsx         # /orders
        └── [id]/
            └── page.tsx     # /orders/:id
```

## Multiple Root Pages

You can have multiple pages that map to the same URL (like `/`) in different route groups. Next.js will use the first one it finds.

```
app/
├── (marketing)/
│   └── page.tsx             # / (marketing homepage)
│
└── (app)/
    └── page.tsx             # Would also map to / (conflict!)
```

To avoid conflicts, use specific routes:

```
app/
├── (marketing)/
│   ├── page.tsx             # / (homepage)
│   ├── about/page.tsx       # /about
│   └── pricing/page.tsx     # /pricing
│
└── (app)/
    ├── dashboard/page.tsx   # /dashboard
    └── settings/page.tsx    # /settings
```

## Shared Components Between Groups

```typescript
// components/shared/page-header.tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

// Usage in any route group
// app/(dashboard)/dashboard/page.tsx
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your account"
        actions={<Button>Create New</Button>}
      />
      {/* Dashboard content */}
    </div>
  );
}
```

## Nested Route Groups

```
app/
└── (marketing)/
    ├── layout.tsx               # Main marketing layout
    │
    ├── (landing)/               # Landing pages group
    │   ├── page.tsx             # / (homepage)
    │   ├── features/page.tsx    # /features
    │   └── pricing/page.tsx     # /pricing
    │
    └── (content)/               # Content pages group
        ├── layout.tsx           # Content-specific layout (prose styles)
        ├── blog/
        │   └── [...slug]/page.tsx
        └── docs/
            └── [...slug]/page.tsx
```

```typescript
// app/(marketing)/(content)/layout.tsx
// Nested layout adds prose styling for content pages

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="prose lg:prose-xl max-w-4xl mx-auto py-12">
      {children}
    </article>
  );
}
```

## Route Groups with Parallel Routes

```
app/
├── (dashboard)/
│   ├── layout.tsx
│   ├── @sidebar/              # Parallel route for sidebar
│   │   └── default.tsx
│   ├── @main/                 # Parallel route for main content
│   │   └── default.tsx
│   └── dashboard/
│       ├── @sidebar/
│       │   └── page.tsx
│       └── @main/
│           └── page.tsx
```

## Grouping by Access Level

```
app/
├── (public)/                  # Accessible to everyone
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/page.tsx
│
├── (protected)/               # Requires authentication
│   ├── layout.tsx             # Auth check here
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
│
└── (admin)/                   # Requires admin role
    ├── layout.tsx             # Admin check here
    ├── admin/page.tsx
    └── users/page.tsx
```

```typescript
// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}

// app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="bg-yellow-50 min-h-screen">
      <div className="bg-yellow-100 text-yellow-800 text-sm py-1 text-center">
        Admin Mode
      </div>
      {children}
    </div>
  );
}
```

## Loading and Error Per Group

```
app/
└── (dashboard)/
    ├── layout.tsx
    ├── loading.tsx            # Loading for all dashboard routes
    ├── error.tsx              # Error boundary for dashboard
    ├── dashboard/
    │   ├── page.tsx
    │   └── loading.tsx        # Override loading for this specific route
    └── settings/
        └── page.tsx
```

## Naming Conventions

```typescript
// Good route group names (descriptive, lowercase)
(marketing)
(dashboard)
(auth)
(shop)
(blog)
(admin)
(public)
(protected)

// For feature-based organization
(user-management)
(content-management)
(analytics)

// For layout-based organization
(with-sidebar)
(full-width)
(centered)
```

## Anti-patterns

### Don't Use Route Groups Just for Organization

```typescript
// BAD - Route group adds no value (no different layout)
app/
├── (pages)/
│   ├── about/page.tsx
│   └── contact/page.tsx
└── layout.tsx

// GOOD - Regular folders work fine
app/
├── about/page.tsx
├── contact/page.tsx
└── layout.tsx
```

### Don't Create Deep Nesting

```typescript
// BAD - Too many nested groups
app/
└── (marketing)/
    └── (landing)/
        └── (hero)/
            └── page.tsx

// GOOD - Keep it flat
app/
└── (marketing)/
    └── page.tsx
```

## Related Skills

- [app-router](./app-router.md)
- [parallel-routes](./parallel-routes.md)
- [dynamic-routes](./dynamic-routes.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Multiple layouts pattern
- Access level grouping
- Nested groups
