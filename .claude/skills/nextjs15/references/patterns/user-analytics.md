---
id: pt-user-analytics
name: User Analytics
version: 2.0.0
layer: L5
category: observability
description: User behavior analytics with event tracking, session management, and privacy-compliant data collection
tags: [analytics, tracking, events, sessions, privacy, gdpr]
composes: []
dependencies:
  @vercel/analytics: "^1.4.0"
formula: events + sessions + consent + identity = privacy-compliant behavioral insights
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# User Analytics

Track user behavior with privacy-first analytics and custom event tracking.

## When to Use

- Product analytics requiring user journey understanding
- Conversion funnel optimization and A/B testing
- GDPR/CCPA compliant analytics implementations
- Session-based behavioral analysis
- Attribution and marketing campaign tracking

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|  User Actions     |---->| pt-user-analytics |---->|  Analytics API    |
| (Clicks/Forms)    |     |   (Core Engine)   |     | (/api/analytics)  |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
| pt-analytics-     |     |  Session Manager  |     |    Database       |
|   events          |     |   & Identity      |     | (Event Storage)   |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|  Consent Banner   |     |  pt-web-vitals    |     |   pt-metrics      |
|  (Privacy)        |     | (Performance)     |     |  (Aggregations)   |
+-------------------+     +-------------------+     +-------------------+
                                  |
                                  v
                          +-------------------+
                          |     pt-rum        |
                          | (RUM Integration) |
                          +-------------------+
```

## Overview

This pattern covers:
- Event tracking system
- Session management
- Page view tracking
- User journey analytics
- Privacy-compliant implementation
- Custom analytics dashboard
- Integration with third-party tools

## Implementation

### Analytics Event Types

```typescript
// lib/analytics/types.ts
export type EventCategory = 
  | 'navigation'
  | 'engagement'
  | 'conversion'
  | 'error'
  | 'performance'
  | 'feature';

export interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  page?: string;
}

export interface PageViewEvent {
  path: string;
  referrer?: string;
  title?: string;
  query?: Record<string, string>;
}

export interface SessionData {
  id: string;
  startTime: number;
  lastActive: number;
  pageViews: number;
  events: number;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface UserIdentity {
  userId?: string;
  anonymousId: string;
  traits?: Record<string, unknown>;
}
```

### Analytics Core

```typescript
// lib/analytics/core.ts
import { v4 as uuidv4 } from 'uuid';
import type { 
  AnalyticsEvent, 
  PageViewEvent, 
  SessionData, 
  UserIdentity 
} from './types';

const STORAGE_KEYS = {
  anonymousId: 'analytics_anonymous_id',
  sessionId: 'analytics_session_id',
  sessionData: 'analytics_session_data',
  consent: 'analytics_consent',
};

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class Analytics {
  private identity: UserIdentity | null = null;
  private session: SessionData | null = null;
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;
  private hasConsent = false;

  /**
   * Initialize analytics
   */
  init(options?: { respectDoNotTrack?: boolean }) {
    if (typeof window === 'undefined') return;
    if (this.isInitialized) return;

    // Check Do Not Track
    if (options?.respectDoNotTrack && navigator.doNotTrack === '1') {
      console.log('[Analytics] Respecting Do Not Track preference');
      return;
    }

    // Check consent
    this.hasConsent = this.checkConsent();
    if (!this.hasConsent) {
      console.log('[Analytics] No consent, queuing events');
    }

    // Initialize identity
    this.identity = this.getOrCreateIdentity();

    // Initialize or resume session
    this.session = this.getOrCreateSession();

    // Process queued events
    if (this.hasConsent && this.queue.length > 0) {
      this.queue.forEach((event) => this.sendEvent(event));
      this.queue = [];
    }

    // Track session activity
    this.setupActivityTracking();

    this.isInitialized = true;
  }

  /**
   * Set user consent
   */
  setConsent(granted: boolean) {
    this.hasConsent = granted;
    localStorage.setItem(STORAGE_KEYS.consent, granted ? 'true' : 'false');

    if (granted && this.queue.length > 0) {
      this.queue.forEach((event) => this.sendEvent(event));
      this.queue = [];
    }
  }

  /**
   * Check if consent was given
   */
  private checkConsent(): boolean {
    const consent = localStorage.getItem(STORAGE_KEYS.consent);
    return consent === 'true';
  }

  /**
   * Get or create anonymous identity
   */
  private getOrCreateIdentity(): UserIdentity {
    let anonymousId = localStorage.getItem(STORAGE_KEYS.anonymousId);
    
    if (!anonymousId) {
      anonymousId = uuidv4();
      localStorage.setItem(STORAGE_KEYS.anonymousId, anonymousId);
    }

    return { anonymousId };
  }

  /**
   * Identify user
   */
  identify(userId: string, traits?: Record<string, unknown>) {
    if (!this.identity) return;

    this.identity = {
      ...this.identity,
      userId,
      traits,
    };

    this.track('user_identified', 'engagement', { userId, ...traits });
  }

  /**
   * Get or create session
   */
  private getOrCreateSession(): SessionData {
    const stored = sessionStorage.getItem(STORAGE_KEYS.sessionData);
    
    if (stored) {
      const session = JSON.parse(stored) as SessionData;
      const now = Date.now();
      
      // Check if session is still valid
      if (now - session.lastActive < SESSION_TIMEOUT) {
        session.lastActive = now;
        this.saveSession(session);
        return session;
      }
    }

    // Create new session
    const session: SessionData = {
      id: uuidv4(),
      startTime: Date.now(),
      lastActive: Date.now(),
      pageViews: 0,
      events: 0,
      ...this.getUtmParams(),
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Extract UTM parameters
   */
  private getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
    };
  }

  /**
   * Save session data
   */
  private saveSession(session: SessionData) {
    sessionStorage.setItem(STORAGE_KEYS.sessionData, JSON.stringify(session));
  }

  /**
   * Setup activity tracking
   */
  private setupActivityTracking() {
    // Update session on activity
    const updateActivity = () => {
      if (this.session) {
        this.session.lastActive = Date.now();
        this.saveSession(this.session);
      }
    };

    document.addEventListener('click', updateActivity, { passive: true });
    document.addEventListener('scroll', updateActivity, { passive: true });
    document.addEventListener('keydown', updateActivity, { passive: true });

    // Track when user leaves
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.track('session_end', 'engagement', {
          duration: Date.now() - (this.session?.startTime || Date.now()),
          pageViews: this.session?.pageViews,
          events: this.session?.events,
        });
      }
    });
  }

  /**
   * Track page view
   */
  page(data?: Partial<PageViewEvent>) {
    if (!this.session) return;

    this.session.pageViews++;
    this.saveSession(this.session);

    const pageView: PageViewEvent = {
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
      query: Object.fromEntries(new URLSearchParams(window.location.search)),
      ...data,
    };

    this.track('page_view', 'navigation', pageView);
  }

  /**
   * Track custom event
   */
  track(
    name: string,
    category: AnalyticsEvent['category'],
    properties?: Record<string, unknown>
  ) {
    const event: AnalyticsEvent = {
      name,
      category,
      properties,
      timestamp: Date.now(),
      userId: this.identity?.userId,
      sessionId: this.session?.id,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };

    if (this.session) {
      this.session.events++;
      this.saveSession(this.session);
    }

    if (!this.hasConsent) {
      this.queue.push(event);
      return;
    }

    this.sendEvent(event);
  }

  /**
   * Send event to analytics backend
   */
  private sendEvent(event: AnalyticsEvent) {
    const payload = {
      ...event,
      anonymousId: this.identity?.anonymousId,
      traits: this.identity?.traits,
    };

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { 
        type: 'application/json' 
      });
      navigator.sendBeacon('/api/analytics', blob);
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event.name, event.properties);
    }
  }

  /**
   * Reset analytics (for logout)
   */
  reset() {
    this.identity = this.getOrCreateIdentity();
    this.session = this.getOrCreateSession();
  }
}

// Export singleton
export const analytics = new Analytics();
```

### React Provider and Hooks

```typescript
// components/analytics/analytics-provider.tsx
'use client';

import { createContext, useContext, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics/core';
import type { AnalyticsEvent } from '@/lib/analytics/types';

interface AnalyticsContextValue {
  track: (
    name: string,
    category: AnalyticsEvent['category'],
    properties?: Record<string, unknown>
  ) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  setConsent: (granted: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on mount
  useEffect(() => {
    analytics.init({ respectDoNotTrack: true });
  }, []);

  // Track page views on route change
  useEffect(() => {
    analytics.page({
      path: pathname,
      query: Object.fromEntries(searchParams.entries()),
    });
  }, [pathname, searchParams]);

  const track = useCallback(
    (
      name: string,
      category: AnalyticsEvent['category'],
      properties?: Record<string, unknown>
    ) => {
      analytics.track(name, category, properties);
    },
    []
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      analytics.identify(userId, traits);
    },
    []
  );

  const setConsent = useCallback((granted: boolean) => {
    analytics.setConsent(granted);
  }, []);

  return (
    <AnalyticsContext.Provider value={{ track, identify, setConsent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
```

### Event Tracking Hooks

```typescript
// hooks/use-track-event.ts
'use client';

import { useCallback } from 'react';
import { useAnalytics } from '@/components/analytics/analytics-provider';
import type { AnalyticsEvent } from '@/lib/analytics/types';

// Generic event tracking
export function useTrackEvent() {
  const { track } = useAnalytics();
  return track;
}

// Click tracking
export function useTrackClick(
  name: string,
  properties?: Record<string, unknown>
) {
  const { track } = useAnalytics();

  return useCallback(
    (e?: React.MouseEvent) => {
      track(name, 'engagement', {
        ...properties,
        element: e?.currentTarget?.tagName,
        text: e?.currentTarget?.textContent?.slice(0, 50),
      });
    },
    [name, properties, track]
  );
}

// Form tracking
export function useTrackForm(formName: string) {
  const { track } = useAnalytics();

  const trackStart = useCallback(() => {
    track('form_start', 'engagement', { form: formName });
  }, [formName, track]);

  const trackField = useCallback(
    (fieldName: string) => {
      track('form_field_completed', 'engagement', { 
        form: formName, 
        field: fieldName 
      });
    },
    [formName, track]
  );

  const trackSubmit = useCallback(
    (success: boolean, data?: Record<string, unknown>) => {
      track(success ? 'form_submit' : 'form_error', 'conversion', {
        form: formName,
        ...data,
      });
    },
    [formName, track]
  );

  const trackAbandon = useCallback(() => {
    track('form_abandon', 'engagement', { form: formName });
  }, [formName, track]);

  return { trackStart, trackField, trackSubmit, trackAbandon };
}

// Feature usage tracking
export function useTrackFeature(featureName: string) {
  const { track } = useAnalytics();

  return useCallback(
    (action: string, properties?: Record<string, unknown>) => {
      track(`${featureName}_${action}`, 'feature', properties);
    },
    [featureName, track]
  );
}
```

### Analytics API Endpoint

```typescript
// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geolocation } from '@vercel/functions';

export async function POST(request: Request) {
  try {
    const event = await request.json();
    const geo = geolocation(request);

    // Enrich with server-side data
    const enrichedEvent = {
      ...event,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0],
      country: geo.country,
      city: geo.city,
      region: geo.countryRegion,
    };

    // Store event
    await prisma.analyticsEvent.create({
      data: {
        name: enrichedEvent.name,
        category: enrichedEvent.category,
        properties: enrichedEvent.properties,
        anonymousId: enrichedEvent.anonymousId,
        userId: enrichedEvent.userId,
        sessionId: enrichedEvent.sessionId,
        page: enrichedEvent.page,
        userAgent: enrichedEvent.userAgent,
        country: enrichedEvent.country,
        city: enrichedEvent.city,
        timestamp: new Date(enrichedEvent.timestamp),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

### Consent Banner

```typescript
// components/analytics/consent-banner.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAnalytics } from './analytics-provider';
import { Button } from '@/components/ui/button';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const { setConsent } = useAnalytics();

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    if (consent === null) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          We use analytics to improve your experience. 
          Your data is never sold to third parties.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Event Tracking Examples

```typescript
// components/examples/tracked-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useTrackClick } from '@/hooks/use-track-event';

export function TrackedButton({ 
  children, 
  trackingName,
  ...props 
}: React.ComponentProps<typeof Button> & { trackingName: string }) {
  const trackClick = useTrackClick(trackingName);

  return (
    <Button {...props} onClick={(e) => {
      trackClick(e);
      props.onClick?.(e);
    }}>
      {children}
    </Button>
  );
}

// Usage
// <TrackedButton trackingName="cta_hero_click">Get Started</TrackedButton>
```

```typescript
// components/examples/tracked-form.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTrackForm } from '@/hooks/use-track-event';

export function NewsletterForm() {
  const { trackStart, trackField, trackSubmit, trackAbandon } = useTrackForm('newsletter');
  const form = useForm({ defaultValues: { email: '' } });

  // Track form start
  useEffect(() => {
    trackStart();
    
    // Track abandon on unmount if not submitted
    return () => {
      if (!form.formState.isSubmitted) {
        trackAbandon();
      }
    };
  }, []);

  const onSubmit = async (data: { email: string }) => {
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      trackSubmit(true);
    } catch {
      trackSubmit(false, { error: 'submission_failed' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        {...form.register('email')}
        onBlur={() => trackField('email')}
        placeholder="Enter your email"
      />
      <button type="submit">Subscribe</button>
    </form>
  );
}
```

### Database Schema

```prisma
// prisma/schema.prisma
model AnalyticsEvent {
  id          String   @id @default(cuid())
  name        String
  category    String
  properties  Json?
  anonymousId String
  userId      String?
  sessionId   String?
  page        String?
  userAgent   String?
  country     String?
  city        String?
  timestamp   DateTime

  @@index([name, timestamp])
  @@index([category, timestamp])
  @@index([anonymousId])
  @@index([userId])
  @@index([sessionId])
}
```

## Variants

### Posthog Integration

```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js';

export function initPosthog() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // We handle this ourselves
    });
  }
}

export function trackPosthog(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}
```

## Anti-patterns

1. **Tracking without consent** - Always get user consent first
2. **Storing PII** - Hash or anonymize personal identifiers
3. **Too many events** - Focus on actionable metrics
4. **No session context** - Always include session for user journey analysis
5. **Blocking the main thread** - Use sendBeacon and async processing

## Related Skills

- [[web-vitals]] - Performance monitoring
- [[observability]] - System observability
- [[cookies]] - Cookie management for consent

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial user analytics pattern with consent and event tracking
