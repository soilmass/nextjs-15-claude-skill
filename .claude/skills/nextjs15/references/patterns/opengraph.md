---
id: pt-opengraph
name: OpenGraph Meta Tags
version: 1.1.0
layer: L5
category: seo
description: Generate dynamic OpenGraph meta tags for social media sharing and SEO in Next.js 15 applications
tags: [seo, opengraph, meta-tags, social-sharing, next15, react19]
composes:
  - ../atoms/display-image.md
dependencies:
  "@vercel/og": "^0.6.0"
formula: "OpenGraph = generateMetadata + ImageResponse + og:image API Route"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# OpenGraph Meta Tags

## Overview

OpenGraph (OG) meta tags are the foundation of how your web pages appear when shared on social media platforms like Facebook, Twitter (X), LinkedIn, Discord, Slack, and iMessage. When a user shares a link, these platforms scrape the OG tags to display a rich preview card with a title, description, and image. A well-implemented OG strategy can significantly increase click-through rates on shared links.

This pattern covers the complete implementation of OpenGraph meta tags in Next.js 15 applications, including static metadata for layout files, dynamic metadata generation for content pages, programmatic OG image generation using the Vercel OG library, and JSON-LD structured data for enhanced search engine understanding. The pattern leverages Next.js 15's metadata API which automatically handles tag deduplication and proper rendering.

Beyond social sharing, proper meta tag implementation affects SEO rankings, search result appearance, and how content management systems and link preview services display your pages. The investment in dynamic OG generation pays dividends across all channels where your content is shared or discovered.

## When to Use

- **Blog posts and articles**: Content shared on social media needs compelling preview cards with article titles, excerpts, and featured images
- **Product pages**: E-commerce products should display product images, names, and prices in share previews
- **User profile pages**: Social platforms and apps where users share their profiles need personalized OG images
- **Landing pages**: Marketing pages require carefully crafted OG content to maximize conversion from social traffic
- **Event pages**: Events with dates, locations, and images benefit from structured OG data
- **Any sharable content**: If users might share a URL, it needs proper OG tags

## When NOT to Use

- **Admin dashboards**: Internal pages that should not be indexed or shared do not need OG optimization
- **Authentication pages**: Login, register, and password reset pages rarely benefit from OG tags
- **API endpoints**: Non-HTML responses do not use OG tags
- **Development/staging environments**: Avoid indexing non-production environments

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    OpenGraph Implementation Architecture                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Metadata Sources                              │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ Static Metadata │  │ Dynamic Metadata│  │ Template        │  │   │
│  │  │ (layout.tsx)    │  │ (page.tsx)      │  │ Metadata        │  │   │
│  │  │                 │  │                 │  │                 │  │   │
│  │  │ - Site name     │  │ - Page title    │  │ - Title template│  │   │
│  │  │ - Default OG    │  │ - Description   │  │ - Fallbacks     │  │   │
│  │  │ - Twitter card  │  │ - Images        │  │                 │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                    │                    │                  │
│            └────────────────────┼────────────────────┘                  │
│                                 ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Metadata API                                  │   │
│  │                                                                  │   │
│  │  export async function generateMetadata({ params }): Metadata   │   │
│  │  ├─ Fetch content data                                          │   │
│  │  ├─ Generate OG image URL                                       │   │
│  │  ├─ Build metadata object                                       │   │
│  │  └─ Return merged metadata                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                                                            │
│            ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    OG Image Generation                           │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ /api/og         │  │ ImageResponse   │  │ Custom Fonts    │  │   │
│  │  │ (Edge Runtime)  │  │ (Satori)        │  │ & Styling       │  │   │
│  │  │                 │  │                 │  │                 │  │   │
│  │  │ - Query params  │  │ - JSX to PNG    │  │ - Brand colors  │  │   │
│  │  │ - Template type │  │ - 1200x630 px   │  │ - Logos         │  │   │
│  │  │ - Caching       │  │                 │  │ - Typography    │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                                                            │
│            ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Output (HTML <head>)                          │   │
│  │                                                                  │   │
│  │  <meta property="og:title" content="..." />                     │   │
│  │  <meta property="og:description" content="..." />               │   │
│  │  <meta property="og:image" content="https://.../api/og?..." /> │   │
│  │  <meta property="og:url" content="..." />                       │   │
│  │  <meta name="twitter:card" content="summary_large_image" />     │   │
│  │  <script type="application/ld+json">...</script>                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Root Layout Static Metadata

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next';

// Shared metadata configuration
const siteConfig = {
  name: 'My Application',
  description: 'A powerful Next.js application for modern web development',
  url: 'https://example.com',
  ogImage: '/og-default.png',
  twitterHandle: '@myhandle',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  // Basic metadata
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['Next.js', 'React', 'TypeScript', 'Web Development'],
  authors: [{ name: 'Your Name', url: siteConfig.url }],
  creator: 'Your Name',
  publisher: 'Your Company',

  // OpenGraph metadata
  openGraph: {
    type: 'website',
    locale: 'en_US',
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

  // Twitter metadata
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/site.webmanifest',

  // Verification
  verification: {
    google: 'google-site-verification-code',
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

### Dynamic Metadata for Content Pages

```typescript
// app/posts/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for static generation
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true },
    where: { published: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
}

// Generate dynamic metadata based on post content
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { name: true, image: true } },
      category: { select: { name: true } },
    },
  });

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  // Build dynamic OG image URL with parameters
  const ogImageUrl = new URL('/api/og', process.env.NEXT_PUBLIC_APP_URL);
  ogImageUrl.searchParams.set('title', post.title);
  ogImageUrl.searchParams.set('type', 'article');
  if (post.author.name) {
    ogImageUrl.searchParams.set('author', post.author.name);
  }
  if (post.category?.name) {
    ogImageUrl.searchParams.set('category', post.category.name);
  }

  // Get parent metadata for fallbacks
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    authors: [{ name: post.author.name }],

    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      type: 'article',
      url: `/posts/${slug}`,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      section: post.category?.name,
      tags: post.tags,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title,
        },
        ...previousImages,
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: [ogImageUrl.toString()],
    },

    alternates: {
      canonical: `/posts/${slug}`,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: { author: true },
  });

  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### Dynamic OG Image Generation API

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// OG Image dimensions (recommended by social platforms)
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Extract parameters
    const title = searchParams.get('title') || 'My Application';
    const description = searchParams.get('description') || '';
    const author = searchParams.get('author') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || 'default';
    const theme = searchParams.get('theme') || 'dark';

    // Load custom fonts
    const interBold = await fetch(
      new URL('../../../public/fonts/Inter-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const interRegular = await fetch(
      new URL('../../../public/fonts/Inter-Regular.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    // Theme colors
    const colors = {
      dark: {
        bg: '#0a0a0a',
        bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
        text: '#ffffff',
        textMuted: '#a1a1aa',
        accent: '#3b82f6',
      },
      light: {
        bg: '#ffffff',
        bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        text: '#0f172a',
        textMuted: '#64748b',
        accent: '#2563eb',
      },
    };

    const themeColors = colors[theme as keyof typeof colors] || colors.dark;

    // Calculate font size based on title length
    const titleFontSize = title.length > 60 ? 48 : title.length > 40 ? 56 : 64;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: themeColors.bg,
            backgroundImage: themeColors.bgGradient,
            padding: '60px',
          }}
        >
          {/* Header with logo and category */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'auto',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: themeColors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
                  M
                </span>
              </div>
              <span
                style={{
                  color: themeColors.text,
                  fontSize: '24px',
                  fontWeight: 700,
                }}
              >
                My App
              </span>
            </div>

            {/* Category badge */}
            {category && (
              <div
                style={{
                  backgroundColor: themeColors.accent,
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {category}
              </div>
            )}
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '1000px',
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: `${titleFontSize}px`,
                fontWeight: 700,
                color: themeColors.text,
                lineHeight: 1.2,
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                style={{
                  fontSize: '24px',
                  color: themeColors.textMuted,
                  margin: 0,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </p>
            )}

            {/* Author */}
            {author && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '20px',
                    backgroundColor: themeColors.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                    {author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '20px',
                    color: themeColors.textMuted,
                  }}
                >
                  by {author}
                </span>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fonts: [
          {
            name: 'Inter',
            data: interBold,
            style: 'normal',
            weight: 700,
          },
          {
            name: 'Inter',
            data: interRegular,
            style: 'normal',
            weight: 400,
          },
        ],
      }
    );
  } catch (error) {
    console.error('OG image generation error:', error);

    // Return fallback image on error
    return new Response('Failed to generate image', { status: 500 });
  }
}
```

### Product Page Metadata

```typescript
// app/products/[id]/page.tsx
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      images: { take: 4 },
    },
  });

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  // Build OG image URL
  const ogImageUrl = new URL('/api/og/product', process.env.NEXT_PUBLIC_APP_URL);
  ogImageUrl.searchParams.set('name', product.name);
  ogImageUrl.searchParams.set('price', price);
  ogImageUrl.searchParams.set('image', product.images[0]?.url || '');

  return {
    title: product.name,
    description: `${product.description.slice(0, 150)} - ${price}`,

    openGraph: {
      title: product.name,
      description: product.description,
      type: 'website',
      url: `/products/${id}`,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: product.name,
        },
        // Include product images as additional OG images
        ...product.images.map((img) => ({
          url: img.url,
          width: 800,
          height: 800,
          alt: product.name,
        })),
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${price}`,
      description: product.description.slice(0, 200),
      images: [ogImageUrl.toString()],
    },

    // Product-specific meta tags
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'USD',
      'product:availability': product.inStock ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:brand': product.brand?.name || '',
      'product:category': product.category?.name || '',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) notFound();

  return (
    <div>
      <h1>{product.name}</h1>
      {/* Product content */}
    </div>
  );
}
```

### JSON-LD Structured Data

```typescript
// components/structured-data.tsx
interface BaseStructuredDataProps {
  type: string;
  [key: string]: unknown;
}

export function StructuredData({ type, ...props }: BaseStructuredDataProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...props,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Article structured data
interface ArticleStructuredDataProps {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  modifiedAt: string;
  image: string;
  url: string;
}

export function ArticleStructuredData({
  title,
  description,
  author,
  publishedAt,
  modifiedAt,
  image,
  url,
}: ArticleStructuredDataProps) {
  return (
    <StructuredData
      type="Article"
      headline={title}
      description={description}
      author={{
        '@type': 'Person',
        name: author,
      }}
      datePublished={publishedAt}
      dateModified={modifiedAt}
      image={image}
      url={url}
      publisher={{
        '@type': 'Organization',
        name: 'My Application',
        logo: {
          '@type': 'ImageObject',
          url: 'https://example.com/logo.png',
        },
      }}
    />
  );
}

// Product structured data
interface ProductStructuredDataProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
  rating?: { value: number; count: number };
}

export function ProductStructuredData({
  name,
  description,
  image,
  price,
  currency,
  availability,
  brand,
  sku,
  rating,
}: ProductStructuredDataProps) {
  return (
    <StructuredData
      type="Product"
      name={name}
      description={description}
      image={image}
      sku={sku}
      brand={brand ? { '@type': 'Brand', name: brand } : undefined}
      offers={{
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url: typeof window !== 'undefined' ? window.location.href : '',
      }}
      aggregateRating={
        rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: rating.value,
              reviewCount: rating.count,
            }
          : undefined
      }
    />
  );
}

// Organization structured data (for homepage)
export function OrganizationStructuredData() {
  return (
    <StructuredData
      type="Organization"
      name="My Application"
      url="https://example.com"
      logo="https://example.com/logo.png"
      sameAs={[
        'https://twitter.com/myhandle',
        'https://github.com/myhandle',
        'https://linkedin.com/company/mycompany',
      ]}
      contactPoint={{
        '@type': 'ContactPoint',
        telephone: '+1-555-555-5555',
        contactType: 'customer service',
      }}
    />
  );
}
```

## Examples

### Example 1: Blog Post with Full OG Implementation

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ArticleStructuredData } from '@/components/structured-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: { author: true, category: true },
  });

  if (!post) return { title: 'Not Found' };

  const ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/api/og?title=${encodeURIComponent(post.title)}&author=${encodeURIComponent(post.author.name)}&category=${encodeURIComponent(post.category?.name || '')}&type=article`;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: { author: true },
  });

  if (!post) notFound();

  return (
    <>
      <ArticleStructuredData
        title={post.title}
        description={post.excerpt}
        author={post.author.name}
        publishedAt={post.createdAt.toISOString()}
        modifiedAt={post.updatedAt.toISOString()}
        image={`${process.env.NEXT_PUBLIC_APP_URL}/api/og?title=${encodeURIComponent(post.title)}`}
        url={`${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`}
      />

      <article className="max-w-3xl mx-auto py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>By {post.author.name}</span>
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
          </div>
        </header>

        <div
          className="prose prose-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
}
```

### Example 2: E-commerce Product with Rich Metadata

```tsx
// app/shop/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductStructuredData } from '@/components/structured-data';
import { ProductGallery } from '@/components/product/gallery';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, images: true, reviews: true },
  });

  if (!product) return { title: 'Product Not Found' };

  const avgRating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length || 0;

  return {
    title: `${product.name} | Shop`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'website',
      images: product.images.map((img) => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'USD',
      'product:availability': product.inventory > 0 ? 'in stock' : 'out of stock',
      'product:brand': product.brand?.name || '',
      'product:rating': String(avgRating),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, images: true, reviews: true },
  });

  if (!product) notFound();

  const avgRating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length || 0;

  return (
    <>
      <ProductStructuredData
        name={product.name}
        description={product.description}
        image={product.images[0]?.url || ''}
        price={product.price}
        currency="USD"
        availability={product.inventory > 0 ? 'InStock' : 'OutOfStock'}
        brand={product.brand?.name}
        sku={product.sku}
        rating={{ value: avgRating, count: product.reviews.length }}
      />

      <div className="grid md:grid-cols-2 gap-8">
        <ProductGallery images={product.images} />

        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold">${product.price}</p>
          <p className="text-muted-foreground">{product.description}</p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </>
  );
}
```

### Example 3: User Profile with Dynamic OG Image

```tsx
// app/users/[username]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });

  if (!user) return { title: 'User Not Found' };

  const ogImage = new URL('/api/og/profile', process.env.NEXT_PUBLIC_APP_URL);
  ogImage.searchParams.set('name', user.name || user.username);
  ogImage.searchParams.set('username', user.username);
  ogImage.searchParams.set('bio', user.bio || '');
  ogImage.searchParams.set('avatar', user.image || '');
  ogImage.searchParams.set('posts', String(user._count.posts));
  ogImage.searchParams.set('followers', String(user._count.followers));

  const title = user.name || `@${user.username}`;
  const description = user.bio || `View ${title}'s profile`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/users/${username}`,
      images: [{ url: ogImage.toString(), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.toString()],
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { posts: { take: 10, orderBy: { createdAt: 'desc' } } },
  });

  if (!user) notFound();

  return (
    <div className="max-w-4xl mx-auto py-12">
      <header className="flex items-center gap-6 mb-8">
        <img
          src={user.image || '/default-avatar.png'}
          alt={user.name || user.username}
          className="w-24 h-24 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-2">{user.bio}</p>}
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        {/* User posts */}
      </section>
    </div>
  );
}
```

## Anti-patterns

### Anti-pattern 1: Hardcoding Metadata for Dynamic Content

```typescript
// BAD - Static metadata for dynamic pages
export const metadata = {
  title: 'Blog Post',
  description: 'Read our latest blog post',
  openGraph: {
    images: ['/default-og.png'],
  },
};

export default function BlogPost({ params }) {
  // Dynamic content but static OG tags
  return <article>...</article>;
}

// GOOD - Dynamic metadata generation
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
    },
  };
}
```

### Anti-pattern 2: Missing metadataBase

```typescript
// BAD - Relative URLs without base
export const metadata: Metadata = {
  openGraph: {
    images: ['/og-image.png'], // Relative URL - may not resolve correctly
  },
};

// GOOD - Set metadataBase in root layout
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  openGraph: {
    images: ['/og-image.png'], // Now resolves to https://example.com/og-image.png
  },
};
```

### Anti-pattern 3: Ignoring Image Dimensions

```typescript
// BAD - Missing dimensions
export async function generateMetadata() {
  return {
    openGraph: {
      images: ['/og.png'], // No dimensions - platforms may cache incorrectly
    },
  };
}

// GOOD - Always specify dimensions
export async function generateMetadata() {
  return {
    openGraph: {
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: 'Page description',
        },
      ],
    },
  };
}
```

## Testing

### Unit Tests for OG Image API

```typescript
// __tests__/api/og.test.ts
import { GET } from '@/app/api/og/route';
import { NextRequest } from 'next/server';

describe('OG Image API', () => {
  it('returns image response with default parameters', async () => {
    const request = new NextRequest('https://example.com/api/og');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('uses title from query parameters', async () => {
    const request = new NextRequest(
      'https://example.com/api/og?title=Test%20Title'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    // The response is a PNG, so we cannot easily inspect content
    // But we can verify it returns successfully
  });

  it('handles missing parameters gracefully', async () => {
    const request = new NextRequest(
      'https://example.com/api/og?title=&author='
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('supports theme parameter', async () => {
    const darkRequest = new NextRequest(
      'https://example.com/api/og?theme=dark'
    );
    const lightRequest = new NextRequest(
      'https://example.com/api/og?theme=light'
    );

    const darkResponse = await GET(darkRequest);
    const lightResponse = await GET(lightRequest);

    expect(darkResponse.status).toBe(200);
    expect(lightResponse.status).toBe(200);
  });
});
```

### Integration Tests for Metadata Generation

```typescript
// __tests__/metadata.test.ts
import { generateMetadata } from '@/app/posts/[slug]/page';

describe('Post Metadata', () => {
  it('generates correct metadata for existing post', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'test-post' }),
    }, {} as any);

    expect(metadata.title).toBeDefined();
    expect(metadata.openGraph?.title).toBeDefined();
    expect(metadata.twitter?.card).toBe('summary_large_image');
  });

  it('generates OG image URL with correct parameters', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'test-post' }),
    }, {} as any);

    const ogImage = metadata.openGraph?.images?.[0];
    expect(ogImage).toBeDefined();

    if (typeof ogImage === 'object' && 'url' in ogImage) {
      expect(ogImage.url).toContain('/api/og');
      expect(ogImage.width).toBe(1200);
      expect(ogImage.height).toBe(630);
    }
  });

  it('handles missing post gracefully', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'non-existent' }),
    }, {} as any);

    expect(metadata.title).toBe('Post Not Found');
  });
});
```

## Related Skills

- [Server Components](../patterns/server-components.md) - Metadata generation runs on server
- [Image Optimization](../patterns/image-optimization.md) - Optimizing OG images
- [SEO](../patterns/seo.md) - Complete SEO implementation
- [Caching](../patterns/caching.md) - Caching OG image responses
- [Edge Functions](../patterns/edge-functions.md) - OG image generation at edge

---

## Changelog

### 1.1.0 (2026-01-18)
- Added comprehensive Overview section
- Added When NOT to Use section
- Added detailed Composition Diagram
- Added JSON-LD structured data components
- Added 3 real-world examples including e-commerce and user profiles
- Added 3 anti-patterns with corrections
- Added unit and integration tests
- Expanded OG image generation with theming support
- Added Related Skills section

### 1.0.0 (2025-01-18)
- Initial implementation
- Static and dynamic metadata
- OG image generation API route
- Basic JSON-LD structured data
