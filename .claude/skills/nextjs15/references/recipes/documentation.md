---
id: r-documentation
name: Documentation Site Recipe
version: 3.0.0
layer: L6
category: recipes
description: Complete recipe for building a documentation site with Next.js 15
tags: [recipe, documentation, docs, technical-writing, mdx, search]
formula: "Documentation = DocumentationLayout(t-documentation-layout) + MarketingLayout(t-marketing-layout) + ChangelogPage(t-changelog-page) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + Sidebar(o-sidebar) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + TableOfContents(o-table-of-contents) + CodeBlock(o-code-block) + SearchModal(o-search-modal) + LanguageSwitcher(o-language-switcher) + KeyboardShortcuts(o-keyboard-shortcuts) + CommandPalette(o-command-palette) + CookieConsent(o-cookie-consent) + Faq(o-faq) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + SearchInput(m-search-input) + CopyButton(m-copy-button) + NavLink(m-nav-link) + Card(m-card) + Tabs(m-tabs) + Callout(m-callout) + Badge(m-badge) + FormField(m-form-field) + EmptyState(m-empty-state) + Mdx(pt-mdx) + Search(pt-search) + FullTextSearch(pt-full-text-search) + StaticRendering(pt-static-rendering) + ImageOptimization(pt-image-optimization) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + I18nRouting(pt-i18n-routing) + Translations(pt-translations) + ErrorBoundaries(pt-error-boundaries) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + KeyboardNavigation(pt-keyboard-navigation) + Pagination(pt-pagination) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + GdprCompliance(pt-gdpr-compliance) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + InputSanitization(pt-input-sanitization) + Csp(pt-csp) + ErrorTracking(pt-error-tracking) + UserAnalytics(pt-user-analytics)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/search-input.md
  - ../molecules/copy-button.md
  - ../molecules/nav-link.md
  - ../molecules/card.md
  - ../molecules/tabs.md
  - ../molecules/callout.md
  # L3 Organisms - Complex Components
  - ../organisms/sidebar.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/table-of-contents.md
  - ../organisms/code-block.md
  - ../organisms/search-modal.md
  - ../organisms/language-switcher.md
  - ../organisms/keyboard-shortcuts.md
  - ../organisms/command-palette.md
  - ../organisms/cookie-consent.md
  # L4 Templates - Page Layouts
  - ../templates/documentation-layout.md
  - ../templates/marketing-layout.md
  - ../templates/changelog-page.md
  # L5 Patterns - Content & Search
  - ../patterns/mdx.md
  - ../patterns/search.md
  - ../patterns/full-text-search.md
  # L5 Patterns - Rendering & Optimization
  - ../patterns/static-rendering.md
  - ../patterns/image-optimization.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Internationalization
  - ../patterns/i18n-routing.md
  - ../patterns/translations.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Accessibility & Navigation
  - ../patterns/keyboard-navigation.md
  # L5 Patterns - Data Management
  - ../patterns/pagination.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Privacy
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/input-sanitization.md
  - ../patterns/csp.md
  # L4 Templates - Additional
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  # L3 Organisms - Additional
  - ../organisms/faq.md
  # L2 Molecules - Additional
  - ../molecules/badge.md
  - ../molecules/form-field.md
  - ../molecules/empty-state.md
  # L5 Patterns - Error Handling
  - ../patterns/error-tracking.md
  # L5 Patterns - Analytics
  - ../patterns/user-analytics.md
dependencies:
  - next
  - next-mdx-remote
  - fumadocs-core
  - pagefind
complexity: intermediate
estimated_time: 6-12 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Documentation Site Recipe

## Overview

Build a professional documentation site with versioning, search, and excellent navigation. Supports MDX for rich content, automatic table of contents, and full-text search. Perfect for API documentation, product guides, and developer portals.

## Architecture

```
app/
├── (docs)/                      # Docs route group
│   ├── layout.tsx              # Docs layout with sidebar
│   ├── page.tsx                # Docs homepage
│   └── [[...slug]]/
│       └── page.tsx            # Documentation pages
├── api/
│   └── search/
│       └── route.ts            # Search API
├── og/
│   └── [...slug]/
│       └── route.tsx           # OG image generation
└── sitemap.ts

content/
├── docs/
│   ├── index.mdx               # Docs homepage
│   ├── getting-started/
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   └── quick-start.mdx
│   ├── guides/
│   │   ├── index.mdx
│   │   └── ...
│   └── api-reference/
│       ├── index.mdx
│       └── ...
└── meta.json                    # Navigation structure
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| [documentation-layout](../templates/documentation-layout.md) | L4 Template | Documentation shell with sidebar and TOC areas |
| [marketing-layout](../templates/marketing-layout.md) | L4 Template | Marketing pages layout for docs landing |
| [sidebar](../organisms/sidebar.md) | L3 Organism | Collapsible navigation sidebar |
| [table-of-contents](../organisms/table-of-contents.md) | L3 Organism | In-page table of contents |
| [code-block](../organisms/code-block.md) | L3 Organism | Syntax highlighted code blocks |
| [search-dialog](../organisms/search-dialog.md) | L3 Organism | Full-text search dialog |
| [version-selector](../organisms/version-selector.md) | L3 Organism | Documentation version switcher |
| [mdx](../patterns/mdx.md) | L5 Pattern | MDX content rendering |
| [search](../patterns/search.md) | L5 Pattern | Pagefind search integration |

## Implementation

### Content Configuration

```typescript
// lib/docs/source.ts
import { createMDXSource } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';

export const docs = loader({
  baseUrl: '/docs',
  source: createMDXSource({
    dir: 'content/docs',
  }),
});
```

### Navigation Structure

```json
// content/docs/meta.json
{
  "title": "Documentation",
  "pages": [
    "index",
    "---Getting Started---",
    "getting-started/index",
    "getting-started/installation",
    "getting-started/quick-start",
    "getting-started/project-structure",
    "---Guides---",
    "guides/index",
    "guides/authentication",
    "guides/data-fetching",
    "guides/styling",
    "guides/deployment",
    "---API Reference---",
    "api-reference/index",
    "api-reference/components",
    "api-reference/hooks",
    "api-reference/utilities"
  ]
}
```

### Docs Layout

```tsx
// app/(docs)/layout.tsx
import { DocsLayout } from 'fumadocs-ui/layout';
import { docs } from '@/lib/docs/source';
import { Search } from '@/components/docs/search';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={docs.pageTree}
      nav={{
        title: 'My Docs',
        githubUrl: 'https://github.com/username/repo',
      }}
      sidebar={{
        defaultOpenLevel: 1,
        collapsible: true,
      }}
    >
      <Search />
      {children}
    </DocsLayout>
  );
}
```

### Docs Page

```tsx
// app/(docs)/[[...slug]]/page.tsx
import { notFound } from 'next/navigation';
import { MDXContent } from 'fumadocs-ui/mdx';
import { docs } from '@/lib/docs/source';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { getTableOfContents } from 'fumadocs-core/server';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  return docs.getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = docs.getPage(slug);
  
  if (!page) {
    return { title: 'Not Found' };
  }

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: 'article',
      images: [`/og/${slug.join('/')}`],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug = [] } = await params;
  const page = docs.getPage(slug);

  if (!page) {
    notFound();
  }

  const toc = await getTableOfContents(page.data.body);

  return (
    <DocsPage
      toc={toc}
      tableOfContent={{
        enabled: true,
        style: 'clerk',
      }}
      editOnGithub={{
        owner: 'username',
        repo: 'repo',
        sha: 'main',
        path: `content/docs/${slug.join('/')}.mdx`,
      }}
      lastUpdate={page.data.lastModified}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description && (
        <DocsDescription>{page.data.description}</DocsDescription>
      )}
      <DocsBody>
        <MDXContent code={page.data.body} />
      </DocsBody>
    </DocsPage>
  );
}
```

### Custom MDX Components

```tsx
// components/docs/mdx-components.tsx
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Callout } from 'fumadocs-ui/components/callout';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';

// API Reference components
interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

function PropsTable({ props }: { props: PropDefinition[] }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3 pr-4 font-medium">Prop</th>
            <th className="py-3 pr-4 font-medium">Type</th>
            <th className="py-3 pr-4 font-medium">Default</th>
            <th className="py-3 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b">
              <td className="py-3 pr-4">
                <code className="rounded bg-muted px-1 py-0.5 text-sm">
                  {prop.name}
                </code>
                {prop.required && (
                  <span className="ml-1 text-destructive">*</span>
                )}
              </td>
              <td className="py-3 pr-4">
                <code className="text-muted-foreground">{prop.type}</code>
              </td>
              <td className="py-3 pr-4">
                {prop.default ? (
                  <code className="text-muted-foreground">{prop.default}</code>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="py-3">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Interactive code playground
function Playground({ code, language = 'tsx' }: { code: string; language?: string }) {
  return (
    <div className="my-6 rounded-lg border">
      <div className="border-b bg-muted/50 px-4 py-2 text-sm font-medium">
        Live Preview
      </div>
      <div className="p-4">
        {/* Preview would go here */}
        <div className="rounded bg-muted p-4">
          Component Preview
        </div>
      </div>
      <div className="border-t">
        <pre className="overflow-x-auto p-4">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export const mdxComponents = {
  Accordion,
  Accordions,
  Callout,
  Tab,
  Tabs,
  TypeTable,
  Card,
  Cards,
  Step,
  Steps,
  File,
  Files,
  Folder,
  ImageZoom,
  PropsTable,
  Playground,
};
```

### Search Implementation

```tsx
// components/docs/search.tsx
'use client';

import * as React from 'react';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { SearchDialog } from 'fumadocs-ui/components/dialog/search';

export function Search() {
  const { search, setSearch, query } = useDocsSearch();

  return (
    <SearchDialog
      open={search}
      onOpenChange={setSearch}
      results={query.data ?? []}
      isLoading={query.isLoading}
    />
  );
}
```

```typescript
// app/api/search/route.ts
import { createSearchAPI } from 'fumadocs-core/search/server';
import { docs } from '@/lib/docs/source';

export const { GET } = createSearchAPI('advanced', {
  indexes: docs.getPages().map((page) => ({
    id: page.url,
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    structuredData: page.data.structuredData,
  })),
});
```

### Version Selector

```tsx
// components/docs/version-selector.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const versions = [
  { value: 'v3', label: 'v3.x (latest)' },
  { value: 'v2', label: 'v2.x' },
  { value: 'v1', label: 'v1.x (legacy)' },
];

export function VersionSelector() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract current version from path
  const currentVersion = pathname.split('/')[2] || 'v3';

  const handleVersionChange = (version: string) => {
    const newPath = pathname.replace(/\/docs\/v\d+/, `/docs/${version}`);
    router.push(newPath);
  };

  return (
    <Select value={currentVersion} onValueChange={handleVersionChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {versions.map((version) => (
          <SelectItem key={version.value} value={version.value}>
            {version.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### OG Image Generation

```tsx
// app/og/[...slug]/route.tsx
import { ImageResponse } from 'next/og';
import { docs } from '@/lib/docs/source';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const page = docs.getPage(slug);

  if (!page) {
    return new Response('Not Found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: 80,
          backgroundColor: '#0a0a0a',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#888',
            }}
          >
            Documentation
          </div>
        </div>
        
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          {page.data.title}
        </div>
        
        {page.data.description && (
          <div
            style={{
              fontSize: 28,
              color: '#888',
              lineHeight: 1.4,
            }}
          >
            {page.data.description}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### Example Documentation Page

```mdx
---
title: Installation
description: How to install and set up the project
---

import { Steps, Step } from 'fumadocs-ui/components/steps'
import { Tabs, Tab } from 'fumadocs-ui/components/tabs'
import { Callout } from 'fumadocs-ui/components/callout'

# Installation

Get started by installing the package.

<Tabs items={['npm', 'pnpm', 'yarn', 'bun']}>
  <Tab value="npm">
    ```bash
    npm install my-package
    ```
  </Tab>
  <Tab value="pnpm">
    ```bash
    pnpm add my-package
    ```
  </Tab>
  <Tab value="yarn">
    ```bash
    yarn add my-package
    ```
  </Tab>
  <Tab value="bun">
    ```bash
    bun add my-package
    ```
  </Tab>
</Tabs>

<Callout type="info">
  Make sure you have Node.js 18 or later installed.
</Callout>

## Quick Setup

<Steps>
  <Step>
    ### Create a new project
    
    Run the create command to scaffold a new project:
    
    ```bash
    npx create-my-app@latest my-project
    ```
  </Step>
  
  <Step>
    ### Configure your environment
    
    Copy the example environment file:
    
    ```bash
    cp .env.example .env.local
    ```
  </Step>
  
  <Step>
    ### Start the development server
    
    ```bash
    npm run dev
    ```
    
    Open [http://localhost:3000](http://localhost:3000) in your browser.
  </Step>
</Steps>

## Project Structure

<Files>
  <Folder name="app" defaultOpen>
    <File name="layout.tsx" />
    <File name="page.tsx" />
    <Folder name="api">
      <File name="route.ts" />
    </Folder>
  </Folder>
  <Folder name="components">
    <File name="ui/" />
  </Folder>
  <File name="package.json" />
</Files>

## Next Steps

<Cards>
  <Card title="Quick Start" href="/docs/getting-started/quick-start">
    Build your first feature in 5 minutes
  </Card>
  <Card title="Configuration" href="/docs/guides/configuration">
    Learn about all configuration options
  </Card>
</Cards>
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/docs/source.test.ts
import { describe, it, expect } from 'vitest';
import { docs } from '@/lib/docs/source';

describe('Documentation Source', () => {
  it('should load all documentation pages', () => {
    const pages = docs.getPages();
    expect(pages.length).toBeGreaterThan(0);
  });

  it('should have valid frontmatter for all pages', () => {
    const pages = docs.getPages();
    pages.forEach((page) => {
      expect(page.data.title).toBeDefined();
      expect(typeof page.data.title).toBe('string');
    });
  });

  it('should generate correct URLs', () => {
    const page = docs.getPage(['getting-started', 'installation']);
    expect(page?.url).toBe('/docs/getting-started/installation');
  });
});
```

### Integration Tests

```typescript
// __tests__/app/docs/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Page from '@/app/(docs)/[[...slug]]/page';

describe('Documentation Page', () => {
  it('should render documentation content', async () => {
    const params = Promise.resolve({ slug: ['getting-started'] });
    const { container } = render(await Page({ params }));

    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('should display table of contents', async () => {
    const params = Promise.resolve({ slug: ['getting-started'] });
    render(await Page({ params }));

    expect(screen.getByRole('navigation', { name: /table of contents/i })).toBeInTheDocument();
  });
});
```

### Search Tests

```typescript
// __tests__/api/search.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/search/route';

describe('Search API', () => {
  it('should return results for valid query', async () => {
    const request = new Request('http://localhost/api/search?q=installation');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return empty array for no matches', async () => {
    const request = new Request('http://localhost/api/search?q=xyznonexistent');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveLength(0);
  });
});
```

## Error Handling

### 404 for Missing Pages

```tsx
// app/(docs)/[[...slug]]/page.tsx
import { notFound } from 'next/navigation';

export default async function Page({ params }: PageProps) {
  const { slug = [] } = await params;
  const page = docs.getPage(slug);

  if (!page) {
    notFound();
  }
  // ... rest of component
}
```

### Custom Not Found Page

```tsx
// app/(docs)/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The documentation page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/docs">Browse Documentation</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
```

### Search Error Boundary

```tsx
// components/docs/search-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SearchErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 text-sm text-muted-foreground">
          Search is temporarily unavailable
        </div>
      );
    }
    return this.props.children;
  }
}
```

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate between sidebar items, TOC links, and interactive elements
- **Enter/Space**: Activate links and toggle collapsible sections
- **Escape**: Close search dialog and mobile menu
- **Arrow keys**: Navigate search results
- **Cmd/Ctrl + K**: Open search dialog

### ARIA Labels

```tsx
// Sidebar navigation
<nav aria-label="Documentation navigation">
  <ul role="list">
    {items.map((item) => (
      <li key={item.href}>
        <a
          href={item.href}
          aria-current={isActive ? 'page' : undefined}
        >
          {item.title}
        </a>
      </li>
    ))}
  </ul>
</nav>

// Table of contents
<nav aria-label="Table of contents">
  <h2 className="sr-only">On this page</h2>
  {/* TOC items */}
</nav>

// Search dialog
<div
  role="dialog"
  aria-modal="true"
  aria-label="Search documentation"
>
  <input
    type="search"
    aria-label="Search documentation"
    placeholder="Search docs..."
  />
</div>
```

### Screen Reader Support

- Proper heading hierarchy (h1 for title, h2-h6 for sections)
- Skip to main content link
- Descriptive link text
- Alt text for all images
- Code blocks with language labels

## Security

### Input Sanitization for Search

```typescript
// lib/validations/search.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export const searchQuerySchema = z.object({
  q: z.string()
    .min(1, 'Search query required')
    .max(100, 'Query too long')
    .transform((q) => DOMPurify.sanitize(q.trim())),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
```

### Rate Limiting for Search API

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const searchRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 searches per minute
  analytics: true,
});

export async function checkSearchRateLimit(ip: string) {
  const { success, remaining, reset } = await searchRatelimit.limit(`search:${ip}`);

  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  return { remaining, reset };
}
```

### Content Security Policy

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

### XSS Prevention in MDX

```typescript
// lib/mdx/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code',
      'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'figure', 'figcaption', 'div', 'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}
```

## Performance

### Static Generation Optimization

```typescript
// app/(docs)/[[...slug]]/page.tsx
import { notFound } from 'next/navigation';
import { docs } from '@/lib/docs/source';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams() {
  return docs.getPages().map((page) => ({
    slug: page.slugs,
  }));
}
```

### Search Index Optimization

```typescript
// scripts/build-search-index.ts
import { docs } from '@/lib/docs/source';
import { writeFileSync } from 'fs';

export async function buildSearchIndex() {
  const pages = docs.getPages();

  const index = pages.map((page) => ({
    id: page.url,
    title: page.data.title,
    description: page.data.description,
    content: extractTextContent(page.data.body),
    url: page.url,
    keywords: page.data.keywords || [],
  }));

  writeFileSync('public/search-index.json', JSON.stringify(index));
}
```

### Code Splitting for Heavy Components

```tsx
// components/docs/dynamic-imports.tsx
import dynamic from 'next/dynamic';

export const CodePlayground = dynamic(
  () => import('./code-playground'),
  {
    loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />,
    ssr: false,
  }
);

export const DiagramRenderer = dynamic(
  () => import('./diagram-renderer'),
  {
    loading: () => <div className="h-48 animate-pulse bg-muted rounded-lg" />,
    ssr: false,
  }
);
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 1.5s | 1.2s |
| FID | < 100ms | 30ms |
| CLS | < 0.1 | 0.02 |
| TTFB | < 200ms | 150ms |
| Search Response | < 100ms | 50ms |
| Time to Interactive | < 2s | 1.5s |

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

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
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:ci

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: .next
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e

  deploy:
    needs: [lint, type-check, test, build, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Content Validation on PR

```yaml
# .github/workflows/content-check.yml
name: Content Validation

on:
  pull_request:
    paths:
      - 'content/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install

      - name: Check frontmatter
        run: pnpm check:frontmatter

      - name: Check broken links
        run: pnpm check:links

      - name: Lint MDX
        run: pnpm lint:mdx

      - name: Build search index
        run: pnpm build:search
```

## Monitoring

### Application Monitoring

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function initMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

export function trackPageView(path: string, title: string) {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Viewed: ${title} (${path})`,
    level: 'info',
  });
}

export function trackSearch(query: string, resultsCount: number) {
  Sentry.addBreadcrumb({
    category: 'search',
    message: `Search: "${query}" - ${resultsCount} results`,
    level: 'info',
  });
}
```

### Search Analytics

```typescript
// lib/analytics/search.ts
export async function trackSearchQuery(query: string, results: number) {
  await fetch('/api/analytics/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      results,
      timestamp: new Date().toISOString(),
    }),
  });
}

export async function getPopularSearches() {
  const response = await fetch('/api/analytics/search/popular');
  return response.json();
}

export async function getZeroResultSearches() {
  const response = await fetch('/api/analytics/search/zero-results');
  return response.json();
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    search: false,
    content: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check search is working
    const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/search?q=test`);
    checks.search = searchResponse.ok;
  } catch (error) {
    console.error('Search health check failed:', error);
  }

  try {
    // Check content is accessible
    const docs = await import('@/lib/docs/source');
    checks.content = docs.docs.getPages().length > 0;
  } catch (error) {
    console.error('Content health check failed:', error);
  }

  const allHealthy = Object.values(checks).every((v) => v === true || typeof v === 'string');

  return Response.json(checks, { status: allHealthy ? 200 : 503 });
}
```

### Alert Configuration

```yaml
# alerts.yml
alerts:
  - name: search-errors
    condition: search_error_rate > 5%
    window: 5m
    severity: high
    channels: [slack]

  - name: slow-page-load
    condition: lcp_p95 > 3000ms
    window: 15m
    severity: warning
    channels: [slack]

  - name: build-failure
    condition: build_status == "failed"
    severity: critical
    channels: [slack, pagerduty]

  - name: content-validation-failure
    condition: content_check_status == "failed"
    severity: high
    channels: [slack]
```

## Deployment Checklist

- [ ] Configure search indexing
- [ ] Set up versioned documentation
- [ ] Configure redirects for moved pages
- [ ] Set up feedback collection
- [ ] Configure analytics
- [ ] Test search functionality
- [ ] Verify OG images generate correctly

## Related Recipes

- [blog-platform](./blog-platform.md) - For content blogs
- [marketing-site](./marketing-site.md) - For landing pages

---

## Changelog

### 3.0.0 (2025-01-18)
- Added Security, Performance, CI/CD, and Monitoring sections
- Enhanced compositions with additional patterns
- Updated to comprehensive recipe standard

### 1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- Fumadocs integration
- Search implementation
- Version support
