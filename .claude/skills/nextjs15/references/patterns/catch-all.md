---
id: pt-catch-all
name: Catch-All Routes
version: 2.1.0
layer: L5
category: routing
description: Handle multiple URL segments with catch-all and optional catch-all route patterns
tags: [routing, catch-all, dynamic-segments, docs, cms, next15]
composes: []
dependencies: []
formula: "Catch-All = [...slug] or [[...slug]] + path.join('/') + hierarchical content"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Catch-All Routes

## When to Use

- **Documentation sites**: Hierarchical docs like /docs/api/auth/login
- **CMS pages**: Dynamic content paths from CMS
- **File browsers**: Navigate file system-like structures
- **Help centers**: Categorized help articles
- **Wiki systems**: Arbitrary nesting of content pages

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Catch-All Route Patterns                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Required Catch-All: [...slug]                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ app/docs/[...slug]/page.tsx                         │   │
│  │                                                     │   │
│  │  /docs/intro          → slug = ['intro']           │   │
│  │  /docs/api/auth       → slug = ['api', 'auth']     │   │
│  │  /docs/api/auth/login → slug = ['api','auth','login']│  │
│  │  /docs                → 404 (no match)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Optional Catch-All: [[...slug]]                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ app/pages/[[...slug]]/page.tsx                      │   │
│  │                                                     │   │
│  │  /pages               → slug = undefined (index)   │   │
│  │  /pages/about         → slug = ['about']           │   │
│  │  /pages/products/new  → slug = ['products', 'new'] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   Component Structure                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  ┌─────────────┐                                   │   │
│  │  │  Sidebar    │  ┌──────────────────────────┐    │   │
│  │  │  (nested    │  │  Main Content            │    │   │
│  │  │   nav from  │  │  ┌────────────────────┐  │    │   │
│  │  │   content   │  │  │ Breadcrumb         │  │    │   │
│  │  │   tree)     │  │  │ Home > API > Auth  │  │    │   │
│  │  │             │  │  └────────────────────┘  │    │   │
│  │  │  ▶ Intro    │  │                          │    │   │
│  │  │  ▼ API      │  │  Content from path      │    │   │
│  │  │    ▶ Auth   │  │                          │    │   │
│  │  │    ▶ Users  │  │                          │    │   │
│  │  └─────────────┘  └──────────────────────────┘    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Catch-all routes allow you to match multiple URL segments with a single route definition. They're ideal for documentation sites, CMS pages, file browsers, and any hierarchical content structure.

## Convention

| Syntax | Directory | Matches | Example |
|--------|-----------|---------|---------|
| `[...slug]` | `app/docs/[...slug]/` | One or more segments | `/docs/a`, `/docs/a/b/c` |
| `[[...slug]]` | `app/docs/[[...slug]]/` | Zero or more segments | `/docs`, `/docs/a`, `/docs/a/b` |

## Required Catch-All `[...slug]`

### Use Case: Documentation Site

```
app/
└── docs/
    └── [...slug]/
        ├── page.tsx
        ├── loading.tsx
        └── not-found.tsx
```

```typescript
// app/docs/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { getDocByPath, getAllDocPaths } from "@/lib/docs";
import { DocContent } from "@/components/doc-content";
import { DocSidebar } from "@/components/doc-sidebar";
import { DocBreadcrumb } from "@/components/doc-breadcrumb";

interface DocsPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  
  // slug = ['getting-started'] -> /docs/getting-started
  // slug = ['api', 'auth', 'login'] -> /docs/api/auth/login
  
  const path = slug.join('/');
  const doc = await getDocByPath(path);

  if (!doc) {
    notFound();
  }

  return (
    <div className="flex">
      <DocSidebar currentPath={path} />
      <main className="flex-1 px-8 py-6">
        <DocBreadcrumb segments={slug} />
        <DocContent doc={doc} />
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const paths = await getAllDocPaths();
  
  return paths.map((path) => ({
    slug: path.split('/'),
  }));
}

export async function generateMetadata({ params }: DocsPageProps) {
  const { slug } = await params;
  const path = slug.join('/');
  const doc = await getDocByPath(path);

  return {
    title: doc?.title || 'Documentation',
    description: doc?.description,
  };
}
```

## Optional Catch-All `[[...slug]]`

### Use Case: CMS Pages with Index

```
app/
└── pages/
    └── [[...slug]]/
        └── page.tsx
```

```typescript
// app/pages/[[...slug]]/page.tsx
import { notFound } from "next/navigation";
import { getPageByPath } from "@/lib/cms";

interface CMSPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function CMSPage({ params }: CMSPageProps) {
  const { slug } = await params;
  
  // slug = undefined -> /pages (index page)
  // slug = ['about'] -> /pages/about
  // slug = ['products', 'software'] -> /pages/products/software
  
  const path = slug?.join('/') || 'index';
  const page = await getPageByPath(path);

  if (!page) {
    notFound();
  }

  return (
    <article className="prose lg:prose-xl max-w-none">
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}

export async function generateStaticParams() {
  const pages = await getAllCMSPages();
  
  return [
    { slug: undefined },  // Index page at /pages
    ...pages.map((page) => ({
      slug: page.path.split('/').filter(Boolean),
    })),
  ];
}
```

## File Browser Example

```typescript
// app/files/[...path]/page.tsx
import { notFound } from "next/navigation";
import { getDirectoryContents, getFile, isDirectory } from "@/lib/files";
import { FileBrowser } from "@/components/file-browser";
import { FileViewer } from "@/components/file-viewer";
import { FileBreadcrumb } from "@/components/file-breadcrumb";

interface FilePageProps {
  params: Promise<{ path: string[] }>;
}

export default async function FilePage({ params }: FilePageProps) {
  const { path } = await params;
  const fullPath = path.join('/');

  // Check if it's a directory or file
  const isDir = await isDirectory(fullPath);

  if (isDir) {
    const contents = await getDirectoryContents(fullPath);
    return (
      <div>
        <FileBreadcrumb segments={path} />
        <FileBrowser items={contents} currentPath={fullPath} />
      </div>
    );
  }

  const file = await getFile(fullPath);
  if (!file) {
    notFound();
  }

  return (
    <div>
      <FileBreadcrumb segments={path} />
      <FileViewer file={file} />
    </div>
  );
}
```

## Nested Catch-All with Layout

```
app/
└── help/
    ├── layout.tsx          # Help center layout
    ├── page.tsx            # /help (index)
    └── [[...category]]/
        ├── page.tsx        # Category/article pages
        └── not-found.tsx
```

```typescript
// app/help/layout.tsx
import { HelpSidebar } from "@/components/help-sidebar";
import { HelpSearch } from "@/components/help-search";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <HelpSearch />
      </div>
      <div className="grid lg:grid-cols-4 gap-8">
        <HelpSidebar />
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}

// app/help/page.tsx
export default function HelpIndexPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Popular Topics</h2>
      {/* Show popular help categories */}
    </div>
  );
}

// app/help/[[...category]]/page.tsx
interface HelpPageProps {
  params: Promise<{ category?: string[] }>;
}

export default async function HelpPage({ params }: HelpPageProps) {
  const { category } = await params;

  if (!category || category.length === 0) {
    // This shouldn't happen due to /help/page.tsx, but handle it
    return <HelpCategories />;
  }

  if (category.length === 1) {
    // /help/billing -> Show category
    const articles = await getHelpArticles(category[0]);
    return <HelpArticleList articles={articles} />;
  }

  // /help/billing/refunds -> Show specific article
  const articleSlug = category[category.length - 1];
  const article = await getHelpArticle(articleSlug);
  return <HelpArticle article={article} />;
}
```

## Breadcrumb Component for Catch-All

```typescript
// components/breadcrumb.tsx
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  segments: string[];
  basePath: string;
  labels?: Record<string, string>;
  className?: string;
}

export function Breadcrumb({
  segments,
  basePath,
  labels = {},
  className,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-2 text-sm", className)}
    >
      <Link
        href={basePath}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((segment, index) => {
        const path = `${basePath}/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label = labels[segment] || formatSegment(segment);

        return (
          <div key={path} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium" aria-current="page">
                {label}
              </span>
            ) : (
              <Link
                href={path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
```

## Dynamic Metadata for Catch-All

```typescript
// app/docs/[...slug]/page.tsx
export async function generateMetadata({
  params,
}: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join('/');
  const doc = await getDocByPath(path);

  if (!doc) {
    return {
      title: 'Page Not Found',
    };
  }

  // Build breadcrumb for title
  const titleParts = slug.map(formatSegment);
  const title = `${doc.title} | ${titleParts.slice(0, -1).join(' > ')}`;

  return {
    title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: 'article',
    },
    alternates: {
      canonical: `/docs/${path}`,
    },
  };
}
```

## Route Priority

```typescript
// More specific routes take priority over catch-all

app/
├── docs/
│   ├── page.tsx              // /docs (matches first)
│   ├── getting-started/
│   │   └── page.tsx          // /docs/getting-started (matches first)
│   └── [...slug]/
│       └── page.tsx          // /docs/api/auth (catch-all)
```

## With Search Params

```typescript
// app/search/[[...filters]]/page.tsx
interface SearchPageProps {
  params: Promise<{ filters?: string[] }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { filters } = await params;
  const { q: query, page = "1" } = await searchParams;

  // /search?q=shoes -> No filters
  // /search/clothing?q=shoes -> Category filter
  // /search/clothing/mens?q=shoes -> Category + subcategory

  const results = await search({
    query,
    filters: filters || [],
    page: parseInt(page),
  });

  return (
    <div>
      <SearchFilters activeFilters={filters} />
      <SearchResults results={results} />
    </div>
  );
}
```

## Anti-patterns

### Don't Mix Catch-All with Specific Routes at Same Level

```typescript
// BAD - Confusing route priority
app/
└── blog/
    ├── [...slug]/
    │   └── page.tsx
    └── [postId]/        // Conflicts with catch-all
        └── page.tsx

// GOOD - Clear hierarchy
app/
└── blog/
    ├── page.tsx         // Index
    ├── category/
    │   └── [...path]/   // Category browsing
    │       └── page.tsx
    └── [postId]/        // Individual posts
        └── page.tsx
```

### Don't Forget to Handle Empty Segments

```typescript
// BAD - Crashes on optional catch-all
export default async function Page({ params }) {
  const { slug } = await params;
  const path = slug.join('/');  // Error if slug is undefined
}

// GOOD - Handle undefined
export default async function Page({ params }) {
  const { slug } = await params;
  const path = slug?.join('/') || 'index';
}
```

## Related Skills

- [dynamic-routes](./dynamic-routes.md)
- [app-router](./app-router.md)
- [route-groups](./route-groups.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Required vs optional catch-all
- File browser example
- Breadcrumb component
