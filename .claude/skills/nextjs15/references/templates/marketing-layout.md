---
id: t-marketing-layout
name: Marketing Layout
version: 2.0.0
layer: L4
category: layouts
description: Public marketing pages layout with header, footer, and announcement bar
tags: [layout, marketing, public, header, footer, landing]
composes:
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/announcement-banner.md
  - ../organisms/cookie-consent.md
dependencies: []
performance:
  impact: high
  lcp: high
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
formula: "MarketingLayout = Header(o-header) + Footer(o-footer) + AnnouncementBanner(o-announcement-banner) + CookieConsent(o-cookie-consent)"
---

# Marketing Layout

## Overview

The Marketing Layout template provides the structure for public-facing marketing pages. Includes a sticky header with navigation, optional announcement bar, and comprehensive footer. Optimized for landing pages, about pages, and blog content.

## When to Use

Use this skill when:
- Building landing pages
- Creating marketing/sales pages
- Building blog layouts
- Creating about/company pages

## Composition Diagram

```
+------------------------------------------------------------------+
|                      MARKETING LAYOUT                             |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |          Announcement Banner (o-announcement-banner)       |  |
|  |  [X] We just launched v2.0! Check out what's new. [->]     |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    Header (o-header)                       |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [Logo]  Products v  Solutions v  Pricing  Blog  Docs |  |  |
|  |  |                           [Sign In]  [Get Started]   |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |              Mega Menu Dropdown                      |  |  |
|  |  |  +-------------+  +-------------+  +-------------+   |  |  |
|  |  |  | Feature One |  | Feature Two |  | Feature 3   |   |  |  |
|  |  |  | Description |  | Description |  | Description |   |  |  |
|  |  |  +-------------+  +-------------+  +-------------+   |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    MAIN CONTENT                            |  |
|  |                                                            |  |
|  |                   {children}                               |  |
|  |                                                            |  |
|  |         (Landing Page, About Page, Blog, etc.)             |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    Footer (o-footer)                       |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [Logo]                                               |  |  |
|  |  | Description text                                     |  |  |
|  |  |                                                      |  |  |
|  |  | Product      Company     Resources     Legal         |  |  |
|  |  | - Features   - About     - Docs        - Privacy     |  |  |
|  |  | - Pricing    - Blog      - Help        - Terms       |  |  |
|  |  | - Changelog  - Careers   - Community   - Security    |  |  |
|  |  | - Roadmap    - Contact   - Status                    |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | Newsletter Signup                                    |  |  |
|  |  | +----------------------------------+  [Subscribe]    |  |  |
|  |  | | Enter your email                 |                 |  |  |
|  |  | +----------------------------------+                 |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [Twitter] [GitHub] [LinkedIn]                        |  |  |
|  |  | (c) 2025 Company. All rights reserved.               |  |  |
|  |  | Privacy Policy | Terms of Service | Cookie Policy   |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |           Cookie Consent (o-cookie-consent)                |  |
|  |  +------------------------------------------------------+  |  |
|  |  | We use cookies to improve your experience.           |  |  |
|  |  | [Accept All]  [Customize]  [Reject All]              |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Organisms Used

- [header](../organisms/header.md) - Site navigation
- [footer](../organisms/footer.md) - Site footer
- [mobile-menu](../organisms/mobile-menu.md) - Mobile navigation

## Implementation

```typescript
// app/(marketing)/layout.tsx
import { Suspense } from "react";
import { Header } from "@/components/organisms/header";
import { Footer } from "@/components/organisms/footer";
import { AnnouncementBar } from "@/components/organisms/announcement-bar";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

// Navigation configuration
const navigationItems = [
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "Feature One", href: "/products/feature-one", description: "Powerful feature description" },
      { label: "Feature Two", href: "/products/feature-two", description: "Another great feature" },
      { label: "Feature Three", href: "/products/feature-three", description: "The best feature yet" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "For Startups", href: "/solutions/startups" },
      { label: "For Enterprise", href: "/solutions/enterprise" },
      { label: "For Agencies", href: "/solutions/agencies" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
];

// Footer configuration
const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

const socialLinks = [
  { platform: "twitter" as const, href: "https://twitter.com/yourhandle" },
  { platform: "github" as const, href: "https://github.com/yourhandle" },
  { platform: "linkedin" as const, href: "https://linkedin.com/company/yourcompany" },
];

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      {/* Announcement Bar (optional) */}
      <AnnouncementBar
        message="We just launched v2.0! Check out what's new."
        link={{ label: "Learn more", href: "/changelog" }}
        dismissible
      />

      {/* Header */}
      <Header
        logo={{
          src: "/logo.svg",
          alt: "Company Logo",
          href: "/",
        }}
        navigation={navigationItems}
        actions={[
          { label: "Sign In", href: "/login", variant: "ghost" },
          { label: "Get Started", href: "/signup", variant: "default" },
        ]}
        sticky
        blur
      />

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer
        logo={{
          src: "/logo.svg",
          alt: "Company Logo",
        }}
        description="Building the future of web development with Next.js and modern tooling."
        columns={footerColumns}
        social={socialLinks}
        newsletter={{
          title: "Subscribe to our newsletter",
          description: "Get the latest news and updates.",
          placeholder: "Enter your email",
          buttonLabel: "Subscribe",
        }}
        copyright={`© ${new Date().getFullYear()} Your Company. All rights reserved.`}
        bottomLinks={[
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Cookie Policy", href: "/cookies" },
        ]}
      />
    </>
  );
}
```

### Announcement Bar Component

```typescript
// components/organisms/announcement-bar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementBarProps {
  message: string;
  link?: {
    label: string;
    href: string;
  };
  dismissible?: boolean;
  variant?: "default" | "gradient" | "dark";
  className?: string;
}

export function AnnouncementBar({
  message,
  link,
  dismissible = true,
  variant = "default",
  className,
}: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Check localStorage for dismissed state
  React.useEffect(() => {
    const dismissed = localStorage.getItem("announcement-dismissed");
    if (dismissed) setIsDismissed(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("announcement-dismissed", "true");
  };

  if (isDismissed) return null;

  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    gradient: "bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white",
    dark: "bg-gray-900 text-white",
  };

  return (
    <div
      className={cn(
        "relative px-4 py-2 text-center text-sm",
        variantStyles[variant],
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <span>{message}</span>
        {link && (
          <Link
            href={link.href}
            className="inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:no-underline"
          >
            {link.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-sm opacity-70 hover:opacity-100"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

### Page Metadata Helper

```typescript
// lib/metadata.ts
import { Metadata } from "next";

interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  image = "/og.jpg",
  noIndex = false,
}: PageMetadata): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
    },
    twitter: {
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// Usage in page:
// export const metadata = generatePageMetadata({
//   title: "About Us",
//   description: "Learn about our company and mission.",
// });
```

## Key Implementation Notes

1. **Sticky Header**: Header stays visible while scrolling
2. **Backdrop Blur**: Glassmorphism effect on scroll
3. **Announcement Bar**: Dismissible with localStorage
4. **Footer Newsletter**: Email capture integration ready
5. **Responsive Navigation**: Mobile menu for small screens

## Variants

### Without Announcement

```tsx
export default function MarketingLayout({ children }) {
  return (
    <>
      <Header {...headerProps} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer {...footerProps} />
    </>
  );
}
```

### With Breadcrumbs

```tsx
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function MarketingLayout({ children }) {
  return (
    <>
      <Header {...headerProps} />
      <div className="container py-4">
        <Breadcrumbs />
      </div>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer {...footerProps} />
    </>
  );
}
```

### Minimal (No Footer)

```tsx
export default function MinimalLayout({ children }) {
  return (
    <>
      <Header minimal />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </>
  );
}
```

## Performance

### Header Optimization

- Lazy load mega menu content
- Debounce scroll handlers
- Use CSS for blur effects

### Footer Optimization

- Newsletter form is client component
- Static content is server rendered
- Lazy load social icons

## Accessibility

### Required Features

- Skip to main content link
- Keyboard-navigable menu
- Focus trap in mobile menu
- ARIA labels on navigation

### Screen Reader

- Navigation landmarks
- Announcement announced once
- Menu states communicated

## Route Group Structure

```
app/
├── (marketing)/
│   ├── layout.tsx        # Marketing layout
│   ├── page.tsx          # Landing page
│   ├── about/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   └── contact/
│       └── page.tsx
```

## Error States

### Header Error Boundary

```tsx
// components/organisms/header-error.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderErrorProps {
  error: Error;
  reset: () => void;
}

export function HeaderError({ error, reset }: HeaderErrorProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6" />
          <span className="font-bold">Home</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Navigation unavailable</span>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </header>
  );
}
```

### Footer Error Fallback

```tsx
// components/organisms/footer-error.tsx
import Link from "next/link";
import { Mail } from "lucide-react";

export function FooterError() {
  return (
    <footer className="border-t py-8 bg-muted/30">
      <div className="container text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Some content failed to load.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            Home
          </Link>
          <Link
            href="/contact"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

### Newsletter Signup Error

```tsx
// components/organisms/newsletter-error.tsx
"use client";

import { useFormState } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/actions/newsletter";

const initialState = { error: null, success: false };

export function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeToNewsletter, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{state.error}</span>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          className="flex-1"
        />
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        "Subscribe"
      )}
    </Button>
  );
}
```

### Announcement Bar Error

```tsx
// components/organisms/announcement-bar-error.tsx
"use client";

import { useEffect, useState } from "react";

export function AnnouncementBarWithFallback() {
  const [announcement, setAnnouncement] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/announcements/active")
      .then((res) => res.json())
      .then(setAnnouncement)
      .catch(() => setError(true));
  }, []);

  // Silent failure - don't show error state for optional content
  if (error || !announcement) return null;

  return <AnnouncementBar {...announcement} />;
}
```

## Loading States

### Full Layout Skeleton

```tsx
// components/skeletons/marketing-layout-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function MarketingLayoutSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement Bar Skeleton */}
      <div className="bg-muted h-10 flex items-center justify-center">
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <div className="hidden md:flex items-center gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </header>

      {/* Main Content Placeholder */}
      <main className="flex-1">
        <Skeleton className="h-[60vh]" />
      </main>

      {/* Footer Skeleton */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((col) => (
              <div key={col} className="space-y-3">
                <Skeleton className="h-5 w-20" />
                {[1, 2, 3, 4].map((link) => (
                  <Skeleton key={link} className="h-4 w-24" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
```

### Header Loading State

```tsx
// components/organisms/header-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function HeaderLoading() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Skeleton className="h-8 w-28" />

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-16 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        {/* Mobile Menu Button */}
        <Skeleton className="h-10 w-10 rounded-md md:hidden" />
      </div>
    </header>
  );
}
```

### Footer Loading with Suspense

```tsx
// components/organisms/footer-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function FooterLoading() {
  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-8">
          {/* Logo Section */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((col) => (
              <div key={col} className="space-y-3">
                <Skeleton className="h-5 w-20" />
                {[1, 2, 3, 4].map((link) => (
                  <Skeleton key={link} className="h-4 w-24" />
                ))}
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </footer>
  );
}
```

### Mega Menu Loading

```tsx
// components/navigation/mega-menu-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function MegaMenuLoading() {
  return (
    <div className="absolute top-full left-0 w-full bg-background border-b shadow-lg">
      <div className="container py-6">
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((col) => (
            <div key={col} className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Breakpoints

| Breakpoint | Header | Navigation | Footer | Announcement |
|------------|--------|------------|--------|--------------|
| < 640px | Logo + hamburger | Sheet drawer | Stacked columns | Compact text |
| 640-1023px | Logo + partial nav | Dropdown menus | 2-column grid | Full text |
| >= 1024px | Full header | Mega menus | 4-column grid | With dismiss |

### Mobile-First Layout

```tsx
// app/(marketing)/layout.tsx - Mobile Responsive
import { Suspense } from "react";
import { Header } from "@/components/organisms/header";
import { Footer } from "@/components/organisms/footer";
import { AnnouncementBar } from "@/components/organisms/announcement-bar";
import { MobileMenu } from "@/components/organisms/mobile-menu";
import { HeaderLoading } from "@/components/organisms/header-loading";
import { FooterLoading } from "@/components/organisms/footer-loading";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement - Responsive text */}
      <AnnouncementBar
        message="We just launched v2.0!"
        link={{ label: "Learn more", href: "/changelog" }}
        mobileMessage="v2.0 is here!" // Shorter for mobile
        dismissible
      />

      {/* Header with Suspense */}
      <Suspense fallback={<HeaderLoading />}>
        <Header
          logo={{
            src: "/logo.svg",
            alt: "Company Logo",
            href: "/",
          }}
          navigation={navigationItems}
          actions={[
            { label: "Sign In", href: "/login", variant: "ghost" },
            { label: "Get Started", href: "/signup", variant: "default" },
          ]}
          sticky
          blur
        />
      </Suspense>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer with Suspense */}
      <Suspense fallback={<FooterLoading />}>
        <Footer
          columns={footerColumns}
          social={socialLinks}
          newsletter
        />
      </Suspense>

      {/* Mobile Menu - Only renders on mobile */}
      <MobileMenu navigation={navigationItems} />
    </div>
  );
}
```

### Mobile Header

```tsx
// components/organisms/header-mobile.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface HeaderMobileProps {
  logo: { src: string; alt: string; href: string };
  navigation: NavigationItem[];
  actions: Action[];
}

export function HeaderMobile({ logo, navigation, actions }: HeaderMobileProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={logo.href} className="flex items-center space-x-2">
          <img src={logo.src} alt={logo.alt} className="h-6 sm:h-8" />
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-6">
          {navigation.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Desktop Actions - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3">
          {actions.map((action) => (
            <Button key={action.href} variant={action.variant} asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <div className="flex flex-col h-full">
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 space-y-4">
                {navigation.map((item) => (
                  <MobileNavItem
                    key={item.href}
                    {...item}
                    onNavigate={() => setIsOpen(false)}
                  />
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="space-y-3 pt-6 border-t">
                {actions.map((action) => (
                  <Button
                    key={action.href}
                    variant={action.variant}
                    className="w-full h-12"
                    asChild
                  >
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
```

### Mobile Footer

```tsx
// components/organisms/footer-mobile.tsx
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface FooterMobileProps {
  columns: FooterColumn[];
  social: SocialLink[];
  newsletter?: boolean;
}

export function FooterMobile({ columns, social, newsletter }: FooterMobileProps) {
  return (
    <footer className="border-t py-8 sm:py-12 bg-muted/30">
      <div className="container px-4">
        {/* Logo and Description */}
        <div className="mb-8 text-center sm:text-left">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="font-bold">Company</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto sm:mx-0">
            Building the future of web development.
          </p>
        </div>

        {/* Collapsible Link Columns - Mobile */}
        <div className="space-y-2 sm:hidden">
          {columns.map((column) => (
            <Collapsible key={column.title}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-3 border-b">
                <span className="font-medium text-sm">{column.title}</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="py-2">
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Grid Link Columns - Tablet and up */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-medium mb-3">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter - Full width on mobile */}
        {newsletter && (
          <div className="py-6 border-t border-b mb-6">
            <h3 className="font-medium mb-2 text-center sm:text-left">
              Subscribe to our newsletter
            </h3>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto sm:mx-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-lg border bg-background"
              />
              <button className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium">
                Subscribe
              </button>
            </form>
          </div>
        )}

        {/* Social Links - Centered on mobile */}
        <div className="flex items-center justify-center sm:justify-start gap-4 mb-6">
          {social.map((item) => (
            <a
              key={item.platform}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80"
            >
              <SocialIcon platform={item.platform} />
            </a>
          ))}
        </div>

        {/* Copyright - Centered on mobile */}
        <div className="text-center sm:text-left text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### Responsive Announcement Bar

```tsx
// components/organisms/announcement-bar-responsive.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementBarResponsiveProps {
  message: string;
  mobileMessage?: string; // Shorter message for mobile
  link?: {
    label: string;
    href: string;
  };
  dismissible?: boolean;
}

export function AnnouncementBarResponsive({
  message,
  mobileMessage,
  link,
  dismissible = true,
}: AnnouncementBarResponsiveProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    const dismissed = localStorage.getItem("announcement-dismissed");
    if (dismissed) setIsDismissed(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("announcement-dismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <div className="relative bg-primary text-primary-foreground px-4 py-2 sm:py-2.5">
      <div className="container flex items-center justify-center gap-2 text-center">
        {/* Full message on desktop, short on mobile */}
        <span className="text-xs sm:text-sm">
          <span className="sm:hidden">{mobileMessage || message}</span>
          <span className="hidden sm:inline">{message}</span>
        </span>

        {link && (
          <Link
            href={link.href}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium underline underline-offset-4 hover:no-underline whitespace-nowrap"
          >
            <span className="hidden xs:inline">{link.label}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-sm opacity-70 hover:opacity-100"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      )}
    </div>
  );
}
```

## Related Skills

### Composes Into
- [templates/landing-page](./landing-page.md)
- [templates/about-page](./about-page.md)
- [templates/blog-index](./blog-index.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Sticky header with blur
- Announcement bar
- Comprehensive footer
