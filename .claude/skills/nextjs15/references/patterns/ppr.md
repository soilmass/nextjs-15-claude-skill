---
id: pt-ppr
name: Partial Prerendering (PPR)
version: 2.0.0
layer: L5
category: performance
description: Combine static shells with dynamic content using Next.js 15 Partial Prerendering
tags: [data, ppr, static, dynamic, streaming, next15]
composes: []
dependencies: []
formula: "ppr = static_shell + suspense_boundaries + dynamic_holes + streaming_ssr"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Partial Prerendering (PPR)

## Overview

Partial Prerendering (PPR) is an experimental Next.js 15 feature that combines static and dynamic rendering in the same route. The static shell is served instantly from the edge while dynamic content streams in. This gives you the best of both worlds: instant initial load with personalized content.

## When to Use

- **E-commerce pages**: Static product info + dynamic inventory/pricing
- **Dashboards**: Static layout + personalized data
- **Content sites**: Static articles + dynamic comments/recommendations
- **Landing pages**: Static marketing + personalized CTAs
- **Auth-aware pages**: Static shell + user-specific content

## Composition Diagram

```
+------------------+
|   PPR Request    |
+------------------+
          |
          v
+------------------+     +------------------+
| Static Shell     | --> | Instant TTFB     |
| (edge cached)    |     | (0ms latency)    |
+------------------+     +------------------+
          |
          v
+------------------+
| Suspense Boundary|
+------------------+
          |
    +-----+-----+
    |           |
    v           v
+--------+  +--------+
|Fallback|  |Dynamic |
|(shown  |  |Content |
|first)  |  |(streams|
+--------+  | in)    |
            +--------+
                |
                v
          +----------+
          |Personalized|
          |  Content   |
          +----------+
```

## Enable PPR

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    ppr: true,
    // Or enable incrementally per-route
    ppr: 'incremental',
  },
};

export default config;
```

## Basic PPR Pattern

```typescript
// app/page.tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';

// Static shell - prerendered at build time
function StaticHeader() {
  return (
    <header className="border-b p-4">
      <h1 className="text-2xl font-bold">My Store</h1>
      <nav>{/* Static navigation */}</nav>
    </header>
  );
}

// Dynamic content - streams in at request time
async function PersonalizedGreeting() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  if (!userId) {
    return <p>Welcome, guest!</p>;
  }
  
  const user = await getUser(userId);
  return <p>Welcome back, {user.name}!</p>;
}

async function CartPreview() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  
  if (!cartId) {
    return <span>Cart (0)</span>;
  }
  
  const cart = await getCart(cartId);
  return <span>Cart ({cart.items.length})</span>;
}

export default function HomePage() {
  return (
    <div>
      {/* Static shell renders immediately */}
      <StaticHeader />
      
      {/* Dynamic content streams in */}
      <Suspense fallback={<p>Loading...</p>}>
        <PersonalizedGreeting />
      </Suspense>
      
      <Suspense fallback={<span>Cart (...)</span>}>
        <CartPreview />
      </Suspense>
      
      {/* More static content */}
      <main>
        <HeroSection />
        <FeaturedProducts />
      </main>
    </div>
  );
}

// Enable PPR for this route
export const experimental_ppr = true;
```

## PPR with Dynamic Data

```typescript
// app/products/[id]/page.tsx
import { Suspense } from 'react';
import { unstable_noStore } from 'next/cache';

// Static product info (from generateStaticParams)
async function ProductInfo({ id }: { id: string }) {
  const product = await getProduct(id);
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="text-2xl font-bold">${product.price}</p>
    </div>
  );
}

// Dynamic inventory (real-time)
async function InventoryStatus({ id }: { id: string }) {
  unstable_noStore(); // Mark as dynamic
  
  const inventory = await getInventory(id);
  return (
    <div className={inventory.inStock ? 'text-green-600' : 'text-red-600'}>
      {inventory.inStock 
        ? `${inventory.quantity} in stock` 
        : 'Out of stock'}
    </div>
  );
}

// Dynamic personalized recommendations
async function Recommendations({ id }: { id: string }) {
  unstable_noStore();
  
  const recs = await getPersonalizedRecommendations(id);
  return (
    <div className="mt-8">
      <h2>You might also like</h2>
      <div className="grid grid-cols-4 gap-4">
        {recs.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      {/* Static shell */}
      <ProductInfo id={id} />
      
      {/* Dynamic holes */}
      <Suspense fallback={<div>Checking stock...</div>}>
        <InventoryStatus id={id} />
      </Suspense>
      
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations id={id} />
      </Suspense>
    </div>
  );
}

// Pre-render product pages
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export const experimental_ppr = true;
```

## Dashboard with PPR

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';

// Static shell
function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b p-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}

// Dynamic user-specific stats
async function UserStats() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  if (!userId) {
    return null;
  }
  
  const stats = await getUserStats(userId);
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatCard title="Revenue" value={stats.revenue} />
      <StatCard title="Orders" value={stats.orders} />
      <StatCard title="Customers" value={stats.customers} />
      <StatCard title="Conversion" value={stats.conversion} />
    </div>
  );
}

// Dynamic activity feed
async function ActivityFeed() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  const activity = await getRecentActivity(userId);
  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-semibold mb-4">Recent Activity</h2>
      {activity.map((item) => (
        <ActivityItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<StatsSkeleton />}>
        <UserStats />
      </Suspense>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <AnalyticsChart />
        </Suspense>
        
        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityFeed />
        </Suspense>
      </div>
    </DashboardShell>
  );
}

export const experimental_ppr = true;
```

## PPR with Auth

```typescript
// app/layout.tsx with PPR
import { Suspense } from 'react';
import { cookies } from 'next/headers';

// Static nav structure
function NavShell({ children }: { children: React.ReactNode }) {
  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Logo />
      <div className="flex items-center gap-4">
        <NavLinks />
        {children}
      </div>
    </nav>
  );
}

// Dynamic auth state
async function AuthButton() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  
  if (!session) {
    return (
      <div className="flex gap-2">
        <a href="/login" className="btn-ghost">Sign in</a>
        <a href="/register" className="btn-primary">Get Started</a>
      </div>
    );
  }
  
  const user = await getUser(session);
  return (
    <div className="flex items-center gap-2">
      <Avatar user={user} />
      <UserMenu user={user} />
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NavShell>
          <Suspense fallback={<AuthButtonSkeleton />}>
            <AuthButton />
          </Suspense>
        </NavShell>
        {children}
      </body>
    </html>
  );
}
```

## Forcing Dynamic Content

```typescript
// Use these to mark content as dynamic

// 1. Using cookies() or headers()
import { cookies, headers } from 'next/headers';

async function DynamicComponent() {
  const cookieStore = await cookies();  // Makes component dynamic
  // ...
}

// 2. Using unstable_noStore
import { unstable_noStore } from 'next/cache';

async function DynamicData() {
  unstable_noStore();  // Opts out of static rendering
  const data = await fetch('/api/realtime');
  return <div>{data}</div>;
}

// 3. Using connection()
import { connection } from 'next/server';

async function DynamicComponent() {
  await connection();  // Waits for request
  // Dynamic content here
}
```

## Build Output with PPR

```bash
# Build output shows static shell + dynamic fallback
Route (app)              Size     First Load JS
├ ○ /                    5.2 kB   89.5 kB
│   └ ◐ PPR             
├ ○ /products/[id]       4.8 kB   89.1 kB
│   └ ◐ PPR             
└ ƒ /api/data            0 B      0 B

○  (Static)   prerendered as static HTML
◐  (PPR)      prerendered with streaming fallback
ƒ  (Dynamic)  server-rendered on demand
```

## PPR Considerations

### What Gets Prerendered

- Components without dynamic dependencies
- Static layouts and shells
- Default fallbacks for Suspense

### What Streams In

- Components using cookies()/headers()
- Components with unstable_noStore()
- Components fetching user-specific data

### Benefits

- Instant TTFB from edge
- Personalized content without losing caching
- Smooth progressive loading
- Better Core Web Vitals

## Anti-patterns

### Don't Make Everything Dynamic

```typescript
// BAD - All content dynamic
export default async function Page() {
  const session = await cookies();  // Makes everything dynamic
  
  return (
    <div>
      <StaticContent />  {/* Could have been prerendered! */}
      <UserContent session={session} />
    </div>
  );
}

// GOOD - Isolate dynamic content
export default function Page() {
  return (
    <div>
      <StaticContent />  {/* Prerendered */}
      <Suspense fallback={<Loading />}>
        <DynamicUserContent />  {/* Streams in */}
      </Suspense>
    </div>
  );
}
```

## Related Skills

- [streaming](./streaming.md)
- [server-components-data](./server-components-data.md)
- [data-cache](./data-cache.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Basic PPR patterns
- Auth integration
- Dynamic content isolation
