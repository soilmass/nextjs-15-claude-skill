---
id: t-documentation-layout
name: Documentation Layout
version: 2.0.0
layer: L4
category: layouts
description: Documentation site layout with sidebar navigation, search, and content area
tags: [layout, documentation, docs, sidebar, mdx, search]
formula: "DocumentationLayout = Sidebar(o-sidebar) + SearchModal(o-search-modal) + Breadcrumb(m-breadcrumb) + Tabs(m-tabs)"
composes:
  - ../organisms/sidebar.md
  - ../organisms/search-modal.md
  - ../molecules/breadcrumb.md
  - ../molecules/tabs.md
dependencies: [next-mdx-remote, cmdk]
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Documentation Layout

## Overview

The Documentation Layout template provides the structure for documentation sites. Features a searchable sidebar with nested navigation, table of contents, version selector, and MDX content rendering. Inspired by Stripe, Vercel, and Next.js documentation.

## When to Use

Use this skill when:
- Building documentation sites
- Creating knowledge bases
- Building API reference docs
- Creating developer guides

## Composition Diagram

```
+------------------------------------------------------------------+
|                    DocumentationLayout                            |
+------------------------------------------------------------------+
|  Header                                                           |
|  +--------------------------------------------------------------+ |
|  | [=] [ Logo ]  Docs  API  Guides  Blog  | o SearchModal [Cmd+K]| |
|  |                                         | [GitHub] [Theme]    | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
|  +------------+  +---------------------------+  +-------------+   |
|  | o Sidebar  |  |     Main Content          |  | TOC         |   |
|  |            |  |                           |  |             |   |
|  | Getting    |  |  m Breadcrumb             |  | On This Page|   |
|  | Started    |  |  Docs > Routing           |  |             |   |
|  | +--------+ |  |                           |  | - Overview  |   |
|  | |Intro   | |  |  +---------------------+  |  | - Usage     |   |
|  | |Install | |  |  |  {children}         |  |  | - Examples  |   |
|  | |Quick   | |  |  |                     |  |  | - API       |   |
|  | +--------+ |  |  |  MDX Content Area   |  |  |             |   |
|  |            |  |  |                     |  |  |             |   |
|  | Core       |  |  |  ## Overview        |  |  |             |   |
|  | Concepts   |  |  |  Content...         |  |  |             |   |
|  | +--------+ |  |  |                     |  |  |             |   |
|  | |Routing | |  |  |  ## Usage           |  |  |             |   |
|  | |Data    | |  |  |  m Tabs             |  |  |             |   |
|  | |Render  | |  |  |  [npm] [yarn]       |  |  |             |   |
|  | +--------+ |  |  |  ```code```         |  |  |             |   |
|  |            |  |  |                     |  |  |             |   |
|  | API Ref    |  |  +---------------------+  |  |             |   |
|  | +--------+ |  |                           |  |             |   |
|  | |Comps   | |  |  [ <- Prev ]  [ Next -> ] |  |             |   |
|  | |Hooks   | |  +---------------------------+  +-------------+   |
|  | +--------+ |                                                   |
|  +------------+                                                   |
+------------------------------------------------------------------+
```

## Organisms Used

- [sidebar](../organisms/sidebar.md) - Navigation sidebar
- [command-palette](../organisms/command-palette.md) - Search
- [blog-post](../organisms/blog-post.md) - Content rendering

## Implementation

```typescript
// app/(docs)/layout.tsx
import { Suspense } from "react";
import Link from "next/link";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsHeader } from "@/components/docs/docs-header";
import { DocSearch } from "@/components/docs/doc-search";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocsLayoutProps {
  children: React.ReactNode;
}

// Documentation navigation structure
const docsNavigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quickstart" },
      { title: "Project Structure", href: "/docs/project-structure" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Routing", href: "/docs/routing" },
      { title: "Data Fetching", href: "/docs/data-fetching" },
      { title: "Rendering", href: "/docs/rendering" },
      { title: "Caching", href: "/docs/caching" },
      { title: "Styling", href: "/docs/styling" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Components", href: "/docs/api/components" },
      { title: "Hooks", href: "/docs/api/hooks" },
      { title: "Utilities", href: "/docs/api/utilities" },
      { title: "Configuration", href: "/docs/api/configuration" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Authentication", href: "/docs/guides/authentication" },
      { title: "Database", href: "/docs/guides/database" },
      { title: "Deployment", href: "/docs/guides/deployment" },
      { title: "Testing", href: "/docs/guides/testing" },
    ],
  },
];

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <DocsHeader />

      <div className="container flex-1">
        <div className="flex-1 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Sidebar */}
          <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <DocsSidebar navigation={docsNavigation} />
            </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
            <div className="mx-auto w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

### Docs Header Component

```typescript
// components/docs/docs-header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Github, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DocSearch } from "@/components/docs/doc-search";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

export function DocsHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] pr-0">
            <DocsSidebar navigation={docsNavigation} />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="hidden font-bold sm:inline-block">Acme Docs</span>
        </Link>

        {/* Main Nav */}
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/docs"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith("/docs")
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Docs
          </Link>
          <Link
            href="/docs/api"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith("/docs/api")
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            API
          </Link>
          <Link
            href="/docs/guides"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith("/docs/guides")
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Guides
          </Link>
          <Link
            href="/blog"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            Blog
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Search */}
          <DocSearch />

          {/* GitHub */}
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/yourorg/yourrepo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

### Docs Sidebar Component

```typescript
// components/docs/docs-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface DocsSidebarProps {
  navigation: NavSection[];
}

export function DocsSidebar({ navigation }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      {navigation.map((section, index) => (
        <div key={index} className="pb-8">
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
            {section.title}
          </h4>
          <div className="grid grid-flow-row auto-rows-max text-sm">
            {section.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                href={item.disabled ? "#" : item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline",
                  item.disabled && "cursor-not-allowed opacity-60",
                  pathname === item.href
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
                {item.label && (
                  <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs leading-none text-primary">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Doc Search Component

```typescript
// components/docs/doc-search.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Hash, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Mock search results - replace with actual search
const searchResults = [
  { title: "Getting Started", href: "/docs", type: "page" },
  { title: "Installation", href: "/docs/installation", type: "page" },
  { title: "Data Fetching", href: "/docs/data-fetching", type: "page" },
  { title: "useQuery Hook", href: "/docs/api/hooks#usequery", type: "heading" },
];

export function DocSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search documentation...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documentation..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {searchResults
              .filter((r) => r.type === "page")
              .map((result) => (
                <CommandItem
                  key={result.href}
                  value={result.title}
                  onSelect={() => runCommand(() => router.push(result.href))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {result.title}
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Headings">
            {searchResults
              .filter((r) => r.type === "heading")
              .map((result) => (
                <CommandItem
                  key={result.href}
                  value={result.title}
                  onSelect={() => runCommand(() => router.push(result.href))}
                >
                  <Hash className="mr-2 h-4 w-4" />
                  {result.title}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

### Table of Contents Component

```typescript
// components/docs/table-of-contents.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
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

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="hidden xl:block">
      <div className="sticky top-16 -mt-10 max-h-[calc(100vh-3.5rem)] overflow-y-auto pt-10">
        <div className="space-y-2">
          <p className="font-medium">On This Page</p>
          <ul className="m-0 list-none text-sm">
            {items.map((item) => (
              <li key={item.id} className="mt-0 pt-2">
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "inline-block no-underline transition-colors hover:text-foreground",
                    item.level === 3 && "pl-4",
                    activeId === item.id
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

## Key Implementation Notes

1. **Cmd+K Search**: Global search via command palette
2. **Sticky Sidebar**: Navigation stays visible
3. **Active Link**: Current page highlighted
4. **TOC Scroll Spy**: Highlights active section
5. **Mobile Sheet**: Sidebar in drawer on mobile

## Variants

### With Version Selector

```tsx
<header>
  {/* ... other header content */}
  <Select value={version} onValueChange={setVersion}>
    <SelectTrigger className="w-24">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="v2">v2.0</SelectItem>
      <SelectItem value="v1">v1.0</SelectItem>
    </SelectContent>
  </Select>
</header>
```

### With Prev/Next Navigation

```tsx
<div className="flex items-center justify-between pt-8">
  {prevPage && (
    <Link href={prevPage.href} className="flex items-center gap-2">
      <ArrowLeft className="h-4 w-4" />
      {prevPage.title}
    </Link>
  )}
  {nextPage && (
    <Link href={nextPage.href} className="flex items-center gap-2 ml-auto">
      {nextPage.title}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )}
</div>
```

## Performance

### Search

- Consider Algolia DocSearch
- Pre-index content at build time
- Debounce search input

### Content

- Use MDX for static generation
- Lazy load code blocks
- Paginate long pages

## Accessibility

### Required Features

- Skip to content link
- Keyboard-navigable sidebar
- Search accessible via Cmd+K
- TOC landmarks

### Screen Reader

- Navigation announced
- Current page indicated
- Search results announced

## Route Group Structure

```
app/
├── (docs)/
│   ├── layout.tsx           # Docs layout
│   └── docs/
│       ├── page.tsx         # Docs home
│       ├── installation/
│       │   └── page.tsx
│       ├── api/
│       │   └── [...slug]/
│       │       └── page.tsx
│       └── guides/
│           └── [...slug]/
│               └── page.tsx
```

## Error States

### Search Error

```tsx
// components/docs/doc-search-error.tsx
"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandEmpty } from "@/components/ui/command";

interface SearchErrorProps {
  error: Error;
  onRetry: () => void;
}

export function SearchError({ error, onRetry }: SearchErrorProps) {
  return (
    <CommandEmpty>
      <div className="flex flex-col items-center py-6">
        <AlertCircle className="h-8 w-8 text-destructive mb-3" />
        <p className="text-sm font-medium mb-1">Search failed</p>
        <p className="text-xs text-muted-foreground mb-4">
          {error.message || "Unable to fetch search results"}
        </p>
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-2" />
          Try again
        </Button>
      </div>
    </CommandEmpty>
  );
}
```

### Navigation Loading Error

```tsx
// components/docs/sidebar-error.tsx
"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4 text-center">
      <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-3">
        Failed to load navigation
      </p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="h-3 w-3 mr-2" />
        Reload
      </Button>
    </div>
  );
}
```

### MDX Content Error

```tsx
// components/docs/mdx-error.tsx
"use client";

import { AlertCircle, FileQuestion, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MDXErrorProps {
  error: Error;
  slug?: string;
}

export function MDXError({ error, slug }: MDXErrorProps) {
  const isNotFound = error.message.includes("not found");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {isNotFound ? (
        <>
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            The documentation page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/docs">Browse Documentation</Link>
            </Button>
            <Button asChild>
              <Link href="/docs/search">Search Docs</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Content</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            There was a problem loading this documentation page.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
        </>
      )}
    </div>
  );
}
```

### Table of Contents Error

```tsx
// components/docs/toc-error.tsx
"use client";

import { AlertCircle } from "lucide-react";

export function TOCError() {
  return (
    <div className="hidden xl:block">
      <div className="sticky top-16 pt-10">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Unable to load outline</span>
        </div>
      </div>
    </div>
  );
}
```

## Loading States

### Full Documentation Layout Skeleton

```tsx
// components/skeletons/docs-layout-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function DocsLayoutSkeleton() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-14 items-center">
          <Skeleton className="h-6 w-6 rounded mr-4 md:hidden" />
          <Skeleton className="h-6 w-24 mr-6" />
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Skeleton className="h-10 w-10 xl:w-60 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </header>

      <div className="container flex-1">
        <div className="flex-1 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Sidebar Skeleton */}
          <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <div className="h-full py-6 pr-6 lg:py-8 space-y-6">
              {[1, 2, 3, 4].map((section) => (
                <div key={section} className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="space-y-2 pl-2">
                    {[1, 2, 3, 4].map((item) => (
                      <Skeleton key={item} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
            <div className="mx-auto w-full min-w-0 space-y-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Title */}
              <Skeleton className="h-10 w-2/3" />

              {/* Content */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* TOC Skeleton */}
            <div className="hidden xl:block">
              <div className="sticky top-16 pt-10 space-y-2">
                <Skeleton className="h-4 w-24 mb-4" />
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton key={item} className="h-3 w-full" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

### Sidebar Loading

```tsx
// components/docs/sidebar-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarLoading() {
  return (
    <div className="w-full space-y-6">
      {[1, 2, 3, 4].map((section) => (
        <div key={section} className="pb-8">
          <Skeleton className="h-4 w-28 mb-3 ml-2" />
          <div className="grid grid-flow-row auto-rows-max gap-1">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-7 w-full rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Search Loading

```tsx
// components/docs/search-loading.tsx
"use client";

import { Loader2 } from "lucide-react";
import { CommandLoading } from "@/components/ui/command";

export function SearchLoading() {
  return (
    <CommandLoading>
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
      </div>
    </CommandLoading>
  );
}
```

### MDX Content Loading

```tsx
// components/docs/mdx-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function MDXLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title */}
      <Skeleton className="h-10 w-2/3" />

      {/* Description */}
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />

      {/* Section */}
      <div className="pt-4">
        <Skeleton className="h-7 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
        <Skeleton className="h-4 w-4/5 mt-2" />
      </div>

      {/* Code block */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* More text */}
      <div className="pt-4">
        <Skeleton className="h-7 w-1/4 mb-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>
    </div>
  );
}
```

### TOC Loading

```tsx
// components/docs/toc-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function TOCLoading() {
  return (
    <div className="hidden xl:block">
      <div className="sticky top-16 -mt-10 max-h-[calc(100vh-3.5rem)] overflow-y-auto pt-10">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton
                key={item}
                className="h-4"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Breakpoints

| Breakpoint | Sidebar | Content | TOC | Search |
|------------|---------|---------|-----|--------|
| < 768px | Sheet drawer | Full width | Hidden | Icon only |
| 768-1279px | Sticky 220px | Flexible | Hidden | Compact |
| >= 1280px | Sticky 240px | Flexible | Sticky 200px | Full width |

### Mobile Documentation Layout

```tsx
// app/(docs)/layout.tsx - Mobile Responsive
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsHeader } from "@/components/docs/docs-header";
import { cn } from "@/lib/utils";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <DocsHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="container flex-1 px-4 md:px-6">
        <div className="flex-1 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Mobile Sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-[300px] pr-0">
              <div className="flex items-center justify-between mb-6 pr-4">
                <span className="font-semibold">Documentation</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <DocsSidebar navigation={docsNavigation} />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Desktop Sidebar */}
          <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <DocsSidebar navigation={docsNavigation} />
            </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
            <div className="mx-auto w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

### Mobile Header with Search

```tsx
// components/docs/docs-header-mobile.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocSearch } from "./doc-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface DocsHeaderMobileProps {
  onMenuClick: () => void;
}

export function DocsHeaderMobile({ onMenuClick }: DocsHeaderMobileProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center space-x-2">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="hidden font-bold sm:inline-block">Docs</span>
        </Link>

        {/* Desktop Nav - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/docs" className="text-foreground/60 hover:text-foreground">
            Docs
          </Link>
          <Link href="/docs/api" className="text-foreground/60 hover:text-foreground">
            API
          </Link>
          <Link href="/docs/guides" className="text-foreground/60 hover:text-foreground">
            Guides
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Mobile Search */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block">
            <DocSearch />
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container flex h-14 items-center px-4">
            <DocSearch autoFocus onClose={() => setSearchOpen(false)} />
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setSearchOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
```

### Mobile Table of Contents (Collapsible)

```tsx
// components/docs/mobile-toc.tsx
"use client";

import * as React from "react";
import { ChevronDown, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface MobileTOCProps {
  items: TocItem[];
}

export function MobileTOC({ items }: MobileTOCProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
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

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="xl:hidden mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span>On this page</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <nav className="border rounded-lg p-3 bg-muted/50">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className={cn(
                      "block w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors",
                      item.level === 3 && "pl-6",
                      activeId === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
```

### Responsive Prev/Next Navigation

```tsx
// components/docs/prev-next-nav.tsx
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLink {
  title: string;
  href: string;
}

interface PrevNextNavProps {
  prevPage?: PageLink;
  nextPage?: PageLink;
}

export function PrevNextNav({ prevPage, nextPage }: PrevNextNavProps) {
  return (
    <nav className="flex flex-col sm:flex-row items-stretch gap-3 pt-8 border-t">
      {prevPage ? (
        <Link
          href={prevPage.href}
          className="flex-1 flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Previous</p>
            <p className="font-medium truncate">{prevPage.title}</p>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextPage ? (
        <Link
          href={nextPage.href}
          className="flex-1 flex items-center justify-between gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group sm:text-right"
        >
          <div className="min-w-0 sm:order-1">
            <p className="text-xs text-muted-foreground">Next</p>
            <p className="font-medium truncate">{nextPage.title}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 sm:order-2" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
```

## Related Skills

### Composes Into
- MDX content pages
- API reference pages
- Guide pages

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Searchable sidebar
- Table of contents
- Mobile drawer navigation
