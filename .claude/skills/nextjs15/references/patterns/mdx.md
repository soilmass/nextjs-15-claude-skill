---
id: pt-mdx
name: MDX Content
version: 2.0.0
layer: L5
category: cms
description: Local MDX content with next-mdx-remote, syntax highlighting, and custom components
tags: [mdx, markdown, content, blog, documentation, static]
composes:
  - ../molecules/card.md
  - ../molecules/tabs.md
  - ../molecules/accordion-item.md
dependencies:
  @next/mdx: "^15.1.0"
formula: next-mdx-remote + gray-matter + rehype-pretty-code + Custom Components = Developer Documentation
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

- Building developer documentation with code examples and syntax highlighting
- Creating technical blogs where content authors write in Markdown
- Implementing changelog pages with version history and release notes
- Managing static content that lives alongside the codebase in version control
- Building knowledge bases with table of contents and cross-references

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       MDX CONTENT PATTERN                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                  Content Layer                        │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │  .mdx files │  │ Frontmatter │  │   Assets    │  │      │
│  │  │ (content/)  │  │ (gray-matter)│  │  (public/) │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                    │                │                 │
│         ▼                    ▼                ▼                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 Processing Layer                      │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ remark-gfm  │  │   rehype    │  │    TOC      │  │      │
│  │  │ (markdown)  │  │ pretty-code │  │ extraction  │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               Rendering Layer                         │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ MDXRemote   │  │   Custom    │  │   Table of  │  │      │
│  │  │ (render)    │  │ Components  │  │  Contents   │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# MDX Content

Render MDX content with custom components, syntax highlighting, and frontmatter.

## Overview

This pattern covers:
- MDX setup with next-mdx-remote
- Frontmatter parsing with gray-matter
- Syntax highlighting with rehype-pretty-code
- Custom MDX components
- Table of contents generation
- Content collections
- Static generation

## Implementation

### Installation

```bash
npm install next-mdx-remote gray-matter rehype-pretty-code rehype-slug rehype-autolink-headings remark-gfm
npm install -D @types/mdx
```

### MDX Configuration

```typescript
// lib/mdx/config.ts
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import type { Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';

export const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: false,
  onVisitLine(node) {
    // Prevent lines from collapsing in `display: grid` mode
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className = ['line--highlighted'];
  },
  onVisitHighlightedChars(node) {
    node.properties.className = ['chars--highlighted'];
  },
};

export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [rehypePrettyCode, rehypePrettyCodeOptions],
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'wrap',
        properties: {
          className: ['anchor'],
        },
      },
    ],
  ],
};
```

### Content Utilities

```typescript
// lib/mdx/content.ts
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface ContentMeta {
  title: string;
  description: string;
  date: string;
  author?: string;
  tags?: string[];
  image?: string;
  published?: boolean;
  [key: string]: unknown;
}

export interface ContentItem<T extends ContentMeta = ContentMeta> {
  slug: string;
  meta: T;
  content: string;
}

// Cache content reading for the request
export const getContentBySlug = cache(async <T extends ContentMeta>(
  type: string,
  slug: string
): Promise<ContentItem<T> | null> => {
  try {
    const filePath = path.join(CONTENT_DIR, type, `${slug}.mdx`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      meta: data as T,
      content,
    };
  } catch {
    return null;
  }
});

// Get all content of a type
export const getAllContent = cache(async <T extends ContentMeta>(
  type: string,
  options?: {
    limit?: number;
    filterDraft?: boolean;
    sortBy?: keyof T;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<ContentItem<T>[]> => {
  const { limit, filterDraft = true, sortBy = 'date', sortOrder = 'desc' } = options || {};

  const contentDir = path.join(CONTENT_DIR, type);
  
  try {
    const files = await fs.readdir(contentDir);
    const mdxFiles = files.filter((file) => file.endsWith('.mdx'));

    const contentPromises = mdxFiles.map(async (file) => {
      const slug = file.replace(/\.mdx$/, '');
      const item = await getContentBySlug<T>(type, slug);
      return item;
    });

    let content = (await Promise.all(contentPromises)).filter(
      (item): item is ContentItem<T> => item !== null
    );

    // Filter drafts in production
    if (filterDraft && process.env.NODE_ENV === 'production') {
      content = content.filter((item) => item.meta.published !== false);
    }

    // Sort
    content.sort((a, b) => {
      const aValue = a.meta[sortBy];
      const bValue = b.meta[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      return 0;
    });

    // Limit
    if (limit) {
      content = content.slice(0, limit);
    }

    return content;
  } catch {
    return [];
  }
});

// Get all slugs for static generation
export const getAllSlugs = cache(async (type: string): Promise<string[]> => {
  const contentDir = path.join(CONTENT_DIR, type);
  
  try {
    const files = await fs.readdir(contentDir);
    return files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
});

// Get content by tag
export const getContentByTag = cache(async <T extends ContentMeta>(
  type: string,
  tag: string
): Promise<ContentItem<T>[]> => {
  const allContent = await getAllContent<T>(type);
  return allContent.filter((item) => item.meta.tags?.includes(tag));
});

// Get all tags
export const getAllTags = cache(async (type: string): Promise<string[]> => {
  const allContent = await getAllContent(type);
  const tags = new Set<string>();
  
  allContent.forEach((item) => {
    item.meta.tags?.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
});
```

### MDX Renderer Component

```typescript
// components/mdx/mdx-content.tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxOptions } from '@/lib/mdx/config';
import { mdxComponents } from './mdx-components';

interface MDXContentProps {
  source: string;
  components?: Record<string, React.ComponentType>;
}

export function MDXContent({ source, components }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      options={{ mdxOptions }}
      components={{ ...mdxComponents, ...components }}
    />
  );
}
```

### Custom MDX Components

```typescript
// components/mdx/mdx-components.tsx
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Custom callout component
function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
    error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
    success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  return (
    <div className={cn('border-l-4 p-4 my-6 rounded-r-lg', styles[type])}>
      <div className="flex gap-2">
        <span>{icons[type]}</span>
        <div>{children}</div>
      </div>
    </div>
  );
}

// Code block wrapper
function Pre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      {...props}
      className="relative overflow-x-auto rounded-lg border bg-muted p-4 my-6"
    >
      {children}
    </pre>
  );
}

// Inline code
function Code({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      {...props}
      className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
    >
      {children}
    </code>
  );
}

// Custom link with external detection
function CustomLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <span {...props}>{children}</span>;

  const isExternal = href.startsWith('http');
  
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-4"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className="text-primary underline underline-offset-4" {...props}>
      {children}
    </Link>
  );
}

// Responsive image
function MDXImage({
  src,
  alt,
  width,
  height,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;

  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt || ''}
        width={Number(width) || 800}
        height={Number(height) || 450}
        className="rounded-lg"
        {...props}
      />
      {alt && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

// Tabs component for code examples
function Tabs({ children }: { children: React.ReactNode }) {
  return <div className="my-6">{children}</div>;
}

function Tab({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div data-label={label}>
      {children}
    </div>
  );
}

// Video embed
function Video({ src, title }: { src: string; title?: string }) {
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
  
  if (isYouTube) {
    const videoId = src.includes('youtu.be')
      ? src.split('/').pop()
      : new URL(src).searchParams.get('v');
    
    return (
      <div className="relative aspect-video my-8 rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <video
      src={src}
      controls
      className="w-full rounded-lg my-8"
      title={title}
    />
  );
}

// Export all components
export const mdxComponents = {
  // Override default elements
  a: CustomLink,
  img: MDXImage,
  pre: Pre,
  code: Code,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-bold mt-12 mb-4 scroll-mt-20" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-bold mt-8 mb-3 scroll-mt-20" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-xl font-bold mt-6 mb-2 scroll-mt-20" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-6" {...props} />
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full" {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border px-4 py-2 text-left font-bold" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border px-4 py-2" {...props} />
  ),
  // Custom components
  Callout,
  Tabs,
  Tab,
  Video,
  Image: MDXImage,
};
```

### Table of Contents

```typescript
// lib/mdx/toc.ts
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    toc.push({ id, text, level });
  }

  return toc;
}

// components/mdx/table-of-contents.tsx
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/lib/mdx/toc';

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="space-y-1">
      <p className="font-medium mb-4">On this page</p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            'block text-sm py-1 text-muted-foreground hover:text-foreground transition-colors',
            item.level === 3 && 'pl-4',
            item.level === 4 && 'pl-8',
            activeId === item.id && 'text-primary font-medium'
          )}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
```

### Blog Post Page

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getContentBySlug, getAllSlugs } from '@/lib/mdx/content';
import { extractToc } from '@/lib/mdx/toc';
import { MDXContent } from '@/components/mdx/mdx-content';
import { TableOfContents } from '@/components/mdx/table-of-contents';
import { formatDate } from '@/lib/utils';

interface BlogMeta {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  published?: boolean;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs('blog');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getContentBySlug<BlogMeta>('blog', slug);

  if (!post) return {};

  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      publishedTime: post.meta.date,
      authors: [post.meta.author],
      images: post.meta.image ? [post.meta.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getContentBySlug<BlogMeta>('blog', slug);

  if (!post) notFound();

  const toc = extractToc(post.content);

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
        <article className="max-w-3xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.meta.title}</h1>
            
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{post.meta.author}</span>
              <span>•</span>
              <time dateTime={post.meta.date}>
                {formatDate(post.meta.date)}
              </time>
            </div>

            {post.meta.tags && (
              <div className="flex gap-2 mt-4">
                {post.meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-muted rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <MDXContent source={post.content} />
          </div>
        </article>

        {/* Sidebar with TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TableOfContents items={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
```

### Content Collection Page

```typescript
// app/blog/page.tsx
import Link from 'next/link';
import { getAllContent } from '@/lib/mdx/content';
import { formatDate } from '@/lib/utils';

interface BlogMeta {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
}

export default async function BlogPage() {
  const posts = await getAllContent<BlogMeta>('blog');

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      <div className="grid gap-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-8">
            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                {post.meta.title}
              </h2>
            </Link>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <time dateTime={post.meta.date}>
                {formatDate(post.meta.date)}
              </time>
              <span>•</span>
              <span>{post.meta.author}</span>
            </div>

            <p className="mt-4 text-muted-foreground">
              {post.meta.description}
            </p>

            {post.meta.tags && (
              <div className="flex gap-2 mt-4">
                {post.meta.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag}`}
                    className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
```

### Example MDX File

```mdx
---
title: Getting Started with Next.js 15
description: Learn about the new features in Next.js 15 including async request APIs and the new cache directive
date: 2024-01-15
author: John Doe
tags: [nextjs, react, tutorial]
published: true
---

# Getting Started with Next.js 15

Next.js 15 introduces several exciting new features that improve both developer experience and application performance.

<Callout type="info">
This guide assumes you have basic knowledge of React and TypeScript.
</Callout>

## What's New

### Async Request APIs

In Next.js 15, `params` and `searchParams` are now Promises:

```typescript
// app/blog/[slug]/page.tsx
export default async function Page({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  // ...
}
```

### The `use cache` Directive

The new caching API provides fine-grained control:

```typescript
async function getData() {
  'use cache';
  cacheLife('hours');
  
  return fetch('/api/data').then(r => r.json());
}
```

<Callout type="warning">
The `use cache` directive is currently experimental.
</Callout>

## Conclusion

Next.js 15 brings powerful new features for building modern web applications.

<Video src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Next.js 15 Overview" />
```

## Anti-patterns

1. **No syntax highlighting** - Always configure rehype-pretty-code
2. **Missing frontmatter** - Require title and description
3. **No image optimization** - Use next/image in MDX components
4. **No TOC for long content** - Add table of contents for navigation
5. **Hardcoded paths** - Use constants for content directories

## Related Skills

- [[sanity]] - Headless CMS alternative
- [[static-rendering]] - Static generation
- [[streaming]] - Streaming with Suspense

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial MDX pattern with custom components and TOC
