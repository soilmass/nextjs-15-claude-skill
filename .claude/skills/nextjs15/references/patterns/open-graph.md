---
id: pt-open-graph
name: Open Graph Patterns
version: 2.0.0
layer: L5
category: seo
description: Open Graph and Twitter Card meta tags for social media sharing optimization
tags: [seo, open-graph, twitter-cards, social-media, meta-tags]
composes: []
dependencies: []
formula: Metadata API + OG Tags + Twitter Cards + Dynamic Images = Social Share Optimization
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

- Controlling how content appears when shared on Facebook, LinkedIn, and other platforms
- Creating Twitter Cards for better engagement on Twitter/X
- Generating dynamic OG images for blog posts, products, and profiles
- Implementing article, product, profile, and video-specific Open Graph tags
- Testing and validating social share previews before launch

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      OPEN GRAPH PATTERN                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │             Next.js Metadata API                      │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  generateMetadata({ params })                   │ │      │
│  │  │    → openGraph: { type, title, images, ... }    │ │      │
│  │  │    → twitter: { card, title, images, ... }      │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Content Types                            │      │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │      │
│  │  │ website │  │ article │  │ profile │  │  video  │ │      │
│  │  │         │  │ product │  │         │  │         │ │      │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Dynamic OG Image Generation                │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  /api/og?title=...&type=...                     │ │      │
│  │  │    → ImageResponse (1200x630)                   │ │      │
│  │  │    → Edge runtime for speed                     │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Social Platforms                         │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │  Facebook   │  │  Twitter/X  │  │  LinkedIn   │  │      │
│  │  │  LinkedIn   │  │  Slack      │  │  Discord    │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Open Graph Patterns

## Overview

Open Graph (OG) tags and Twitter Cards control how your content appears when shared on social media. This pattern covers proper implementation with Next.js 15's Metadata API.

## Implementation

### Global Open Graph Configuration

```typescript
// app/layout.tsx
import type { Metadata } from "next";

const siteConfig = {
  name: "Your Site Name",
  description: "Your site description that appears in social shares",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://yoursite.com",
  ogImage: "/og-default.png",
  twitterHandle: "@yourhandle",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  
  // Other social
  other: {
    "fb:app_id": process.env.FACEBOOK_APP_ID || "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Page-Specific Open Graph

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {};
  }

  // Get parent images as fallback
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    description: post.excerpt,
    
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : previousImages,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      section: post.category?.name,
      tags: post.tags.map((t) => t.name),
    },
    
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    
    // Article-specific
    authors: [{ name: post.author.name, url: `/authors/${post.author.slug}` }],
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      {/* ... */}
    </article>
  );
}
```

### Product Open Graph

```typescript
// app/products/[slug]/page.tsx
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {};
  }

  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  return {
    title: product.name,
    description: `${product.name} - ${priceFormatted}. ${product.shortDescription}`,
    
    openGraph: {
      type: "website", // or "product" for some platforms
      title: product.name,
      description: product.shortDescription,
      url: `/products/${product.slug}`,
      images: product.images.map((img, index) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: `${product.name} - Image ${index + 1}`,
      })),
    },
    
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ${priceFormatted}`,
      description: product.shortDescription,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
    
    // Product-specific meta
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "USD",
      "product:availability": product.stock > 0 ? "in stock" : "out of stock",
      "product:brand": product.brand,
    },
  };
}
```

### Dynamic OG Image Generation

```typescript
// app/api/og/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get("title") || "Default Title";
  const description = searchParams.get("description") || "";
  const type = searchParams.get("type") || "default";

  // Load fonts
  const interBold = await fetch(
    new URL("../../../public/fonts/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#0f172a",
          padding: "60px",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Your logo SVG */}
            <rect width="48" height="48" rx="8" fill="#3b82f6" />
          </svg>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "white",
            }}
          >
            Your Site
          </span>
        </div>

        {/* Content type badge */}
        {type !== "default" && (
          <div
            style={{
              display: "flex",
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <span style={{ color: "white", fontSize: 16, fontWeight: 600 }}>
              {type.toUpperCase()}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            maxWidth: "80%",
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#94a3b8",
              marginTop: 24,
              maxWidth: "70%",
            }}
          >
            {description}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interBold,
          weight: 700,
        },
      ],
    }
  );
}

// Usage in metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  const ogImageUrl = new URL("/api/og", process.env.NEXT_PUBLIC_APP_URL);
  ogImageUrl.searchParams.set("title", post.title);
  ogImageUrl.searchParams.set("description", post.excerpt);
  ogImageUrl.searchParams.set("type", "article");

  return {
    openGraph: {
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}
```

### Profile Open Graph

```typescript
// app/authors/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);

  if (!author) {
    return {};
  }

  return {
    title: author.name,
    description: author.bio,
    
    openGraph: {
      type: "profile",
      title: author.name,
      description: author.bio,
      url: `/authors/${author.slug}`,
      images: author.avatar
        ? [
            {
              url: author.avatar,
              width: 400,
              height: 400,
              alt: author.name,
            },
          ]
        : undefined,
      firstName: author.firstName,
      lastName: author.lastName,
      username: author.username,
    },
    
    twitter: {
      card: "summary",
      title: author.name,
      description: author.bio,
      images: author.avatar ? [author.avatar] : undefined,
    },
  };
}
```

### Video Open Graph

```typescript
// app/videos/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return {};
  }

  return {
    title: video.title,
    description: video.description,
    
    openGraph: {
      type: "video.other",
      title: video.title,
      description: video.description,
      url: `/videos/${video.id}`,
      videos: [
        {
          url: video.url,
          secureUrl: video.url,
          type: "video/mp4",
          width: 1280,
          height: 720,
        },
      ],
      images: [
        {
          url: video.thumbnail,
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
    },
    
    twitter: {
      card: "player",
      title: video.title,
      description: video.description,
      players: [
        {
          playerUrl: `/videos/${video.id}/embed`,
          streamUrl: video.url,
          width: 1280,
          height: 720,
        },
      ],
    },
  };
}
```

### Testing Open Graph Tags

```typescript
// scripts/validate-og.ts
import { JSDOM } from "jsdom";

async function validateOpenGraph(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const requiredTags = [
    "og:title",
    "og:description",
    "og:image",
    "og:url",
    "twitter:card",
  ];

  const results: { tag: string; value: string | null; status: string }[] = [];

  for (const tag of requiredTags) {
    const element = document.querySelector(`meta[property="${tag}"], meta[name="${tag}"]`);
    const value = element?.getAttribute("content") || null;
    
    results.push({
      tag,
      value,
      status: value ? "✓" : "✗ MISSING",
    });
  }

  console.log(`\nOpen Graph validation for: ${url}\n`);
  console.table(results);

  // Check image dimensions
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
  if (ogImage) {
    console.log(`\nOG Image: ${ogImage}`);
    console.log("Recommended: 1200x630 pixels for optimal display");
  }

  return results;
}

// Run: npx tsx scripts/validate-og.ts https://yoursite.com/page
validateOpenGraph(process.argv[2] || "http://localhost:3000");
```

## Variants

### Localized Open Graph

```typescript
// For multi-language sites
openGraph: {
  locale: locale, // e.g., "es_ES"
  alternateLocale: locales.filter((l) => l !== locale),
  // ...
}
```

### E-commerce Product Tags

```typescript
other: {
  "product:price:amount": "29.99",
  "product:price:currency": "USD",
  "product:availability": "in stock",
  "product:condition": "new",
  "product:retailer_item_id": "SKU123",
}
```

## Anti-patterns

1. **Missing images**: No og:image tag
2. **Wrong image dimensions**: Not 1200x630 for summary_large_image
3. **Generic descriptions**: Same description on all pages
4. **Missing Twitter cards**: Relying only on Open Graph
5. **Not testing**: Not validating with social debuggers

## Related Skills

- `L5/patterns/metadata-api` - Next.js metadata API
- `L5/patterns/structured-data` - JSON-LD schemas
- `L5/patterns/sitemap` - XML sitemap
- `L5/patterns/seo` - General SEO patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Next.js 15 Metadata API
