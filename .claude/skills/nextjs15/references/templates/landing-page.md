---
id: t-landing-page
name: Landing Page
version: 2.0.0
layer: L4
category: pages
description: Marketing landing page with hero, features, testimonials, pricing, and CTA sections
tags: [page, landing, marketing, hero, features, conversion]
composes:
  - ../organisms/hero.md
  - ../organisms/features.md
  - ../organisms/testimonials.md
  - ../organisms/pricing.md
  - ../organisms/cta.md
  - ../organisms/faq.md
dependencies: []
performance:
  impact: critical
  lcp: critical
  cls: high
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
formula: "LandingPage = Hero(o-hero) + Features(o-features) + Testimonials(o-testimonials) + Pricing(o-pricing) + CTA(o-cta) + FAQ(o-faq)"
---

# Landing Page

## Overview

The Landing Page template provides a complete marketing landing page composition. Assembles Hero, Features, Testimonials, Pricing, FAQ, and CTA organisms in an optimized layout for conversion. Designed for maximum visual impact and performance.

## When to Use

Use this skill when:
- Building product landing pages
- Creating SaaS marketing pages
- Building launch/announcement pages
- Creating conversion-focused pages

## Composition Diagram

```
+------------------------------------------------------------------+
|                        LANDING PAGE                               |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |                    Hero (o-hero)                           |  |
|  |  +------------------------------------------------------+  |  |
|  |  |            [Badge: Now in Public Beta]               |  |  |
|  |  |                                                      |  |  |
|  |  |        Build faster with our platform                |  |  |
|  |  |              ~~~~~~                                  |  |  |
|  |  |    The modern way to build web applications.         |  |  |
|  |  |                                                      |  |  |
|  |  |    [Get Started Free]    [Book a Demo]               |  |  |
|  |  |                                                      |  |  |
|  |  |    +------------------------------------------+      |  |  |
|  |  |    |          Dashboard Preview Image         |      |  |  |
|  |  |    +------------------------------------------+      |  |  |
|  |  |                                                      |  |  |
|  |  |    Trusted by: [Logo] [Logo] [Logo] [Logo]           |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    Stats Section                           |  |
|  |    +----------+  +----------+  +----------+  +----------+  |  |
|  |    | 10,000+  |  |  99.9%   |  |  <50ms   |  |  4.9/5   |  |  |
|  |    | Users    |  |  Uptime  |  | Response |  |  Rating  |  |  |
|  |    +----------+  +----------+  +----------+  +----------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                 Features (o-features)                      |  |
|  |    "Everything you need to build"                          |  |
|  |    +------------+  +------------+  +------------+          |  |
|  |    | [Zap]      |  | [Shield]   |  | [Globe]    |          |  |
|  |    | Lightning  |  | Enterprise |  | Global     |          |  |
|  |    | Fast       |  | Security   |  | CDN        |          |  |
|  |    +------------+  +------------+  +------------+          |  |
|  |    +------------+  +------------+  +------------+          |  |
|  |    | [Code]     |  | [Puzzle]   |  | [Users]    |          |  |
|  |    | Developer  |  | Extensible |  | Team       |          |  |
|  |    | First      |  |            |  | Collab     |          |  |
|  |    +------------+  +------------+  +------------+          |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                  Product Demo Section                      |  |
|  |    "See it in action"                                      |  |
|  |    +--------------------------------------------------+    |  |
|  |    |                                                  |    |  |
|  |    |              [Video Player]                      |    |  |
|  |    |                                                  |    |  |
|  |    +--------------------------------------------------+    |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |               Testimonials (o-testimonials)                |  |
|  |    "Loved by developers"                                   |  |
|  |    +----------------+  +----------------+  +----------------+  |
|  |    | "Quote..."     |  | "Quote..."     |  | "Quote..."     |  |
|  |    | - Name, Title  |  | - Name, Title  |  | - Name, Title  |  |
|  |    +----------------+  +----------------+  +----------------+  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                   Pricing (o-pricing)                      |  |
|  |    "Simple, transparent pricing"     [Monthly] [Yearly]    |  |
|  |    +----------------+  +----------------+  +----------------+  |
|  |    |     BASIC      |  |      PRO       |  |  ENTERPRISE  |  |
|  |    |     $9/mo      |  |    $29/mo      |  |   Custom     |  |
|  |    | [  ] Feature 1 |  | [x] Feature 1  |  | [x] All      |  |
|  |    | [x] Feature 2  |  | [x] Feature 2  |  | [x] Priority |  |
|  |    | [Get Started]  |  | [Get Started]  |  | [Contact]    |  |
|  |    +----------------+  +----------------+  +----------------+  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                     FAQ (o-faq)                            |  |
|  |    "Frequently asked questions"                            |  |
|  |    +------------------------------------------------------+|  |
|  |    | Question 1?                                     [v]  ||  |
|  |    | Answer expanded here...                              ||  |
|  |    +------------------------------------------------------+|  |
|  |    | Question 2?                                     [>]  ||  |
|  |    +------------------------------------------------------+|  |
|  |    | Question 3?                                     [>]  ||  |
|  |    +------------------------------------------------------+|  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                     CTA (o-cta)                            |  |
|  |    +------------------------------------------------------+|  |
|  |    |         Ready to get started?                        ||  |
|  |    |    Join thousands of developers building...          ||  |
|  |    |                                                      ||  |
|  |    |    [Start Building Free]    [Talk to Sales]          ||  |
|  |    +------------------------------------------------------+|  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Organisms Used

- [hero](../organisms/hero.md) - Hero section
- [features](../organisms/features.md) - Features grid
- [testimonials](../organisms/testimonials.md) - Social proof
- [pricing](../organisms/pricing.md) - Pricing plans
- [faq](../organisms/faq.md) - FAQ accordion
- [cta](../organisms/cta.md) - Call to action
- [scroll-animations](../organisms/scroll-animations.md) - Reveal effects

## Implementation

```typescript
// app/(marketing)/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { Hero } from "@/components/organisms/hero";
import { Features } from "@/components/organisms/features";
import { Testimonials } from "@/components/organisms/testimonials";
import { Pricing } from "@/components/organisms/pricing";
import { FAQ } from "@/components/organisms/faq";
import { CTA } from "@/components/organisms/cta";
import { FadeIn, Stagger, Counter } from "@/components/organisms/scroll-animations";
import { Skeleton } from "@/components/ui/skeleton";
import { getTestimonials, getPricingPlans, getFAQs } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Build Faster with Acme Platform",
  description: "The modern development platform for building exceptional websites. Ship in days, not months.",
  openGraph: {
    title: "Build Faster with Acme Platform",
    description: "The modern development platform for building exceptional websites.",
    images: ["/og-landing.jpg"],
  },
};

// Feature data
const features = [
  {
    icon: "Zap",
    title: "Lightning Fast",
    description: "Built for speed from the ground up. Sub-second page loads guaranteed.",
  },
  {
    icon: "Shield",
    title: "Enterprise Security",
    description: "Bank-grade security with SOC 2 compliance and end-to-end encryption.",
  },
  {
    icon: "Globe",
    title: "Global CDN",
    description: "Deploy to 100+ edge locations worldwide for optimal performance.",
  },
  {
    icon: "Code",
    title: "Developer First",
    description: "Built by developers, for developers. Intuitive APIs and great DX.",
  },
  {
    icon: "Puzzle",
    title: "Extensible",
    description: "Integrate with your favorite tools. 200+ integrations available.",
  },
  {
    icon: "Users",
    title: "Team Collaboration",
    description: "Real-time collaboration with role-based access controls.",
  },
];

// Stats for social proof
const stats = [
  { value: 10000, suffix: "+", label: "Active Users" },
  { value: 99.9, suffix: "%", label: "Uptime SLA" },
  { value: 50, prefix: "<", suffix: "ms", label: "Response Time" },
  { value: 4.9, suffix: "/5", label: "User Rating" },
];

export default async function LandingPage() {
  // Fetch dynamic content
  const [testimonials, pricingPlans, faqs] = await Promise.all([
    getTestimonials(),
    getPricingPlans(),
    getFAQs(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <Hero
        badge={{ text: "Now in Public Beta", href: "/changelog" }}
        title="Build faster with our platform"
        titleHighlight="faster"
        description="The modern way to build web applications. Ship in days, not months. Join thousands of developers building the future."
        primaryAction={{ label: "Get Started Free", href: "/signup" }}
        secondaryAction={{ label: "Book a Demo", href: "/demo" }}
        image={{
          src: "/hero-dashboard.png",
          alt: "Dashboard preview",
        }}
        socialProof={{
          label: "Trusted by leading companies",
          logos: [
            { src: "/logos/google.svg", alt: "Google" },
            { src: "/logos/meta.svg", alt: "Meta" },
            { src: "/logos/stripe.svg", alt: "Stripe" },
            { src: "/logos/vercel.svg", alt: "Vercel" },
          ],
        }}
        variant="centered"
        background="gradient"
      />

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="text-4xl font-bold tracking-tight">
                    {stat.prefix}
                    <Counter to={stat.value} duration={2} />
                    {stat.suffix}
                  </div>
                  <div className="text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FadeIn>
        <Features
          title="Everything you need to build"
          description="All the tools to build, deploy, and scale your application. No compromises."
          features={features}
          variant="grid"
          columns={3}
        />
      </FadeIn>

      {/* Product Demo/Screenshot Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                See it in action
              </h2>
              <p className="text-lg text-muted-foreground">
                Watch how our platform transforms your development workflow
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="relative rounded-xl overflow-hidden shadow-2xl border">
              <video
                src="/demo.mp4"
                poster="/demo-poster.jpg"
                controls
                className="w-full"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials Section */}
      <Suspense fallback={<Skeleton className="h-96" />}>
        <FadeIn>
          <Testimonials
            title="Loved by developers"
            description="Don't just take our word for it"
            testimonials={testimonials}
            variant="carousel"
          />
        </FadeIn>
      </Suspense>

      {/* Pricing Section */}
      <FadeIn>
        <Pricing
          title="Simple, transparent pricing"
          description="Choose the plan that's right for you. All plans include a 14-day free trial."
          plans={pricingPlans}
          showToggle
          highlighted="pro"
        />
      </FadeIn>

      {/* FAQ Section */}
      <FadeIn>
        <FAQ
          title="Frequently asked questions"
          description="Everything you need to know about the product"
          items={faqs}
          variant="centered"
          columns={1}
        />
      </FadeIn>

      {/* Final CTA Section */}
      <CTA
        title="Ready to get started?"
        description="Join thousands of developers building the future with our platform. Start free, no credit card required."
        primaryAction={{ label: "Start Building Free", href: "/signup" }}
        secondaryAction={{ label: "Talk to Sales", href: "/contact" }}
        variant="gradient"
      />
    </>
  );
}
```

### Key Implementation Notes

1. **Section Ordering**: Hero → Stats → Features → Demo → Testimonials → Pricing → FAQ → CTA
2. **Progressive Loading**: Suspense for dynamic content
3. **Scroll Animations**: FadeIn on each section
4. **Counter Animation**: Stats animate on scroll
5. **LCP Optimization**: Hero prioritized

## Variants

### Minimal Landing

```tsx
export default function MinimalLanding() {
  return (
    <>
      <Hero
        title="One line that explains everything"
        description="A brief description that completes the thought."
        primaryAction={{ label: "Get Started", href: "/signup" }}
        variant="centered"
        background="none"
      />
      <Features features={features} variant="list" />
      <CTA
        title="Start today"
        primaryAction={{ label: "Sign Up Free", href: "/signup" }}
        variant="simple"
      />
    </>
  );
}
```

### Product-Focused

```tsx
export default function ProductLanding() {
  return (
    <>
      <Hero
        variant="split"
        media={<ProductDemo />}
      />
      <Features variant="alternating" />
      <ComparisonTable items={competitors} features={featureList} />
      <Testimonials variant="grid" />
      <Pricing />
      <CTA />
    </>
  );
}
```

### Event/Launch

```tsx
export default function LaunchLanding() {
  return (
    <>
      <Hero
        title="Launching January 2025"
        variant="centered"
      />
      <CountdownTimer targetDate={launchDate} />
      <Features features={highlights} />
      <WaitlistForm />
    </>
  );
}
```

## Performance

### LCP Optimization

- Hero images use `priority`
- Above-fold content is static
- Defer below-fold content

### CLS Prevention

- Set image dimensions
- Reserve space for dynamic content
- Use skeleton loading

### Bundle Size

- Lazy load heavy sections
- Dynamic import for video players
- Split animations by route

## Accessibility

### Required Features

- Proper heading hierarchy (h1 in hero)
- Skip links to main content
- Alt text on all images
- Keyboard-navigable CTAs

### Screen Reader

- Section landmarks
- Descriptive link text
- Form labels in CTA

## SEO Considerations

```typescript
// Structured data for rich results
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Acme Platform",
  applicationCategory: "DeveloperApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1500",
  },
};
```

## Error States

### Section Error Boundary

```tsx
// components/landing/section-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            Failed to load {this.props.sectionName || 'this section'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 inline-flex items-center gap-2 text-sm text-red-600 hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### CMS Fetch Error

```tsx
// components/landing/cms-error.tsx
export function CMSError({ sectionName }: { sectionName: string }) {
  return (
    <section className="py-20 text-center">
      <div className="container mx-auto px-4">
        <p className="text-muted-foreground">
          Unable to load {sectionName}. Please refresh the page.
        </p>
      </div>
    </section>
  );
}
```

### Page Error Boundary

```tsx
// app/(marketing)/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function MarketingError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Marketing page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-2xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn't load this page. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## Loading States

### Page Loading Skeleton

```tsx
// app/(marketing)/loading.tsx
export default function LandingLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="mx-auto mb-4 h-12 w-96 max-w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mx-auto mb-8 h-6 w-80 max-w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex justify-center gap-4">
            <div className="h-12 w-36 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-12 w-36 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="border-y py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto h-10 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mx-auto mt-2 h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mx-auto h-10 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mx-auto mt-4 h-6 w-80 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-6">
                <div className="mb-4 h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-1 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

### Section Streaming

```tsx
// app/(marketing)/page.tsx with streaming
import { Suspense } from 'react';

export default async function LandingPage() {
  return (
    <>
      {/* Hero - immediate render */}
      <Hero />

      {/* Stats - immediate render */}
      <Stats />

      {/* Features - stream */}
      <Suspense fallback={<FeaturesSkeleton />}>
        <Features />
      </Suspense>

      {/* Testimonials - stream */}
      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>

      {/* Pricing - stream */}
      <Suspense fallback={<PricingSkeleton />}>
        <Pricing />
      </Suspense>

      {/* FAQ - stream */}
      <Suspense fallback={<FAQSkeleton />}>
        <FAQ />
      </Suspense>

      {/* CTA - immediate render */}
      <CTA />
    </>
  );
}
```

## Mobile Responsiveness

### Responsive Hero

```tsx
// components/landing/responsive-hero.tsx
export function ResponsiveHero({
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background px-4 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-5xl text-center">
        {/* Badge - smaller on mobile */}
        <div className="mb-4 sm:mb-6">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
            Now in Public Beta
          </span>
        </div>

        {/* Title - responsive font size */}
        <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          {title}
        </h1>

        {/* Description - readable on mobile */}
        <p className="mx-auto mb-6 sm:mb-8 max-w-2xl text-base sm:text-lg lg:text-xl text-muted-foreground px-4">
          {description}
        </p>

        {/* CTAs - stack on mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href={primaryAction.href}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary px-6 sm:px-8 py-3 text-sm sm:text-base font-medium text-primary-foreground"
          >
            {primaryAction.label}
          </Link>
          <Link
            href={secondaryAction.href}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border px-6 sm:px-8 py-3 text-sm sm:text-base font-medium"
          >
            {secondaryAction.label}
          </Link>
        </div>

        {/* Social proof - wrap on mobile */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Trusted by leading companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {logos.map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={80}
                height={24}
                className="h-5 sm:h-6 w-auto opacity-50 grayscale"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Mobile-Optimized Features

```tsx
// components/landing/mobile-features.tsx
export function MobileFeatures({ features }: { features: Feature[] }) {
  return (
    <section className="py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 sm:mb-12 max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Everything you need
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
            All the tools to build, deploy, and scale
          </p>
        </div>

        {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border p-4 sm:p-6"
            >
              <div className="mb-3 sm:mb-4 inline-flex rounded-lg bg-primary/10 p-2 sm:p-3">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="mt-1 sm:mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Hero title | 30px | 36-48px | 48-60px |
| CTAs | Stacked, full width | Inline | Inline |
| Features grid | 1 column | 2 columns | 3 columns |
| Pricing cards | 1 column | 2 columns | 3 columns |
| Section padding | 48px | 80px | 128px |
| Stats | 2x2 grid | 4 columns | 4 columns |

## Testing Strategies

### Component Testing

```tsx
// __tests__/landing-page.test.tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LandingPage from '@/app/(marketing)/page';
import { Hero } from '@/components/organisms/hero';
import { Features } from '@/components/organisms/features';

// Mock CMS data
vi.mock('@/lib/cms', () => ({
  getTestimonials: vi.fn().mockResolvedValue([]),
  getPricingPlans: vi.fn().mockResolvedValue([]),
  getFAQs: vi.fn().mockResolvedValue([]),
}));

describe('LandingPage', () => {
  it('renders hero section', async () => {
    render(await LandingPage());
    expect(screen.getByText(/build faster/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', async () => {
    render(await LandingPage());
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Book a Demo')).toBeInTheDocument();
  });
});

describe('Hero', () => {
  it('renders title and description', () => {
    render(
      <Hero
        title="Test Title"
        description="Test description"
        primaryAction={{ label: 'Primary', href: '/' }}
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(
      <Hero
        title="Test"
        badge={{ text: 'New Feature', href: '/changelog' }}
        primaryAction={{ label: 'CTA', href: '/' }}
      />
    );
    expect(screen.getByText('New Feature')).toBeInTheDocument();
  });
});

describe('Features', () => {
  const features = [
    { icon: 'Zap', title: 'Fast', description: 'Very fast' },
    { icon: 'Shield', title: 'Secure', description: 'Very secure' },
  ];

  it('renders all features', () => {
    render(<Features features={features} />);
    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
  });
});
```

### E2E Testing

```tsx
// e2e/landing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('hero section displays correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Get Started Free')).toBeVisible();
  });

  test('navigation to signup works', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Get Started Free');
    await expect(page).toHaveURL('/signup');
  });

  test('features section is visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Everything you need')).toBeVisible();
  });

  test('pricing section renders', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Simple, transparent pricing').scrollIntoViewIfNeeded();
    await expect(page.getByText('Simple, transparent pricing')).toBeVisible();
  });

  test('FAQ accordion works', async ({ page }) => {
    await page.goto('/');

    const question = page.locator('[data-testid="faq-item"]').first();
    await question.click();
    await expect(question.locator('[data-testid="faq-answer"]')).toBeVisible();
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // CTA buttons should be stacked
    const ctas = page.locator('[data-testid="hero-ctas"] a');
    const positions = await ctas.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().top)
    );
    expect(positions[0]).toBeLessThan(positions[1]);
  });

  test('scroll animations trigger', async ({ page }) => {
    await page.goto('/');

    // Scroll to features
    await page.locator('text=Everything you need').scrollIntoViewIfNeeded();

    // Check if animation class is applied
    const feature = page.locator('[data-testid="feature-card"]').first();
    await expect(feature).toHaveClass(/animate/);
  });
});
```

### Accessibility Testing

```tsx
// __tests__/landing-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LandingPage from '@/app/(marketing)/page';

expect.extend(toHaveNoViolations);

describe('Landing Page Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(await LandingPage());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading hierarchy', async () => {
    const { container } = render(await LandingPage());

    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1); // Only one h1

    const h2s = container.querySelectorAll('h2');
    expect(h2s.length).toBeGreaterThan(0); // Section headings
  });

  it('images have alt text', async () => {
    const { container } = render(await LandingPage());

    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('links have descriptive text', async () => {
    const { getAllByRole } = render(await LandingPage());

    const links = getAllByRole('link');
    links.forEach((link) => {
      expect(link.textContent || link.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
```

### Performance Testing

```tsx
// e2e/landing-performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Landing Page Performance', () => {
  test('LCP is under 2.5s', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });

    expect(lcp).toBeLessThan(2500);
  });

  test('hero image loads with priority', async ({ page }) => {
    await page.goto('/');

    const heroImage = page.locator('[data-testid="hero-image"]');
    const priority = await heroImage.getAttribute('fetchpriority');
    expect(priority).toBe('high');
  });
});
```

## Related Skills

### Uses Layout
- [marketing-layout](./marketing-layout.md)

### Related Pages
- [about-page](./about-page.md)
- [pricing-page](./pricing-page.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Full section composition
- Scroll animations
- Performance optimizations
