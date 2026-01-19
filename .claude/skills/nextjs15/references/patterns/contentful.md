---
id: pt-contentful
name: Contentful CMS
version: 2.0.0
layer: L5
category: cms
description: Contentful headless CMS integration with GraphQL, rich text rendering, and preview mode
tags: [contentful, cms, headless, graphql, content, preview]
composes:
  - ../molecules/card.md
  - ../molecules/pagination.md
dependencies:
  contentful: "^11.0.0"
formula: Contentful Client + GraphQL/REST + Rich Text Renderer + Draft Mode = Enterprise Content Management
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

- Building enterprise content platforms with complex content models and relationships
- Creating multi-site architectures with shared content and localization
- Implementing editorial workflows with drafts, scheduling, and approval chains
- Managing large media libraries with automatic format conversion and CDN delivery
- Building content-driven applications requiring webhook-based cache invalidation

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENTFUL CMS PATTERN                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                Contentful Space                       │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │  Content    │  │   Assets    │  │   Preview   │  │      │
│  │  │   Types     │  │  (media)    │  │   Client    │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                    │                │                 │
│         ▼                    ▼                ▼                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                     API Layer                         │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ REST/GraphQL│  │  Images API │  │   Webhook   │  │      │
│  │  │  (fetch)    │  │  (optimize) │  │ (revalidate)│  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               Rendering Layer                         │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ Rich Text   │  │ Contentful  │  │   Draft     │  │      │
│  │  │  Renderer   │  │   Image     │  │   Mode      │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Contentful CMS

Integrate Contentful headless CMS with Next.js 15 using GraphQL and the Content Delivery API.

## Overview

This pattern covers:
- Contentful client setup (REST and GraphQL)
- TypeScript type generation
- Rich text rendering
- Image optimization with Contentful Images API
- Preview mode and live preview
- Incremental Static Regeneration
- Webhook-based revalidation

## Implementation

### Installation

```bash
npm install contentful @contentful/rich-text-react-renderer @contentful/rich-text-types
npm install -D contentful-management @contentful/rich-text-plain-text-renderer
```

### Client Configuration

```typescript
// lib/contentful/client.ts
import { createClient, type EntryCollection, type Entry } from 'contentful';

const space = process.env.CONTENTFUL_SPACE_ID!;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN!;
const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN!;

// Delivery client (published content)
export const client = createClient({
  space,
  accessToken,
});

// Preview client (draft content)
export const previewClient = createClient({
  space,
  accessToken: previewToken,
  host: 'preview.contentful.com',
});

// Get appropriate client based on preview mode
export function getClient(preview = false) {
  return preview ? previewClient : client;
}

// Helper for typed entries
export async function getEntry<T>(
  id: string,
  preview = false
): Promise<Entry<T> | null> {
  try {
    const client = getClient(preview);
    return await client.getEntry<T>(id);
  } catch {
    return null;
  }
}

// Helper for typed collections
export async function getEntries<T>(
  contentType: string,
  query: Record<string, unknown> = {},
  preview = false
): Promise<EntryCollection<T>> {
  const client = getClient(preview);
  return client.getEntries<T>({
    content_type: contentType,
    ...query,
  });
}
```

### TypeScript Types

```typescript
// lib/contentful/types.ts
import type { Asset, Entry, EntryFields } from 'contentful';
import type { Document } from '@contentful/rich-text-types';

// Author content type
export interface AuthorFields {
  name: EntryFields.Text;
  slug: EntryFields.Text;
  bio?: EntryFields.Text;
  avatar?: Asset;
}

export type Author = Entry<AuthorFields>;

// Category content type
export interface CategoryFields {
  name: EntryFields.Text;
  slug: EntryFields.Text;
  description?: EntryFields.Text;
}

export type Category = Entry<CategoryFields>;

// Blog Post content type
export interface BlogPostFields {
  title: EntryFields.Text;
  slug: EntryFields.Text;
  excerpt?: EntryFields.Text;
  featuredImage?: Asset;
  author?: Entry<AuthorFields>;
  categories?: Entry<CategoryFields>[];
  publishedAt: EntryFields.Date;
  content: Document;
  seoTitle?: EntryFields.Text;
  seoDescription?: EntryFields.Text;
}

export type BlogPost = Entry<BlogPostFields>;

// Page content type
export interface PageFields {
  title: EntryFields.Text;
  slug: EntryFields.Text;
  content: Document;
  sections?: Entry<SectionFields>[];
}

export type Page = Entry<PageFields>;

// Section content type (for modular pages)
export interface SectionFields {
  type: EntryFields.Text;
  title?: EntryFields.Text;
  content?: Document;
  image?: Asset;
  cta?: {
    text: string;
    url: string;
  };
}

export type Section = Entry<SectionFields>;

// Transformed types for frontend use
export interface BlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  categories: string[];
}

export interface BlogPostDetail extends BlogPostPreview {
  content: Document;
  seoTitle?: string;
  seoDescription?: string;
}
```

### Data Fetching Functions

```typescript
// lib/contentful/api.ts
import { getEntries, getClient } from './client';
import type {
  BlogPost,
  BlogPostFields,
  BlogPostPreview,
  BlogPostDetail,
  Category,
  CategoryFields,
} from './types';

// Transform Contentful asset to image object
function transformImage(asset?: { fields: { file: { url: string; details: { image: { width: number; height: number } } }; title: string } }) {
  if (!asset?.fields?.file) return undefined;
  
  return {
    url: `https:${asset.fields.file.url}`,
    alt: asset.fields.title || '',
    width: asset.fields.file.details.image.width,
    height: asset.fields.file.details.image.height,
  };
}

// Transform blog post entry
function transformBlogPost(entry: BlogPost): BlogPostPreview {
  const { fields, sys } = entry;
  
  return {
    id: sys.id,
    title: fields.title,
    slug: fields.slug,
    excerpt: fields.excerpt || '',
    featuredImage: transformImage(fields.featuredImage as any),
    author: fields.author
      ? {
          name: fields.author.fields.name,
          avatar: fields.author.fields.avatar
            ? `https:${(fields.author.fields.avatar as any).fields.file.url}`
            : undefined,
        }
      : undefined,
    publishedAt: fields.publishedAt,
    categories: fields.categories?.map((cat) => cat.fields.name) || [],
  };
}

// Get all blog posts
export async function getBlogPosts(options?: {
  limit?: number;
  skip?: number;
  category?: string;
  preview?: boolean;
}): Promise<{ posts: BlogPostPreview[]; total: number }> {
  const { limit = 10, skip = 0, category, preview = false } = options || {};

  const query: Record<string, unknown> = {
    order: '-fields.publishedAt',
    limit,
    skip,
    include: 2, // Include linked entries
  };

  if (category) {
    query['fields.categories.sys.contentType.sys.id'] = 'category';
    query['fields.categories.fields.slug'] = category;
  }

  const response = await getEntries<BlogPostFields>('blogPost', query, preview);

  return {
    posts: response.items.map((item) => transformBlogPost(item as BlogPost)),
    total: response.total,
  };
}

// Get single blog post by slug
export async function getBlogPost(
  slug: string,
  preview = false
): Promise<BlogPostDetail | null> {
  const response = await getEntries<BlogPostFields>(
    'blogPost',
    {
      'fields.slug': slug,
      include: 2,
      limit: 1,
    },
    preview
  );

  const entry = response.items[0] as BlogPost;
  if (!entry) return null;

  return {
    ...transformBlogPost(entry),
    content: entry.fields.content,
    seoTitle: entry.fields.seoTitle,
    seoDescription: entry.fields.seoDescription,
  };
}

// Get all blog post slugs
export async function getBlogPostSlugs(): Promise<string[]> {
  const response = await getEntries<BlogPostFields>('blogPost', {
    select: ['fields.slug'],
    limit: 1000,
  });

  return response.items.map((item) => item.fields.slug);
}

// Get categories
export async function getCategories(): Promise<
  Array<{ name: string; slug: string; description?: string }>
> {
  const response = await getEntries<CategoryFields>('category', {
    order: 'fields.name',
  });

  return response.items.map((item) => ({
    name: item.fields.name,
    slug: item.fields.slug,
    description: item.fields.description,
  }));
}

// Search posts
export async function searchPosts(
  query: string,
  preview = false
): Promise<BlogPostPreview[]> {
  const response = await getEntries<BlogPostFields>(
    'blogPost',
    {
      query,
      limit: 10,
    },
    preview
  );

  return response.items.map((item) => transformBlogPost(item as BlogPost));
}
```

### Rich Text Renderer

```typescript
// components/contentful/rich-text.tsx
'use client';

import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS, Document, Node } from '@contentful/rich-text-types';
import Image from 'next/image';
import Link from 'next/link';

interface RichTextProps {
  content: Document;
  className?: string;
}

const options: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-3xl font-bold mt-12 mb-4 scroll-mt-20">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-2xl font-bold mt-8 mb-3 scroll-mt-20">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node, children) => (
      <h4 className="text-xl font-bold mt-6 mb-2 scroll-mt-20">{children}</h4>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => <li>{children}</li>,
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-6">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-border" />,
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields;
      const url = `https:${file.url}`;
      const { width, height } = file.details.image;

      return (
        <figure className="my-8">
          <Image
            src={url}
            alt={description || title || ''}
            width={width}
            height={height}
            className="rounded-lg"
          />
          {description && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {description}
            </figcaption>
          )}
        </figure>
      );
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      const contentType = node.data.target.sys.contentType.sys.id;
      const fields = node.data.target.fields;

      // Handle different embedded content types
      switch (contentType) {
        case 'codeBlock':
          return (
            <pre className="bg-muted p-4 rounded-lg my-6 overflow-x-auto">
              <code className="text-sm">{fields.code}</code>
            </pre>
          );
        case 'callout':
          return (
            <div className={`border-l-4 p-4 my-6 rounded-r-lg ${
              fields.type === 'warning' 
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                : 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            }`}>
              {fields.content}
            </div>
          );
        default:
          return null;
      }
    },
    [INLINES.HYPERLINK]: (node, children) => {
      const url = node.data.uri;
      const isExternal = url.startsWith('http');

      if (isExternal) {
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={url} className="text-primary underline underline-offset-4">
          {children}
        </Link>
      );
    },
    [INLINES.ENTRY_HYPERLINK]: (node, children) => {
      const contentType = node.data.target.sys.contentType.sys.id;
      const slug = node.data.target.fields.slug;

      const href = contentType === 'blogPost' ? `/blog/${slug}` : `/${slug}`;

      return (
        <Link href={href} className="text-primary underline underline-offset-4">
          {children}
        </Link>
      );
    },
  },
};

export function RichText({ content, className }: RichTextProps) {
  return (
    <div className={className}>
      {documentToReactComponents(content, options)}
    </div>
  );
}
```

### Contentful Image Component

```typescript
// components/contentful/contentful-image.tsx
import Image from 'next/image';

interface ContentfulImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  format?: 'webp' | 'png' | 'jpg' | 'avif';
  fit?: 'pad' | 'fill' | 'scale' | 'crop' | 'thumb';
  focus?: 'center' | 'top' | 'right' | 'left' | 'bottom' | 'face' | 'faces';
  className?: string;
  priority?: boolean;
}

export function ContentfulImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  format = 'webp',
  fit = 'fill',
  focus = 'center',
  className,
  priority,
}: ContentfulImageProps) {
  // Build Contentful Images API URL
  const imageUrl = new URL(src);
  imageUrl.searchParams.set('w', width.toString());
  imageUrl.searchParams.set('h', height.toString());
  imageUrl.searchParams.set('q', quality.toString());
  imageUrl.searchParams.set('fm', format);
  imageUrl.searchParams.set('fit', fit);
  imageUrl.searchParams.set('f', focus);

  // Get blur placeholder
  const blurUrl = new URL(src);
  blurUrl.searchParams.set('w', '20');
  blurUrl.searchParams.set('q', '20');

  return (
    <Image
      src={imageUrl.toString()}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurUrl.toString()}
    />
  );
}

// next.config.js - Add Contentful to image domains
// images: {
//   remotePatterns: [
//     {
//       protocol: 'https',
//       hostname: 'images.ctfassets.net',
//     },
//   ],
// },
```

### Preview Mode

```typescript
// app/api/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getBlogPost } from '@/lib/contentful/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const contentType = searchParams.get('type') || 'blogPost';

  // Validate secret
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  // Validate content exists
  if (contentType === 'blogPost' && slug) {
    const post = await getBlogPost(slug, true);
    if (!post) {
      return new Response('Post not found', { status: 404 });
    }
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the path
  const path = contentType === 'blogPost' ? `/blog/${slug}` : `/${slug}`;
  redirect(path);
}

// app/api/exit-preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';

  const draft = await draftMode();
  draft.disable();

  redirect(path);
}
```

### Webhook Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

// Contentful webhook payload type
interface ContentfulWebhook {
  sys: {
    type: string;
    id: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields?: {
    slug?: {
      'en-US'?: string;
    };
  };
}

export async function POST(request: Request) {
  // Verify webhook secret
  const secret = request.headers.get('x-contentful-webhook-secret');
  if (secret !== process.env.CONTENTFUL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const body: ContentfulWebhook = await request.json();
  const contentType = body.sys.contentType?.sys.id;
  const slug = body.fields?.slug?.['en-US'];

  // Revalidate based on content type
  switch (contentType) {
    case 'blogPost':
      revalidateTag('blog-posts');
      if (slug) {
        revalidatePath(`/blog/${slug}`);
      }
      revalidatePath('/blog');
      break;
    case 'category':
      revalidateTag('categories');
      revalidatePath('/blog');
      break;
    case 'page':
      if (slug) {
        revalidatePath(`/${slug}`);
      }
      break;
    default:
      // Revalidate homepage for any content change
      revalidatePath('/');
  }

  return NextResponse.json({ revalidated: true });
}
```

### Server Component Example

```typescript
// app/blog/page.tsx
import { getBlogPosts, getCategories } from '@/lib/contentful/api';
import { ContentfulImage } from '@/components/contentful/contentful-image';
import Link from 'next/link';
import { draftMode } from 'next/headers';

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { isEnabled: preview } = await draftMode();
  
  const page = Number(params.page) || 1;
  const limit = 9;

  const [{ posts, total }, categories] = await Promise.all([
    getBlogPosts({
      limit,
      skip: (page - 1) * limit,
      category: params.category,
      preview,
    }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container py-12">
      {preview && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-8">
          Preview Mode - <a href="/api/exit-preview" className="underline">Exit</a>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      {/* Categories */}
      <div className="flex gap-2 mb-8">
        <Link
          href="/blog"
          className={`px-3 py-1 rounded ${!params.category ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/blog?category=${cat.slug}`}
            className={`px-3 py-1 rounded ${params.category === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="border rounded-lg overflow-hidden">
            {post.featuredImage && (
              <ContentfulImage
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                width={400}
                height={225}
                className="w-full"
              />
            )}
            <div className="p-4">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-bold hover:text-primary">
                  {post.title}
                </h2>
              </Link>
              <p className="text-muted-foreground mt-2 line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export const revalidate = 3600; // Revalidate every hour
```

## Anti-patterns

1. **Not using preview mode** - Always implement preview for editors
2. **Missing image optimization** - Use Contentful Images API parameters
3. **No webhook revalidation** - Set up webhooks for instant updates
4. **Over-fetching** - Use `select` parameter to limit fields
5. **Not handling linked entries** - Set appropriate `include` depth

## Related Skills

- [[sanity]] - Alternative headless CMS
- [[image-optimization]] - Next.js image handling
- [[streaming]] - Streaming with Suspense

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial Contentful integration with rich text, preview, and webhooks
