---
id: pt-metadata-api
name: Metadata API
version: 2.0.0
layer: L5
category: seo
description: Next.js 15 Metadata API for SEO, Open Graph, Twitter Cards, and structured data
tags: [seo, metadata, opengraph, twitter, structured-data, next15]
composes: []
dependencies: []
formula: Static Metadata + generateMetadata + JSON-LD + File Conventions = Complete SEO
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Setting up site-wide metadata with title templates in root layout
- Generating dynamic metadata for blog posts, products, and user profiles
- Implementing Open Graph and Twitter Cards for social sharing
- Adding JSON-LD structured data for rich search results
- Using file-based metadata conventions (favicon.ico, opengraph-image.tsx)

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      METADATA API                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Static Metadata (layout.tsx)             │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  export const metadata: Metadata = {            │ │      │
│  │  │    title: { default, template },                │ │      │
│  │  │    description, openGraph, twitter, icons       │ │      │
│  │  │  }                                              │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Dynamic Metadata (page.tsx)                   │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  export async function generateMetadata(        │ │      │
│  │  │    { params }, parent                           │ │      │
│  │  │  ): Promise<Metadata> {                         │ │      │
│  │  │    const data = await fetch(...)                │ │      │
│  │  │    return { title, description, openGraph }     │ │      │
│  │  │  }                                              │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            File-Based Conventions                     │      │
│  │  ┌────────────┐  ┌────────────────┐  ┌────────────┐ │      │
│  │  │favicon.ico │  │opengraph-image │  │ sitemap.ts │ │      │
│  │  │ icon.svg   │  │ twitter-image  │  │ robots.ts  │ │      │
│  │  └────────────┘  └────────────────┘  └────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              JSON-LD Structured Data                  │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  <script type="application/ld+json">            │ │      │
│  │  │    { "@type": "Article/Product/Organization" }  │ │      │
│  │  │  </script>                                      │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Metadata API

## Overview

The Metadata API in Next.js 15 provides a type-safe way to define SEO metadata, Open Graph tags, Twitter Cards, and other meta information. Metadata can be static or dynamically generated based on route parameters.

## Static Metadata

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: "Acme Inc",
    template: "%s | Acme Inc", // Page titles become "Page Name | Acme Inc"
  },
  description: "Build amazing products with Acme platform",
  
  // Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Canonical and alternates
  metadataBase: new URL("https://acme.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      "de-DE": "/de-DE",
    },
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://acme.com",
    siteName: "Acme Inc",
    title: "Acme Inc - Build Amazing Products",
    description: "Build amazing products with Acme platform",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Acme Inc",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Acme Inc",
    description: "Build amazing products with Acme platform",
    creator: "@acme",
    images: ["/twitter-image.jpg"],
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  
  // Manifest
  manifest: "/manifest.json",
  
  // Verification
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
  
  // Category
  category: "technology",
  
  // Authors
  authors: [{ name: "Acme Team", url: "https://acme.com/team" }],
  creator: "Acme Inc",
  publisher: "Acme Inc",
};

// Viewport (separate export in Next.js 15)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: "light dark",
};
```

## Dynamic Metadata

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  // Optionally access parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
        ...previousImages,
      ],
    },
    
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
    
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return <Article post={post} />;
}
```

## Product Page Metadata

```typescript
// app/products/[id]/page.tsx
import type { Metadata } from "next";
import { getProduct } from "@/lib/products";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  return {
    title: product.name,
    description: `${product.name} - ${price}. ${product.description}`,
    
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website", // or "product" for some platforms
      images: product.images.map((img) => ({
        url: img.url,
        width: 800,
        height: 800,
        alt: img.alt,
      })),
    },
    
    other: {
      // Product-specific meta tags
      "product:price:amount": product.price.toString(),
      "product:price:currency": "USD",
      "product:availability": product.inStock ? "in stock" : "out of stock",
      "product:brand": product.brand,
      "product:category": product.category,
    },
  };
}
```

## Structured Data (JSON-LD)

```typescript
// app/blog/[slug]/page.tsx
import { getPost } from "@/lib/blog";

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Acme Inc",
      logo: {
        "@type": "ImageObject",
        url: "https://acme.com/logo.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Article post={post} />
    </>
  );
}
```

## Product JSON-LD

```typescript
// components/product-json-ld.tsx
interface ProductJsonLdProps {
  product: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    availability: "InStock" | "OutOfStock" | "PreOrder";
    brand: string;
    sku: string;
    rating?: {
      value: number;
      count: number;
    };
  };
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    },
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## Organization JSON-LD

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Acme Inc",
    url: "https://acme.com",
    logo: "https://acme.com/logo.png",
    sameAs: [
      "https://twitter.com/acme",
      "https://linkedin.com/company/acme",
      "https://github.com/acme",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-800-ACME",
      contactType: "customer service",
    },
  };

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Breadcrumb JSON-LD

```typescript
// components/breadcrumb-json-ld.tsx
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Usage
<BreadcrumbJsonLd
  items={[
    { name: "Home", url: "https://acme.com" },
    { name: "Products", url: "https://acme.com/products" },
    { name: "Widgets", url: "https://acme.com/products/widgets" },
  ]}
/>
```

## FAQ JSON-LD

```typescript
// components/faq-json-ld.tsx
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## File-Based Metadata

```typescript
// Place these files in the app directory
// app/
// ├── favicon.ico          → <link rel="icon" href="/favicon.ico" />
// ├── icon.png             → <link rel="icon" type="image/png" href="/icon.png" />
// ├── icon.svg             → <link rel="icon" type="image/svg+xml" href="/icon.svg" />
// ├── apple-icon.png       → <link rel="apple-touch-icon" href="/apple-icon.png" />
// ├── opengraph-image.png  → <meta property="og:image" content="..." />
// ├── twitter-image.png    → <meta name="twitter:image" content="..." />
// ├── robots.txt           → Robots file
// ├── sitemap.xml          → Sitemap file
// └── manifest.json        → Web app manifest

// Dynamic OG image
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog";

export const runtime = "edge";
export const alt = "Blog post cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          padding: 40,
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 700, textAlign: "center" }}>
          {post?.title || "Blog Post"}
        </div>
        <div style={{ fontSize: 30, marginTop: 20, opacity: 0.8 }}>
          acme.com
        </div>
      </div>
    ),
    { ...size }
  );
}
```

## Anti-patterns

### Don't Duplicate Metadata

```typescript
// BAD - Duplicating in layout and page
// layout.tsx
export const metadata = { title: "Acme Inc" };
// page.tsx
export const metadata = { title: "Acme Inc" };

// GOOD - Use template in layout, specific in pages
// layout.tsx
export const metadata = { title: { template: "%s | Acme", default: "Acme" } };
// page.tsx
export const metadata = { title: "Products" }; // Becomes "Products | Acme"
```

## Related Skills

- [sitemap](./sitemap.md)
- [robots](./robots.md)
- [og-images](./og-images.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Static and dynamic metadata
- JSON-LD patterns
- File-based metadata
