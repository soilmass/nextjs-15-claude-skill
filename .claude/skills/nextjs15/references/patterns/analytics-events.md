---
id: pt-analytics-events
name: Analytics Events
version: 2.0.0
layer: L5
category: observability
description: Custom event tracking with multiple analytics providers
tags: [analytics, events, tracking, metrics, gtag]
composes: []
dependencies:
  @vercel/analytics: "^1.4.0"
formula: event definitions + provider abstraction + type safety = unified multi-provider analytics
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Analytics Events

## When to Use

- Applications requiring multi-provider analytics (GA4, Mixpanel, Amplitude)
- Type-safe event tracking with compile-time validation
- Automatic page view tracking in SPA navigation
- Server-side event tracking for API actions
- UTM parameter and referrer tracking

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|  User Actions     |---->|pt-analytics-events|---->|   Providers       |
| (Clicks/Forms)    |     |  (Event System)   |     | (GA/Mixpanel/etc) |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
| TrackedButton     |     | Type-Safe Events  |     |   Google          |
| TrackedLink       |     | (AnalyticsEvents) |     |   Analytics 4     |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
| pt-user-analytics |     | Auto Page Views   |     |   Mixpanel/       |
| (Session Context) |     | (Route Change)    |     |   Amplitude       |
+-------------------+     +-------------------+     +-------------------+
                                  |                        |
                                  v                        v
                          +-------------------+     +-------------------+
                          |  pt-web-vitals    |     |    PostHog        |
                          | (Performance)     |     |  (Self-hosted)    |
                          +-------------------+     +-------------------+
```

## Overview

A comprehensive analytics event tracking system supporting multiple providers (Google Analytics, Mixpanel, Amplitude) with type-safe events and automatic page view tracking.

## Implementation

### Analytics Provider

```tsx
// lib/analytics/analytics-provider.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

type AnalyticsProvider = 'gtag' | 'mixpanel' | 'amplitude' | 'posthog';

interface AnalyticsConfig {
  gtag?: { measurementId: string };
  mixpanel?: { token: string };
  amplitude?: { apiKey: string };
  posthog?: { apiKey: string; host?: string };
}

interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  plan?: string;
  [key: string]: any;
}

interface AnalyticsContextValue {
  track: (eventName: string, properties?: Record<string, any>) => void;
  identify: (userId: string, properties?: UserProperties) => void;
  page: (pageName?: string, properties?: Record<string, any>) => void;
  reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
  config: AnalyticsConfig;
  debug?: boolean;
}

export function AnalyticsProvider({
  children,
  config,
  debug = false,
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const log = useCallback(
    (message: string, data?: any) => {
      if (debug) {
        console.log(`[Analytics] ${message}`, data || '');
      }
    },
    [debug]
  );

  // Track page views
  const page = useCallback(
    (pageName?: string, properties?: Record<string, any>) => {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`;
      const name = pageName || pathname;

      log('Page view', { name, url, ...properties });

      // Google Analytics
      if (config.gtag && window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: url,
          page_title: name,
          ...properties,
        });
      }

      // Mixpanel
      if (config.mixpanel && window.mixpanel) {
        window.mixpanel.track('Page View', {
          page: name,
          url,
          ...properties,
        });
      }

      // Amplitude
      if (config.amplitude && window.amplitude) {
        window.amplitude.track('Page View', {
          page: name,
          url,
          ...properties,
        });
      }

      // PostHog
      if (config.posthog && window.posthog) {
        window.posthog.capture('$pageview', {
          $current_url: url,
          ...properties,
        });
      }
    },
    [pathname, searchParams, config, log]
  );

  // Auto-track page views on route change
  useEffect(() => {
    page();
  }, [pathname, searchParams, page]);

  // Track custom events
  const track = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      log('Track', { eventName, properties });

      // Google Analytics
      if (config.gtag && window.gtag) {
        window.gtag('event', eventName, properties);
      }

      // Mixpanel
      if (config.mixpanel && window.mixpanel) {
        window.mixpanel.track(eventName, properties);
      }

      // Amplitude
      if (config.amplitude && window.amplitude) {
        window.amplitude.track(eventName, properties);
      }

      // PostHog
      if (config.posthog && window.posthog) {
        window.posthog.capture(eventName, properties);
      }
    },
    [config, log]
  );

  // Identify user
  const identify = useCallback(
    (userId: string, properties?: UserProperties) => {
      log('Identify', { userId, properties });

      // Google Analytics
      if (config.gtag && window.gtag) {
        window.gtag('config', config.gtag.measurementId, {
          user_id: userId,
        });
        if (properties) {
          window.gtag('set', 'user_properties', properties);
        }
      }

      // Mixpanel
      if (config.mixpanel && window.mixpanel) {
        window.mixpanel.identify(userId);
        if (properties) {
          window.mixpanel.people.set(properties);
        }
      }

      // Amplitude
      if (config.amplitude && window.amplitude) {
        window.amplitude.setUserId(userId);
        if (properties) {
          window.amplitude.setUserProperties(properties);
        }
      }

      // PostHog
      if (config.posthog && window.posthog) {
        window.posthog.identify(userId, properties);
      }
    },
    [config, log]
  );

  // Reset/logout
  const reset = useCallback(() => {
    log('Reset');

    // Mixpanel
    if (config.mixpanel && window.mixpanel) {
      window.mixpanel.reset();
    }

    // Amplitude
    if (config.amplitude && window.amplitude) {
      window.amplitude.reset();
    }

    // PostHog
    if (config.posthog && window.posthog) {
      window.posthog.reset();
    }
  }, [config, log]);

  return (
    <AnalyticsContext.Provider value={{ track, identify, page, reset }}>
      {/* Google Analytics */}
      {config.gtag && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.gtag.measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.gtag.measurementId}');
            `}
          </Script>
        </>
      )}

      {/* Mixpanel */}
      {config.mixpanel && (
        <Script id="mixpanel-init" strategy="afterInteractive">
          {`
            (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
            mixpanel.init('${config.mixpanel.token}');
          `}
        </Script>
      )}

      {/* PostHog */}
      {config.posthog && (
        <Script id="posthog-init" strategy="afterInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${config.posthog.apiKey}', {api_host: '${config.posthog.host || 'https://app.posthog.com'}'});
          `}
        </Script>
      )}

      {children}
    </AnalyticsContext.Provider>
  );
}

// Type declarations for window
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    mixpanel: any;
    amplitude: any;
    posthog: any;
  }
}
```

### Type-Safe Event Tracking

```tsx
// lib/analytics/events.ts
import { useAnalytics } from './analytics-provider';
import { useCallback } from 'react';

// Define all possible events with their properties
export interface AnalyticsEvents {
  // User events
  user_signed_up: { method: 'email' | 'google' | 'github' };
  user_logged_in: { method: 'email' | 'google' | 'github' };
  user_logged_out: {};
  
  // Subscription events
  subscription_started: { plan: string; interval: 'monthly' | 'yearly'; value: number };
  subscription_cancelled: { plan: string; reason?: string };
  subscription_upgraded: { from_plan: string; to_plan: string };
  
  // Feature usage events
  feature_used: { feature_name: string; context?: string };
  search_performed: { query: string; results_count: number };
  
  // E-commerce events
  product_viewed: { product_id: string; product_name: string; price: number };
  add_to_cart: { product_id: string; quantity: number; value: number };
  checkout_started: { cart_value: number; item_count: number };
  purchase_completed: { order_id: string; value: number; item_count: number };
  
  // Engagement events
  button_clicked: { button_name: string; location: string };
  form_submitted: { form_name: string; success: boolean };
  link_clicked: { link_url: string; link_text?: string };
  modal_opened: { modal_name: string };
  modal_closed: { modal_name: string; action?: string };
}

// Type-safe tracking hook
export function useTrack() {
  const { track } = useAnalytics();

  return useCallback(
    <T extends keyof AnalyticsEvents>(
      eventName: T,
      properties: AnalyticsEvents[T]
    ) => {
      track(eventName, properties);
    },
    [track]
  );
}

// Pre-built tracking hooks for common events
export function useTrackPageView() {
  const { page } = useAnalytics();
  
  return useCallback(
    (pageName: string, properties?: Record<string, any>) => {
      page(pageName, properties);
    },
    [page]
  );
}

export function useTrackClick() {
  const track = useTrack();

  return useCallback(
    (buttonName: string, location: string) => {
      track('button_clicked', { button_name: buttonName, location });
    },
    [track]
  );
}

export function useTrackFormSubmit() {
  const track = useTrack();

  return useCallback(
    (formName: string, success: boolean) => {
      track('form_submitted', { form_name: formName, success });
    },
    [track]
  );
}
```

### Analytics Middleware

```tsx
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Track referrer
  const referrer = request.headers.get('referer');
  if (referrer) {
    response.cookies.set('analytics_referrer', referrer, {
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });
  }

  // Track UTM parameters
  const url = new URL(request.url);
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  utmParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) {
      response.cookies.set(`analytics_${param}`, value, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Click Tracking Component

```tsx
// components/analytics/tracked-link.tsx
'use client';

import Link, { LinkProps } from 'next/link';
import { ReactNode, forwardRef } from 'react';
import { useAnalytics } from '@/lib/analytics/analytics-provider';

interface TrackedLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  trackingName?: string;
  trackingProperties?: Record<string, any>;
}

export const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  ({ children, trackingName, trackingProperties, ...props }, ref) => {
    const { track } = useAnalytics();

    const handleClick = () => {
      track('link_clicked', {
        link_url: props.href.toString(),
        link_name: trackingName,
        ...trackingProperties,
      });
    };

    return (
      <Link ref={ref} {...props} onClick={handleClick}>
        {children}
      </Link>
    );
  }
);

TrackedLink.displayName = 'TrackedLink';

// Tracked button component
interface TrackedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trackingName: string;
  trackingLocation?: string;
  trackingProperties?: Record<string, any>;
}

export const TrackedButton = forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({ trackingName, trackingLocation, trackingProperties, onClick, ...props }, ref) => {
    const { track } = useAnalytics();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      track('button_clicked', {
        button_name: trackingName,
        location: trackingLocation || 'unknown',
        ...trackingProperties,
      });
      onClick?.(e);
    };

    return <button ref={ref} {...props} onClick={handleClick} />;
  }
);

TrackedButton.displayName = 'TrackedButton';
```

### Server-Side Tracking

```tsx
// lib/analytics/server.ts
interface ServerTrackingEvent {
  event: string;
  userId?: string;
  anonymousId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export async function trackServerEvent(event: ServerTrackingEvent) {
  // Send to your analytics backend
  try {
    await fetch(process.env.ANALYTICS_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ANALYTICS_API_KEY}`,
      },
      body: JSON.stringify({
        ...event,
        timestamp: event.timestamp || new Date(),
        context: {
          library: {
            name: 'nextjs-server',
            version: '1.0.0',
          },
        },
      }),
    });
  } catch (error) {
    console.error('Failed to track server event:', error);
  }
}

// Usage in API routes or Server Actions
// app/api/checkout/route.ts
import { trackServerEvent } from '@/lib/analytics/server';

export async function POST(request: Request) {
  const { userId, orderId, amount } = await request.json();

  // Process order...

  // Track server-side
  await trackServerEvent({
    event: 'purchase_completed',
    userId,
    properties: {
      order_id: orderId,
      value: amount,
    },
  });

  return Response.json({ success: true });
}
```

## Usage

```tsx
// Setup in layout
import { AnalyticsProvider } from '@/lib/analytics/analytics-provider';

export default function RootLayout({ children }) {
  return (
    <AnalyticsProvider
      config={{
        gtag: { measurementId: 'G-XXXXXXXXXX' },
        mixpanel: { token: 'your-mixpanel-token' },
      }}
      debug={process.env.NODE_ENV === 'development'}
    >
      {children}
    </AnalyticsProvider>
  );
}

// Track events in components
import { useTrack, useAnalytics } from '@/lib/analytics';

function SignupButton() {
  const track = useTrack();
  const { identify } = useAnalytics();

  const handleSignup = async (method: 'email' | 'google') => {
    const user = await signUp(method);
    
    // Identify user
    identify(user.id, {
      email: user.email,
      name: user.name,
      plan: 'free',
    });

    // Track signup
    track('user_signed_up', { method });
  };

  return <button onClick={() => handleSignup('email')}>Sign Up</button>;
}

// Use tracked components
import { TrackedButton, TrackedLink } from '@/components/analytics';

function Hero() {
  return (
    <div>
      <TrackedLink href="/pricing" trackingName="hero_pricing_link">
        View Pricing
      </TrackedLink>
      <TrackedButton trackingName="hero_cta" trackingLocation="homepage">
        Get Started
      </TrackedButton>
    </div>
  );
}
```

## Related Skills

- [L5/ab-testing](./ab-testing.md) - A/B testing
- [L5/cookie-management](./cookie-management.md) - Cookie consent
- [L3/cookie-consent](../organisms/cookie-consent.md) - Cookie banner

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with multi-provider support
