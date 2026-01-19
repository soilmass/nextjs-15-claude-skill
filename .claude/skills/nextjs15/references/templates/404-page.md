---
id: t-404-page
name: 404 Not Found Page
version: 2.0.0
layer: L4
category: pages
description: Custom 404 error page with navigation options and search
tags: [page, error, 404, not-found, navigation]
composes:
  - ../organisms/hero.md
  - ../molecules/search-input.md
  - ../atoms/input-button.md
formula: "404Page = Hero(o-hero) + SearchInput(m-search-input) + Button(a-input-button) + SuggestedLinks + HelpLink"
dependencies: []
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# 404 Not Found Page

## Overview

The 404 Not Found Page template provides a user-friendly error experience when visitors reach a non-existent URL. Includes helpful navigation options, search functionality, and optional humorous or branded illustrations to maintain engagement while guiding users back to valid content.

## When to Use

Use this skill when:
- Handling missing pages in your application
- Creating custom error experiences
- Providing recovery options for lost users
- Maintaining brand consistency in error states

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       404 Page                              │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Hero (o-hero)                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              404 Error Display                  │  │  │
│  │  │         "Page not found" Message                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             SearchInput (m-search-input)              │  │
│  │  [Search for content...                    ] [Search] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ [Back to Home]      │  │ [Go Back]                   │  │
│  │ Button (a-input-btn)│  │ Button (a-input-button)     │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Suggested Links Grid                     │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │  │
│  │  │   Home      │ │  Products   │ │      Blog       │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Help Link                         │  │
│  │          "Contact our support team"                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

```typescript
// app/not-found.tsx
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/molecules/search-input";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: {
    index: false,
    follow: true,
  },
};

// Popular/suggested links for recovery
const suggestedLinks = [
  { label: "Home", href: "/", description: "Go back to the homepage" },
  { label: "Products", href: "/products", description: "Browse our products" },
  { label: "Blog", href: "/blog", description: "Read our latest posts" },
  { label: "Contact", href: "/contact", description: "Get in touch with us" },
];

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Code Display */}
        <div className="space-y-4">
          <h1 className="text-[10rem] font-bold leading-none tracking-tighter text-muted-foreground/20 select-none">
            404
          </h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Page not found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for. 
              It might have been moved, deleted, or never existed.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-sm mx-auto">
          <SearchInput
            placeholder="Search for content..."
            className="w-full"
          />
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Suggested Links */}
        <div className="pt-8 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Popular pages
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {suggestedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {link.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Link */}
        <div className="text-sm text-muted-foreground">
          <p>
            Still can't find what you're looking for?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

## Variants

### Illustrated 404

```tsx
// With custom illustration or animation
export default function Illustrated404() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Animated Illustration */}
        <div className="relative h-64 md:h-80">
          <Image
            src="/illustrations/lost-astronaut.svg"
            alt="Lost in space"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Houston, we have a problem
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you're looking for has drifted into space. 
            Let's get you back on course.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">Return to Earth</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/sitemap">View Sitemap</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Minimal 404

```tsx
// Clean, minimal design
export default function Minimal404() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Error 404
        </p>
        <h1 className="text-4xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          The page you requested could not be found.
        </p>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
```

### Interactive 404

```tsx
// With interactive elements or games
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Interactive404() {
  const [clicks, setClicks] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        <motion.button
          onClick={() => setClicks(c => c + 1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-[8rem] font-bold leading-none"
        >
          404
        </motion.button>

        {clicks > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground"
          >
            {clicks < 5 
              ? `Clicked ${clicks} time${clicks > 1 ? 's' : ''}. Keep trying?`
              : clicks < 10
                ? "Still here? The page won't appear..."
                : "Okay, you win! Here's a cookie: 🍪"
            }
          </motion.p>
        )}

        <div className="pt-4">
          <Button asChild>
            <Link href="/">Actually, take me home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### E-commerce 404

```tsx
// With product recommendations
export default async function Ecommerce404() {
  const popularProducts = await getPopularProducts(4);

  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">
            This product may have been removed or the URL is incorrect.
          </p>
        </div>

        <SearchInput placeholder="Search products..." />

        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>

      {/* Product Recommendations */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold text-center mb-8">
          Popular right now
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Dashboard 404

```tsx
// Within authenticated dashboard
export default function Dashboard404() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="h-24 w-24 mx-auto rounded-full bg-muted flex items-center justify-center">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-muted-foreground">
            This page doesn't exist in your workspace.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/settings">Check Settings</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/support" className="text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
```

## Segment-Level Not Found

```typescript
// app/blog/[slug]/not-found.tsx
// Specific 404 for blog posts
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPosts } from "@/lib/blog";

export default async function BlogNotFound() {
  const recentPosts = await getPosts({ limit: 3 });

  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-3xl font-bold">Post not found</h1>
        <p className="text-muted-foreground">
          This blog post doesn't exist or has been removed.
        </p>
        
        <Button asChild>
          <Link href="/blog">Browse all posts</Link>
        </Button>
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Recent posts</h2>
        <div className="grid gap-6">
          {recentPosts.map((post) => (
            <article key={post.slug} className="border-b pb-6">
              <Link href={`/blog/${post.slug}`} className="group">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {post.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Triggering Not Found

```typescript
// In a Server Component
import { notFound } from "next/navigation";

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound(); // Triggers the closest not-found.tsx
  }

  return <ProductDetail product={product} />;
}
```

## Performance

### Static Generation

- 404 pages are statically generated by default
- No server-side data fetching needed
- Instant loading for better UX

### Bundle Size

- Keep 404 page minimal
- Lazy load illustrations
- Avoid heavy dependencies

## Accessibility

### Required Features

- Clear heading hierarchy
- Descriptive link text
- Focus management to main content
- Screen reader announcements

### Implementation

```tsx
<main role="main" aria-labelledby="error-heading">
  <h1 id="error-heading">Page not found</h1>
  <p>The page you requested could not be found.</p>
  <nav aria-label="Error recovery options">
    <Link href="/">Return to homepage</Link>
  </nav>
</main>
```

## SEO Considerations

- Return proper 404 HTTP status code (Next.js handles this)
- `robots: { index: false }` to prevent indexing
- Include navigation links for crawlers
- Don't soft-404 (show 404 content with 200 status)

## Error States

The 404 page itself is an error state. However, you may need to handle additional errors.

### Search Error Handling

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/molecules/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function NotFoundSearch() {
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } catch (err) {
      setError("Search failed. Please try again.");
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <SearchInput
        onSearch={handleSearch}
        disabled={isSearching}
        placeholder="Search for content..."
      />
    </div>
  );
}
```

### Error Boundary for 404

```tsx
// app/not-found.tsx with error boundary
"use client";

import { ErrorBoundary } from "react-error-boundary";
import { NotFoundContent } from "@/components/not-found-content";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <button onClick={resetErrorBoundary} className="text-primary underline">
          Try again
        </button>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <NotFoundContent />
    </ErrorBoundary>
  );
}
```

## Loading States

The 404 page is typically static, but dynamic content like suggested links may need loading states.

### Suggested Links Skeleton

```tsx
// components/skeletons/suggested-links-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function SuggestedLinksSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-3 rounded-lg border bg-card">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
```

### With Suspense for Dynamic Content

```tsx
// app/not-found.tsx
import { Suspense } from "react";
import { SuggestedLinksSkeleton } from "@/components/skeletons/suggested-links-skeleton";

async function SuggestedLinks() {
  const links = await getPopularPages();
  return (
    <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="p-3 rounded-lg border">
          <p className="font-medium">{link.label}</p>
          <p className="text-sm text-muted-foreground">{link.description}</p>
        </Link>
      ))}
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">404</h1>
        <p>Page not found</p>

        <Suspense fallback={<SuggestedLinksSkeleton />}>
          <SuggestedLinks />
        </Suspense>
      </div>
    </div>
  );
}
```

### Search Loading State

```tsx
"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

export function SearchWithLoading() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative">
      <input
        type="search"
        className="w-full px-4 py-2 pr-10 rounded-lg border"
        placeholder="Search..."
        onChange={(e) => {
          startTransition(() => {
            // Search logic
          });
        }}
      />
      {isPending && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Layout Breakdown

| Breakpoint | Layout Changes |
|------------|----------------|
| `< 640px` (mobile) | Single column, stacked buttons, smaller text |
| `640px - 1024px` (tablet) | 2-column grid for links, side-by-side buttons |
| `> 1024px` (desktop) | Full layout with larger typography |

### Mobile-First Implementation

```tsx
export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-8">
        {/* Error Code - Responsive sizing */}
        <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-bold leading-none tracking-tighter text-muted-foreground/20">
          404
        </h1>

        {/* Message - Responsive text */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Page not found</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        {/* Search - Full width on mobile */}
        <div className="max-w-sm mx-auto px-4 sm:px-0">
          <SearchInput placeholder="Search..." className="w-full" />
        </div>

        {/* Actions - Stack on mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
            <Link href="javascript:history.back()">Go Back</Link>
          </Button>
        </div>

        {/* Suggested Links - Responsive grid */}
        <div className="pt-6 sm:pt-8 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Popular pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto">
            {suggestedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-3 sm:p-4 rounded-lg border text-left hover:bg-accent transition-colors"
              >
                <p className="font-medium text-sm sm:text-base">{link.label}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Touch-Friendly Mobile Considerations

```tsx
// Ensure touch targets are at least 44x44px
<Button
  asChild
  size="lg"
  className="min-h-[44px] min-w-[44px] touch-manipulation"
>
  <Link href="/">Back to Home</Link>
</Button>

// Add touch feedback
<Link
  href={link.href}
  className="p-4 rounded-lg border active:bg-accent/80 transition-colors"
>
  {link.label}
</Link>
```

### Mobile Navigation with Swipe Support

```tsx
"use client";

import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/navigation";

export function MobileNotFound() {
  const router = useRouter();

  const handlers = useSwipeable({
    onSwipedRight: () => router.back(),
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <div {...handlers} className="min-h-screen">
      <p className="text-xs text-muted-foreground text-center sm:hidden">
        Swipe right to go back
      </p>
      {/* Rest of 404 content */}
    </div>
  );
}
```

## Analytics

```typescript
// Track 404 occurrences
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function NotFoundTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track("404_error", {
      path: pathname,
      referrer: document.referrer,
    });
  }, [pathname]);

  return null;
}
```

## Related Skills

### Uses Layout
- [marketing-layout](./marketing-layout.md) - For public 404
- [dashboard-layout](./dashboard-layout.md) - For app 404

### Related Pages
- [landing-page](./landing-page.md)
- [about-page](./about-page.md)

### Related Molecules
- [search-input](../molecules/search-input.md)
- [empty-state](../molecules/empty-state.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Multiple variants (illustrated, minimal, interactive)
- Search integration
- Suggested links
- Segment-level not-found support
