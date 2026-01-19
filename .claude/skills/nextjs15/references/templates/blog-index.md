---
id: t-blog-index
name: Blog Index
version: 2.0.0
layer: L4
category: pages
description: Blog listing page with featured posts, categories, and pagination
tags: [page, blog, posts, articles, listing, categories]
composes:
  - ../organisms/hero.md
  - ../molecules/card.md
  - ../molecules/pagination.md
  - ../molecules/tabs.md
formula: "BlogIndex = Hero(o-hero) + FeaturedPost + CategoryTabs(m-tabs) + PostGrid(Card(m-card)) + Pagination(m-pagination) + NewsletterCTA"
dependencies: []
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Blog Index

## Overview

The Blog Index template provides a complete blog listing page. Features a hero with featured post, category filtering, search, and paginated post grid. Optimized for SEO with structured data and proper metadata.

## When to Use

Use this skill when:
- Building blog home pages
- Creating article listing pages
- Building news/updates pages
- Creating content hub pages

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Blog Index                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        Hero (o-hero)                              │  │
│  │  "Blog" - Insights, tutorials, and updates from our team         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Featured Post (Card)                           │  │
│  │  ┌─────────────────────────┬─────────────────────────────────┐    │  │
│  │  │                         │ [Badge] Category                │    │  │
│  │  │     Cover Image         │ Article Title                   │    │  │
│  │  │                         │ Excerpt text...                 │    │  │
│  │  │                         │ [Avatar] Author • Date • X min  │    │  │
│  │  └─────────────────────────┴─────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────┬─────────────────────────────┐  │
│  │       Category Tabs (m-tabs)        │  [Search...    ] (Search)   │  │
│  │  [All] [Tech] [Design] [Product]    │                             │  │
│  └─────────────────────────────────────┴─────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Post Grid (Cards m-card)                       │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐  │  │
│  │  │ [Image]         │ │ [Image]         │ │ [Image]             │  │  │
│  │  │ [Badge]         │ │ [Badge]         │ │ [Badge]             │  │  │
│  │  │ Title           │ │ Title           │ │ Title               │  │  │
│  │  │ Excerpt...      │ │ Excerpt...      │ │ Excerpt...          │  │  │
│  │  │ [Avi] Author    │ │ [Avi] Author    │ │ [Avi] Author        │  │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Pagination (m-pagination)                        │  │
│  │              [<] [1] [2] [3] ... [10] [>]                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Newsletter CTA                                │  │
│  │  "Subscribe to our newsletter"                                    │  │
│  │  [Enter your email          ] [Subscribe ->]                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Organisms Used

- [hero](../organisms/hero.md) - Featured post
- [card](../molecules/card.md) - Post cards
- [data-table](../organisms/data-table.md) - Pagination logic

## Implementation

```typescript
// app/(marketing)/blog/page.tsx
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { getBlogPosts, getCategories, getFeaturedPost } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FadeIn, Stagger } from "@/components/organisms/scroll-animations";
import { Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, tutorials, and updates from the Acme team.",
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    q?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page = "1", category, q } = await searchParams;
  const currentPage = parseInt(page);
  const postsPerPage = 9;

  const [featuredPost, { posts, totalPages }, categories] = await Promise.all([
    getFeaturedPost(),
    getBlogPosts({
      page: currentPage,
      limit: postsPerPage,
      category,
      search: q,
    }),
    getCategories(),
  ]);

  return (
    <>
      {/* Header */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <FadeIn>
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Blog
              </h1>
              <p className="text-xl text-muted-foreground">
                Insights, tutorials, and updates from our team. Stay up to date 
                with the latest in web development.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && !q && !category && currentPage === 1 && (
        <section className="container mb-16">
          <FadeIn>
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <article className="grid lg:grid-cols-2 gap-8 rounded-2xl border bg-card p-6 lg:p-0 overflow-hidden">
                <div className="relative aspect-video lg:aspect-auto">
                  <Image
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center lg:pr-8 lg:py-8">
                  <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={featuredPost.author.avatar} />
                      <AvatarFallback>
                        {featuredPost.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{featuredPost.author.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(featuredPost.publishedAt), "MMM d, yyyy")}
                        {" · "}
                        {featuredPost.readingTime} min read
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </FadeIn>
        </section>
      )}

      {/* Filters */}
      <section className="container mb-12">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Link href="/blog">
              <Badge
                variant={!category ? "default" : "outline"}
                className="cursor-pointer"
              >
                All
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/blog?category=${cat.slug}`}>
                <Badge
                  variant={category === cat.slug ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Search */}
          <form className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Search articles..."
              defaultValue={q}
              className="pl-10 w-full sm:w-64"
            />
          </form>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mb-16">
        {posts.length > 0 ? (
          <Stagger staggerDelay={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <Badge variant="secondary" className="mb-2">
                      {post.category}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>
                          {post.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.author.name}</p>
                        <p className="text-muted-foreground">
                          {format(new Date(post.publishedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </Stagger>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No posts found. Try a different search or category.
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/blog">View all posts</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="container mb-16">
          <nav
            className="flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              asChild={currentPage !== 1}
            >
              {currentPage === 1 ? (
                <span>
                  <ChevronLeft className="h-4 w-4" />
                </span>
              ) : (
                <Link
                  href={`/blog?page=${currentPage - 1}${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                asChild
              >
                <Link
                  href={`/blog?page=${page}${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`}
                >
                  {page}
                </Link>
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              asChild={currentPage !== totalPages}
            >
              {currentPage === totalPages ? (
                <span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              ) : (
                <Link
                  href={`/blog?page=${currentPage + 1}${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </Button>
          </nav>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="container mb-16">
        <div className="bg-muted rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Subscribe to our newsletter</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get the latest posts delivered right to your inbox. No spam, unsubscribe anytime.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
              required
            />
            <Button type="submit">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
```

### Key Implementation Notes

1. **Featured Post**: Highlighted on first page
2. **Category Filtering**: URL-based filtering
3. **Search**: Server-side search
4. **Pagination**: SEO-friendly URL pagination
5. **Newsletter**: Email capture CTA

## Variants

### Magazine Layout

```tsx
<div className="grid lg:grid-cols-12 gap-8">
  {/* Main featured post */}
  <article className="lg:col-span-8">
    <FeaturedPost post={posts[0]} large />
  </article>
  
  {/* Sidebar recent posts */}
  <aside className="lg:col-span-4 space-y-6">
    {posts.slice(1, 4).map((post) => (
      <PostCard key={post.slug} post={post} compact />
    ))}
  </aside>
  
  {/* Grid of remaining posts */}
  <div className="lg:col-span-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {posts.slice(4).map((post) => (
      <PostCard key={post.slug} post={post} />
    ))}
  </div>
</div>
```

### List Layout

```tsx
<div className="max-w-3xl mx-auto divide-y">
  {posts.map((post) => (
    <article key={post.slug} className="py-8 first:pt-0">
      <Link href={`/blog/${post.slug}`} className="group">
        <div className="flex gap-6">
          <Image
            src={post.coverImage}
            alt=""
            width={200}
            height={120}
            className="rounded-lg object-cover"
          />
          <div>
            <Badge>{post.category}</Badge>
            <h2 className="text-xl font-semibold group-hover:text-primary">
              {post.title}
            </h2>
            <p className="text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
            <time className="text-sm text-muted-foreground">
              {format(new Date(post.publishedAt), "MMMM d, yyyy")}
            </time>
          </div>
        </div>
      </Link>
    </article>
  ))}
</div>
```

## Performance

### Data Fetching

- ISR with 1-hour revalidation
- Paginated queries
- Category pre-fetching

### Image Optimization

- Lazy load post images
- Priority on featured post
- Responsive image sizes

## SEO Considerations

```typescript
// Generate sitemap
export async function generateSitemap() {
  const posts = await getAllPostSlugs();
  
  return posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}
```

## Accessibility

### Required Features

- Article landmarks
- Pagination navigation labeled
- Search form accessible
- Filter state communicated

### Screen Reader

- Post list announced
- Current page indicated
- Categories described

## Error States

### Data Fetching Error

```tsx
// app/(marketing)/blog/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Blog error:", error);
  }, [error]);

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Failed to load blog posts</h1>
        <p className="text-muted-foreground">
          We couldn't load the blog posts. Please try again.
        </p>
        <Button onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
```

### Empty State

```tsx
function NoPosts({ category, search }: { category?: string; search?: string }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No posts found</h2>
      <p className="text-muted-foreground mb-6">
        {search
          ? `No posts match "${search}"`
          : category
            ? `No posts in the "${category}" category`
            : "No posts available yet"}
      </p>
      <Button variant="outline" asChild>
        <Link href="/blog">View all posts</Link>
      </Button>
    </div>
  );
}
```

### Image Error Fallback

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

export function PostCoverImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
        <ImageOff className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        onError={() => setError(true)}
      />
    </div>
  );
}
```

### Search Error Handling

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, AlertCircle, X } from "lucide-react";

export function BlogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (query.length > 100) {
      setError("Search query is too long");
      return;
    }

    startTransition(() => {
      router.push(query ? `/blog?q=${encodeURIComponent(query)}` : "/blog");
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles..."
        className="w-full pl-10 pr-10 py-2 rounded-lg border"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push("/blog");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      {error && (
        <p className="absolute top-full mt-1 text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </form>
  );
}
```

## Loading States

### Full Page Loading

```tsx
// app/(marketing)/blog/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-6 w-full max-w-md" />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="container mb-16">
        <div className="grid lg:grid-cols-2 gap-8 rounded-2xl border p-6">
          <Skeleton className="aspect-video rounded-lg" />
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-4 pt-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mb-12">
        <div className="flex justify-between">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Streaming Posts with Suspense

```tsx
// app/(marketing)/blog/page.tsx
import { Suspense } from "react";

function PostGridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

async function PostGrid({ page, category, search }: Props) {
  const { posts } = await getBlogPosts({ page, category, search });
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}

export default function BlogPage({ searchParams }) {
  return (
    <>
      <BlogHeader />
      <CategoryFilter />

      <section className="container mb-16">
        <Suspense fallback={<PostGridSkeleton />}>
          <PostGrid {...searchParams} />
        </Suspense>
      </section>
    </>
  );
}
```

### Newsletter Loading State

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ArrowRight } from "lucide-react";

function SubscribeButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          Subscribe
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
```

## Mobile Responsiveness

### Responsive Layout Breakdown

| Breakpoint | Layout Changes |
|------------|----------------|
| `< 640px` (mobile) | Single column posts, stacked filters, full-width search |
| `640px - 1024px` (tablet) | 2-column post grid, horizontal filters |
| `> 1024px` (desktop) | 3-column grid, featured post side-by-side |

### Mobile-First Implementation

```tsx
export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <>
      {/* Header - Responsive typography */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
              Blog
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
              Insights, tutorials, and updates from our team.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post - Stack on mobile */}
      {featuredPost && (
        <section className="container px-4 sm:px-6 mb-12 sm:mb-16">
          <article className="grid lg:grid-cols-2 gap-6 lg:gap-8 rounded-xl lg:rounded-2xl border bg-card p-4 sm:p-6 lg:p-0 overflow-hidden">
            <div className="relative aspect-video lg:aspect-auto lg:min-h-[300px]">
              <Image
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center lg:pr-8 lg:py-8">
              <Badge className="w-fit mb-3 sm:mb-4 text-xs sm:text-sm">
                {featuredPost.category}
              </Badge>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-2 sm:mb-3">
                {featuredPost.title}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={featuredPost.author.avatar} />
                </Avatar>
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {featuredPost.author.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {format(featuredPost.publishedAt, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* Filters - Stack on mobile */}
      <section className="container px-4 sm:px-6 mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Categories - Horizontal scroll on mobile */}
          <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max">
              <Badge
                variant={!category ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
              >
                All
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat.slug}
                  variant={category === cat.slug ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search - Full width on mobile */}
          <div className="w-full sm:w-64">
            <BlogSearch />
          </div>
        </div>
      </section>

      {/* Posts Grid - Responsive columns */}
      <section className="container px-4 sm:px-6 mb-12 sm:mb-16">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <article key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3 sm:mb-4">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {post.category}
                  </Badge>
                  <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 text-sm">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage src={post.author.avatar} />
                    </Avatar>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(post.publishedAt, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <NoPosts category={category} search={search} />
        )}
      </section>

      {/* Pagination - Simplified on mobile */}
      {totalPages > 1 && (
        <section className="container px-4 sm:px-6 mb-12 sm:mb-16">
          <nav className="flex items-center justify-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Show fewer page numbers on mobile */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            {/* Mobile: Show current/total */}
            <span className="sm:hidden text-sm px-2">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </section>
      )}

      {/* Newsletter CTA - Responsive padding */}
      <section className="container px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="bg-muted rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Subscribe to our newsletter
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
            Get the latest posts delivered right to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-10 sm:h-11"
            />
            <Button className="h-10 sm:h-11">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
```

### Touch-Friendly Category Pills

```tsx
// Horizontal scroll with touch momentum
<div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
  <div className="flex gap-2 pb-2 min-w-max touch-pan-x">
    {categories.map((category) => (
      <button
        key={category.slug}
        onClick={() => handleCategoryChange(category.slug)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap",
          "transition-colors touch-manipulation active:scale-95",
          "min-h-[44px]", // Touch target
          selectedCategory === category.slug
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80"
        )}
      >
        {category.name}
      </button>
    ))}
  </div>
</div>
```

## Related Skills

### Uses Layout
- [marketing-layout](./marketing-layout.md)

### Related Pages
- [blog-post-page](./blog-post-page.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Featured post hero
- Category filtering
- Search and pagination
