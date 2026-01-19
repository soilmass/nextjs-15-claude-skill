---
id: r-marketing-site
name: Marketing Site Recipe
version: 3.0.0
layer: L6
category: recipes
description: Complete recipe for building a high-performance static marketing site with Next.js 15
tags: [recipe, marketing, static, seo, performance, landing-page, corporate]
formula: "MarketingSite = RootLayout(t-root-layout) + MarketingLayout(t-marketing-layout) + LandingPage(t-landing-page) + AboutPage(t-about-page) + BlogIndex(t-blog-index) + TeamPage(t-team-page) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + ProfilePage(t-profile-page) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + Features(o-features) + Pricing(o-pricing) + Testimonials(o-testimonials) + Faq(o-faq) + ContactForm(o-contact-form) + ScrollAnimations(o-scroll-animations) + Team(o-team) + Cta(o-cta) + AnnouncementBanner(o-announcement-banner) + SocialShare(o-social-share) + CookieConsent(o-cookie-consent) + NewsletterSignup(o-newsletter-signup) + MobileNav(o-mobile-nav) + Stats(o-stats) + Card(m-card) + Breadcrumb(m-breadcrumb) + ShareButton(m-share-button) + Stepper(m-stepper) + Badge(m-badge) + Toast(m-toast) + Avatar(m-avatar) + Toggle(m-toggle) + StaticRendering(pt-static-rendering) + ImageOptimization(pt-image-optimization) + ImageProcessing(pt-image-processing) + CriticalCss(pt-critical-css) + Fonts(pt-fonts) + Animations(pt-animations) + Transitions(pt-transitions) + ScrollEffects(pt-scroll-effects) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + OpenGraph(pt-open-graph) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + TransactionalEmail(pt-transactional-email) + ErrorBoundaries(pt-error-boundaries) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + WebVitals(pt-web-vitals) + I18nRouting(pt-i18n-routing) + Translations(pt-translations) + ReactQuery(pt-react-query) + AbTesting(pt-ab-testing) + GdprCompliance(pt-gdpr-compliance) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + RateLimiting(pt-rate-limiting) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + ErrorTracking(pt-error-tracking) + UserAnalytics(pt-user-analytics) + ContactFormHandling(pt-contact-form-handling)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/card.md
  - ../molecules/breadcrumb.md
  - ../molecules/share-button.md
  - ../molecules/stepper.md
  # L3 Organisms - Complex Components
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/features.md
  - ../organisms/pricing.md
  - ../organisms/testimonials.md
  - ../organisms/faq.md
  - ../organisms/contact-form.md
  - ../organisms/scroll-animations.md
  - ../organisms/team.md
  - ../organisms/cta.md
  - ../organisms/announcement-banner.md
  - ../organisms/social-share.md
  - ../organisms/cookie-consent.md
  # L4 Templates - Page Layouts
  - ../templates/root-layout.md
  - ../templates/marketing-layout.md
  - ../templates/landing-page.md
  - ../templates/about-page.md
  - ../templates/blog-index.md
  - ../templates/team-page.md
  # L5 Patterns - Rendering & Optimization
  - ../patterns/static-rendering.md
  - ../patterns/image-optimization.md
  - ../patterns/image-processing.md
  - ../patterns/critical-css.md
  - ../patterns/fonts.md
  # L5 Patterns - Animations & Effects
  - ../patterns/animations.md
  - ../patterns/transitions.md
  - ../patterns/scroll-effects.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  - ../patterns/open-graph.md
  # L5 Patterns - Forms & Communication
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/transactional-email.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics & Performance
  - ../patterns/analytics-events.md
  - ../patterns/web-vitals.md
  # L5 Patterns - Internationalization
  - ../patterns/i18n-routing.md
  - ../patterns/translations.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  # L5 Patterns - Optimization
  - ../patterns/ab-testing.md
  # L5 Patterns - Privacy
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L4 Templates - Additional
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  - ../templates/profile-page.md
  # L3 Organisms - Additional
  - ../organisms/newsletter-signup.md
  - ../organisms/mobile-nav.md
  - ../organisms/stats.md
  # L2 Molecules - Additional
  - ../molecules/badge.md
  - ../molecules/toast.md
  - ../molecules/avatar.md
  - ../molecules/toggle.md
  # L5 Patterns - Error Handling
  - ../patterns/error-tracking.md
  # L5 Patterns - Analytics
  - ../patterns/user-analytics.md
  # L5 Patterns - Communication
  - ../patterns/contact-form-handling.md
dependencies:
  - next
  - tailwindcss
  - framer-motion
  - @vercel/analytics
complexity: intermediate
estimated_time: 2-4 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Marketing Site Recipe

## Overview

Build a high-performance, SEO-optimized marketing website using Next.js 15 with static generation. Perfect for corporate sites, product landing pages, and startup websites. Achieves perfect Lighthouse scores through static rendering and optimized assets.

## Architecture

```
app/
├── (marketing)/                 # Marketing route group
│   ├── layout.tsx              # Marketing layout with header/footer
│   ├── page.tsx                # Homepage
│   ├── about/
│   │   └── page.tsx            # About page
│   ├── pricing/
│   │   └── page.tsx            # Pricing page
│   ├── features/
│   │   └── page.tsx            # Features page
│   ├── blog/
│   │   ├── page.tsx            # Blog index
│   │   └── [slug]/
│   │       └── page.tsx        # Blog post (MDX)
│   ├── contact/
│   │   └── page.tsx            # Contact form
│   └── legal/
│       ├── privacy/
│       │   └── page.tsx        # Privacy policy
│       └── terms/
│           └── page.tsx        # Terms of service
├── api/
│   ├── contact/
│   │   └── route.ts            # Contact form handler
│   └── newsletter/
│       └── route.ts            # Newsletter subscription
├── layout.tsx                   # Root layout
├── not-found.tsx               # 404 page
└── sitemap.ts                  # Dynamic sitemap
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| [root-layout](../templates/root-layout.md) | L4 Template | Base HTML structure and providers |
| [marketing-layout](../templates/marketing-layout.md) | L4 Template | Header/footer wrapper for marketing pages |
| [landing-page](../templates/landing-page.md) | L4 Template | Homepage section composition |
| [about-page](../templates/about-page.md) | L4 Template | About page template |
| [blog-index](../templates/blog-index.md) | L4 Template | Blog listing page template |
| [header](../organisms/header.md) | L3 Organism | Responsive navigation header |
| [footer](../organisms/footer.md) | L3 Organism | Site footer with links |
| [hero](../organisms/hero.md) | L3 Organism | Hero sections with CTA |
| [features](../organisms/features.md) | L3 Organism | Feature grid displays |
| [pricing](../organisms/pricing.md) | L3 Organism | Pricing table comparisons |
| [testimonials](../organisms/testimonials.md) | L3 Organism | Customer testimonial carousel |
| [faq](../organisms/faq.md) | L3 Organism | FAQ accordion component |
| [contact-form](../organisms/contact-form.md) | L3 Organism | Contact form with validation |
| [scroll-animations](../organisms/scroll-animations.md) | L3 Organism | Scroll-triggered animations |
| [static-rendering](../patterns/static-rendering.md) | L5 Pattern | Static page generation strategies |
| [image-optimization](../patterns/image-optimization.md) | L5 Pattern | Next.js Image optimization |

## Implementation

### Root Layout

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    template: '%s | Your Company',
    default: 'Your Company - Tagline Here',
  },
  description: 'Your company description for SEO. Keep it under 160 characters.',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  authors: [{ name: 'Your Company' }],
  creator: 'Your Company',
  publisher: 'Your Company',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://example.com',
    siteName: 'Your Company',
    title: 'Your Company - Tagline Here',
    description: 'Your company description for social sharing.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Your Company',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Company - Tagline Here',
    description: 'Your company description for Twitter.',
    images: ['/og-image.png'],
    creator: '@yourcompany',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Marketing Layout

```tsx
// app/(marketing)/layout.tsx
import { Header } from '@/components/marketing/header';
import { Footer } from '@/components/marketing/footer';

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header navigation={navigation} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### Homepage

```tsx
// app/(marketing)/page.tsx
import { Suspense } from 'react';
import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { Testimonials } from '@/components/marketing/testimonials';
import { Pricing } from '@/components/marketing/pricing';
import { FAQ } from '@/components/marketing/faq';
import { CTA } from '@/components/marketing/cta';
import { LogoCloud } from '@/components/marketing/logo-cloud';

// Static generation - no dynamic data
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate - fully static

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero
        title="Build something amazing"
        subtitle="The modern platform for teams who want to ship faster without sacrificing quality."
        primaryCTA={{ label: 'Get Started Free', href: '/signup' }}
        secondaryCTA={{ label: 'View Demo', href: '/demo' }}
        image={{
          src: '/images/hero-screenshot.png',
          alt: 'Product screenshot',
        }}
      />

      {/* Social Proof */}
      <LogoCloud
        title="Trusted by industry leaders"
        logos={[
          { name: 'Company 1', src: '/logos/company1.svg' },
          { name: 'Company 2', src: '/logos/company2.svg' },
          { name: 'Company 3', src: '/logos/company3.svg' },
          { name: 'Company 4', src: '/logos/company4.svg' },
          { name: 'Company 5', src: '/logos/company5.svg' },
        ]}
      />

      {/* Features Grid */}
      <Features
        title="Everything you need"
        subtitle="All the tools your team needs to build, deploy, and scale."
        features={[
          {
            icon: 'Zap',
            title: 'Lightning Fast',
            description: 'Built on the edge for instant global performance.',
          },
          {
            icon: 'Shield',
            title: 'Secure by Default',
            description: 'Enterprise-grade security without the complexity.',
          },
          {
            icon: 'Code',
            title: 'Developer First',
            description: 'APIs and SDKs that developers actually enjoy using.',
          },
          {
            icon: 'BarChart',
            title: 'Real-time Analytics',
            description: 'Understand your users with powerful analytics.',
          },
          {
            icon: 'Users',
            title: 'Team Collaboration',
            description: 'Work together seamlessly with built-in collaboration.',
          },
          {
            icon: 'Globe',
            title: 'Global Scale',
            description: 'Deploy to 30+ regions with a single click.',
          },
        ]}
      />

      {/* Testimonials */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
        <Testimonials
          title="Loved by teams worldwide"
          testimonials={[
            {
              quote: "This product has transformed how our team works. We've cut our deployment time by 80%.",
              author: 'Sarah Chen',
              role: 'CTO',
              company: 'TechCorp',
              avatar: '/avatars/sarah.jpg',
            },
            {
              quote: 'The best developer experience I\'ve ever had. Period.',
              author: 'Marcus Johnson',
              role: 'Lead Engineer',
              company: 'StartupXYZ',
              avatar: '/avatars/marcus.jpg',
            },
            {
              quote: 'We scaled from 1K to 1M users without changing a single line of infrastructure code.',
              author: 'Emily Rodriguez',
              role: 'VP Engineering',
              company: 'ScaleUp Inc',
              avatar: '/avatars/emily.jpg',
            },
          ]}
        />
      </Suspense>

      {/* Pricing */}
      <Pricing
        title="Simple, transparent pricing"
        subtitle="No hidden fees. No surprises. Cancel anytime."
        plans={[
          {
            name: 'Starter',
            price: { monthly: 0, annually: 0 },
            description: 'Perfect for side projects',
            features: [
              '1,000 monthly requests',
              '1 team member',
              'Community support',
              'Basic analytics',
            ],
            cta: { label: 'Start Free', href: '/signup?plan=starter' },
          },
          {
            name: 'Pro',
            price: { monthly: 29, annually: 24 },
            description: 'For growing teams',
            features: [
              '100,000 monthly requests',
              '10 team members',
              'Priority support',
              'Advanced analytics',
              'Custom domains',
              'API access',
            ],
            cta: { label: 'Start Trial', href: '/signup?plan=pro' },
            popular: true,
          },
          {
            name: 'Enterprise',
            price: { monthly: 'custom', annually: 'custom' },
            description: 'For large organizations',
            features: [
              'Unlimited requests',
              'Unlimited team members',
              'Dedicated support',
              'Custom integrations',
              'SLA guarantee',
              'On-premise option',
            ],
            cta: { label: 'Contact Sales', href: '/contact?type=enterprise' },
          },
        ]}
      />

      {/* FAQ */}
      <FAQ
        title="Frequently asked questions"
        items={[
          {
            question: 'How does the free trial work?',
            answer: 'Start with a 14-day free trial of our Pro plan. No credit card required.',
          },
          {
            question: 'Can I change plans later?',
            answer: 'Yes, you can upgrade or downgrade your plan at any time.',
          },
          {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards and can invoice for annual plans.',
          },
          {
            question: 'Is there a setup fee?',
            answer: 'No, there are no setup fees or hidden charges.',
          },
        ]}
      />

      {/* Final CTA */}
      <CTA
        title="Ready to get started?"
        subtitle="Join thousands of teams already building with us."
        primaryCTA={{ label: 'Start Free Trial', href: '/signup' }}
        secondaryCTA={{ label: 'Talk to Sales', href: '/contact' }}
      />
    </>
  );
}
```

### Header Component

```tsx
// components/marketing/header.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
}

interface HeaderProps {
  navigation: NavItem[];
}

export function Header({ navigation }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">YourLogo</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                  YourLogo
                </Link>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-base font-medium',
                        pathname === item.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

### Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://example.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // Blog posts
  const posts = await getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
```

### Performance Optimizations

```tsx
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export for hosting anywhere
  // output: 'export', // Uncomment for static export
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },
  
  // Compression
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/components/marketing/header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '@/components/marketing/header';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
];

describe('Header', () => {
  it('should render navigation links', () => {
    render(<Header navigation={navigation} />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('should toggle mobile menu', () => {
    render(<Header navigation={navigation} />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should highlight active navigation item', () => {
    vi.mocked(usePathname).mockReturnValue('/features');
    render(<Header navigation={navigation} />);

    const featuresLink = screen.getByText('Features');
    expect(featuresLink).toHaveClass('text-primary');
  });
});
```

### Integration Tests

```typescript
// __tests__/app/marketing/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/(marketing)/page';

describe('Marketing Homepage', () => {
  it('should render hero section', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
  });

  it('should render all marketing sections', () => {
    render(<HomePage />);

    expect(screen.getByText(/trusted by/i)).toBeInTheDocument();
    expect(screen.getByText(/features/i)).toBeInTheDocument();
    expect(screen.getByText(/pricing/i)).toBeInTheDocument();
    expect(screen.getByText(/faq/i)).toBeInTheDocument();
  });

  it('should have accessible CTA buttons', () => {
    render(<HomePage />);

    const ctaButtons = screen.getAllByRole('link', { name: /get started|start/i });
    expect(ctaButtons.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests

```typescript
// e2e/marketing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketing Site', () => {
  test('homepage loads with all sections', async ({ page }) => {
    await page.goto('/');

    // Hero section
    await expect(page.locator('h1')).toBeVisible();

    // Scroll through sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Footer should be visible
    await expect(page.locator('footer')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Features');
    await expect(page).toHaveURL('/features');

    await page.click('text=Pricing');
    await expect(page).toHaveURL('/pricing');
  });

  test('contact form submission', async ({ page }) => {
    await page.goto('/contact');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'Test message');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Thank you')).toBeVisible();
  });

  test('mobile menu functionality', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.click('text=Features');
    await expect(page).toHaveURL('/features');
  });
});
```

## Error Handling

### Contact Form Error Handling

```tsx
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    // Send email or save to database
    await sendContactEmail(validated);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

### Global Error Boundary

```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We apologize for the inconvenience. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
```

### Custom 404 Page

```tsx
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  );
}
```

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close mobile menu and modals
- **Arrow keys**: Navigate FAQ accordion items

### Focus Management

```tsx
// components/marketing/header.tsx - Focus trap in mobile menu
import { useFocusTrap } from '@/hooks/use-focus-trap';

export function Header({ navigation }: HeaderProps) {
  const menuRef = useFocusTrap(mobileMenuOpen);

  return (
    <div ref={menuRef} role="dialog" aria-modal="true">
      {/* Mobile menu content */}
    </div>
  );
}
```

### ARIA Labels

```tsx
// Hero section
<section aria-labelledby="hero-heading">
  <h1 id="hero-heading">{title}</h1>
</section>

// Features section
<section aria-labelledby="features-heading">
  <h2 id="features-heading">{title}</h2>
  <ul role="list" aria-label="Product features">
    {features.map((feature) => (
      <li key={feature.title}>{/* Feature content */}</li>
    ))}
  </ul>
</section>

// Pricing section
<section aria-labelledby="pricing-heading">
  <h2 id="pricing-heading">{title}</h2>
  <div role="list" aria-label="Pricing plans">
    {plans.map((plan) => (
      <article key={plan.name} aria-labelledby={`plan-${plan.name}`}>
        <h3 id={`plan-${plan.name}`}>{plan.name}</h3>
      </article>
    ))}
  </div>
</section>
```

### Skip to Content Link

```tsx
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>
      <Header navigation={navigation} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### Color Contrast & Motion

```css
/* Ensure sufficient color contrast */
:root {
  --foreground: 0 0% 3.9%;
  --muted-foreground: 0 0% 45.1%; /* Meets WCAG AA for large text */
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Deployment Checklist

- [ ] Configure environment variables
- [ ] Set up custom domain and SSL
- [ ] Configure redirects for old URLs
- [ ] Set up analytics (Vercel Analytics, GA4)
- [ ] Test all pages with Lighthouse
- [ ] Verify sitemap.xml is accessible
- [ ] Submit sitemap to Google Search Console
- [ ] Test OpenGraph images with social debuggers
- [ ] Configure caching headers
- [ ] Set up error monitoring (Sentry)

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Static generation, optimized images |
| FID | < 100ms | Minimal JavaScript, code splitting |
| CLS | < 0.1 | Reserved image dimensions, font optimization |
| TTFB | < 200ms | Edge caching, static pages |

## Security

### Input Validation for Contact Form

```typescript
// lib/validations/contact.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .transform((v) => DOMPurify.sanitize(v.trim())),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long'),
  company: z.string()
    .max(100, 'Company name too long')
    .optional()
    .transform((v) => v ? DOMPurify.sanitize(v.trim()) : v),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message too long')
    .transform((v) => DOMPurify.sanitize(v.trim())),
  type: z.enum(['general', 'sales', 'support', 'enterprise']).default('general'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});
```

### Rate Limiting for Forms

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const formRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 submissions per hour
  analytics: true,
});

export async function checkFormRateLimit(ip: string, formType: string) {
  const { success, remaining, reset } = await formRatelimit.limit(`form:${formType}:${ip}`);

  if (!success) {
    throw new Error('Too many submissions. Please try again later.');
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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://vitals.vercel-insights.com https://www.google-analytics.com",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

### Honeypot for Spam Prevention

```tsx
// components/marketing/contact-form.tsx
'use client';

import { useState } from 'react';

export function ContactForm() {
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (formData: FormData) => {
    // Check honeypot - bots will fill this field
    if (honeypot) {
      // Silently reject spam
      return { success: true }; // Fake success to fool bots
    }

    // Process legitimate submission
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  };

  return (
    <form action={handleSubmit}>
      {/* Honeypot field - hidden from users, visible to bots */}
      <input
        type="text"
        name="_gotcha"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {/* Real form fields */}
    </form>
  );
}
```

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

  lighthouse:
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
      - run: pnpm start &
      - run: npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json
      - name: Check Lighthouse Scores
        run: |
          node -e "
            const report = require('./lighthouse-report.json');
            const scores = report.categories;
            if (scores.performance.score < 0.9) process.exit(1);
            if (scores.accessibility.score < 0.9) process.exit(1);
            if (scores.seo.score < 0.9) process.exit(1);
          "

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
    needs: [lint, type-check, test, build, e2e, lighthouse]
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

### Preview Deployments

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        id: deploy
      - name: Comment Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed to: ${{ steps.deploy.outputs.preview-url }}'
            })
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

export function trackPageView(path: string) {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Page view: ${path}`,
    level: 'info',
  });
}

export function trackContactSubmission(type: string) {
  Sentry.addBreadcrumb({
    category: 'form',
    message: `Contact form submission: ${type}`,
    level: 'info',
  });
}

export function trackNewsletterSignup() {
  Sentry.addBreadcrumb({
    category: 'conversion',
    message: 'Newsletter signup',
    level: 'info',
  });
}
```

### Analytics Integration

```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

// Custom event tracking
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', { name, ...properties });
  }
}

// Conversion tracking
export function trackConversion(type: 'signup' | 'contact' | 'newsletter') {
  trackEvent('conversion', { type });
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  };

  return Response.json(checks, { status: 200 });
}
```

### Web Vitals Monitoring

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

// Custom Web Vitals reporter
export function reportWebVitals(metric: any) {
  const { id, name, value, rating } = metric;

  // Send to analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', {
      name: 'web-vital',
      metric: name,
      value: Math.round(value),
      rating,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name}: ${value} (${rating})`);
  }
}
```

### Alert Configuration

```yaml
# alerts.yml
alerts:
  - name: high-error-rate
    condition: error_rate > 1%
    window: 5m
    severity: critical
    channels: [slack, pagerduty]

  - name: slow-lcp
    condition: lcp_p95 > 3000ms
    window: 15m
    severity: warning
    channels: [slack]

  - name: contact-form-failures
    condition: contact_error_rate > 10%
    window: 30m
    severity: high
    channels: [slack]

  - name: lighthouse-regression
    condition: lighthouse_performance < 0.9
    severity: warning
    channels: [slack]

  - name: deployment-failure
    condition: deploy_status == "failed"
    severity: critical
    channels: [slack, pagerduty]
```

## Related Recipes

- [blog-platform](./blog-platform.md) - For content-heavy sites
- [documentation](./documentation.md) - For technical documentation
- [ecommerce](./ecommerce.md) - For product sales

---

## Changelog

### 3.0.0 (2025-01-18)
- Added Security, CI/CD, and Monitoring sections
- Enhanced compositions with additional patterns and components
- Updated to comprehensive recipe standard

### 1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- Static generation optimizations
- SEO best practices
