---
id: pt-dynamic-routes
name: Dynamic Routes
version: 2.1.0
layer: L5
category: routing
description: Create dynamic URL segments with parameters for user-specific, content-specific, or data-driven pages
tags: [routing, dynamic-routes, params, segments, next15]
composes: []
dependencies: []
formula: "Dynamic Route = [param]/ + page.tsx + generateStaticParams() + generateMetadata()"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Dynamic Routes

## When to Use

- **Content pages**: Blog posts, products, user profiles with unique URLs
- **Data-driven URLs**: URLs that map to database records
- **SEO optimization**: Meaningful URLs for search engines
- **Shareable links**: Each item has its own URL for sharing

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Dynamic Route Flow                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  URL: /products/electronics/laptop-pro-15                   │
│        │           │              │                         │
│        │           │              └── [slug] = "laptop-15"  │
│        │           └── [category] = "electronics"           │
│        └── products (static)                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ app/products/[category]/[slug]/                     │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ page.tsx                                     │   │   │
│  │  │                                             │   │   │
│  │  │  async function Page({ params }) {          │   │   │
│  │  │    const { category, slug } = await params; │   │   │
│  │  │    const product = await getProduct(slug);  │   │   │
│  │  │    return <ProductDetail product={product}/>│   │   │
│  │  │  }                                          │   │   │
│  │  │                                             │   │   │
│  │  │  generateStaticParams() ──► Build Time     │   │   │
│  │  │  generateMetadata() ──────► SEO/OG Tags    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌───────────────┐  ┌───────────────┐              │   │
│  │  │ loading.tsx   │  │ not-found.tsx │              │   │
│  │  │ (Skeleton)    │  │ (404 UI)      │              │   │
│  │  └───────────────┘  └───────────────┘              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Dynamic Routes allow you to create pages where the URL segments are determined by data. In Next.js 15, `params` is now a Promise that must be awaited before accessing its values.

## Next.js 15 Breaking Change

```typescript
// BEFORE (Next.js 14) - DEPRECATED
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;  // Direct access
}

// AFTER (Next.js 15) - REQUIRED
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;  // Await params
}
```

## Convention

| Syntax | Route | Matches |
|--------|-------|---------|
| `[slug]` | `/blog/[slug]` | `/blog/hello-world` |
| `[...slug]` | `/blog/[...slug]` | `/blog/a/b/c` |
| `[[...slug]]` | `/blog/[[...slug]]` | `/blog` or `/blog/a/b` |
| `[id]/[slug]` | `/products/[id]/[slug]` | `/products/123/cool-shirt` |

## Single Dynamic Segment

### Directory Structure

```
app/
└── blog/
    └── [slug]/
        ├── page.tsx
        ├── loading.tsx
        └── not-found.tsx
```

### Implementation

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/blog";
import { BlogPost } from "@/components/organisms/blog-post";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
}

// Generate static params at build time
export async function generateStaticParams() {
  const posts = await getPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Dynamic metadata
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}
```

## Multiple Dynamic Segments

### Directory Structure

```
app/
└── shop/
    └── [category]/
        └── [productId]/
            └── page.tsx
```

### Implementation

```typescript
// app/shop/[category]/[productId]/page.tsx
interface ProductPageProps {
  params: Promise<{
    category: string;
    productId: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, productId } = await params;
  
  const product = await getProduct(productId);
  const relatedProducts = await getRelatedProducts(category, productId);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/shop">Shop</BreadcrumbItem>
        <BreadcrumbItem href={`/shop/${category}`}>
          {formatCategory(category)}
        </BreadcrumbItem>
        <BreadcrumbItem>{product.name}</BreadcrumbItem>
      </Breadcrumb>
      
      <ProductDetail product={product} />
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}

// Generate static params for all category/product combinations
export async function generateStaticParams() {
  const products = await getAllProducts();
  
  return products.map((product) => ({
    category: product.category.slug,
    productId: product.id,
  }));
}
```

## Catch-All Dynamic Segments

### Optional Catch-All

```
app/
└── docs/
    └── [[...slug]]/
        └── page.tsx
```

```typescript
// app/docs/[[...slug]]/page.tsx
// Matches: /docs, /docs/getting-started, /docs/api/auth/login

interface DocsPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  
  // /docs -> slug = undefined
  // /docs/getting-started -> slug = ['getting-started']
  // /docs/api/auth/login -> slug = ['api', 'auth', 'login']
  
  const path = slug?.join('/') || 'index';
  const doc = await getDoc(path);

  return <DocContent doc={doc} />;
}

export async function generateStaticParams() {
  const allDocs = await getAllDocPaths();
  
  return [
    { slug: undefined },  // /docs
    ...allDocs.map((path) => ({
      slug: path.split('/'),
    })),
  ];
}
```

### Required Catch-All

```
app/
└── files/
    └── [...path]/
        └── page.tsx
```

```typescript
// app/files/[...path]/page.tsx
// Matches: /files/a, /files/a/b/c (NOT /files)

interface FilesPageProps {
  params: Promise<{ path: string[] }>;
}

export default async function FilesPage({ params }: FilesPageProps) {
  const { path } = await params;
  
  // /files/documents/report.pdf -> path = ['documents', 'report.pdf']
  
  const fullPath = path.join('/');
  const file = await getFile(fullPath);

  return <FileViewer file={file} />;
}
```

## Client Component with Dynamic Params

```typescript
// app/products/[id]/page.tsx
import { ProductClient } from "./product-client";
import { getProduct } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  return <ProductClient product={product} />;
}

// app/products/[id]/product-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProductClient({ product }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // Client-side interactivity
  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    router.push("/cart");
  };

  return (
    // Interactive product UI
  );
}
```

## Using params in Client Components

```typescript
// For client components that need params directly
"use client";

import { use } from "react";
import { useParams } from "next/navigation";

// Option 1: Use React's `use` hook with params prop
export function ProductModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // ...
}

// Option 2: Use the useParams hook
export function ProductDetails() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  // ...
}
```

## With Search Params

```typescript
// app/products/[category]/page.tsx
interface ProductsPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    filter?: string;
  }>;
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { category } = await params;
  const { page = "1", sort = "newest", filter } = await searchParams;

  const products = await getProducts({
    category,
    page: parseInt(page),
    sort,
    filter: filter?.split(","),
  });

  return (
    <div>
      <ProductFilters category={category} />
      <ProductGrid products={products} />
      <Pagination
        currentPage={parseInt(page)}
        totalPages={products.totalPages}
      />
    </div>
  );
}
```

## Nested Dynamic Routes with Layouts

```
app/
└── users/
    └── [userId]/
        ├── layout.tsx        # Shared user layout
        ├── page.tsx          # User profile
        ├── posts/
        │   └── page.tsx      # User's posts
        ├── followers/
        │   └── page.tsx      # User's followers
        └── settings/
            └── page.tsx      # User settings (if authorized)
```

```typescript
// app/users/[userId]/layout.tsx
import { notFound } from "next/navigation";
import { getUser } from "@/lib/users";
import { UserHeader } from "@/components/user-header";
import { UserNav } from "@/components/user-nav";

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}

export default async function UserLayout({
  children,
  params,
}: UserLayoutProps) {
  const { userId } = await params;
  const user = await getUser(userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="container py-8">
      <UserHeader user={user} />
      <UserNav userId={userId} />
      <main className="mt-6">{children}</main>
    </div>
  );
}
```

## Type-Safe Dynamic Routes

```typescript
// lib/routes.ts
// Define route types for type safety

export type Routes = {
  blog: {
    index: "/blog";
    post: `/blog/${string}`;
  };
  products: {
    category: `/products/${string}`;
    detail: `/products/${string}/${string}`;
  };
};

// Helper functions
export function blogPostRoute(slug: string): Routes["blog"]["post"] {
  return `/blog/${slug}`;
}

export function productRoute(
  category: string,
  productId: string
): Routes["products"]["detail"] {
  return `/products/${category}/${productId}`;
}

// Usage
import Link from "next/link";
import { blogPostRoute } from "@/lib/routes";

<Link href={blogPostRoute(post.slug)}>{post.title}</Link>
```

## Anti-patterns

### Don't Use Dynamic Routes for Static Content

```typescript
// BAD - Dynamic route for known paths
app/pages/[page]/page.tsx
// /pages/about, /pages/contact, /pages/terms

// GOOD - Static routes for known paths
app/about/page.tsx
app/contact/page.tsx
app/terms/page.tsx
```

### Don't Forget Error Handling

```typescript
// BAD - No null check
export default async function Page({ params }) {
  const { id } = await params;
  const data = await getData(id);
  return <div>{data.title}</div>;  // Crashes if data is null
}

// GOOD - Handle missing data
export default async function Page({ params }) {
  const { id } = await params;
  const data = await getData(id);
  
  if (!data) {
    notFound();
  }
  
  return <div>{data.title}</div>;
}
```

## Related Skills

- [app-router](./app-router.md)
- [catch-all](./catch-all.md)
- [route-groups](./route-groups.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Next.js 15 async params
- Multiple segment patterns
- Type-safe routes
