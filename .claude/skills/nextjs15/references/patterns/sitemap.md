---
id: pt-sitemap
name: Sitemap Generation
version: 2.0.0
layer: L5
category: seo
description: Generate XML sitemaps dynamically for SEO with Next.js 15
tags: [seo, sitemap, xml, indexing, next15]
composes: []
dependencies: []
formula: sitemap.ts + Database Query + Pagination + Revalidation = Search Engine Indexing
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

- Helping search engines discover and index all your public pages
- Creating dynamic sitemaps from database content (posts, products)
- Implementing sitemap index for large sites with 50,000+ URLs
- Adding image and video sitemaps for media-rich content
- Building internationalized sitemaps with hreflang alternates

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SITEMAP GENERATION                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Data Sources                             │      │
│  │  ┌───────────────┐  ┌───────────────────────────┐   │      │
│  │  │ Static Pages  │  │   Database (Prisma)       │   │      │
│  │  │ /, /about     │  │   posts, products, users  │   │      │
│  │  └───────────────┘  └───────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              app/sitemap.ts                           │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  export default async function sitemap()        │ │      │
│  │  │    : Promise<MetadataRoute.Sitemap> {           │ │      │
│  │  │    return [{ url, lastModified, priority }]     │ │      │
│  │  │  }                                              │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Sitemap Variants                         │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │      │
│  │  │   Basic      │  │  Paginated   │  │   Index    │ │      │
│  │  │  (< 50k)     │  │  (per 10k)   │  │ (multiple) │ │      │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │      │
│  │  │   Images     │  │   Videos     │  │   i18n     │ │      │
│  │  │  (product)   │  │  (media)     │  │ (hreflang) │ │      │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Output: /sitemap.xml                     │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  <?xml version="1.0" encoding="UTF-8"?>         │ │      │
│  │  │  <urlset xmlns="...">                           │ │      │
│  │  │    <url><loc>...</loc></url>                    │ │      │
│  │  │  </urlset>                                      │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Sitemap Generation

## Overview

Sitemaps help search engines discover and index your pages efficiently. Next.js 15 supports both static and dynamic sitemap generation through the `sitemap.ts` file convention.

## Basic Sitemap

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://acme.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://acme.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://acme.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://acme.com/products",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
```

## Dynamic Sitemap with Database

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://acme.com";

  // Fetch all dynamic content
  const [posts, products, categories] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Products
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Categories
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/products/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...productPages, ...categoryPages];
}
```

## Multiple Sitemaps (Sitemap Index)

For large sites, split into multiple sitemaps:

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://acme.com/sitemap-static.xml",
      lastModified: new Date(),
    },
    {
      url: "https://acme.com/sitemap-blog.xml",
      lastModified: new Date(),
    },
    {
      url: "https://acme.com/sitemap-products.xml",
      lastModified: new Date(),
    },
  ];
}

// app/sitemap-static.xml/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const staticPages = [
    { url: "https://acme.com", priority: 1.0 },
    { url: "https://acme.com/about", priority: 0.8 },
    { url: "https://acme.com/contact", priority: 0.7 },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

// app/sitemap-blog.xml/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts
    .map(
      (post) => `
  <url>
    <loc>https://acme.com/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
```

## Paginated Sitemaps

```typescript
// app/sitemap/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const URLS_PER_SITEMAP = 10000;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = parseInt(id, 10);

  if (isNaN(page) || page < 0) {
    return NextResponse.json({ error: "Invalid sitemap id" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: "asc" },
    skip: page * URLS_PER_SITEMAP,
    take: URLS_PER_SITEMAP,
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${products
    .map(
      (product) => `
  <url>
    <loc>https://acme.com/products/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

// Generate sitemap index
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const totalProducts = await prisma.product.count({ where: { active: true } });
  const sitemapCount = Math.ceil(totalProducts / 10000);

  const productSitemaps = Array.from({ length: sitemapCount }, (_, i) => ({
    url: `https://acme.com/sitemap/${i}`,
    lastModified: new Date(),
  }));

  return [
    { url: "https://acme.com/sitemap-static.xml", lastModified: new Date() },
    { url: "https://acme.com/sitemap-blog.xml", lastModified: new Date() },
    ...productSitemaps,
  ];
}
```

## Sitemap with Images

```typescript
// app/sitemap.ts (custom XML for images)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { images: true },
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${products
    .map(
      (product) => `
  <url>
    <loc>https://acme.com/products/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    ${product.images
      .map(
        (img) => `
    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${img.alt || product.name}</image:title>
    </image:image>`
      )
      .join("")}
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
```

## Sitemap with Videos

```typescript
// app/video-sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const videos = await prisma.video.findMany({
    where: { published: true },
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${videos
    .map(
      (video) => `
  <url>
    <loc>https://acme.com/videos/${video.slug}</loc>
    <video:video>
      <video:thumbnail_loc>${video.thumbnailUrl}</video:thumbnail_loc>
      <video:title>${video.title}</video:title>
      <video:description>${video.description}</video:description>
      <video:content_loc>${video.url}</video:content_loc>
      <video:duration>${video.duration}</video:duration>
      <video:publication_date>${video.publishedAt.toISOString()}</video:publication_date>
    </video:video>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
```

## Internationalized Sitemap

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

const locales = ["en", "de", "fr", "es"];
const baseUrl = "https://acme.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/about", "/products", "/contact"];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      const url = locale === "en" ? `${baseUrl}${page}` : `${baseUrl}/${locale}${page}`;

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: page === "/" ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l,
              l === "en" ? `${baseUrl}${page}` : `${baseUrl}/${l}${page}`,
            ])
          ),
        },
      });
    }
  }

  return entries;
}
```

## Caching and Revalidation

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

// Revalidate sitemap every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch data...
  return [...];
}
```

## Anti-patterns

### Don't Include Non-Indexable Pages

```typescript
// BAD - Including login, admin, etc.
{ url: "https://acme.com/login" },
{ url: "https://acme.com/admin" },
{ url: "https://acme.com/checkout" },

// GOOD - Only public, indexable content
{ url: "https://acme.com" },
{ url: "https://acme.com/products/widget" },
```

### Don't Exceed Size Limits

```typescript
// BAD - All URLs in one sitemap
const allProducts = await prisma.product.findMany(); // 100k products

// GOOD - Paginate sitemaps (max 50,000 URLs per sitemap)
const URLS_PER_SITEMAP = 10000;
```

## Related Skills

- [metadata-api](./metadata-api.md)
- [robots](./robots.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Dynamic generation
- Sitemap index
- Image/video sitemaps
