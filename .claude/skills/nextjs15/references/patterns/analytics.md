---
id: pt-analytics
name: Analytics Integration
version: 1.1.0
layer: L5
category: tracking
description: General analytics integration with Google Analytics, Plausible, and custom event tracking
tags: [analytics, tracking, google-analytics, plausible, events, next15]
composes: []
dependencies:
  "@vercel/analytics": "^1.4.0"
formula: "Analytics = AnalyticsProvider + EventTracking + PageViews + ConsentManagement"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Analytics Integration

## Overview

Analytics integration is fundamental to understanding user behavior, measuring business metrics, and making data-driven decisions. This pattern provides a comprehensive framework for implementing analytics in Next.js 15 applications, supporting multiple analytics providers while respecting user privacy and consent preferences.

The implementation follows a provider-agnostic approach, allowing you to send events to Google Analytics 4, Plausible, Vercel Analytics, and custom backends simultaneously. This ensures data redundancy and flexibility as your analytics needs evolve.

Modern analytics must balance comprehensive tracking with privacy compliance. This pattern includes built-in consent management that integrates with GDPR and CCPA requirements, ensuring you only track users who have explicitly opted in.

## When to Use

- Tracking user behavior and engagement across your application
- Measuring conversion funnels and identifying drop-off points
- A/B testing and feature experimentation analytics
- Privacy-compliant tracking with consent management
- Custom event tracking for user actions like button clicks, form submissions
- E-commerce tracking for product views, add-to-cart, and purchases

## When NOT to Use

- Internal admin dashboards where user behavior tracking is unnecessary
- Applications with strict no-tracking policies or privacy-first requirements
- Server-side only applications without user interaction
- When you lack proper data processing agreements with analytics providers

## Composition Diagram

```
Analytics Architecture
======================

+------------------------------------------------------------------+
|                        Root Layout                                |
|  +------------------------------------------------------------+  |
|  |                   AnalyticsProvider                         |  |
|  |  +---------------------------+---------------------------+  |  |
|  |  |    ConsentManager         |    ScriptLoader           |  |  |
|  |  |  - Cookie consent         |  - GA4 Script             |  |  |
|  |  |  - Preference storage     |  - Plausible Script       |  |  |
|  |  |  - GDPR compliance        |  - Custom Analytics       |  |  |
|  |  +---------------------------+---------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    Page View Tracking                             |
|  +------------------------------------------------------------+  |
|  |  AnalyticsTracker (Client Component)                        |  |
|  |  - usePathname() hook                                       |  |
|  |  - useSearchParams() hook                                   |  |
|  |  - Automatic page view on route change                      |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                     Event Tracking Layer                          |
|  +--------------------+  +--------------------+  +--------------+ |
|  |   useAnalytics()   |  |   TrackableButton  |  | TrackableForm| |
|  | - trackEvent()     |  | - onClick tracking |  | - onSubmit   | |
|  | - trackClick()     |  | - Category/label   |  | - Field data | |
|  | - trackConversion()|  | - Custom props     |  | - Validation | |
|  +--------------------+  +--------------------+  +--------------+ |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    Server-Side Events                             |
|  +------------------------------------------------------------+  |
|  |  trackServerEvent() - API Routes & Server Actions           |  |
|  |  - Purchase events                                          |  |
|  |  - User registration                                        |  |
|  |  - Backend conversions                                      |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Implementation

### Google Analytics 4 Setup

```typescript
// lib/analytics/gtag.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views
export function pageview(url: string) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// Track custom events
export function event({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// E-commerce events
export function trackPurchase(transactionData: {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'purchase', {
      transaction_id: transactionData.transactionId,
      value: transactionData.value,
      currency: transactionData.currency,
      items: transactionData.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}
```

### Analytics Provider Component

```typescript
// components/analytics/analytics-provider.tsx
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { pageview, GA_MEASUREMENT_ID } from '@/lib/analytics/gtag';
import { useConsent } from '@/hooks/use-consent';

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
      pageview(url);
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { hasConsent } = useConsent();

  return (
    <>
      {hasConsent && GA_MEASUREMENT_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </>
      )}
      {children}
    </>
  );
}
```

### Plausible Analytics (Privacy-Friendly)

```typescript
// components/analytics/plausible-provider.tsx
'use client';

import Script from 'next/script';

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export function PlausibleProvider({ children }: { children: React.ReactNode }) {
  if (!PLAUSIBLE_DOMAIN) return <>{children}</>;

  return (
    <>
      <Script
        defer
        data-domain={PLAUSIBLE_DOMAIN}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}

// Track custom events with Plausible
export function trackEvent(eventName: string, props?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(eventName, { props });
  }
}
```

### Custom Event Tracking Hook

```typescript
// hooks/use-analytics.ts
'use client';

import { useCallback } from 'react';
import { event as gtagEvent } from '@/lib/analytics/gtag';
import { trackEvent as plausibleEvent } from '@/components/analytics/plausible-provider';

type EventParams = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export function useAnalytics() {
  const trackEvent = useCallback((params: EventParams) => {
    // Send to Google Analytics
    gtagEvent(params);

    // Send to Plausible
    plausibleEvent(params.action, {
      category: params.category,
      label: params.label || '',
    });
  }, []);

  const trackClick = useCallback((label: string, category = 'engagement') => {
    trackEvent({ action: 'click', category, label });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string) => {
    trackEvent({ action: 'form_submit', category: 'forms', label: formName });
  }, [trackEvent]);

  const trackConversion = useCallback((conversionType: string, value?: number) => {
    trackEvent({ action: 'conversion', category: 'conversions', label: conversionType, value });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent({ action: 'search', category: 'engagement', label: query, value: resultsCount });
  }, [trackEvent]);

  return { trackEvent, trackClick, trackFormSubmit, trackConversion, trackSearch };
}
```

### Server-Side Analytics

```typescript
// lib/analytics/server.ts
import { headers } from 'next/headers';

export async function trackServerEvent(eventName: string, properties: Record<string, any>) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '';

  // Send to analytics API
  await fetch('https://api.analytics.example.com/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventName,
      properties,
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
    }),
  });
}

// Server action for tracking
export async function trackConversionServer(
  conversionType: string,
  value: number,
  metadata?: Record<string, any>
) {
  await trackServerEvent('conversion', {
    type: conversionType,
    value,
    ...metadata,
  });
}
```

### Consent Management Hook

```typescript
// hooks/use-consent.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

const CONSENT_KEY = 'analytics-consent';

type ConsentState = {
  hasConsent: boolean;
  consentGiven: Date | null;
  preferences: {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };
};

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState>({
    hasConsent: false,
    consentGiven: null,
    preferences: {
      analytics: false,
      marketing: false,
      functional: true,
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setConsent({
        ...parsed,
        consentGiven: parsed.consentGiven ? new Date(parsed.consentGiven) : null,
      });
    }
  }, []);

  const grantConsent = useCallback((preferences: Partial<ConsentState['preferences']>) => {
    const newConsent: ConsentState = {
      hasConsent: true,
      consentGiven: new Date(),
      preferences: {
        analytics: preferences.analytics ?? true,
        marketing: preferences.marketing ?? false,
        functional: true,
      },
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
  }, []);

  const revokeConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    setConsent({
      hasConsent: false,
      consentGiven: null,
      preferences: { analytics: false, marketing: false, functional: true },
    });
  }, []);

  return { ...consent, grantConsent, revokeConsent };
}
```

## Examples

### Example 1: CTA Button with Analytics

```typescript
// components/cta-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';

export function CTAButton({ label, href }: { label: string; href: string }) {
  const { trackClick } = useAnalytics();

  return (
    <Button
      onClick={() => {
        trackClick(label, 'cta');
        window.location.href = href;
      }}
    >
      {label}
    </Button>
  );
}
```

### Example 2: E-commerce Product View Tracking

```typescript
// components/product-view-tracker.tsx
'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export function ProductViewTracker({ product }: { product: Product }) {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent({
      action: 'view_item',
      category: 'ecommerce',
      label: product.name,
      value: product.price,
    });
  }, [product.id, trackEvent]);

  return null;
}
```

### Example 3: Form Submission with Analytics

```typescript
// components/newsletter-form.tsx
'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { trackFormSubmit, trackConversion } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      trackFormSubmit('newsletter');
      trackConversion('newsletter_signup', 1);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
}
```

### Example 4: Search Analytics

```typescript
// components/search-bar.tsx
'use client';

import { useState, useCallback } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { Input } from '@/components/ui/input';
import { debounce } from '@/lib/utils';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { trackSearch } = useAnalytics();

  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data.results);

      // Track the search
      trackSearch(searchQuery, data.results.length);
    }, 300),
    [trackSearch]
  );

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          performSearch(e.target.value);
        }}
        placeholder="Search..."
      />
      {/* Render results */}
    </div>
  );
}
```

## Anti-patterns

### Anti-pattern 1: Tracking Without Consent

```typescript
// BAD - No consent check
useEffect(() => {
  pageview(pathname);
}, [pathname]);

// GOOD - Check consent first
const { hasConsent } = useConsent();
useEffect(() => {
  if (hasConsent) {
    pageview(pathname);
  }
}, [pathname, hasConsent]);
```

### Anti-pattern 2: Blocking Analytics Scripts

```typescript
// BAD - Blocking script load
<script src="https://www.googletagmanager.com/gtag/js" />

// GOOD - Non-blocking with afterInteractive
<Script
  strategy="afterInteractive"
  src="https://www.googletagmanager.com/gtag/js"
/>
```

### Anti-pattern 3: Tracking Sensitive Data

```typescript
// BAD - Tracking PII
trackEvent({
  action: 'form_submit',
  category: 'registration',
  label: user.email, // Never track email
});

// GOOD - Track anonymized data
trackEvent({
  action: 'form_submit',
  category: 'registration',
  label: 'new_user',
});
```

### Anti-pattern 4: Duplicate Event Tracking

```typescript
// BAD - No deduplication
const handleClick = () => {
  trackEvent({ action: 'click', category: 'button', label: 'submit' });
  trackEvent({ action: 'click', category: 'button', label: 'submit' }); // Duplicate!
};

// GOOD - Use refs to prevent duplicates
const trackedRef = useRef(false);
const handleClick = () => {
  if (!trackedRef.current) {
    trackEvent({ action: 'click', category: 'button', label: 'submit' });
    trackedRef.current = true;
  }
};
```

## Testing

### Unit Test: Analytics Hook

```typescript
// __tests__/hooks/use-analytics.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '@/hooks/use-analytics';

// Mock gtag
const mockGtag = jest.fn();
beforeEach(() => {
  window.gtag = mockGtag;
  mockGtag.mockClear();
});

describe('useAnalytics', () => {
  it('should track click events', () => {
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackClick('buy-now', 'cta');
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'click', {
      event_category: 'cta',
      event_label: 'buy-now',
      value: undefined,
    });
  });

  it('should track form submissions', () => {
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackFormSubmit('newsletter');
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'form_submit', {
      event_category: 'forms',
      event_label: 'newsletter',
      value: undefined,
    });
  });

  it('should track conversions with value', () => {
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackConversion('purchase', 9999);
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'conversion', {
      event_category: 'conversions',
      event_label: 'purchase',
      value: 9999,
    });
  });
});
```

### Integration Test: Consent Flow

```typescript
// __tests__/integration/consent-flow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentBanner } from '@/components/consent-banner';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';

describe('Consent Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not load analytics scripts without consent', () => {
    render(
      <AnalyticsProvider>
        <div>App Content</div>
      </AnalyticsProvider>
    );

    const scripts = document.querySelectorAll('script[src*="googletagmanager"]');
    expect(scripts.length).toBe(0);
  });

  it('should load analytics scripts after consent', async () => {
    render(
      <>
        <ConsentBanner />
        <AnalyticsProvider>
          <div>App Content</div>
        </AnalyticsProvider>
      </>
    );

    const acceptButton = screen.getByText('Accept All');
    fireEvent.click(acceptButton);

    // Wait for scripts to load
    await new Promise((resolve) => setTimeout(resolve, 100));

    const consent = JSON.parse(localStorage.getItem('analytics-consent') || '{}');
    expect(consent.hasConsent).toBe(true);
  });
});
```

### E2E Test: Page View Tracking

```typescript
// e2e/analytics.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Analytics', () => {
  test('should track page views on navigation', async ({ page }) => {
    // Intercept analytics requests
    const analyticsRequests: string[] = [];
    await page.route('**/google-analytics.com/**', async (route) => {
      analyticsRequests.push(route.request().url());
      await route.fulfill({ status: 200 });
    });

    // Accept consent
    await page.goto('/');
    await page.click('button:has-text("Accept All")');

    // Navigate to another page
    await page.click('a:has-text("Products")');
    await page.waitForURL('/products');

    // Verify analytics was called
    expect(analyticsRequests.length).toBeGreaterThan(0);
  });
});
```

## Related Skills

- [ab-testing](./ab-testing.md) - A/B testing framework
- [logging](./logging.md) - Application logging
- [error-tracking](./error-tracking.md) - Error monitoring with Sentry
- [performance-monitoring](./performance-monitoring.md) - Core Web Vitals tracking

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive overview section
- Added When NOT to Use section
- Enhanced composition diagram with full architecture
- Added consent management hook implementation
- Added 4 real-world usage examples
- Added 4 anti-patterns with code examples
- Added unit, integration, and E2E test examples
- Added e-commerce tracking functions
- Improved documentation structure

### 1.0.0 (2025-01-15)
- Initial implementation
- Google Analytics 4 integration
- Plausible analytics support
- Custom event tracking hooks
