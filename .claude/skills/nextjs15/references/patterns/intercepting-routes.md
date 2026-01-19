---
id: pt-intercepting-routes
name: Intercepting Routes
version: 2.1.0
layer: L5
category: routing
description: Intercept routes to show content in modals while preserving URL state and enabling deep linking
tags: [routing, intercepting-routes, modals, url-state, soft-navigation, next15]
composes: []
dependencies: []
formula: "Intercepting Route = @slot/ + (.)pattern + dialog/sheet + fallback page"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Intercepting Routes

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Soft Navigation Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User clicks /photos/123                                    │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ app/                                                 │   │
│  │  ├── layout.tsx ─────────────────┐                  │   │
│  │  │     {children}                │                  │   │
│  │  │     {modal} ◄─────────────────┼──── @modal/      │   │
│  │  │                               │     (.)photos/   │   │
│  │  │                               │        [id]/     │   │
│  │  │                               │          page    │   │
│  │  │                               │                  │   │
│  │  └── photos/                     │                  │   │
│  │       └── [id]/                  │                  │   │
│  │            └── page.tsx ◄────────┘                  │   │
│  │               (stays in background)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    Hard Navigation Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Direct URL to /photos/123 (refresh/external link)         │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ app/                                                 │   │
│  │  └── photos/                                        │   │
│  │       └── [id]/                                     │   │
│  │            └── page.tsx ◄──── Full page renders     │   │
│  │                              (no modal)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Intercepting Routes allow you to load a route within the current layout while keeping the URL updated. This is perfect for modals that need their own URL for sharing and deep linking, while showing content inline during soft navigation.

## Convention

| Pattern | Matches |
|---------|---------|
| `(.)` | Same level |
| `(..)` | One level up |
| `(..)(..)` | Two levels up |
| `(...)` | From root `app` directory |

## When to Use

- Photo galleries with modal detail view
- Login modals that can also be full pages
- Quick edit forms
- Product quick view
- Any content that should have a URL but appear as overlay

## Photo Gallery Example

### Directory Structure

```
app/
├── layout.tsx
├── page.tsx
├── @modal/
│   ├── default.tsx
│   └── (.)photos/[id]/
│       └── page.tsx         # Intercepted modal
└── photos/
    ├── page.tsx             # Gallery page
    └── [id]/
        └── page.tsx         # Full photo page
```

### Root Layout with Modal Slot

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
```

### Modal Default (No Modal Active)

```typescript
// app/@modal/default.tsx
export default function ModalDefault() {
  return null;
}
```

### Gallery Page with Links

```typescript
// app/photos/page.tsx
import Link from "next/link";
import { getPhotos } from "@/lib/photos";

export default async function GalleryPage() {
  const photos = await getPhotos();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Photo Gallery</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/photos/${photo.id}`}
            className="group relative aspect-square overflow-hidden rounded-lg"
          >
            <img
              src={photo.thumbnailUrl}
              alt={photo.title}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Intercepted Modal Route

```typescript
// app/@modal/(.)photos/[id]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { PhotoDetail } from "@/components/photo-detail";
import { X } from "lucide-react";

export default function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  // Close modal and go back
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogClose className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm">
          <X className="h-4 w-4" />
        </DialogClose>
        <PhotoDetail id={id} />
      </DialogContent>
    </Dialog>
  );
}
```

### Full Photo Page (Direct Navigation / Refresh)

```typescript
// app/photos/[id]/page.tsx
import { notFound } from "next/navigation";
import { getPhoto } from "@/lib/photos";
import { PhotoDetail } from "@/components/photo-detail";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  if (!photo) {
    notFound();
  }

  return (
    <div className="container py-8">
      <Link
        href="/photos"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </Link>
      
      <PhotoDetail id={id} />
    </div>
  );
}

// Generate static params for popular photos
export async function generateStaticParams() {
  const photos = await getPopularPhotos();
  return photos.map((photo) => ({ id: photo.id }));
}

// Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);
  
  return {
    title: photo?.title || "Photo",
    description: photo?.description,
    openGraph: {
      images: [photo?.url],
    },
  };
}
```

### Shared Photo Detail Component

```typescript
// components/photo-detail.tsx
import { getPhoto } from "@/lib/photos";
import { Button } from "@/components/ui/button";
import { Heart, Share, Download } from "lucide-react";

export async function PhotoDetail({ id }: { id: string }) {
  const photo = await getPhoto(id);

  if (!photo) {
    return <div className="p-8 text-center">Photo not found</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="relative aspect-square">
        <img
          src={photo.url}
          alt={photo.title}
          className="object-cover w-full h-full"
        />
      </div>
      
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">{photo.title}</h2>
        <p className="text-muted-foreground">{photo.description}</p>
        
        <div className="flex items-center gap-4">
          <img
            src={photo.author.avatar}
            alt={photo.author.name}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <p className="font-medium">{photo.author.name}</p>
            <p className="text-sm text-muted-foreground">
              {photo.createdAt}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Login Modal Example

### Directory Structure

```
app/
├── layout.tsx
├── page.tsx
├── @auth/
│   ├── default.tsx
│   └── (.)login/
│       └── page.tsx
└── login/
    └── page.tsx
```

### Auth Modal Slot

```typescript
// app/@auth/default.tsx
export default function AuthDefault() {
  return null;
}

// app/@auth/(.)login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginModal() {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to your account</DialogTitle>
        </DialogHeader>
        <LoginForm
          onSuccess={() => router.back()}
          onSignUpClick={() => router.push("/signup")}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Full Login Page

```typescript
// app/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const handleSuccess = () => {
    redirect("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
```

## Product Quick View

### Directory Structure

```
app/
├── products/
│   ├── page.tsx
│   ├── @quickview/
│   │   ├── default.tsx
│   │   └── (.)product/[slug]/
│   │       └── page.tsx
│   └── [slug]/
│       └── page.tsx
```

### Using Sheet Instead of Dialog

```typescript
// app/products/@quickview/(.)product/[slug]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ProductQuickView } from "@/components/product-quick-view";

export default function ProductQuickViewModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);

  return (
    <Sheet open onOpenChange={() => router.back()}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <ProductQuickView slug={slug} />
      </SheetContent>
    </Sheet>
  );
}
```

## Navigation Behavior

```typescript
// How intercepting routes work:

// 1. Soft navigation (Link click from same app)
//    - URL updates to /photos/123
//    - Modal renders in @modal slot
//    - Background stays visible

// 2. Hard navigation (direct URL, refresh, external link)
//    - URL is /photos/123
//    - Full page renders at app/photos/[id]/page.tsx
//    - No modal, standard page layout

// 3. Browser back button
//    - Returns to previous URL
//    - Modal closes
//    - Original content visible again
```

## With Keyboard Navigation

```typescript
// components/photo-modal.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";

export function PhotoModalContainer({
  children,
  prevId,
  nextId,
}: {
  children: React.ReactNode;
  prevId?: string;
  nextId?: string;
}) {
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      router.back();
    } else if (e.key === "ArrowLeft" && prevId) {
      router.replace(`/photos/${prevId}`);
    } else if (e.key === "ArrowRight" && nextId) {
      router.replace(`/photos/${nextId}`);
    }
  }, [router, prevId, nextId]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return <>{children}</>;
}
```

## Anti-patterns

### Don't Use for Non-Modal Content

```typescript
// BAD - Intercepting routes for regular page sections
app/@section/(.)about/page.tsx

// GOOD - Use for actual modal/overlay experiences
app/@modal/(.)photos/[id]/page.tsx
```

### Don't Forget the Full Page Route

```typescript
// BAD - Only creating the intercepting route
app/@modal/(.)login/page.tsx
// (missing app/login/page.tsx)

// GOOD - Always create both
app/@modal/(.)login/page.tsx  // Modal version
app/login/page.tsx            // Full page version
```

## Related Skills

- [parallel-routes](./parallel-routes.md)
- [app-router](./app-router.md)
- [dynamic-routes](./dynamic-routes.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Photo gallery modal example
- Login modal pattern
- Keyboard navigation
