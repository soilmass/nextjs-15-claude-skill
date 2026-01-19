---
id: pt-sanity
name: Sanity CMS
version: 2.0.0
layer: L5
category: cms
description: Sanity.io headless CMS integration with GROQ queries, live preview, and visual editing
tags: [sanity, cms, headless, groq, preview, content]
composes:
  - ../molecules/card.md
  - ../molecules/pagination.md
dependencies:
  next-sanity: "^9.8.0"
formula: Sanity Client + GROQ Queries + Portable Text + Draft Mode = Headless Content Management
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

- Building content-rich websites with non-technical content editors
- Creating blogs, portfolios, or documentation sites with structured content
- Implementing real-time preview for content changes before publishing
- Managing media assets with automatic image optimization and hotspot cropping
- Building multi-language content with localized fields and references

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       SANITY CMS PATTERN                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 Sanity Studio                         │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │   Schemas   │  │   Assets    │  │   Preview   │  │      │
│  │  │ (documents) │  │  (images)   │  │  (drafts)   │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                    │                │                 │
│         ▼                    ▼                ▼                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Data Layer                          │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ GROQ Query  │  │ Image URL   │  │   Types     │  │      │
│  │  │  (fetch)    │  │  Builder    │  │ (TypeScript)│  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               Rendering Layer                         │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ Portable    │  │   Sanity    │  │   Draft     │  │      │
│  │  │   Text      │  │   Image     │  │   Mode      │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Sanity CMS

Integrate Sanity.io headless CMS with Next.js 15 for structured content management.

## Overview

This pattern covers:
- Sanity client configuration
- Schema definitions
- GROQ queries with TypeScript
- Live preview and visual editing
- Image handling with next/image
- Incremental Static Regeneration
- Portable Text rendering

## Implementation

### Installation

```bash
npm install @sanity/client @sanity/image-url next-sanity @portabletext/react
npm install -D @sanity/types
```

### Sanity Client Configuration

```typescript
// lib/sanity/client.ts
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

// Read-only client for fetching data
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
});

// Client with write access (server-only)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Preview client with draft content
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'previewDrafts',
});

// Get appropriate client based on preview mode
export function getClient(preview = false) {
  return preview ? previewClient : client;
}

// Image URL builder
const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Helper for image dimensions
export function getImageDimensions(image: SanityImageSource & { asset?: { _ref?: string } }) {
  if (!image?.asset?._ref) return { width: 0, height: 0, aspectRatio: 1 };
  
  const ref = image.asset._ref;
  const dimensions = ref.split('-')[2];
  const [width, height] = dimensions.split('x').map(Number);
  
  return {
    width,
    height,
    aspectRatio: width / height,
  };
}
```

### Schema Definitions

```typescript
// sanity/schemas/post.ts
import { defineType, defineField } from 'sanity';

export const postSchema = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author ? `by ${author}` : '',
        media,
      };
    },
  },
});

// sanity/schemas/blockContent.ts
export const blockContentSchema = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Underline', value: 'underline' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
              },
              {
                name: 'blank',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: false,
              },
            ],
          },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    },
    {
      type: 'code',
      options: {
        language: 'typescript',
        languageAlternatives: [
          { title: 'TypeScript', value: 'typescript' },
          { title: 'JavaScript', value: 'javascript' },
          { title: 'HTML', value: 'html' },
          { title: 'CSS', value: 'css' },
          { title: 'JSON', value: 'json' },
          { title: 'Bash', value: 'bash' },
        ],
      },
    },
  ],
});

import { defineType, defineField } from 'sanity';
```

### TypeScript Types from Schema

```typescript
// lib/sanity/types.ts
import type { PortableTextBlock } from '@portabletext/types';

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  alt?: string;
}

export interface Author {
  _id: string;
  _type: 'author';
  name: string;
  slug: { current: string };
  image?: SanityImage;
  bio?: PortableTextBlock[];
}

export interface Category {
  _id: string;
  _type: 'category';
  title: string;
  slug: { current: string };
  description?: string;
}

export interface Post {
  _id: string;
  _type: 'post';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  author?: Author;
  mainImage?: SanityImage & { alt?: string };
  categories?: Category[];
  publishedAt?: string;
  excerpt?: string;
  body?: PortableTextBlock[];
}

export interface PostPreview {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: SanityImage & { alt?: string };
  publishedAt?: string;
  excerpt?: string;
  author?: { name: string };
}
```

### GROQ Queries

```typescript
// lib/sanity/queries.ts
import { groq } from 'next-sanity';

// Reusable projections
const imageProjection = `{
  _type,
  asset->{
    _id,
    url,
    metadata {
      dimensions,
      lqip
    }
  },
  hotspot,
  crop,
  alt
}`;

const authorProjection = `{
  _id,
  name,
  slug,
  image ${imageProjection}
}`;

// Post queries
export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    mainImage ${imageProjection},
    author-> ${authorProjection},
    categories[]-> {
      _id,
      title,
      slug
    },
    publishedAt,
    excerpt,
    body[] {
      ...,
      _type == "image" => ${imageProjection}
    }
  }
`;

export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) [$start...$end] {
    _id,
    title,
    slug,
    mainImage ${imageProjection},
    publishedAt,
    excerpt,
    author-> { name }
  }
`;

export const postsSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)].slug.current
`;

export const postsByCategoryQuery = groq`
  *[_type == "post" && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage ${imageProjection},
    publishedAt,
    excerpt,
    author-> { name }
  }
`;

export const postsCountQuery = groq`
  count(*[_type == "post"])
`;

// Category queries
export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description
  }
`;

// Search query
export const searchPostsQuery = groq`
  *[_type == "post" && (
    title match $query + "*" ||
    excerpt match $query + "*" ||
    pt::text(body) match $query + "*"
  )] | order(publishedAt desc) [0...10] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt
  }
`;
```

### Data Fetching Functions

```typescript
// lib/sanity/fetch.ts
import { getClient } from './client';
import {
  postBySlugQuery,
  postsQuery,
  postsSlugsQuery,
  postsByCategoryQuery,
  postsCountQuery,
  categoriesQuery,
  searchPostsQuery,
} from './queries';
import type { Post, PostPreview, Category } from './types';

export async function getPost(slug: string, preview = false): Promise<Post | null> {
  const client = getClient(preview);
  return client.fetch(postBySlugQuery, { slug });
}

export async function getPosts(
  start = 0,
  end = 10,
  preview = false
): Promise<PostPreview[]> {
  const client = getClient(preview);
  return client.fetch(postsQuery, { start, end });
}

export async function getPostsSlugs(): Promise<string[]> {
  return client.fetch(postsSlugsQuery);
}

export async function getPostsByCategory(
  categorySlug: string,
  preview = false
): Promise<PostPreview[]> {
  const client = getClient(preview);
  return client.fetch(postsByCategoryQuery, { categorySlug });
}

export async function getPostsCount(): Promise<number> {
  return client.fetch(postsCountQuery);
}

export async function getCategories(): Promise<Category[]> {
  return client.fetch(categoriesQuery);
}

export async function searchPosts(query: string): Promise<PostPreview[]> {
  return client.fetch(searchPostsQuery, { query });
}

import { client } from './client';
```

### Server Components Integration

```typescript
// app/blog/page.tsx
import { getPosts, getPostsCount, getCategories } from '@/lib/sanity/fetch';
import { PostCard } from '@/components/blog/post-card';
import { Pagination } from '@/components/ui/pagination';
import { CategoryFilter } from '@/components/blog/category-filter';

const POSTS_PER_PAGE = 9;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const [posts, totalCount, categories] = await Promise.all([
    getPosts(start, end),
    getPostsCount(),
    getCategories(),
  ]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      <CategoryFilter categories={categories} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          className="mt-12"
        />
      )}
    </div>
  );
}

// Generate metadata
export async function generateMetadata() {
  return {
    title: 'Blog',
    description: 'Read our latest articles and updates',
  };
}
```

### Post Page with Portable Text

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getPost, getPostsSlugs } from '@/lib/sanity/fetch';
import { urlFor } from '@/lib/sanity/client';
import { PortableText } from '@/components/blog/portable-text';
import { SanityImage } from '@/components/blog/sanity-image';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPostsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.mainImage
        ? [{ url: urlFor(post.mainImage).width(1200).height(630).url() }]
        : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <article className="container max-w-3xl py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-4 text-muted-foreground">
          {post.author && (
            <span>By {post.author.name}</span>
          )}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
        </div>
      </header>

      {post.mainImage && (
        <SanityImage
          image={post.mainImage}
          alt={post.mainImage.alt || post.title}
          width={800}
          height={450}
          className="rounded-lg mb-8"
          priority
        />
      )}

      {post.body && (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <PortableText value={post.body} />
        </div>
      )}
    </article>
  );
}

// Revalidate every hour
export const revalidate = 3600;
```

### Portable Text Renderer

```typescript
// components/blog/portable-text.tsx
'use client';

import { PortableText as PortableTextComponent } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { SanityImage } from './sanity-image';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PortableTextProps {
  value: PortableTextBlock[];
}

const components = {
  types: {
    image: ({ value }: { value: any }) => (
      <figure className="my-8">
        <SanityImage
          image={value}
          alt={value.alt || ''}
          width={800}
          height={450}
          className="rounded-lg"
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-muted-foreground mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    code: ({ value }: { value: { language: string; code: string } }) => (
      <SyntaxHighlighter
        language={value.language || 'typescript'}
        style={oneDark}
        className="rounded-lg my-4"
      >
        {value.code}
      </SyntaxHighlighter>
    ),
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value: { href: string; blank?: boolean } }) => {
      const isExternal = value.href.startsWith('http');
      
      if (isExternal || value.blank) {
        return (
          <a
            href={value.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={value.href} className="text-primary underline underline-offset-4">
          {children}
        </Link>
      );
    },
    code: ({ children }: { children: React.ReactNode }) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
  },
  block: {
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-3xl font-bold mt-12 mb-4">{children}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-2xl font-bold mt-8 mb-3">{children}</h3>
    ),
    h4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-xl font-bold mt-6 mb-2">{children}</h4>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-6">
        {children}
      </blockquote>
    ),
  },
};

export function PortableText({ value }: PortableTextProps) {
  return <PortableTextComponent value={value} components={components} />;
}
```

### Sanity Image Component

```typescript
// components/blog/sanity-image.tsx
import Image from 'next/image';
import { urlFor, getImageDimensions } from '@/lib/sanity/client';
import type { SanityImage as SanityImageType } from '@/lib/sanity/types';

interface SanityImageProps {
  image: SanityImageType;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function SanityImage({
  image,
  alt,
  width,
  height,
  fill,
  sizes,
  priority,
  className,
}: SanityImageProps) {
  if (!image?.asset) return null;

  const dimensions = getImageDimensions(image);
  const imageWidth = width || dimensions.width;
  const imageHeight = height || dimensions.height;

  // Generate srcSet for responsive images
  const imageUrl = urlFor(image)
    .width(imageWidth)
    .height(imageHeight)
    .auto('format')
    .url();

  // Get blur placeholder
  const blurDataURL = urlFor(image).width(20).quality(20).blur(50).url();

  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes={sizes || '100vw'}
        priority={priority}
        className={className}
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={imageWidth}
      height={imageHeight}
      sizes={sizes}
      priority={priority}
      className={className}
      placeholder="blur"
      blurDataURL={blurDataURL}
    />
  );
}
```

### Live Preview Setup

```typescript
// app/api/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const type = searchParams.get('type') || 'post';

  // Validate secret
  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the path
  const path = type === 'post' ? `/blog/${slug}` : `/${slug}`;
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

## Variants

### On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import { parseBody } from 'next-sanity/webhook';

export async function POST(request: Request) {
  const { body, isValidSignature } = await parseBody<{
    _type: string;
    slug?: { current: string };
  }>(request, process.env.SANITY_REVALIDATE_SECRET);

  if (!isValidSignature) {
    return new Response('Invalid signature', { status: 401 });
  }

  if (!body?._type) {
    return new Response('Bad Request', { status: 400 });
  }

  // Revalidate based on document type
  switch (body._type) {
    case 'post':
      revalidateTag('posts');
      if (body.slug?.current) {
        revalidatePath(`/blog/${body.slug.current}`);
      }
      break;
    case 'category':
      revalidateTag('categories');
      break;
    default:
      revalidatePath('/');
  }

  return Response.json({ revalidated: true });
}
```

## Anti-patterns

1. **Not typing GROQ queries** - Use TypeScript types for query results
2. **Fetching too much** - Use projections to limit returned fields
3. **No image optimization** - Always use urlFor with dimensions
4. **Blocking renders** - Use Suspense for non-critical content
5. **No preview setup** - Always implement draft mode for editors

## Related Skills

- [[mdx]] - Local MDX content
- [[image-optimization]] - Next.js image handling
- [[streaming]] - Streaming with Suspense

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial Sanity CMS integration with GROQ, Portable Text, and preview
