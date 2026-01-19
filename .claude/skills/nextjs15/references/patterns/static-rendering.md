---
id: pt-static-rendering
name: Static Rendering
version: 2.0.0
layer: L5
category: performance
description: Pre-render pages at build time for optimal performance
tags: [render, static, ssg, performance, next15]
composes: []
dependencies: []
formula: "static_rendering = build_time_generation + generateStaticParams + ISR_revalidation + use_cache"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Static Rendering

## Overview

Static rendering (SSG) pre-renders pages at build time, resulting in HTML files that can be cached by CDNs. This provides the best performance for content that doesn't change frequently. Next.js 15 statically renders pages by default when there's no dynamic data.

## When to Use

- **Marketing pages**: Homepage, pricing, about, contact pages
- **Blog posts**: Articles that change infrequently
- **Product catalogs**: Product listings with periodic updates
- **Documentation**: Static docs with version-based updates
- **Legal pages**: Privacy policy, terms of service

## Composition Diagram

```
+------------------+
|   Build Time     |
+------------------+
          |
          v
+------------------+     +------------------+
| generateStatic   | --> | Static HTML      |
| Params           |     | Generation       |
+------------------+     +------------------+
          |                       |
          v                       v
+------------------+     +------------------+
| Data Fetching    |     | CDN Cache        |
| (cached)         |     | (edge delivery)  |
+------------------+     +------------------+
          |
          v
+------------------+     +------------------+
| ISR Revalidation | <-- | On-Demand or     |
| (optional)       |     | Time-Based       |
+------------------+     +------------------+
```

## Basic Static Page

```typescript
// app/about/page.tsx
// This page is automatically statically rendered
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold">About Us</h1>
      <p className="mt-4 text-muted-foreground">
        We're a team dedicated to building great products.
      </p>
    </div>
  );
}

// app/privacy/page.tsx
// Explicitly mark as static (optional, this is the default)
export const dynamic = 'force-static';

export default function PrivacyPage() {
  return (
    <div className="prose max-w-4xl mx-auto py-12">
      <h1>Privacy Policy</h1>
      <p>Last updated: January 2025</p>
      {/* Static content */}
    </div>
  );
}
```

## Static Generation with Data

```typescript
// app/posts/page.tsx
import { prisma } from '@/lib/db';
import { PostCard } from '@/components/post-card';

// Revalidate every hour
export const revalidate = 3600;

async function getPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

## generateStaticParams

```typescript
// app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { PostContent } from '@/components/post-content';

// Generate static paths at build time
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

// Revalidate every hour
export const revalidate = 3600;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: true,
      tags: true,
    },
  });

  if (!post) notFound();

  return <PostContent post={post} />;
}
```

## Incremental Static Regeneration (ISR)

```typescript
// app/products/page.tsx
import { prisma } from '@/lib/db';

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// app/products/[id]/page.tsx
export async function generateStaticParams() {
  // Generate paths for most popular products
  const products = await prisma.product.findMany({
    where: { featured: true },
    select: { id: true },
  });

  return products.map((product) => ({
    id: product.id,
  }));
}

// Allow dynamic rendering for non-generated paths
export const dynamicParams = true;

// Revalidate individual product pages
export const revalidate = 300; // 5 minutes

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
```

## Static with 'use cache'

```typescript
// lib/data.ts
import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/db';

export async function getFeaturedProducts() {
  'use cache';
  cacheLife('hours');
  cacheTag('featured-products');

  return prisma.product.findMany({
    where: { featured: true },
    take: 6,
  });
}

export async function getCategories() {
  'use cache';
  cacheLife('days'); // Categories rarely change
  cacheTag('categories');

  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
}

// app/page.tsx
import { getFeaturedProducts, getCategories } from '@/lib/data';

export default async function HomePage() {
  // Both functions are cached
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      <FeaturedProducts products={products} />
      <Categories categories={categories} />
    </>
  );
}
```

## Static Generation for Marketing Pages

```typescript
// app/(marketing)/layout.tsx
// All marketing pages are static
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

// app/(marketing)/pricing/page.tsx
import { PricingTable } from '@/components/pricing-table';
import { FAQ } from '@/components/faq';

// Static pricing data
const plans = [
  {
    name: 'Free',
    price: 0,
    features: ['5 projects', 'Basic support'],
  },
  {
    name: 'Pro',
    price: 29,
    features: ['Unlimited projects', 'Priority support', 'Analytics'],
  },
  {
    name: 'Enterprise',
    price: null, // Contact for pricing
    features: ['Custom solutions', 'Dedicated support', 'SLA'],
  },
];

const faqs = [
  { question: 'Can I cancel anytime?', answer: 'Yes, no contracts.' },
  { question: 'Do you offer refunds?', answer: 'Yes, 30-day guarantee.' },
];

export default function PricingPage() {
  return (
    <>
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-muted-foreground">
          Choose the plan that works for you
        </p>
      </section>

      <PricingTable plans={plans} />
      <FAQ items={faqs} />
    </>
  );
}
```

## Building Static Exports

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Enables static export

  // Required for static export
  images: {
    unoptimized: true, // Can't use Next.js image optimization
  },

  // Optional: trailing slashes
  trailingSlash: true,
};

export default nextConfig;

// For partial static export (specific pages)
// Use generateStaticParams and set dynamicParams = false
```

## Static with CMS Content

```typescript
// lib/cms.ts
interface CMSPost {
  slug: string;
  title: string;
  content: string;
  publishedAt: string;
}

export async function getAllPosts(): Promise<CMSPost[]> {
  // Fetch from headless CMS (Sanity, Contentful, etc.)
  const response = await fetch(
    `${process.env.CMS_URL}/api/posts`,
    { next: { revalidate: 3600 } } // Cache for 1 hour
  );
  return response.json();
}

export async function getPostBySlug(slug: string): Promise<CMSPost | null> {
  const response = await fetch(
    `${process.env.CMS_URL}/api/posts/${slug}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) return null;
  return response.json();
}

// app/blog/[slug]/page.tsx
import { getAllPosts, getPostBySlug } from '@/lib/cms';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="prose max-w-4xl mx-auto">
      <h1>{post.title}</h1>
      <time dateTime={post.publishedAt}>
        {new Date(post.publishedAt).toLocaleDateString()}
      </time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

## Anti-patterns

### Don't Use Dynamic Data Without Revalidation

```typescript
// BAD - Fetches at request time (becomes dynamic)
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store', // Forces dynamic rendering!
  });
}

// GOOD - Use revalidation for fresh but cached data
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }, // Cached, revalidates hourly
  });
}
```

### Don't Access Request-Time Data

```typescript
// BAD - Using cookies/headers makes page dynamic
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies(); // Dynamic!
  const theme = cookieStore.get('theme');
}

// GOOD - Move to client component or use static defaults
export default function Page() {
  return (
    <ClientThemeWrapper>
      <StaticContent />
    </ClientThemeWrapper>
  );
}
```

## Related Skills

- [dynamic-rendering](./dynamic-rendering.md)
- [isr](./isr.md)
- [ppr](./ppr.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- generateStaticParams
- ISR patterns
- 'use cache' integration
- CMS content
- Static export
