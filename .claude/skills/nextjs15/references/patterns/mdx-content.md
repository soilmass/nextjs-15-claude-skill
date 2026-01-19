---
id: pt-mdx-content
name: MDX Content
version: 1.0.0
layer: L5
category: content
description: Render MDX content with custom components, syntax highlighting, and interactive elements
tags: [mdx, markdown, content, blog, documentation, next15, react19]
composes:
  - ../molecules/code-block.md
dependencies:
  @next/mdx: "^15.1.0"
formula: "MDXContent = MDXCompiler + CustomComponents + SyntaxHighlighting + TableOfContents"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# MDX Content

## When to Use

- When building blogs or documentation sites
- For content that mixes Markdown with React components
- When creating interactive tutorials
- For CMS-managed content with custom elements
- When building knowledge bases

## Overview

This pattern implements MDX content rendering with custom components, syntax highlighting, table of contents generation, and frontmatter parsing.

## Installation

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install rehype-pretty-code shiki rehype-slug rehype-autolink-headings
npm install gray-matter
```

## Next.js Configuration

```typescript
// next.config.mjs
import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, {
        theme: "github-dark",
        keepBackground: true,
      }],
    ],
  },
});

const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

export default withMDX(nextConfig);
```

## MDX Components

```typescript
// components/mdx/index.tsx
import { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import { Callout } from "./callout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom heading with anchor
function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Heading = ({ children, ...props }: ComponentProps<"h1">) => {
    const Tag = `h${level}` as const;
    const id = typeof children === "string"
      ? children.toLowerCase().replace(/\s+/g, "-")
      : undefined;

    return (
      <Tag
        id={id}
        className={cn(
          "scroll-mt-20",
          level === 1 && "text-4xl font-bold mt-8 mb-4",
          level === 2 && "text-3xl font-bold mt-8 mb-4 border-b pb-2",
          level === 3 && "text-2xl font-semibold mt-6 mb-3",
          level === 4 && "text-xl font-semibold mt-4 mb-2"
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  };

  return Heading;
}

export const mdxComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),

  p: (props: ComponentProps<"p">) => (
    <p className="leading-7 [&:not(:first-child)]:mt-4" {...props} />
  ),

  a: ({ href, ...props }: ComponentProps<"a">) => {
    if (href?.startsWith("/")) {
      return <Link href={href} className="text-primary underline" {...props} />;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline"
        {...props}
      />
    );
  },

  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),

  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),

  li: (props: ComponentProps<"li">) => (
    <li className="leading-7" {...props} />
  ),

  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="mt-4 border-l-4 border-primary pl-4 italic text-muted-foreground"
      {...props}
    />
  ),

  hr: () => <hr className="my-8 border-t" />,

  table: (props: ComponentProps<"table">) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props} />
    </div>
  ),

  tr: (props: ComponentProps<"tr">) => (
    <tr className="m-0 border-t p-0 even:bg-muted" {...props} />
  ),

  th: (props: ComponentProps<"th">) => (
    <th
      className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),

  td: (props: ComponentProps<"td">) => (
    <td
      className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),

  pre: ({ children, ...props }: ComponentProps<"pre">) => (
    <CodeBlock {...props}>{children}</CodeBlock>
  ),

  code: (props: ComponentProps<"code">) => (
    <code
      className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
      {...props}
    />
  ),

  Image: (props: ComponentProps<typeof Image>) => (
    <Image
      className="rounded-lg border my-4"
      {...props}
    />
  ),

  // Custom components
  Callout,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
};
```

## Code Block Component

```typescript
// components/mdx/code-block.tsx
"use client";

import { useState, ComponentProps } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CodeBlock({ children, className, ...props }: ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = (children as any)?.props?.children;
    if (typeof code === "string") {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extract language from className
  const language = className?.replace(/language-/, "") || "";

  return (
    <div className="relative group my-4">
      {language && (
        <div className="absolute top-0 right-12 px-2 py-1 text-xs text-muted-foreground bg-muted rounded-b">
          {language}
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>

      <pre
        className={cn(
          "overflow-x-auto rounded-lg border bg-[#0d1117] p-4",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
```

## Callout Component

```typescript
// components/mdx/callout.tsx
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

const styles = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const Icon = icons[type];

  return (
    <div className={cn("my-4 rounded-lg border p-4", styles[type])}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="[&>p]:m-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

## Content Loading

```typescript
// lib/mdx/content.ts
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";

const contentDir = path.join(process.cwd(), "content");

export interface ContentMeta {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  image?: string;
  slug: string;
}

export async function getContentBySlug(type: string, slug: string) {
  const filePath = path.join(contentDir, type, `${slug}.mdx`);

  try {
    const source = await fs.readFile(filePath, "utf8");
    const { content, data } = matter(source);

    const { content: mdxContent } = await compileMDX({
      source: content,
      components: mdxComponents,
      options: {
        mdxOptions: {
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, { theme: "github-dark" }],
          ],
        },
      },
    });

    return {
      content: mdxContent,
      meta: { ...data, slug } as ContentMeta,
    };
  } catch {
    return null;
  }
}

export async function getAllContent(type: string): Promise<ContentMeta[]> {
  const dirPath = path.join(contentDir, type);

  try {
    const files = await fs.readdir(dirPath);
    const mdxFiles = files.filter((f) => f.endsWith(".mdx"));

    const contents = await Promise.all(
      mdxFiles.map(async (filename) => {
        const slug = filename.replace(/\.mdx$/, "");
        const filePath = path.join(dirPath, filename);
        const source = await fs.readFile(filePath, "utf8");
        const { data } = matter(source);

        return { ...data, slug } as ContentMeta;
      })
    );

    return contents.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
  } catch {
    return [];
  }
}
```

## Table of Contents

```typescript
// components/mdx/table-of-contents.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("h2, h3"));
    const headingData = elements.map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: parseInt(el.tagName[1]),
    }));
    setHeadings(headingData);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0% -80% 0%" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-20">
      <h4 className="font-semibold mb-4">On this page</h4>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              heading.level === 3 && "ml-4",
              heading.level === 4 && "ml-8"
            )}
          >
            <a
              href={`#${heading.id}`}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                activeId === heading.id && "text-primary font-medium"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## Blog Post Page

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getContentBySlug, getAllContent } from "@/lib/mdx/content";
import { TableOfContents } from "@/components/mdx/table-of-contents";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllContent("blog");
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getContentBySlug("blog", slug);

  if (!post) notFound();

  return (
    <div className="container max-w-6xl py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.meta.title}</h1>
            {post.meta.date && (
              <time className="text-muted-foreground">
                {formatDate(post.meta.date)}
              </time>
            )}
          </header>

          <div className="prose prose-lg max-w-none">
            {post.content}
          </div>
        </article>

        <aside className="hidden lg:block">
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Mix Client/Server Components in MDX

```typescript
// BAD - Client component in server MDX
// This will cause hydration errors
<ClientComponent onClick={() => {}}>
  Server rendered MDX content
</ClientComponent>

// GOOD - Use wrapper components
export function InteractiveSection({ children }) {
  "use client";
  return <div onClick={handleClick}>{children}</div>;
}
```

## Related Patterns

- [knowledge-base](./knowledge-base.md)
- [search](./search.md)
- [static-rendering](./static-rendering.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Custom MDX components
- Syntax highlighting
- Table of contents
- Frontmatter parsing
