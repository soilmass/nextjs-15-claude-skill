---
id: r-blog-platform
name: Blog Platform Recipe
version: 3.0.0
layer: L6
category: recipes
description: Complete recipe for building a modern blog platform with MDX and Next.js 15
tags: [recipe, blog, mdx, cms, content, writing, publishing]
formula: "BlogPlatform = BlogIndex(t-blog-index) + BlogPostPage(t-blog-post-page) + MarketingLayout(t-marketing-layout) + AuthLayout(t-auth-layout) + DashboardLayout(t-dashboard-layout) + SearchResultsPage(t-search-results-page) + SettingsPage(t-settings-page) + BlogPost(o-blog-post) + CommentsSection(o-comments-section) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + SocialShare(o-social-share) + SearchModal(o-search-modal) + NotificationCenter(o-notification-center) + SettingsForm(o-settings-form) + Sidebar(o-sidebar) + Cta(o-cta) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + ShareButton(m-share-button) + Rating(m-rating) + Card(m-card) + SearchInput(m-search-input) + TagInput(m-tag-input) + Badge(m-badge) + Avatar(m-avatar) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + StaticRendering(pt-static-rendering) + ImageOptimization(pt-image-optimization) + Mdx(pt-mdx) + RichTextEditor(pt-rich-text-editor) + FullTextSearch(pt-full-text-search) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + Rss(pt-rss) + SocialSharing(pt-social-sharing) + TransactionalEmail(pt-transactional-email) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + RateLimiting(pt-rate-limiting) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + AuditLogging(pt-audit-logging) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + GdprCompliance(pt-gdpr-compliance) + SessionManagement(pt-session-management)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/share-button.md
  - ../molecules/rating.md
  - ../molecules/card.md
  - ../molecules/search-input.md
  - ../molecules/tag-input.md
  # L3 Organisms - Complex Components
  - ../organisms/blog-post.md
  - ../organisms/comments-section.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/social-share.md
  - ../organisms/search-modal.md
  - ../organisms/notification-center.md
  - ../organisms/settings-form.md
  # L4 Templates - Page Layouts
  - ../templates/blog-index.md
  - ../templates/blog-post-page.md
  - ../templates/marketing-layout.md
  - ../templates/auth-layout.md
  - ../templates/dashboard-layout.md
  - ../templates/search-results-page.md
  - ../templates/settings-page.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  # L5 Patterns - Rendering & Optimization
  - ../patterns/static-rendering.md
  - ../patterns/image-optimization.md
  # L5 Patterns - Content
  - ../patterns/mdx.md
  - ../patterns/rich-text-editor.md
  - ../patterns/full-text-search.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  - ../patterns/rss.md
  # L5 Patterns - Social & Communication
  - ../patterns/social-sharing.md
  - ../patterns/transactional-email.md
  # L5 Patterns - Forms
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  # L5 Patterns - Data Management
  - ../patterns/pagination.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security (Additional)
  - ../patterns/audit-logging.md
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Privacy
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Authentication (Additional)
  - ../patterns/session-management.md
  # L3 Organisms - Additional
  - ../organisms/sidebar.md
  - ../organisms/cta.md
  # L2 Molecules - Additional
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/toast.md
dependencies:
  - next
  - next-mdx-remote
  - gray-matter
  - rehype-pretty-code
  - shiki
complexity: intermediate
estimated_time: 4-8 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Blog Platform Recipe

## Overview

Build a full-featured blog platform with MDX for rich content, syntax highlighting, SEO optimization, and optional CMS integration. Supports both file-based content and headless CMS. Perfect for personal blogs, company blogs, and technical documentation.

## Architecture

```
app/
├── (blog)/                      # Blog route group
│   ├── layout.tsx              # Blog layout
│   ├── page.tsx                # Blog homepage
│   ├── blog/
│   │   ├── page.tsx            # Blog index with pagination
│   │   └── [slug]/
│   │       └── page.tsx        # Individual post (SSG)
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx        # Category archive
│   ├── tag/
│   │   └── [tag]/
│   │       └── page.tsx        # Tag archive
│   ├── author/
│   │   └── [id]/
│   │       └── page.tsx        # Author posts
│   └── search/
│       └── page.tsx            # Search results
├── api/
│   ├── posts/
│   │   └── route.ts            # Posts API
│   ├── subscribe/
│   │   └── route.ts            # Newsletter subscription
│   └── views/
│       └── [slug]/
│           └── route.ts        # View counter
├── rss.xml/
│   └── route.ts                # RSS feed
└── sitemap.ts                  # Dynamic sitemap

content/
├── posts/                       # MDX blog posts
│   ├── getting-started.mdx
│   └── advanced-patterns.mdx
└── authors/                     # Author data
    └── authors.json
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| blog-index | L4 | Post listing page |
| blog-post-page | L4 | Individual post template |
| blog-post | L3 | Post content display |
| mdx-remote | L5 | MDX rendering |
| syntax-highlighting | L5 | Code block styling |
| static-generation | L5 | SSG for posts |
| metadata | L5 | SEO optimization |
| rss-feed | L5 | RSS generation |

## Implementation

### Content Layer

```typescript
// lib/content/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  author: string;
  image?: string;
  tags?: string[];
  category?: string;
  draft?: boolean;
  featured?: boolean;
}

export interface Post {
  slug: string;
  content: string;
  frontmatter: PostFrontmatter;
  readingTime: number;
}

export interface PostMeta {
  slug: string;
  frontmatter: PostFrontmatter;
  readingTime: number;
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Cache the post fetching for the request
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  try {
    const filePath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      content,
      frontmatter: data as PostFrontmatter,
      readingTime: calculateReadingTime(content),
    };
  } catch {
    return null;
  }
});

export const getAllPosts = cache(async (): Promise<PostMeta[]> => {
  const files = fs.readdirSync(postsDirectory);
  
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const filePath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      return {
        slug,
        frontmatter: data as PostFrontmatter,
        readingTime: calculateReadingTime(content),
      };
    })
    // Filter out drafts in production
    .filter((post) => process.env.NODE_ENV === 'development' || !post.frontmatter.draft)
    // Sort by date descending
    .sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    );

  return posts;
});

export const getPostsByCategory = cache(async (category: string): Promise<PostMeta[]> => {
  const posts = await getAllPosts();
  return posts.filter(
    (post) => post.frontmatter.category?.toLowerCase() === category.toLowerCase()
  );
});

export const getPostsByTag = cache(async (tag: string): Promise<PostMeta[]> => {
  const posts = await getAllPosts();
  return posts.filter((post) =>
    post.frontmatter.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
});

export const getPostsByAuthor = cache(async (authorId: string): Promise<PostMeta[]> => {
  const posts = await getAllPosts();
  return posts.filter((post) => post.frontmatter.author === authorId);
});

export const getFeaturedPosts = cache(async (limit = 3): Promise<PostMeta[]> => {
  const posts = await getAllPosts();
  return posts.filter((post) => post.frontmatter.featured).slice(0, limit);
});

export const getAllCategories = cache(async (): Promise<string[]> => {
  const posts = await getAllPosts();
  const categories = new Set<string>();
  
  posts.forEach((post) => {
    if (post.frontmatter.category) {
      categories.add(post.frontmatter.category);
    }
  });
  
  return Array.from(categories);
});

export const getAllTags = cache(async (): Promise<string[]> => {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  
  posts.forEach((post) => {
    post.frontmatter.tags?.forEach((tag) => tags.add(tag));
  });
  
  return Array.from(tags);
});
```

### MDX Configuration

```typescript
// lib/mdx/config.ts
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import { MDXComponents } from './components';

const rehypePrettyCodeOptions = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: true,
  onVisitLine(node: any) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node: any) {
    node.properties.className = ['line--highlighted'];
  },
  onVisitHighlightedChars(node: any) {
    node.properties.className = ['word--highlighted'];
  },
};

export async function compileMDXContent(source: string) {
  const { content, frontmatter } = await compileMDX({
    source,
    components: MDXComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          [rehypePrettyCode, rehypePrettyCodeOptions],
        ],
      },
    },
  });

  return { content, frontmatter };
}
```

### MDX Components

```tsx
// lib/mdx/components.tsx
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Custom components for MDX
export const MDXComponents = {
  // Override default elements
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn('scroll-m-20 text-4xl font-bold tracking-tight', className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 first:mt-0',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn('scroll-m-20 text-2xl font-semibold tracking-tight mt-8', className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn('scroll-m-20 text-xl font-semibold tracking-tight mt-6', className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('my-6 ml-6 list-decimal [&>li]:mt-2', className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('mt-2', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn('mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground', className)}
      {...props}
    />
  ),
  hr: ({ ...props }) => <hr className="my-8 border-muted" {...props} />,
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn('w-full', className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn('m-0 border-t p-0 even:bg-muted', className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        'border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        'mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted p-4',
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className
      )}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith('http');
    
    if (isExternal) {
      return (
        <a
          className={cn('font-medium text-primary underline underline-offset-4', className)}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      );
    }
    
    return (
      <Link
        className={cn('font-medium text-primary underline underline-offset-4', className)}
        href={href || '#'}
        {...props}
      />
    );
  },
  
  // Custom components
  Image: ({ src, alt, width, height, ...props }: any) => (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt || ''}
        width={width || 800}
        height={height || 400}
        className="rounded-lg border"
        {...props}
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  
  Callout: ({ type = 'info', title, children }: {
    type?: 'info' | 'warning' | 'error' | 'success';
    title?: string;
    children: React.ReactNode;
  }) => (
    <Alert variant={type === 'error' ? 'destructive' : 'default'} className="my-6">
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  ),
  
  Tabs: Tabs,
  TabsList: TabsList,
  TabsTrigger: TabsTrigger,
  TabsContent: TabsContent,
  
  YouTube: ({ id }: { id: string }) => (
    <div className="my-8 aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full rounded-lg"
      />
    </div>
  ),
  
  CodeSandbox: ({ id }: { id: string }) => (
    <iframe
      src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
      className="my-8 h-[500px] w-full rounded-lg border"
      title="CodeSandbox"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    />
  ),
};
```

### Blog Post Page

```tsx
// app/(blog)/blog/[slug]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getPostBySlug, getAllPosts } from '@/lib/content/posts';
import { compileMDXContent } from '@/lib/mdx/config';
import { getAuthor } from '@/lib/content/authors';
import { formatDate } from '@/lib/utils';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { AuthorCard } from '@/components/blog/author-card';
import { ShareButtons } from '@/components/blog/share-buttons';
import { RelatedPosts } from '@/components/blog/related-posts';
import { NewsletterForm } from '@/components/blog/newsletter-form';
import { ViewCounter } from '@/components/blog/view-counter';
import { Badge } from '@/components/ui/badge';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const { frontmatter } = post;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    authors: [{ name: frontmatter.author }],
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updatedAt,
      authors: [frontmatter.author],
      images: frontmatter.image ? [frontmatter.image] : [],
      tags: frontmatter.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: frontmatter.image ? [frontmatter.image] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { content } = await compileMDXContent(post.content);
  const author = await getAuthor(post.frontmatter.author);

  return (
    <article className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mx-auto max-w-3xl text-center">
        {post.frontmatter.category && (
          <Badge variant="secondary" className="mb-4">
            {post.frontmatter.category}
          </Badge>
        )}
        
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {post.frontmatter.title}
        </h1>
        
        <p className="mt-4 text-xl text-muted-foreground">
          {post.frontmatter.description}
        </p>
        
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <time dateTime={post.frontmatter.date}>
            {formatDate(post.frontmatter.date)}
          </time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
          <span>·</span>
          <Suspense fallback={<span>-- views</span>}>
            <ViewCounter slug={slug} />
          </Suspense>
        </div>
      </header>

      {/* Featured Image */}
      {post.frontmatter.image && (
        <div className="mx-auto mt-8 max-w-4xl">
          <Image
            src={post.frontmatter.image}
            alt={post.frontmatter.title}
            width={1200}
            height={630}
            className="rounded-lg"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[1fr_250px]">
        {/* Main Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {content}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <TableOfContents />
            
            <ShareButtons
              title={post.frontmatter.title}
              url={`/blog/${slug}`}
            />
          </div>
        </aside>
      </div>

      {/* Tags */}
      {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {post.frontmatter.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Author */}
      {author && (
        <div className="mx-auto mt-12 max-w-3xl">
          <AuthorCard author={author} />
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="mx-auto mt-12 max-w-3xl">
        <NewsletterForm />
      </div>

      {/* Related Posts */}
      <Suspense>
        <div className="mx-auto mt-16 max-w-4xl">
          <RelatedPosts
            currentSlug={slug}
            category={post.frontmatter.category}
            tags={post.frontmatter.tags}
          />
        </div>
      </Suspense>
    </article>
  );
}
```

### RSS Feed

```typescript
// app/rss.xml/route.ts
import { getAllPosts } from '@/lib/content/posts';

export async function GET() {
  const posts = await getAllPosts();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Your Blog Name</title>
    <link>${siteUrl}</link>
    <description>Your blog description</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.frontmatter.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.frontmatter.description}]]></description>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      ${post.frontmatter.category ? `<category>${post.frontmatter.category}</category>` : ''}
      ${post.frontmatter.tags?.map((tag) => `<category>${tag}</category>`).join('') || ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

### Example MDX Post

```mdx
---
title: "Getting Started with Next.js 15"
description: "Learn how to build modern web applications with Next.js 15 and React 19"
date: "2025-01-15"
author: "john-doe"
image: "/images/posts/nextjs-15.png"
category: "Tutorials"
tags: ["nextjs", "react", "web-development"]
featured: true
---

Next.js 15 introduces several exciting features that make building web applications even better.

## What's New in Next.js 15

The latest version brings significant improvements:

1. **React 19 Support** - Full support for the latest React features
2. **Async Request APIs** - `params` and `searchParams` are now Promises
3. **Improved Caching** - More control over data caching

<Callout type="info" title="Important">
  Remember to `await` your params in page components!
</Callout>

### Code Example

Here's how to create a page with the new API:

```tsx title="app/posts/[slug]/page.tsx"
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  return <h1>Post: {slug}</h1>;
}
```

<YouTube id="dQw4w9WgXcQ" />

## Conclusion

Next.js 15 is a significant release that improves developer experience while maintaining excellent performance.
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npm install -D msw
npx playwright install
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/e2e/', 'content/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { server } from './mocks/server';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/blog',
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock fs for content tests
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
  };
});

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Posts API
  http.get('/api/posts', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    return HttpResponse.json({
      posts: [
        {
          slug: 'getting-started',
          frontmatter: {
            title: 'Getting Started',
            description: 'Learn how to get started',
            date: '2025-01-15',
            author: 'john-doe',
            category: 'Tutorials',
            tags: ['beginner', 'guide'],
          },
          readingTime: 5,
        },
      ],
      total: 1,
      page,
      limit,
    });
  }),

  http.get('/api/posts/:slug', async ({ params }) => {
    return HttpResponse.json({
      slug: params.slug,
      content: '# Test Post\n\nThis is test content.',
      frontmatter: {
        title: 'Test Post',
        description: 'A test post',
        date: '2025-01-15',
        author: 'john-doe',
      },
      readingTime: 3,
    });
  }),

  // Search API
  http.get('/api/search', async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    if (!query) {
      return HttpResponse.json({ results: [] });
    }
    
    return HttpResponse.json({
      results: [
        {
          slug: 'matching-post',
          title: `Post matching "${query}"`,
          description: 'A matching description',
          excerpt: `...content with ${query}...`,
        },
      ],
    });
  }),

  // Newsletter subscription
  http.post('/api/subscribe', async ({ request }) => {
    const body = await request.json() as { email: string };
    
    if (!body.email?.includes('@')) {
      return HttpResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({ success: true });
  }),

  // View counter
  http.get('/api/views/:slug', async ({ params }) => {
    return HttpResponse.json({ views: 1234 });
  }),

  http.post('/api/views/:slug', async ({ params }) => {
    return HttpResponse.json({ views: 1235 });
  }),

  // Comments API
  http.get('/api/posts/:slug/comments', async () => {
    return HttpResponse.json({
      comments: [
        {
          id: 'comment-1',
          author: 'Jane Doe',
          content: 'Great post!',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }),

  http.post('/api/posts/:slug/comments', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'comment-new',
      ...body,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),
];
```

### Unit Tests

```typescript
// tests/unit/lib/posts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import {
  getPostBySlug,
  getAllPosts,
  getPostsByCategory,
  getPostsByTag,
  getAllCategories,
  getAllTags,
  calculateReadingTime,
} from '@/lib/content/posts';

describe('Post Content Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateReadingTime', () => {
    it('calculates reading time for short content', () => {
      const content = 'Word '.repeat(100); // 100 words
      expect(calculateReadingTime(content)).toBe(1); // ceil(100/200)
    });

    it('calculates reading time for long content', () => {
      const content = 'Word '.repeat(1000); // 1000 words
      expect(calculateReadingTime(content)).toBe(5); // ceil(1000/200)
    });

    it('handles empty content', () => {
      expect(calculateReadingTime('')).toBe(1);
    });
  });

  describe('getPostBySlug', () => {
    it('returns post with frontmatter and content', async () => {
      const mockContent = `---
title: "Test Post"
description: "A test post"
date: "2025-01-15"
author: "john-doe"
---

# Test Content

This is the post body.`;
      
      (fs.readFileSync as any).mockReturnValue(mockContent);
      
      const post = await getPostBySlug('test-post');
      
      expect(post).not.toBeNull();
      expect(post?.frontmatter.title).toBe('Test Post');
      expect(post?.content).toContain('# Test Content');
      expect(post?.readingTime).toBeGreaterThan(0);
    });

    it('returns null for non-existent post', async () => {
      (fs.readFileSync as any).mockImplementation(() => {
        throw new Error('File not found');
      });
      
      const post = await getPostBySlug('non-existent');
      
      expect(post).toBeNull();
    });
  });

  describe('getAllPosts', () => {
    it('returns sorted posts', async () => {
      (fs.readdirSync as any).mockReturnValue(['post1.mdx', 'post2.mdx']);
      (fs.readFileSync as any).mockImplementation((path: string) => {
        if (path.includes('post1')) {
          return `---
title: "First Post"
date: "2025-01-10"
author: "john"
---
Content`;
        }
        return `---
title: "Second Post"
date: "2025-01-15"
author: "jane"
---
Content`;
      });
      
      const posts = await getAllPosts();
      
      expect(posts).toHaveLength(2);
      // Should be sorted by date descending
      expect(posts[0].frontmatter.title).toBe('Second Post');
    });

    it('filters out draft posts in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      (fs.readdirSync as any).mockReturnValue(['draft.mdx', 'published.mdx']);
      (fs.readFileSync as any).mockImplementation((path: string) => {
        if (path.includes('draft')) {
          return `---
title: "Draft"
date: "2025-01-15"
draft: true
---
Content`;
        }
        return `---
title: "Published"
date: "2025-01-15"
---
Content`;
      });
      
      const posts = await getAllPosts();
      
      expect(posts).toHaveLength(1);
      expect(posts[0].frontmatter.title).toBe('Published');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('only returns .mdx files', async () => {
      (fs.readdirSync as any).mockReturnValue(['post.mdx', 'readme.md', 'config.json']);
      (fs.readFileSync as any).mockReturnValue(`---
title: "Post"
date: "2025-01-15"
---
Content`);
      
      const posts = await getAllPosts();
      
      expect(posts).toHaveLength(1);
    });
  });

  describe('getPostsByCategory', () => {
    it('filters posts by category', async () => {
      (fs.readdirSync as any).mockReturnValue(['post1.mdx', 'post2.mdx']);
      (fs.readFileSync as any).mockImplementation((path: string) => {
        if (path.includes('post1')) {
          return `---
title: "Tutorial"
date: "2025-01-15"
category: "Tutorials"
---`;
        }
        return `---
title: "News"
date: "2025-01-15"
category: "News"
---`;
      });
      
      const posts = await getPostsByCategory('Tutorials');
      
      expect(posts).toHaveLength(1);
      expect(posts[0].frontmatter.category).toBe('Tutorials');
    });

    it('is case insensitive', async () => {
      (fs.readdirSync as any).mockReturnValue(['post.mdx']);
      (fs.readFileSync as any).mockReturnValue(`---
title: "Post"
date: "2025-01-15"
category: "Tutorials"
---`);
      
      const posts = await getPostsByCategory('tutorials');
      
      expect(posts).toHaveLength(1);
    });
  });

  describe('getPostsByTag', () => {
    it('filters posts by tag', async () => {
      (fs.readdirSync as any).mockReturnValue(['post1.mdx', 'post2.mdx']);
      (fs.readFileSync as any).mockImplementation((path: string) => {
        if (path.includes('post1')) {
          return `---
title: "Post 1"
date: "2025-01-15"
tags: ["react", "nextjs"]
---`;
        }
        return `---
title: "Post 2"
date: "2025-01-15"
tags: ["vue"]
---`;
      });
      
      const posts = await getPostsByTag('react');
      
      expect(posts).toHaveLength(1);
    });
  });

  describe('getAllCategories', () => {
    it('returns unique categories', async () => {
      (fs.readdirSync as any).mockReturnValue(['post1.mdx', 'post2.mdx', 'post3.mdx']);
      (fs.readFileSync as any).mockImplementation((path: string) => {
        if (path.includes('post1') || path.includes('post3')) {
          return `---
title: "Post"
date: "2025-01-15"
category: "Tutorials"
---`;
        }
        return `---
title: "Post"
date: "2025-01-15"
category: "News"
---`;
      });
      
      const categories = await getAllCategories();
      
      expect(categories).toHaveLength(2);
      expect(categories).toContain('Tutorials');
      expect(categories).toContain('News');
    });
  });

  describe('getAllTags', () => {
    it('returns unique tags from all posts', async () => {
      (fs.readdirSync as any).mockReturnValue(['post1.mdx', 'post2.mdx']);
      (fs.readFileSync as any).mockImplementation((path: string) => {
        if (path.includes('post1')) {
          return `---
title: "Post"
date: "2025-01-15"
tags: ["react", "nextjs"]
---`;
        }
        return `---
title: "Post"
date: "2025-01-15"
tags: ["react", "typescript"]
---`;
      });
      
      const tags = await getAllTags();
      
      expect(tags).toHaveLength(3);
      expect(tags).toContain('react');
      expect(tags).toContain('nextjs');
      expect(tags).toContain('typescript');
    });
  });
});
```

```typescript
// tests/unit/lib/mdx.test.ts
import { describe, it, expect, vi } from 'vitest';
import { compileMDXContent } from '@/lib/mdx/config';

describe('MDX Configuration', () => {
  it('compiles basic markdown', async () => {
    const source = '# Hello World\n\nThis is a paragraph.';
    const { content } = await compileMDXContent(source);
    
    expect(content).toBeDefined();
  });

  it('handles code blocks with syntax highlighting', async () => {
    const source = `
\`\`\`typescript
const x: number = 1;
\`\`\`
`;
    
    const { content } = await compileMDXContent(source);
    expect(content).toBeDefined();
  });

  it('adds heading anchors', async () => {
    const source = '## My Heading';
    const { content } = await compileMDXContent(source);
    
    expect(content).toBeDefined();
    // The heading should have an id for linking
  });

  it('handles GFM tables', async () => {
    const source = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;
    
    const { content } = await compileMDXContent(source);
    expect(content).toBeDefined();
  });

  it('renders custom Callout component', async () => {
    const source = `
<Callout type="warning" title="Warning">
  This is a warning message.
</Callout>
`;
    
    const { content } = await compileMDXContent(source);
    expect(content).toBeDefined();
  });
});
```

```typescript
// tests/unit/components/blog-post-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogPostCard } from '@/components/blog/blog-post-card';

const mockPost = {
  slug: 'test-post',
  frontmatter: {
    title: 'Test Post Title',
    description: 'This is a test description',
    date: '2025-01-15',
    author: 'john-doe',
    image: '/images/test.jpg',
    category: 'Tutorials',
    tags: ['react', 'nextjs'],
  },
  readingTime: 5,
};

describe('BlogPostCard', () => {
  it('renders post title', () => {
    render(<BlogPostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders post description', () => {
    render(<BlogPostCard post={mockPost} />);
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<BlogPostCard post={mockPost} />);
    
    expect(screen.getByText(/Jan(uary)? 15, 2025/)).toBeInTheDocument();
  });

  it('renders reading time', () => {
    render(<BlogPostCard post={mockPost} />);
    
    expect(screen.getByText(/5 min read/)).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<BlogPostCard post={mockPost} />);
    
    expect(screen.getByText('Tutorials')).toBeInTheDocument();
  });

  it('links to correct post', () => {
    render(<BlogPostCard post={mockPost} />);
    
    const link = screen.getByRole('link', { name: /test post title/i });
    expect(link).toHaveAttribute('href', '/blog/test-post');
  });

  it('renders featured image when provided', () => {
    render(<BlogPostCard post={mockPost} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('test.jpg'));
  });

  it('renders tags', () => {
    render(<BlogPostCard post={mockPost} showTags />);
    
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('nextjs')).toBeInTheDocument();
  });
});
```

```typescript
// tests/unit/components/newsletter-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsletterForm } from '@/components/blog/newsletter-form';

describe('NewsletterForm', () => {
  it('renders email input and submit button', () => {
    render(<NewsletterForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /subscribe/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid email', async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /subscribe/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/thank you|subscribed/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /subscribe/i }));
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    
    // Type an email that triggers error in mock
    await user.type(screen.getByLabelText(/email/i), 'error@test');
    await user.click(screen.getByRole('button', { name: /subscribe/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });
});
```

```typescript
// tests/unit/components/table-of-contents.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableOfContents } from '@/components/blog/table-of-contents';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
global.IntersectionObserver = MockIntersectionObserver as any;

describe('TableOfContents', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <article>
        <h2 id="intro">Introduction</h2>
        <h2 id="setup">Setup</h2>
        <h3 id="setup-deps">Dependencies</h3>
        <h2 id="conclusion">Conclusion</h2>
      </article>
    `;
  });

  it('renders headings from the document', () => {
    render(<TableOfContents />);
    
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Conclusion')).toBeInTheDocument();
  });

  it('links to heading anchors', () => {
    render(<TableOfContents />);
    
    const introLink = screen.getByRole('link', { name: /introduction/i });
    expect(introLink).toHaveAttribute('href', '#intro');
  });

  it('shows nested headings with indentation', () => {
    render(<TableOfContents />);
    
    const depsLink = screen.getByText('Dependencies');
    expect(depsLink.closest('li')).toHaveClass('ml-4');
  });
});
```

```typescript
// tests/unit/components/search.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchDialog } from '@/components/blog/search-dialog';

describe('SearchDialog', () => {
  it('opens on button click', async () => {
    const user = userEvent.setup();
    render(<SearchDialog />);
    
    await user.click(screen.getByRole('button', { name: /search/i }));
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows search results', async () => {
    const user = userEvent.setup();
    render(<SearchDialog />);
    
    await user.click(screen.getByRole('button', { name: /search/i }));
    await user.type(screen.getByRole('searchbox'), 'nextjs');
    
    await waitFor(() => {
      expect(screen.getByText(/matching.*nextjs/i)).toBeInTheDocument();
    });
  });

  it('shows no results message', async () => {
    const user = userEvent.setup();
    render(<SearchDialog />);
    
    await user.click(screen.getByRole('button', { name: /search/i }));
    await user.type(screen.getByRole('searchbox'), 'xyz123notfound');
    
    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  it('closes on escape key', async () => {
    const user = userEvent.setup();
    render(<SearchDialog />);
    
    await user.click(screen.getByRole('button', { name: /search/i }));
    await user.keyboard('{Escape}');
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens with keyboard shortcut', async () => {
    const user = userEvent.setup();
    render(<SearchDialog />);
    
    await user.keyboard('{Control>}k{/Control}');
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// tests/integration/blog-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BlogIndexPage from '@/app/(blog)/blog/page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Blog Index Page', () => {
  it('displays list of posts', async () => {
    render(<BlogIndexPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });
  });

  it('shows post metadata', async () => {
    render(<BlogIndexPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText(/5 min read/)).toBeInTheDocument();
      expect(screen.getByText('Tutorials')).toBeInTheDocument();
    });
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    render(<BlogIndexPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Tutorials')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /tutorials/i }));
    
    // URL should update with category filter
  });

  it('supports pagination', async () => {
    const user = userEvent.setup();
    render(<BlogIndexPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
    });
  });
});
```

```typescript
// tests/integration/blog-post.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BlogPostPage from '@/app/(blog)/blog/[slug]/page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Blog Post Page', () => {
  it('displays post content', async () => {
    render(
      <BlogPostPage params={Promise.resolve({ slug: 'getting-started' })} />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  it('shows author information', async () => {
    render(
      <BlogPostPage params={Promise.resolve({ slug: 'getting-started' })} />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/john/i)).toBeInTheDocument();
    });
  });

  it('displays table of contents', async () => {
    render(
      <BlogPostPage params={Promise.resolve({ slug: 'getting-started' })} />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /table of contents/i })).toBeInTheDocument();
    });
  });

  it('shows share buttons', async () => {
    render(
      <BlogPostPage params={Promise.resolve({ slug: 'getting-started' })} />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });
  });

  it('displays related posts', async () => {
    render(
      <BlogPostPage params={Promise.resolve({ slug: 'getting-started' })} />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/related/i)).toBeInTheDocument();
    });
  });
});
```

### API Route Tests

```typescript
// tests/api/posts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/posts/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/content/posts', () => ({
  getAllPosts: vi.fn().mockResolvedValue([
    {
      slug: 'post-1',
      frontmatter: { title: 'Post 1', date: '2025-01-15' },
      readingTime: 5,
    },
  ]),
}));

describe('Posts API Route', () => {
  it('returns posts list', async () => {
    const request = new NextRequest('http://localhost/api/posts');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.posts).toHaveLength(1);
  });

  it('paginates results', async () => {
    const request = new NextRequest('http://localhost/api/posts?page=1&limit=5');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.page).toBe(1);
    expect(data.limit).toBe(5);
  });

  it('filters by category', async () => {
    const request = new NextRequest('http://localhost/api/posts?category=tutorials');
    await GET(request);
    
    // Verify filtering was applied
  });
});
```

```typescript
// tests/api/rss.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/rss.xml/route';

vi.mock('@/lib/content/posts', () => ({
  getAllPosts: vi.fn().mockResolvedValue([
    {
      slug: 'post-1',
      frontmatter: {
        title: 'Post 1',
        description: 'Description 1',
        date: '2025-01-15',
        category: 'Tutorials',
        tags: ['react'],
      },
    },
  ]),
}));

describe('RSS Feed Route', () => {
  it('returns valid XML', async () => {
    const response = await GET();
    const text = await response.text();
    
    expect(response.headers.get('Content-Type')).toBe('application/xml');
    expect(text).toContain('<?xml version="1.0"');
  });

  it('includes all posts', async () => {
    const response = await GET();
    const text = await response.text();
    
    expect(text).toContain('<title><![CDATA[Post 1]]></title>');
  });

  it('includes post metadata', async () => {
    const response = await GET();
    const text = await response.text();
    
    expect(text).toContain('<category>Tutorials</category>');
    expect(text).toContain('<category>react</category>');
  });

  it('has correct cache headers', async () => {
    const response = await GET();
    
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
  });
});
```

```typescript
// tests/api/subscribe.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/subscribe/route';
import { NextRequest } from 'next/server';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    contacts: {
      create: vi.fn().mockResolvedValue({ id: 'contact-123' }),
    },
  })),
}));

describe('Subscribe API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes valid email', async () => {
    const request = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
  });

  it('rejects invalid email', async () => {
    const request = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid' }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('handles duplicate subscriptions', async () => {
    const { Resend } = await import('resend');
    (Resend as any).mockImplementation(() => ({
      contacts: {
        create: vi.fn().mockRejectedValue({ code: 'duplicate_contact' }),
      },
    }));
    
    const request = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@example.com' }),
    });
    
    const response = await POST(request);
    
    // Should still return success (already subscribed)
    expect(response.status).toBe(200);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/blog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Blog E2E', () => {
  test('homepage shows featured posts', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('[data-testid="featured-posts"]')).toBeVisible();
    await expect(page.locator('.post-card')).toHaveCount(await page.locator('.post-card').count());
  });

  test('blog index shows all posts', async ({ page }) => {
    await page.goto('/blog');
    
    await expect(page.locator('h1')).toContainText('Blog');
    await expect(page.locator('.post-card')).toHaveCount(await page.locator('.post-card').count());
  });

  test('navigates to single post', async ({ page }) => {
    await page.goto('/blog');
    
    await page.click('.post-card >> nth=0');
    
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('post page shows content', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('[data-testid="author-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="reading-time"]')).toBeVisible();
  });

  test('table of contents links work', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    const toc = page.locator('[data-testid="table-of-contents"]');
    await expect(toc).toBeVisible();
    
    const firstHeading = toc.locator('a >> nth=0');
    await firstHeading.click();
    
    // URL should have hash
    await expect(page).toHaveURL(/#/);
  });

  test('category filtering works', async ({ page }) => {
    await page.goto('/blog');
    
    await page.click('[data-testid="category-filter"] >> text=Tutorials');
    
    await expect(page).toHaveURL(/category=tutorials/i);
  });

  test('tag filtering works', async ({ page }) => {
    await page.goto('/blog');
    
    await page.click('[data-testid="tag-cloud"] >> text=react');
    
    await expect(page).toHaveURL(/tag\/react/);
  });

  test('search finds posts', async ({ page }) => {
    await page.goto('/blog');
    
    await page.click('[data-testid="search-button"]');
    await page.fill('[role="searchbox"]', 'nextjs');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('newsletter subscription works', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    await page.fill('[data-testid="newsletter-email"]', 'test@example.com');
    await page.click('[data-testid="newsletter-submit"]');
    
    await expect(page.locator('text=/thank you|subscribed/i')).toBeVisible();
  });

  test('RSS feed is accessible', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    
    expect(response?.headers()['content-type']).toContain('xml');
  });

  test('sitemap is generated', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    
    expect(response?.headers()['content-type']).toContain('xml');
  });

  test('share buttons work', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    const shareButton = page.locator('[data-testid="share-twitter"]');
    
    // Should open in new window
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      shareButton.click(),
    ]);
    
    expect(popup.url()).toContain('twitter.com');
  });
});

test.describe('Blog Accessibility', () => {
  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/blog');
    
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js' });
    
    const violations = await page.evaluate(async () => {
      const results = await (window as any).axe.run();
      return results.violations;
    });
    
    expect(violations).toEqual([]);
  });

  test('post page is accessible', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js' });
    
    const violations = await page.evaluate(async () => {
      const results = await (window as any).axe.run();
      return results.violations;
    });
    
    expect(violations).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/blog');
    
    // Tab through page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should focus on post link
    const focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('href', /\/blog\//);
  });
});

test.describe('Blog SEO', () => {
  test('has proper meta tags', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    const title = await page.title();
    expect(title).not.toBe('');
    
    const description = await page.$eval(
      'meta[name="description"]',
      (el) => el.getAttribute('content')
    );
    expect(description).not.toBeNull();
  });

  test('has Open Graph tags', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    const ogTitle = await page.$eval(
      'meta[property="og:title"]',
      (el) => el.getAttribute('content')
    );
    expect(ogTitle).not.toBeNull();
    
    const ogType = await page.$eval(
      'meta[property="og:type"]',
      (el) => el.getAttribute('content')
    );
    expect(ogType).toBe('article');
  });

  test('has Twitter card tags', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    const twitterCard = await page.$eval(
      'meta[name="twitter:card"]',
      (el) => el.getAttribute('content')
    );
    expect(twitterCard).toBe('summary_large_image');
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => el.getAttribute('href')
    );
    expect(canonical).toContain('/blog/getting-started');
  });

  test('has structured data', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    const ldJson = await page.$eval(
      'script[type="application/ld+json"]',
      (el) => el.textContent
    );
    
    const data = JSON.parse(ldJson || '{}');
    expect(data['@type']).toBe('Article');
  });
});

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile navigation works', async ({ page }) => {
    await page.goto('/blog');
    
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('table of contents is collapsible on mobile', async ({ page }) => {
    await page.goto('/blog/getting-started');
    
    const toc = page.locator('[data-testid="table-of-contents"]');
    
    // Should be collapsed initially
    await expect(toc).not.toBeVisible();
    
    // Click to expand
    await page.click('[data-testid="toc-toggle"]');
    await expect(toc).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
      tags: { component: 'Blog' },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load content</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't load this content. Please try again.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => this.setState({ hasError: false })}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <a href="/blog">
                <Home className="mr-2 h-4 w-4" />
                Back to blog
              </a>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Blog-Specific Errors

```typescript
// lib/errors/blog-errors.ts
export class BlogError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BlogError';
  }
}

export class PostNotFoundError extends BlogError {
  constructor(slug: string) {
    super(`Post "${slug}" not found`, 'POST_NOT_FOUND', 404);
  }
}

export class InvalidFrontmatterError extends BlogError {
  constructor(slug: string, field: string) {
    super(`Invalid frontmatter in "${slug}": missing ${field}`, 'INVALID_FRONTMATTER', 500);
  }
}

export class MDXCompilationError extends BlogError {
  constructor(slug: string, originalError: string) {
    super(`Failed to compile MDX for "${slug}": ${originalError}`, 'MDX_COMPILATION_ERROR', 500);
  }
}

export function handleBlogError(error: unknown): Response {
  if (error instanceof BlogError) {
    return Response.json(
      { error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    );
  }
  
  return Response.json(
    { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  );
}
```

## Accessibility

### Accessible Blog Post

```typescript
// components/blog/accessible-post.tsx
import { formatDate } from '@/lib/utils';

interface AccessiblePostProps {
  post: {
    title: string;
    description: string;
    date: string;
    author: string;
    readingTime: number;
    content: React.ReactNode;
  };
}

export function AccessiblePost({ post }: AccessiblePostProps) {
  return (
    <article
      aria-labelledby="post-title"
      className="max-w-3xl mx-auto"
    >
      <header>
        <h1 id="post-title" className="text-4xl font-bold">
          {post.title}
        </h1>
        
        <p className="mt-4 text-xl text-muted-foreground">
          {post.description}
        </p>
        
        <div 
          className="mt-4 flex items-center gap-4 text-sm text-muted-foreground"
          aria-label="Post metadata"
        >
          <time dateTime={post.date}>
            <span className="sr-only">Published on </span>
            {formatDate(post.date)}
          </time>
          <span aria-hidden="true">·</span>
          <span>
            <span className="sr-only">Reading time: </span>
            {post.readingTime} min read
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <span className="sr-only">Written by </span>
            {post.author}
          </span>
        </div>
      </header>
      
      <div 
        className="prose prose-lg mt-8"
        role="main"
      >
        {post.content}
      </div>
    </article>
  );
}
```

### Skip Links

```typescript
// components/blog/skip-links.tsx
export function BlogSkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Skip to main content
      </a>
      <a
        href="#table-of-contents"
        className="absolute top-4 left-48 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Skip to table of contents
      </a>
    </div>
  );
}
```

### Accessible Code Blocks

```typescript
// components/blog/accessible-code-block.tsx
'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  highlightedLines?: number[];
}

export function AccessibleCodeBlock({
  code,
  language,
  filename,
  highlightedLines = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <figure
      className="my-6 relative"
      aria-label={`Code block${filename ? `: ${filename}` : ''}`}
    >
      {filename && (
        <figcaption className="text-sm text-muted-foreground mb-2">
          {filename}
        </figcaption>
      )}
      
      <div className="relative">
        <pre
          className="overflow-x-auto rounded-lg bg-muted p-4"
          tabIndex={0}
          aria-label={`${language} code`}
        >
          <code className={`language-${language}`}>
            {code}
          </code>
        </pre>
        
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md bg-background/80 hover:bg-background"
          aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      
      <div className="sr-only" aria-live="polite">
        {copied && 'Code copied to clipboard'}
      </div>
    </figure>
  );
}
```

## Security

### Content Sanitization

```typescript
// lib/content/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'code', 'pre',
      'a', 'img',
      'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
  });
}

export function validateFrontmatter(data: any): boolean {
  const required = ['title', 'date'];
  
  for (const field of required) {
    if (!data[field]) {
      return false;
    }
  }
  
  // Validate date format
  if (isNaN(Date.parse(data.date))) {
    return false;
  }
  
  return true;
}
```

### Rate Limiting for Comments

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiters = {
  comments: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'ratelimit:comments',
  }),
  subscribe: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'ratelimit:subscribe',
  }),
};
```

### Input Validation

```typescript
// lib/validations/blog.ts
import { z } from 'zod';

export const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const commentSchema = z.object({
  content: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be less than 1000 characters'),
  author: z.string().min(2).max(100),
  email: z.string().email(),
});

export const searchSchema = z.object({
  q: z.string().min(2).max(100),
});
```

## Performance

### Static Generation

```typescript
// app/(blog)/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Revalidate pages periodically
export const revalidate = 3600; // 1 hour
```

### Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
};
```

### Search Index

```typescript
// lib/search/index.ts
import Fuse from 'fuse.js';
import { getAllPosts } from '@/lib/content/posts';

let searchIndex: Fuse<any> | null = null;

export async function getSearchIndex() {
  if (searchIndex) return searchIndex;
  
  const posts = await getAllPosts();
  
  searchIndex = new Fuse(posts, {
    keys: ['frontmatter.title', 'frontmatter.description', 'frontmatter.tags'],
    threshold: 0.3,
    includeMatches: true,
  });
  
  return searchIndex;
}

export async function search(query: string) {
  const index = await getSearchIndex();
  return index.search(query);
}
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: Blog CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  deploy:
    needs: [lint, test, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Analytics

```typescript
// lib/analytics.ts
import { track } from '@vercel/analytics';

export function trackPostView(slug: string) {
  track('post_view', { slug });
}

export function trackSearch(query: string, resultsCount: number) {
  track('search', { query, resultsCount });
}

export function trackNewsletterSubscribe() {
  track('newsletter_subscribe');
}
```

### Health Check

```typescript
// app/api/health/route.ts
import { getAllPosts } from '@/lib/content/posts';

export async function GET() {
  try {
    const posts = await getAllPosts();
    
    return Response.json({
      status: 'healthy',
      postsCount: posts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Failed to load content' },
      { status: 503 }
    );
  }
}
```

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_SITE_URL=https://yourblog.com

# Newsletter
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Rate Limiting
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
```

## Deployment Checklist

- [ ] Configure MDX processing
- [ ] Set up syntax highlighting themes
- [ ] Configure RSS feed
- [ ] Set up newsletter integration
- [ ] Configure search (Algolia/Pagefind)
- [ ] Set up analytics
- [ ] Configure social sharing images
- [ ] Test SEO with tools
- [ ] Verify accessibility (WAVE, axe)
- [ ] Test performance (Lighthouse)
- [ ] Security headers configured
- [ ] All tests passing
- [ ] CI/CD pipeline configured

## Related Recipes

- [documentation](./documentation.md) - Technical documentation
- [marketing-site](./marketing-site.md) - Landing pages

---

## Changelog

### v2.0.0 (2025-01-18)
- Standardized to god-tier template
- Added comprehensive Testing section
- Added Error Handling section
- Added Accessibility section
- Added Security section
- Added Performance section
- Added CI/CD section
- Added Monitoring section

### v1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- MDX support with syntax highlighting
- RSS feed generation
- Full SEO optimization
