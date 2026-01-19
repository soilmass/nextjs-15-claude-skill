---
id: t-blog-post-page
name: Blog Post Page
version: 2.0.0
layer: L4
category: pages
description: Individual blog post page with MDX content, TOC, and related posts
tags: [page, blog, post, article, mdx, content]
composes:
  - ../organisms/blog-post.md
  - ../organisms/comments-section.md
  - ../molecules/share-button.md
  - ../molecules/avatar-group.md
formula: "BlogPostPage = BlogPost(o-blog-post) + AuthorCard(AvatarGroup(m-avatar-group)) + ShareButtons(m-share-button) + TableOfContents + Comments(o-comments-section) + RelatedPosts"
dependencies: [next-mdx-remote]
performance:
  impact: medium
  lcp: high
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Blog Post Page

## Overview

The Blog Post Page template provides the structure for individual blog articles. Features MDX content rendering, table of contents, author info, social sharing, and related posts. Optimized for readability and SEO.

## When to Use

Use this skill when:
- Displaying blog articles
- Rendering MDX content
- Building article pages
- Creating documentation articles

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Blog Post Page                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  BlogPost Header (o-blog-post)                    │  │
│  │  [Category Badge]                                                 │  │
│  │  "Article Title Here"                                             │  │
│  │  Author Card (m-avatar-group) │ Published Date │ X min read       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                     Cover Image                             │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────┬─────────────────────────┐  │
│  │                                         │                         │  │
│  │          Article Content                │   Table of Contents     │  │
│  │          (MDX Rendered)                 │   (Sticky Sidebar)      │  │
│  │                                         │   ┌─────────────────┐   │  │
│  │  ## Introduction                        │   │ • Introduction  │   │  │
│  │  Lorem ipsum dolor sit amet...          │   │ • Main Topic    │   │  │
│  │                                         │   │ • Subtopic 1    │   │  │
│  │  ## Main Topic                          │   │ • Subtopic 2    │   │  │
│  │  Content here with code blocks,         │   │ • Conclusion    │   │  │
│  │  images, and callouts...                │   └─────────────────┘   │  │
│  │                                         │                         │  │
│  │  ┌───────────────────────────────────┐  │   Share (m-share-btn)   │  │
│  │  │  Callout: Important note here     │  │   [Twitter] [LinkedIn]  │  │
│  │  └───────────────────────────────────┘  │   [Facebook] [Copy]     │  │
│  │                                         │                         │  │
│  │  ## Conclusion                          │                         │  │
│  │  Summary and final thoughts...          │                         │  │
│  │                                         │                         │  │
│  └─────────────────────────────────────────┴─────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Author Card (m-avatar-group)                     │  │
│  │  [Large Avatar] Author Name • Role                                │  │
│  │                 Author bio and links                              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                Comments Section (o-comments-section)              │  │
│  │  [Leave a comment...]                                             │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ [Avatar] User Name • 2 hours ago                            │  │  │
│  │  │ Comment text here...                                        │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                       Related Posts                               │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐  │  │
│  │  │ [Image]         │ │ [Image]         │ │ [Image]             │  │  │
│  │  │ Related Title 1 │ │ Related Title 2 │ │ Related Title 3     │  │  │
│  │  │ Date            │ │ Date            │ │ Date                │  │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Organisms Used

- [blog-post](../organisms/blog-post.md) - Article content
- [card](../molecules/card.md) - Related posts

## Implementation

```typescript
// app/(marketing)/blog/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts, getAllPostSlugs } from "@/lib/blog";
import { BlogPost } from "@/components/organisms/blog-post";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for the post
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

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
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post, relatedPosts] = await Promise.all([
    getPostBySlug(slug),
    getRelatedPosts(slug),
  ]);

  if (!post) {
    notFound();
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.href,
    },
    publisher: {
      "@type": "Organization",
      name: "Acme Inc",
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://example.com/blog/${slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Blog Post Content */}
      <BlogPost
        title={post.title}
        description={post.excerpt}
        coverImage={{
          src: post.coverImage,
          alt: post.title,
          blurDataURL: post.coverImageBlur,
        }}
        author={{
          name: post.author.name,
          avatar: post.author.avatar,
          role: post.author.role,
          href: post.author.href,
        }}
        publishedAt={new Date(post.publishedAt)}
        updatedAt={post.updatedAt ? new Date(post.updatedAt) : undefined}
        readingTime={post.readingTime}
        categories={post.categories}
        content={post.content}
        tableOfContents={post.tableOfContents}
        showToc
        url={`https://example.com/blog/${slug}`}
        relatedPosts={relatedPosts.map((p) => ({
          title: p.title,
          href: `/blog/${p.slug}`,
          image: p.coverImage,
          date: new Date(p.publishedAt),
        }))}
      />
    </>
  );
}
```

### MDX Content Processing

```typescript
// lib/blog.ts
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { getReadingTime } from "./utils";

export async function getPostBySlug(slug: string) {
  const post = await fetchPost(slug);
  
  if (!post) return null;

  // Compile MDX content
  const { content, frontmatter } = await compileMDX({
    source: post.content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              theme: "github-dark",
              keepBackground: false,
            },
          ],
        ],
      },
    },
    components: {
      // Custom MDX components
      Callout,
      CodeBlock,
      Image: MDXImage,
      Video,
    },
  });

  // Extract table of contents
  const tableOfContents = extractHeadings(post.content);

  return {
    ...post,
    content,
    tableOfContents,
    readingTime: getReadingTime(post.content),
  };
}

// Extract headings for TOC
function extractHeadings(content: string) {
  const headingRegex = /^##\s+(.+)$/gm;
  const headings: { id: string; title: string; level: number }[] = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const title = match[1];
    const id = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    headings.push({ id, title, level: 2 });
  }

  return headings;
}
```

### Custom MDX Components

```typescript
// components/mdx/callout.tsx
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle,
  };

  const styles = {
    info: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
    warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
    success: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
    error: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  };

  const Icon = icons[type];

  return (
    <div className={cn("border rounded-lg p-4 my-6", styles[type])}>
      <div className="flex gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

## Key Implementation Notes

1. **Static Generation**: Uses `generateStaticParams`
2. **MDX Processing**: Server-side MDX compilation
3. **SEO Optimization**: Full meta tags and JSON-LD
4. **TOC Extraction**: Automatic heading extraction
5. **Related Posts**: Fetched alongside main post

## Variants

### Simple Blog Post

```tsx
<article className="container max-w-3xl py-16">
  <header className="mb-8">
    <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
    <div className="flex items-center gap-4 text-muted-foreground">
      <time>{format(post.publishedAt, "MMMM d, yyyy")}</time>
      <span>·</span>
      <span>{post.readingTime} min read</span>
    </div>
  </header>
  
  <Image
    src={post.coverImage}
    alt={post.title}
    width={800}
    height={400}
    className="rounded-lg mb-8"
    priority
  />
  
  <div className="prose prose-lg dark:prose-invert">
    {post.content}
  </div>
</article>
```

### With Sidebar

```tsx
<div className="container grid lg:grid-cols-[1fr_300px] gap-12 py-16">
  <article>
    {/* Post content */}
  </article>
  
  <aside className="hidden lg:block">
    <div className="sticky top-24 space-y-8">
      {/* Author card */}
      <AuthorCard author={post.author} />
      
      {/* Table of contents */}
      <TableOfContents items={post.toc} />
      
      {/* Share buttons */}
      <ShareButtons url={url} title={post.title} />
      
      {/* Newsletter */}
      <NewsletterForm />
    </div>
  </aside>
</div>
```

## Performance

### Static Generation

- Pre-render all posts at build
- ISR for updates
- Incremental adoption for new posts

### Image Optimization

- Cover image priority loading
- Content images lazy loaded
- Blur placeholders

### Code Highlighting

- Server-side syntax highlighting
- No client-side JS for highlighting
- Theme-aware colors

## Accessibility

### Required Features

- Proper heading hierarchy
- Alt text on images
- Skip to content link
- TOC navigation accessible

### Screen Reader

- Article landmarks
- Reading time announced
- Code blocks labeled

## SEO Considerations

- Complete Open Graph tags
- Twitter Card meta
- JSON-LD structured data
- Canonical URL
- Author information

## Error States

### Post Not Found

```tsx
// app/(marketing)/blog/[slug]/not-found.tsx
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostNotFound() {
  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="text-muted-foreground">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/blog">Browse all posts</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Error Boundary

```tsx
// app/(marketing)/blog/[slug]/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog post error:", error);
  }, [error]);

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Failed to load post</h1>
        <p className="text-muted-foreground">
          There was an error loading this blog post. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to blog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### MDX Rendering Error

```tsx
// components/blog/mdx-content.tsx
"use client";

import { ErrorBoundary } from "react-error-boundary";
import { AlertCircle } from "lucide-react";

function MDXErrorFallback({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 my-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-destructive">Content Error</h3>
          <p className="text-sm text-muted-foreground mt-1">
            There was an error rendering this content section.
          </p>
        </div>
      </div>
    </div>
  );
}

export function MDXContent({ content }: { content: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={MDXErrorFallback}>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {content}
      </div>
    </ErrorBoundary>
  );
}
```

### Comment Loading Error

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export function CommentSection({ postId }: { postId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadComments = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const comments = await fetchComments(postId);
      // Set comments state
    } catch (err) {
      setError("Failed to load comments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={loadComments}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Render comments...
}
```

### Share Error Handling

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Share2 } from "lucide-react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleCopyLink}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      {typeof navigator !== "undefined" && navigator.share && (
        <Button variant="outline" size="sm" onClick={handleNativeShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

## Loading States

### Full Page Loading

```tsx
// app/(marketing)/blog/[slug]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <section className="container max-w-4xl py-12">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-3/4 mb-6" />

        {/* Author Info */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Cover Image */}
        <Skeleton className="aspect-video rounded-xl mb-12" />
      </section>

      {/* Content */}
      <section className="container">
        <div className="grid lg:grid-cols-[1fr_250px] gap-12">
          {/* Main Content */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 w-full"
                style={{ width: `${Math.random() * 30 + 70}%` }}
              />
            ))}
            <Skeleton className="h-32 w-full rounded-lg my-8" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 w-full"
                style={{ width: `${Math.random() * 30 + 70}%` }}
              />
            ))}
          </div>

          {/* Sidebar TOC */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              <Skeleton className="h-5 w-24 mb-4" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="container py-16">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Streaming with Suspense

```tsx
// app/(marketing)/blog/[slug]/page.tsx
import { Suspense } from "react";

function RelatedPostsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

async function RelatedPosts({ slug }: { slug: string }) {
  const posts = await getRelatedPosts(slug);
  return <RelatedPostsGrid posts={posts} />;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <BlogPostHeader post={post} />
      <BlogPostContent content={post.content} />

      <section className="container py-16">
        <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
        <Suspense fallback={<RelatedPostsSkeleton />}>
          <RelatedPosts slug={slug} />
        </Suspense>
      </section>
    </>
  );
}
```

### TOC Scroll Progress

```tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function TableOfContentsWithProgress({ items }) {
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / scrollHeight) * 100;
      setProgress(scrollProgress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted">
        <div
          className="w-full bg-primary transition-all duration-150"
          style={{ height: `${progress}%` }}
        />
      </div>

      <nav className="pl-4 space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "block text-sm transition-colors",
              activeId === item.id
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Layout Breakdown

| Breakpoint | Layout Changes |
|------------|----------------|
| `< 640px` (mobile) | Single column, no sidebar TOC, bottom share bar |
| `640px - 1024px` (tablet) | Single column with inline TOC |
| `> 1024px` (desktop) | Two-column with sticky sidebar TOC |

### Mobile-First Implementation

```tsx
export default function BlogPostPage({ post }: { post: Post }) {
  return (
    <article>
      {/* Header - Responsive typography */}
      <header className="container max-w-4xl py-8 sm:py-12 lg:py-16">
        <Badge className="mb-3 sm:mb-4">{post.category}</Badge>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
          {post.title}
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8">
          {post.excerpt}
        </p>

        {/* Author - Responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={post.author.avatar} />
            </Avatar>
            <div>
              <p className="font-medium text-sm sm:text-base">{post.author.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {format(post.publishedAt, "MMMM d, yyyy")} · {post.readingTime} min read
              </p>
            </div>
          </div>

          {/* Share buttons - Hidden on mobile, shown at bottom */}
          <div className="hidden sm:flex">
            <ShareButtons url={post.url} title={post.title} />
          </div>
        </div>
      </header>

      {/* Cover Image - Responsive aspect ratio */}
      <section className="container max-w-5xl mb-8 sm:mb-12">
        <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[21/9] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Content - Two column on desktop */}
      <section className="container">
        <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-12">
          {/* Main Content */}
          <div className="max-w-3xl mx-auto lg:mx-0">
            {/* Mobile TOC - Collapsible */}
            <div className="lg:hidden mb-8">
              <MobileTOC items={post.tableOfContents} />
            </div>

            {/* MDX Content */}
            <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
              {post.content}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs sm:text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Desktop TOC - Sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <h3 className="font-medium mb-4 text-sm">On this page</h3>
              <TableOfContents items={post.tableOfContents} />
            </div>
          </aside>
        </div>
      </section>

      {/* Author Card - Full width on mobile */}
      <section className="container max-w-3xl py-12 sm:py-16">
        <div className="rounded-lg sm:rounded-xl border p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarImage src={post.author.avatar} />
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{post.author.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{post.author.role}</p>
              <p className="text-sm sm:text-base text-muted-foreground">
                {post.author.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts - Responsive grid */}
      <section className="container py-12 sm:py-16 border-t">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Related Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {post.relatedPosts.map((related) => (
            <RelatedPostCard key={related.slug} post={related} />
          ))}
        </div>
      </section>

      {/* Mobile Share Bar - Fixed bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 z-50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Share this post</span>
          <ShareButtons url={post.url} title={post.title} compact />
        </div>
      </div>
    </article>
  );
}
```

### Mobile Table of Contents

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileTOC({ items }: { items: TocItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="font-medium text-sm">Table of contents</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <nav className="px-4 pb-4 space-y-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block text-sm text-muted-foreground hover:text-foreground py-1",
                item.level === 3 && "pl-4"
              )}
            >
              {item.title}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
```

### Responsive Code Blocks

```tsx
// In prose styles
.prose pre {
  @apply -mx-4 sm:mx-0 rounded-none sm:rounded-lg;
  @apply text-xs sm:text-sm;
  @apply overflow-x-auto;
}

// Code block with filename
export function CodeBlock({ filename, children }: CodeBlockProps) {
  return (
    <div className="rounded-lg border overflow-hidden my-6 -mx-4 sm:mx-0">
      {filename && (
        <div className="bg-muted px-4 py-2 text-xs sm:text-sm font-mono border-b">
          {filename}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm">
        {children}
      </pre>
    </div>
  );
}
```

## Related Skills

### Uses Layout
- [marketing-layout](./marketing-layout.md)

### Related Pages
- [blog-index](./blog-index.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- MDX rendering
- Table of contents
- Related posts
