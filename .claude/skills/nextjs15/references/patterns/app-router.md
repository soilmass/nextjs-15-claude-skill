---
id: pt-app-router
name: App Router Fundamentals
version: 2.1.0
layer: L5
category: routing
description: Next.js 15 App Router fundamentals including file conventions, layouts, and server components
tags: [routing, app-router, layouts, server-components, next15]
composes: []
dependencies: []
formula: "App Router = File Conventions + Server Components + Async APIs + Nested Layouts"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# App Router Fundamentals

## When to Use

- **New Next.js projects**: Default choice for Next.js 13+
- **Server-first architecture**: Maximize server component benefits
- **Complex layouts**: Nested layouts with streaming
- **Modern data fetching**: Leverage React Server Components
- **Incremental migration**: Can coexist with Pages Router

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    App Router Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  app/                                                       │
│  ├── layout.tsx ─────────────┬─────────────────────────────│
│  │   (Root Layout)           │  Required: html, body       │
│  │                           │  Providers, global styles    │
│  │                           │                              │
│  ├── page.tsx ───────────────┤  Route: /                   │
│  │                           │                              │
│  ├── loading.tsx ────────────┤  Suspense boundary          │
│  │                           │  (Automatic wrapping)        │
│  │                           │                              │
│  ├── error.tsx ──────────────┤  Error boundary             │
│  │                           │  ("use client" required)     │
│  │                           │                              │
│  ├── not-found.tsx ──────────┤  404 handling               │
│  │                           │                              │
│  └── [dynamic]/              │                              │
│       ├── layout.tsx ────────┤  Nested layout              │
│       └── page.tsx ──────────┤  Route: /[dynamic]          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     Component Types                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Server Components (default)                        │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ • Direct database access                     │   │   │
│  │  │ • Async/await in component                   │   │   │
│  │  │ • No useState, useEffect                     │   │   │
│  │  │ • Access to headers(), cookies()            │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │              │                                      │   │
│  │              │ passes data as props                │   │
│  │              ▼                                      │   │
│  │  Client Components ("use client")                   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ • useState, useEffect                        │   │   │
│  │  │ • Browser APIs                               │   │   │
│  │  │ • Event handlers                             │   │   │
│  │  │ • Interactive UI                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Overview

The App Router is Next.js's file-system based router built on React Server Components. In Next.js 15, several APIs have become async, fundamentally changing how you work with dynamic data in routes.

## Next.js 15 Breaking Changes

### Async Request APIs

```typescript
// BEFORE (Next.js 14) - DEPRECATED
export default function Page({ params, searchParams }) {
  const id = params.id;  // Sync access
  const query = searchParams.q;
}

// AFTER (Next.js 15) - REQUIRED
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  
  return <div>Product: {id}</div>;
}
```

### Async cookies() and headers()

```typescript
// BEFORE (Next.js 14) - DEPRECATED
import { cookies, headers } from "next/headers";

export default function Page() {
  const cookieStore = cookies();
  const headersList = headers();
}

// AFTER (Next.js 15) - REQUIRED
import { cookies, headers } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  const theme = cookieStore.get("theme")?.value;
  const userAgent = headersList.get("user-agent");
}
```

## Directory Structure

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx           # Home page (/)
├── loading.tsx        # Loading UI
├── error.tsx          # Error boundary
├── not-found.tsx      # 404 page
├── global-error.tsx   # Global error boundary
│
├── (marketing)/       # Route group (no URL segment)
│   ├── layout.tsx     # Marketing layout
│   ├── page.tsx       # Still maps to /
│   ├── about/
│   │   └── page.tsx   # /about
│   └── blog/
│       ├── page.tsx   # /blog
│       └── [slug]/
│           └── page.tsx  # /blog/:slug
│
├── (dashboard)/       # Another route group
│   ├── layout.tsx     # Dashboard layout
│   └── dashboard/
│       └── page.tsx   # /dashboard
│
├── api/               # API routes
│   └── route.ts       # /api
│
└── [...catchAll]/     # Catch-all route
    └── page.tsx       # Matches any path
```

## File Conventions

### page.tsx - Route UI

```typescript
// app/products/page.tsx
// Makes the route publicly accessible

export default function ProductsPage() {
  return <h1>Products</h1>;
}

// With metadata
export const metadata = {
  title: "Products",
};

// With dynamic metadata
export async function generateMetadata({ params }) {
  return {
    title: `Products - Page ${params.page}`,
  };
}
```

### layout.tsx - Shared UI

```typescript
// app/layout.tsx - Root Layout (required)
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

// Nested layout - app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### loading.tsx - Loading UI

```typescript
// app/dashboard/loading.tsx
// Automatically wraps page in Suspense

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

// Skeleton loading for specific content
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

### error.tsx - Error Boundary

```typescript
// app/dashboard/error.tsx
"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### template.tsx - Re-render on Navigation

```typescript
// app/dashboard/template.tsx
// Unlike layouts, templates re-mount on navigation

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in duration-300">
      {children}
    </div>
  );
}
```

## Server vs Client Components

### Server Components (Default)

```typescript
// app/products/page.tsx
// Server Component by default - can fetch data directly

import { prisma } from "@/lib/db";

export default async function ProductsPage() {
  const products = await prisma.product.findMany();
  
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### Client Components

```typescript
// components/counter.tsx
"use client"; // Opt-in to client-side rendering

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment
      </Button>
    </div>
  );
}
```

### Composition Pattern

```typescript
// app/dashboard/page.tsx (Server Component)
import { prisma } from "@/lib/db";
import { InteractiveChart } from "@/components/interactive-chart";

export default async function DashboardPage() {
  const data = await prisma.analytics.findMany();
  
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass server data to client component */}
      <InteractiveChart data={data} />
    </div>
  );
}

// components/interactive-chart.tsx
"use client";

import { useState } from "react";

export function InteractiveChart({ data }) {
  const [filter, setFilter] = useState("all");
  // Interactive client-side logic
}
```

## Metadata API

```typescript
// Static metadata
export const metadata = {
  title: "My App",
  description: "App description",
};

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      images: [product.image],
    },
  };
}
```

## Route Segment Config

```typescript
// app/products/page.tsx

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Force static rendering
export const dynamic = "force-static";

// Revalidate every 60 seconds
export const revalidate = 60;

// Customize runtime
export const runtime = "edge"; // or 'nodejs'

// Maximum request duration
export const maxDuration = 30; // seconds
```

## Anti-patterns

### Don't Fetch in Layouts for Child Data

```typescript
// BAD - Fetching child-specific data in layout
export default async function Layout({ children }) {
  const user = await getUser(); // Every child re-fetches
  return <div>{children}</div>;
}

// GOOD - Fetch in the specific page/component that needs it
export default async function ProfilePage() {
  const user = await getUser();
  return <Profile user={user} />;
}
```

### Don't Mix Server and Client Boundaries Incorrectly

```typescript
// BAD - Trying to use hooks in Server Component
export default async function Page() {
  const [state, setState] = useState(); // Error!
}

// GOOD - Separate concerns
export default async function Page() {
  const data = await getData();
  return <ClientComponent initialData={data} />;
}
```

## Related Skills

- [parallel-routes](./parallel-routes.md)
- [intercepting-routes](./intercepting-routes.md)
- [dynamic-routes](./dynamic-routes.md)
- [route-groups](./route-groups.md)
- [catch-all](./catch-all.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Next.js 15 async API updates
- File conventions documentation
- Server/Client component patterns
