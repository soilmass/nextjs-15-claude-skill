---
id: pt-not-found
name: Not Found Pattern
version: 2.0.0
layer: L5
category: errors
description: Custom 404 pages and handling in Next.js 15 using not-found.tsx files
tags: [errors, 404, not-found, navigation]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-text.md
dependencies: []
formula: not-found.tsx + notFound() + Helpful Navigation = User-Friendly 404
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Creating custom 404 pages for the entire app
- Building route-specific not-found pages
- Triggering 404 programmatically with notFound()
- Showing suggestions for similar content
- Hiding private routes from unauthorized users

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Not Found Handling Flow                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                       │
│  │ User Request    │                                       │
│  │ /products/xyz   │                                       │
│  └────────┬────────┘                                       │
│           │                                                 │
│  ┌────────▼────────┐    ┌──────────────────────────────┐   │
│  │ Page Component  │───▶│ Database Lookup              │   │
│  │ (Server)        │    │ product = await getProduct() │   │
│  └────────┬────────┘    └──────────────┬───────────────┘   │
│           │                            │                    │
│           │                  ┌─────────▼─────────┐         │
│           │                  │ if (!product)     │         │
│           │                  │   notFound()      │         │
│           │                  └─────────┬─────────┘         │
│           │                            │                    │
│  ┌────────▼────────────────────────────▼───────────────┐   │
│  │ Not Found Resolution                                │   │
│  │                                                     │   │
│  │ 1. Check /products/not-found.tsx (route-specific)  │   │
│  │ 2. Check /app/not-found.tsx (app fallback)         │   │
│  │ 3. Default Next.js 404                             │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────▼───────────────────────────┐   │
│  │ not-found.tsx Content                               │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ - Contextual message                            │ │   │
│  │ │ - Search functionality                          │ │   │
│  │ │ - Suggested content                             │ │   │
│  │ │ - Navigation back to safety                     │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

# Not Found Pattern

## Overview

Custom 404 pages and handling in Next.js 15 using `not-found.tsx` files and the `notFound()` function for graceful handling of missing resources.

## Implementation

### Root Not Found Page

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        {/* Illustration */}
        <div className="mx-auto mb-8 w-64">
          <svg
            viewBox="0 0 400 300"
            className="text-gray-200"
            fill="currentColor"
          >
            {/* Custom 404 illustration SVG */}
            <text x="50%" y="50%" textAnchor="middle" className="text-8xl font-bold">
              404
            </text>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Page not found
        </h1>
        
        <p className="mt-4 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
```

### Route Segment Not Found

```typescript
// app/products/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Package className="mx-auto h-16 w-16 text-gray-400" />
        
        <h2 className="mt-4 text-2xl font-semibold">
          Product not found
        </h2>
        
        <p className="mt-2 text-gray-600">
          The product you're looking for doesn't exist or has been removed.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Using notFound() in Pages

```typescript
// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

### Using notFound() in Server Components

```typescript
// components/product-details.tsx
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/data/products';

interface ProductDetailsProps {
  productId: string;
}

export async function ProductDetails({ productId }: ProductDetailsProps) {
  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  if (!product.published) {
    notFound(); // Also handle unpublished products
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-gray-600">{product.description}</p>
      <p className="text-xl font-semibold">${product.price}</p>
    </div>
  );
}
```

### Not Found with Suggestions

```typescript
// app/blog/not-found.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function BlogNotFound() {
  // Fetch recent posts as suggestions
  const recentPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { slug: true, title: true },
  });

  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-3xl font-bold">Post not found</h1>
      
      <p className="mt-4 text-gray-600">
        The blog post you're looking for doesn't exist.
      </p>

      {recentPosts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Recent posts</h2>
          <ul className="mt-4 space-y-2">
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/blog"
        className="mt-8 inline-block text-blue-600 hover:underline"
      >
        View all posts
      </Link>
    </div>
  );
}
```

### Not Found with Search

```typescript
// app/docs/not-found.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function DocsNotFound() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/docs/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      
      <p className="mt-4 text-gray-600">
        The documentation page you're looking for doesn't exist.
      </p>

      <form onSubmit={handleSearch} className="mt-8">
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="mt-8 text-sm text-gray-500">
        <p>Popular topics:</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {['Getting Started', 'API Reference', 'Examples'].map((topic) => (
            <a
              key={topic}
              href={`/docs/search?q=${encodeURIComponent(topic)}`}
              className="rounded-full bg-gray-100 px-3 py-1 hover:bg-gray-200"
            >
              {topic}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Conditional Not Found Based on User

```typescript
// app/admin/[...path]/page.tsx
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const session = await getSession();
  
  // For non-admin users, show 404 instead of 403
  // This hides the existence of admin routes
  if (!session || session.role !== 'admin') {
    notFound();
  }

  const { path } = await params;
  // Render admin page...
  
  return <div>Admin: {path.join('/')}</div>;
}
```

### Not Found with Analytics

```typescript
// app/not-found.tsx
import { headers } from 'next/headers';
import Link from 'next/link';

async function trackNotFound() {
  const headersList = await headers();
  const referer = headersList.get('referer');
  const url = headersList.get('x-url') ?? 'unknown';

  // Track 404 for analytics
  await fetch(`${process.env.ANALYTICS_URL}/404`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      referer,
      timestamp: new Date().toISOString(),
    }),
  }).catch(console.error);
}

export default async function NotFound() {
  await trackNotFound();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-4">Page not found</p>
        <Link href="/" className="mt-8 inline-block text-blue-600">
          Go home
        </Link>
      </div>
    </div>
  );
}
```

### Dynamic Catch-All with Not Found

```typescript
// app/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const path = '/' + slug.join('/');

  // Try to find a page with this path
  const page = await prisma.page.findUnique({
    where: { path },
  });

  if (!page) {
    // Check if it's a redirect
    const redirect = await prisma.redirect.findUnique({
      where: { from: path },
    });

    if (redirect) {
      // Handle redirect
      const { redirect: redirectFn } = await import('next/navigation');
      redirectFn(redirect.to);
    }

    notFound();
  }

  return (
    <div>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
```

### API Route Not Found

```typescript
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return NextResponse.json(
      { 
        error: 'Not Found',
        message: `Product with ID '${id}' not found`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}
```

## Variants

### With Language Support

```typescript
// app/[locale]/not-found.tsx
import { getDictionary } from '@/lib/i18n';

export default async function NotFound({
  params,
}: {
  params: { locale: string };
}) {
  const dict = await getDictionary(params.locale);

  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold">{dict.notFound.title}</h1>
      <p className="mt-4">{dict.notFound.description}</p>
    </div>
  );
}
```

### With Brand Styling

```typescript
// app/not-found.tsx
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white">
      <div className="text-center">
        <Image
          src="/404-illustration.svg"
          alt="Page not found"
          width={400}
          height={300}
          priority
        />
        <h1 className="mt-8 text-3xl font-bold text-brand-900">
          Oops! Page not found
        </h1>
        {/* ... */}
      </div>
    </div>
  );
}
```

## Anti-patterns

```typescript
// BAD: Returning null instead of notFound()
async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) return null; // Shows blank page!
  return <Product data={product} />;
}

// GOOD: Use notFound()
async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound(); // Shows not-found.tsx
  return <Product data={product} />;
}

// BAD: Generic 404 with no context
export default function NotFound() {
  return <div>404</div>;
}

// GOOD: Helpful 404 with navigation options
export default function NotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>Here are some helpful links:</p>
      <nav>{/* Links */}</nav>
    </div>
  );
}

// BAD: Leaking private routes
if (!session?.isAdmin) {
  throw new Error('Forbidden'); // Reveals admin route exists
}

// GOOD: Hide private routes
if (!session?.isAdmin) {
  notFound(); // Pretend route doesn't exist
}
```

## Related Patterns

- `global-error.md` - Error handling
- `error-boundaries.md` - React error boundaries
- `dynamic-routes.md` - Dynamic routing
- `catch-all.md` - Catch-all routes

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial not found pattern
