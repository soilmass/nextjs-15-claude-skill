---
id: o-blog-post
name: Blog Post
version: 2.0.0
layer: L3
category: marketing
description: Full blog post article with MDX support, table of contents, and metadata
tags: [blog, article, post, content, mdx, markdown]
formula: "BlogPost = Avatar(m-avatar) + Badge(a-badge)[] + MDXContent + TableOfContents + SocialShare(Button[]) + RelatedPosts(Card[])"
composes:
  - ../molecules/avatar.md
  - ../molecules/card.md
dependencies: [next-mdx-remote, reading-time, rehype-pretty-code, rehype-slug]
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Blog Post

## Overview

The Blog Post organism provides a complete article layout with MDX content rendering, table of contents, author information, reading time, and social sharing. Supports syntax highlighting, custom components, and responsive typography.

## When to Use

Use this skill when:
- Building blog or news article pages
- Creating documentation with rich content
- Rendering MDX/Markdown content
- Building content-heavy marketing pages

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BlogPost (L3)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Article Header                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Badge(a-badge)[] : [Technology] [Tutorial]         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  <h1>Article Title Goes Here</h1>                         │  │
│  │                                                           │  │
│  │  ┌────────┐                                               │  │
│  │  │ Avatar │  Author Name · Jan 15, 2025 · 8 min read     │  │
│  │  │(m-avtr)│                                               │  │
│  │  └────────┘                                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────┐  ┌────────────────────────────────────────┐ │
│  │ Table of       │  │          MDX Content                   │ │
│  │ Contents       │  │                                        │ │
│  │ ├─ Intro       │  │  ## Introduction                       │ │
│  │ ├─ Setup       │  │  Lorem ipsum dolor sit amet...         │ │
│  │ └─ Conclusion  │  │                                        │ │
│  │                │  │  ```typescript                         │ │
│  │                │  │  const code = "highlighted";           │ │
│  │                │  │  ```                                   │ │
│  └────────────────┘  └────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Social Share: Button(a-button)[]                         │  │
│  │  [🐦 Twitter] [💼 LinkedIn] [🔗 Copy Link]                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Related Posts: Card(m-card)[]                            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐           │  │
│  │  │ Related 1  │  │ Related 2  │  │ Related 3  │           │  │
│  │  └────────────┘  └────────────┘  └────────────┘           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [avatar](../molecules/avatar.md) - Author display
- [badge](../atoms/badge.md) - Category tags
- [card](../molecules/card.md) - Related posts

## Implementation

```typescript
// components/organisms/blog-post.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { format } from "date-fns";
import { Calendar, Clock, Share2, Twitter, Linkedin, Link2, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Author {
  name: string;
  avatar?: string;
  role?: string;
  href?: string;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

interface BlogPostProps {
  /** Article title */
  title: string;
  /** Article description/excerpt */
  description: string;
  /** Cover image */
  coverImage?: {
    src: string;
    alt: string;
    blurDataURL?: string;
  };
  /** Author information */
  author: Author;
  /** Publication date */
  publishedAt: Date;
  /** Last updated date */
  updatedAt?: Date;
  /** Reading time in minutes */
  readingTime: number;
  /** Category/tags */
  categories: string[];
  /** MDX content */
  content: MDXRemoteSerializeResult;
  /** Custom MDX components */
  components?: Record<string, React.ComponentType>;
  /** Table of contents */
  tableOfContents?: TableOfContentsItem[];
  /** Show table of contents */
  showToc?: boolean;
  /** Article URL for sharing */
  url: string;
  /** Related posts */
  relatedPosts?: {
    title: string;
    href: string;
    image?: string;
    date: Date;
  }[];
  /** Additional class names */
  className?: string;
}

// Default MDX components with styling
const defaultComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn("mt-10 scroll-m-20 text-4xl font-bold tracking-tight", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("mt-8 scroll-m-20 text-2xl font-semibold tracking-tight", className)} {...props} />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn("mt-8 scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props} />
  ),
  img: ({ className, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn("rounded-md", className)} alt={alt} {...props} />
  ),
  hr: ({ ...props }) => <hr className="my-4 md:my-8" {...props} />,
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn("m-0 border-t p-0 even:bg-muted", className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn("border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className={cn("mb-4 mt-6 overflow-x-auto rounded-lg border bg-black py-4", className)} {...props} />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", className)} {...props} />
  ),
  a: ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className={cn("font-medium underline underline-offset-4", className)} {...props} />
  ),
};

function TableOfContents({ items, activeId }: { items: TableOfContentsItem[]; activeId: string }) {
  return (
    <nav className="space-y-1">
      <p className="font-medium mb-4">On this page</p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            "block text-sm py-1 transition-colors hover:text-foreground",
            item.level === 3 && "pl-4",
            item.level === 4 && "pl-8",
            activeId === item.id
              ? "text-foreground font-medium"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}

function ShareButton({ url, title }: { url: string; title: string }) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedIn}>
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          <Link2 className="h-4 w-4 mr-2" />
          Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BlogPost({
  title,
  description,
  coverImage,
  author,
  publishedAt,
  updatedAt,
  readingTime,
  categories,
  content,
  components,
  tableOfContents = [],
  showToc = true,
  url,
  relatedPosts,
  className,
}: BlogPostProps) {
  const [activeId, setActiveId] = React.useState("");
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  // Track active heading for TOC
  React.useEffect(() => {
    if (!showToc || tableOfContents.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    tableOfContents.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tableOfContents, showToc]);

  // Show scroll to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mergedComponents = { ...defaultComponents, ...components };

  return (
    <article className={cn("relative", className)}>
      {/* Article Header */}
      <header className="container max-w-4xl mx-auto py-10 space-y-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          {title}
        </h1>

        {/* Description */}
        <p className="text-xl text-muted-foreground">{description}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              {author.href ? (
                <Link href={author.href} className="font-medium text-foreground hover:underline">
                  {author.name}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{author.name}</span>
              )}
              {author.role && <p className="text-xs">{author.role}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={publishedAt.toISOString()}>
                {format(publishedAt, "MMM d, yyyy")}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
          </div>

          <ShareButton url={url} title={title} />
        </div>
      </header>

      {/* Cover Image */}
      {coverImage && (
        <div className="container max-w-5xl mx-auto mb-10">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={coverImage.src}
              alt={coverImage.alt}
              fill
              className="object-cover"
              placeholder={coverImage.blurDataURL ? "blur" : undefined}
              blurDataURL={coverImage.blurDataURL}
              priority
            />
          </div>
        </div>
      )}

      {/* Content with TOC */}
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-10">
          {/* Main Content */}
          <div className="max-w-4xl mx-auto lg:mx-0 prose prose-neutral dark:prose-invert">
            <MDXRemote {...content} components={mergedComponents} />
          </div>

          {/* Table of Contents - Sticky Sidebar */}
          {showToc && tableOfContents.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents items={tableOfContents} activeId={activeId} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Updated date */}
      {updatedAt && (
        <div className="container max-w-4xl mx-auto mt-10 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Last updated on {format(updatedAt, "MMMM d, yyyy")}
          </p>
        </div>
      )}

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="container max-w-4xl mx-auto mt-16 pt-10 border-t">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group block space-y-3"
              >
                {post.image && (
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <h3 className="font-medium group-hover:underline">{post.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(post.date, "MMM d, yyyy")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Scroll to top */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-lg"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
    </article>
  );
}
```

### Key Implementation Notes

1. **MDX Support**: Full MDX rendering with custom components
2. **TOC Tracking**: Intersection Observer for active heading
3. **Social Sharing**: Native share dropdown with common platforms
4. **Responsive Typography**: Prose classes with dark mode

## Variants

### Standard Blog Post

```tsx
<BlogPost
  title="Getting Started with Next.js 15"
  description="Learn how to build modern web applications with Next.js 15"
  author={{ name: "John Doe", avatar: "/avatars/john.jpg" }}
  publishedAt={new Date("2025-01-15")}
  readingTime={8}
  categories={["Next.js", "React"]}
  content={mdxContent}
  url="https://example.com/blog/nextjs-15"
/>
```

### With Cover Image

```tsx
<BlogPost
  title="Building Design Systems"
  description="A comprehensive guide to design systems"
  coverImage={{
    src: "/blog/design-systems.jpg",
    alt: "Design system components",
    blurDataURL: "data:image/jpeg;base64,..."
  }}
  author={{ name: "Jane Smith", role: "Design Engineer" }}
  publishedAt={new Date()}
  readingTime={12}
  categories={["Design", "Engineering"]}
  content={mdxContent}
  showToc={true}
  tableOfContents={[
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "components", title: "Components", level: 2 },
    { id: "tokens", title: "Design Tokens", level: 3 },
  ]}
  url="https://example.com/blog/design-systems"
/>
```

### With Related Posts

```tsx
<BlogPost
  title="React Server Components"
  description="Understanding RSC in Next.js"
  author={{ name: "Dev Team" }}
  publishedAt={new Date()}
  readingTime={10}
  categories={["React"]}
  content={mdxContent}
  url="https://example.com/blog/rsc"
  relatedPosts={[
    { title: "Server Actions Guide", href: "/blog/server-actions", date: new Date() },
    { title: "Streaming in Next.js", href: "/blog/streaming", date: new Date() },
  ]}
/>
```

## Performance

### Image Optimization

- Cover images use `priority` for LCP
- Related post images lazy load
- Blur placeholders prevent CLS

### Content Loading

- MDX is serialized at build/request time
- Consider ISR for frequently updated content
- TOC generates from heading extraction

## Accessibility

### Required Attributes

- Semantic article structure
- Proper heading hierarchy in MDX content
- Time elements with datetime attribute

### Screen Reader

- TOC navigation is labeled
- Share menu is keyboard accessible
- Scroll-to-top button is labeled

### Keyboard Navigation

- TOC links are focusable
- Share dropdown supports keyboard
- All interactive elements accessible

## Dependencies

```json
{
  "dependencies": {
    "next-mdx-remote": "^4.4.1",
    "date-fns": "^3.0.0",
    "reading-time": "^1.5.0",
    "rehype-pretty-code": "^0.13.0",
    "rehype-slug": "^6.0.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Article fully loaded and rendered | Full content with header, MDX body, and optional sidebar TOC |
| Loading | MDX content being fetched/serialized | Skeleton placeholders for title, meta, and content area |
| TOC Active | Table of contents tracking scroll | Active heading highlighted in sidebar, smooth scroll transitions |
| TOC Hidden | TOC disabled or no headings | Sidebar not rendered, content spans full width |
| Share Open | Share dropdown menu expanded | Dropdown shows Twitter, LinkedIn, Copy link options |
| Link Copied | User copied article URL | Toast notification or visual confirmation |
| Scroll Top Visible | User scrolled past threshold | Floating "back to top" button appears in corner |
| Image Loading | Cover or content images loading | Blur placeholder shown, transitions to full image |
| Related Posts | Article has related content | Grid of related article cards shown at bottom |
| No Related | No related posts provided | Related section not rendered |

## Anti-patterns

### Bad: Not providing proper MDX serialization

```tsx
// Bad - passing raw MDX string directly
<BlogPost
  content="# Hello\nThis is **markdown**" // Raw string, not serialized
/>

// Good - serialize MDX before rendering
import { serialize } from 'next-mdx-remote/serialize';

const mdxSource = await serialize(rawContent, {
  mdxOptions: {
    rehypePlugins: [rehypeSlug, rehypePrettyCode],
  },
});

<BlogPost content={mdxSource} />
```

### Bad: Missing accessibility in heading hierarchy

```tsx
// Bad - skipping heading levels in MDX content
// # Title (h1)
// ### Subsection (h3) - skipped h2!

// Good - maintain proper hierarchy
// # Title (h1)
// ## Section (h2)
// ### Subsection (h3)

// Also ensure page only has one h1
<BlogPost
  title="Article Title" // This becomes the h1
  content={mdxWithH2AndBelow} // MDX should start at h2
/>
```

### Bad: Not optimizing images for LCP

```tsx
// Bad - no priority on above-fold image
<BlogPost
  coverImage={{
    src: '/large-hero.jpg',
    alt: 'Hero image',
    // Missing priority and blur placeholder
  }}
/>

// Good - optimize cover image loading
<BlogPost
  coverImage={{
    src: '/large-hero.jpg',
    alt: 'Hero image',
    blurDataURL: 'data:image/jpeg;base64,...', // Blur placeholder
  }}
/>
// Implementation uses priority={true} for cover
```

### Bad: Hardcoding share URLs instead of using canonical URL

```tsx
// Bad - sharing with wrong or relative URL
const shareUrl = '/blog/my-post'; // Relative path

// Good - use full canonical URL
<BlogPost
  url="https://example.com/blog/my-post"
  title="My Post"
/>
```

## Related Skills

### Composes Into
- [templates/blog-layout](../templates/blog-layout.md)
- [templates/documentation-layout](../templates/documentation-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- MDX rendering with custom components
- Table of contents with scroll tracking
- Social sharing integration
