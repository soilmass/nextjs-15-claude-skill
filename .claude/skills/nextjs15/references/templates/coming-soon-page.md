---
id: t-coming-soon-page
name: Coming Soon Page
version: 2.0.0
layer: L4
category: pages
description: Pre-launch landing page with countdown, email capture, and social proof
tags: [coming-soon, launch, waitlist, landing, countdown]
performance:
  impact: medium
  lcp: medium
  cls: low
formula: "ComingSoonPage = Hero(o-hero) + FormField(m-form-field) + InputButton(a-input-button)"
composes:
  - ../organisms/hero.md
  - ../molecules/form-field.md
  - ../atoms/input-button.md
dependencies:
  - react
  - lucide-react
  - react-hook-form
  - zod
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Coming Soon Page

## Overview

A pre-launch landing page template with countdown timer, email waitlist signup, social proof indicators, and feature previews to build anticipation.

## Composition Diagram

```
+------------------------------------------------------------------+
|                      ComingSoonPage                               |
+------------------------------------------------------------------+
|                                                                   |
|                        [ Rocket Icon ]                            |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |                      o Hero                                   | |
|  |          "Something awesome is coming"                        | |
|  |    "We're working hard to bring you an incredible..."        | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |                    Countdown Timer                            | |
|  |     [ 45 ]  :  [ 12 ]  :  [ 30 ]  :  [ 15 ]                   | |
|  |      Days      Hours     Minutes    Seconds                   | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |                    Waitlist Form                              | |
|  |  +------------------------------------------------+           | |
|  |  | m FormField                                     |           | |
|  |  | [    Enter your email    ] a InputButton [Join] |           | |
|  |  +------------------------------------------------+           | |
|  |                  1,234 people already on waitlist              | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |                   Feature Cards                               | |
|  |  +----------------+ +----------------+ +----------------+      | |
|  |  | Lightning Fast | | Secure Design  | | AI-Powered     |      | |
|  |  | Built for      | | Enterprise-    | | Smart features |      | |
|  |  | speed          | | grade security | | that learn     |      | |
|  |  +----------------+ +----------------+ +----------------+      | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  Footer: [ Twitter ] [ GitHub ] [ LinkedIn ]                      |
+------------------------------------------------------------------+
```

## Implementation

```tsx
// app/coming-soon/page.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Rocket,
  Mail,
  CheckCircle,
  Loader2,
  Twitter,
  Github,
  Linkedin,
  Sparkles,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComingSoonPageProps {
  title?: string;
  subtitle?: string;
  launchDate?: Date;
  features?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  waitlistCount?: number;
  showProgress?: boolean;
  progressPercent?: number;
}

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

// Countdown Timer
function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const diff = target - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {units.map((unit, index) => (
        <React.Fragment key={unit.label}>
          <div className="text-center">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="text-2xl sm:text-3xl font-bold font-mono">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {unit.label}
            </p>
          </div>
          {index < units.length - 1 && (
            <span className="text-2xl font-bold text-muted-foreground hidden sm:block">
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Waitlist Form
function WaitlistForm({ waitlistCount }: { waitlistCount?: number }) {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [position, setPosition] = React.useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setPosition(result.position || (waitlistCount || 0) + 1);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center p-6 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-green-800">You're on the list!</h3>
        <p className="text-sm text-green-600 mt-1">
          You're #{position} on the waitlist. We'll notify you when we launch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            className={cn(
              'w-full rounded-xl border bg-background px-4 py-3 text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              errors.email && 'border-destructive'
            )}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive text-left">
              {errors.email.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 disabled:opacity-50 transition-colors',
            'whitespace-nowrap'
          )}
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Join waitlist
        </button>
      </div>
      {status === 'error' && (
        <p className="mt-2 text-sm text-destructive text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}

// Feature Card
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 rounded-xl border bg-card">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Social Links
function SocialLinks({
  links,
}: {
  links: ComingSoonPageProps['socialLinks'];
}) {
  if (!links) return null;

  const socialConfig = [
    { key: 'twitter', icon: Twitter, url: links.twitter },
    { key: 'github', icon: Github, url: links.github },
    { key: 'linkedin', icon: Linkedin, url: links.linkedin },
  ].filter((s) => s.url);

  if (socialConfig.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      {socialConfig.map((social) => (
        <a
          key={social.key}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-accent transition-colors"
          aria-label={`Follow us on ${social.key}`}
        >
          <social.icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}

// Default features
const defaultFeatures = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Lightning Fast',
    description: 'Built for speed with modern architecture',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure by Design',
    description: 'Enterprise-grade security from day one',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'AI-Powered',
    description: 'Smart features that learn from you',
  },
];

// Main Coming Soon Page
export default function ComingSoonPage({
  title = 'Something awesome is coming',
  subtitle = "We're working hard to bring you an incredible new experience. Be the first to know when we launch.",
  launchDate,
  features = defaultFeatures,
  socialLinks,
  waitlistCount,
  showProgress = false,
  progressPercent = 75,
}: ComingSoonPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full text-center">
          {/* Logo/Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Rocket className="h-10 w-10 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            {subtitle}
          </p>

          {/* Countdown */}
          {launchDate && (
            <div className="mt-10">
              <Countdown targetDate={launchDate} />
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <div className="mt-10 max-w-sm mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Development progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Waitlist Form */}
          <div className="mt-10">
            <WaitlistForm waitlistCount={waitlistCount} />
            {waitlistCount && waitlistCount > 0 && (
              <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                {waitlistCount.toLocaleString()} people already on the waitlist
              </p>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="mt-16">
              <h2 className="text-lg font-semibold mb-6">What to expect</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-3xl mx-auto px-4">
          <SocialLinks links={socialLinks} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
// app/coming-soon/page.tsx
import ComingSoonPage from '@/components/templates/coming-soon-page';

export default function Page() {
  return (
    <ComingSoonPage
      launchDate={new Date('2024-03-01')}
      waitlistCount={1234}
      socialLinks={{
        twitter: 'https://twitter.com/yourapp',
        github: 'https://github.com/yourapp',
      }}
    />
  );
}
```

### With Custom Features

```tsx
<ComingSoonPage
  title="The future of productivity"
  subtitle="An AI-powered workspace that adapts to how you work."
  features={[
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI Assistant',
      description: 'Your personal AI that understands context',
    },
    {
      icon: <Workflow className="h-6 w-6" />,
      title: 'Smart Workflows',
      description: 'Automate repetitive tasks effortlessly',
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'Privacy First',
      description: 'Your data stays yours, always',
    },
  ]}
  showProgress
  progressPercent={85}
/>
```

## Error States

### Waitlist Submission Error

```tsx
// components/coming-soon/waitlist-form-enhanced.tsx
'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export function WaitlistFormWithErrorHandling() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to join waitlist');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === 'loading'}
          className="flex-1 rounded-lg border px-4 py-2 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground disabled:opacity-50"
        >
          {status === 'loading' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Notify Me'
          )}
        </button>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="ml-auto hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </form>
  );
}
```

### Countdown Error State

```tsx
// components/coming-soon/countdown-error.tsx
export function CountdownError() {
  return (
    <div className="text-center">
      <p className="text-lg text-muted-foreground">
        Launch date coming soon
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Subscribe to be the first to know
      </p>
    </div>
  );
}
```

## Loading States

### Page Loading Skeleton

```tsx
// app/coming-soon/loading.tsx
export default function ComingSoonLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Logo skeleton */}
      <div className="mb-8 h-20 w-20 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />

      {/* Title skeleton */}
      <div className="mb-4 h-12 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

      {/* Description skeleton */}
      <div className="mb-8 h-6 w-96 max-w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

      {/* Countdown skeleton */}
      <div className="mb-8 flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-3 w-12 mx-auto animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Form skeleton */}
      <div className="flex w-full max-w-md gap-2">
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-12 w-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Features skeleton */}
      <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6">
            <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="mx-auto h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mx-auto mt-2 h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Countdown Loading

```tsx
// components/coming-soon/countdown-skeleton.tsx
export function CountdownSkeleton() {
  return (
    <div className="flex justify-center gap-3 sm:gap-6" role="status" aria-label="Loading countdown">
      {['Days', 'Hours', 'Minutes', 'Seconds'].map((label) => (
        <div key={label} className="text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 animate-pulse rounded-xl bg-primary/20" />
          <span className="mt-2 block text-xs sm:text-sm text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Layout

```tsx
// components/coming-soon/responsive-coming-soon.tsx
export function ResponsiveComingSoon({
  title,
  description,
  launchDate,
}: {
  title: string;
  description: string;
  launchDate: Date;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-lg text-center">
        {/* Logo - responsive size */}
        <div className="mx-auto mb-6 sm:mb-8 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10">
          <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>

        {/* Title - responsive font size */}
        <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {title}
        </h1>

        {/* Description - responsive text */}
        <p className="mb-6 sm:mb-8 text-base sm:text-lg text-muted-foreground px-2">
          {description}
        </p>

        {/* Countdown - responsive sizing */}
        <div className="mb-8 sm:mb-10">
          <ResponsiveCountdown targetDate={launchDate} />
        </div>

        {/* Form - full width on mobile */}
        <div className="mx-auto max-w-md">
          <WaitlistForm />
        </div>

        {/* Social links - touch-friendly spacing */}
        <div className="mt-8 sm:mt-10 flex justify-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-accent transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <link.icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// Responsive countdown component
function ResponsiveCountdown({ targetDate }: { targetDate: Date }) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ];

  return (
    <div className="flex justify-center gap-2 sm:gap-4">
      {units.map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-lg sm:rounded-xl bg-primary text-primary-foreground">
            <span className="text-xl sm:text-3xl font-bold font-mono tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="mt-1 sm:mt-2 block text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Mobile Optimizations

```tsx
// Mobile-specific enhancements
const mobileOptimizations = {
  // Touch-friendly form
  form: 'min-h-[48px] touch-manipulation',

  // Prevent zoom on iOS (use 16px minimum)
  input: 'text-base sm:text-sm',

  // Safe area padding for notch devices
  container: 'pb-safe pt-safe',

  // Reduced motion for accessibility
  animation: 'motion-reduce:animate-none',
};
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Logo | 64x64px | 80x80px | 80x80px |
| Title | 30px | 36px | 48px |
| Countdown boxes | 56x56px | 80x80px | 80x80px |
| Form | Full width | Max 400px | Max 400px |
| Features grid | 1 column | 3 columns | 3 columns |

## SEO Considerations

### Metadata Configuration

```tsx
// app/coming-soon/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coming Soon | Your Product',
  description: 'We\'re launching something amazing. Sign up to be notified when we go live.',
  openGraph: {
    title: 'Coming Soon - Your Product',
    description: 'Be the first to know when we launch.',
    images: ['/og-coming-soon.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coming Soon - Your Product',
    description: 'Be the first to know when we launch.',
    images: ['/twitter-coming-soon.jpg'],
  },
};
```

### Structured Data

```tsx
// components/coming-soon/structured-data.tsx
export function ComingSoonStructuredData({
  launchDate,
  productName,
}: {
  launchDate: Date;
  productName: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${productName} Launch`,
    description: `Be the first to experience ${productName}`,
    startDate: launchDate.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://yoursite.com',
    },
    organizer: {
      '@type': 'Organization',
      name: 'Your Company',
      url: 'https://yoursite.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### Pre-launch SEO Tips

```tsx
// SEO best practices for coming soon pages
const seoTips = {
  // 1. Use proper status code (200, not 503)
  statusCode: 200,

  // 2. Include canonical URL
  canonical: 'https://yoursite.com',

  // 3. Don't block indexing
  robots: 'index, follow',

  // 4. Include launch date in content for search visibility
  // 5. Add social sharing metadata
  // 6. Create shareable URLs for referrals
};
```

## Testing Strategies

### Component Testing

```tsx
// __tests__/coming-soon.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ComingSoonPage from '@/app/coming-soon/page';
import { WaitlistForm } from '@/components/coming-soon/waitlist-form';
import { Countdown } from '@/components/coming-soon/countdown';

describe('ComingSoonPage', () => {
  it('renders page title', () => {
    render(<ComingSoonPage title="Coming Soon" />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('displays countdown when launch date provided', () => {
    const futureDate = new Date(Date.now() + 86400000);
    render(<ComingSoonPage launchDate={futureDate} />);
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
  });
});

describe('WaitlistForm', () => {
  it('submits email successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ position: 100 }) });
    global.fetch = mockFetch;

    render(<WaitlistForm />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText(/join waitlist/i));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/waitlist', expect.any(Object));
    });
  });

  it('shows error on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Email already registered' }),
    });

    render(<WaitlistForm />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText(/join waitlist/i));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('validates email format', () => {
    render(<WaitlistForm />);
    const input = screen.getByPlaceholderText(/email/i);
    expect(input).toHaveAttribute('type', 'email');
  });
});

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down correctly', () => {
    const futureDate = new Date(Date.now() + 86400000); // 1 day
    render(<Countdown targetDate={futureDate} />);
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('shows zeros when expired', () => {
    const pastDate = new Date(Date.now() - 1000);
    render(<Countdown targetDate={pastDate} />);
    expect(screen.getAllByText('00')).toHaveLength(4);
  });
});
```

### E2E Testing

```tsx
// e2e/coming-soon.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Coming Soon Page', () => {
  test('displays countdown timer', async ({ page }) => {
    await page.goto('/coming-soon');

    await expect(page.getByText('Days')).toBeVisible();
    await expect(page.getByText('Hours')).toBeVisible();
    await expect(page.getByText('Minutes')).toBeVisible();
    await expect(page.getByText('Seconds')).toBeVisible();
  });

  test('waitlist form submission', async ({ page }) => {
    await page.goto('/coming-soon');

    await page.fill('[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/on the list/i)).toBeVisible();
  });

  test('social links have correct attributes', async ({ page }) => {
    await page.goto('/coming-soon');

    const socialLinks = page.locator('footer a[target="_blank"]');
    for (const link of await socialLinks.all()) {
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/coming-soon');

    // Form should be full width
    const form = page.locator('form');
    const box = await form.boundingBox();
    expect(box?.width).toBeGreaterThan(300);
  });
});
```

### Accessibility Testing

```tsx
// __tests__/coming-soon-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ComingSoonPage from '@/app/coming-soon/page';

expect.extend(toHaveNoViolations);

describe('Coming Soon Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ComingSoonPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('form has proper labels', () => {
    const { container } = render(<ComingSoonPage />);
    const input = container.querySelector('input[type="email"]');
    expect(input).toHaveAttribute('placeholder');
  });

  it('social links have aria-labels', () => {
    const { container } = render(
      <ComingSoonPage socialLinks={{ twitter: 'https://twitter.com' }} />
    );
    const link = container.querySelector('a[target="_blank"]');
    expect(link).toHaveAttribute('aria-label');
  });
});
```

## Related Skills

- `templates/maintenance-page` - Maintenance mode
- `patterns/email-capture` - Email capture patterns
- `organisms/countdown` - Countdown timer

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation
- Countdown timer
- Waitlist form with validation
- Feature highlights
- Social links
- Progress indicator
