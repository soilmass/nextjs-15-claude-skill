---
id: pt-deep-linking
name: Deep Linking
version: 2.1.0
layer: L5
category: routing
description: Mobile deep linking and universal links implementation
tags: [deep-linking, universal-links, mobile, app-links, routing]
composes: []
dependencies: []
formula: "Deep Link = Universal Link Config + App Association Files + Redirect Handler + Fallback Web UI"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Deep Linking

## When to Use

- **Native app integration**: Bridge web and mobile app experiences
- **Shareable content**: Enable sharing that opens in app when installed
- **Marketing campaigns**: Track and route users from external sources
- **Push notification actions**: Deep link from notification taps
- **QR code scanning**: Direct scanning to specific app content

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Deep Linking Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User taps link: https://app.com/product/123                │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Platform Detection                        │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ Is Mobile? ────────────────────────┐          │  │   │
│  │  │     │                              │          │  │   │
│  │  │     ▼                              ▼          │  │   │
│  │  │   YES                             NO          │  │   │
│  │  │     │                              │          │  │   │
│  │  │     ▼                              ▼          │  │   │
│  │  │ ┌─────────────┐            ┌─────────────┐   │  │   │
│  │  │ │ /open/...   │            │ /product/   │   │  │   │
│  │  │ │ redirect    │            │ [id]/page   │   │  │   │
│  │  │ └──────┬──────┘            └─────────────┘   │  │   │
│  │  │        │                                      │  │   │
│  │  │        ▼                                      │  │   │
│  │  │ ┌─────────────────────────────────────────┐  │  │   │
│  │  │ │ Try: myapp://product/123               │  │  │   │
│  │  │ │                                         │  │  │   │
│  │  │ │  ┌──────────┐        ┌──────────────┐  │  │  │   │
│  │  │ │  │ App      │        │ App Not      │  │  │  │   │
│  │  │ │  │ Installed │        │ Installed    │  │  │  │   │
│  │  │ │  │    │     │        │      │       │  │  │  │   │
│  │  │ │  │    ▼     │        │      ▼       │  │  │  │   │
│  │  │ │  │ Opens App│        │ App Store /  │  │  │  │   │
│  │  │ │  │ to page  │        │ Web Fallback │  │  │  │   │
│  │  │ │  └──────────┘        └──────────────┘  │  │  │   │
│  │  │ └─────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Required Files:                                            │
│  ├── /.well-known/apple-app-site-association (iOS)         │
│  └── /.well-known/assetlinks.json (Android)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Overview

A comprehensive deep linking implementation for connecting web and mobile apps, supporting Universal Links (iOS), App Links (Android), and custom URL schemes.

## Implementation

### Apple App Site Association

```json
// public/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourcompany.app",
        "paths": [
          "/product/*",
          "/user/*",
          "/invite/*",
          "/share/*",
          "/open/*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["TEAMID.com.yourcompany.app"]
  }
}
```

### Android Asset Links

```json
// public/.well-known/assetlinks.json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.yourcompany.app",
      "sha256_cert_fingerprints": [
        "AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90"
      ]
    }
  }
]
```

### Deep Link Handler

```tsx
// lib/deep-links/deep-link-handler.ts
export interface DeepLinkConfig {
  iosAppStoreId: string;
  androidPackageName: string;
  customScheme: string; // e.g., 'myapp://'
  webDomain: string;
}

export interface DeepLinkParams {
  path: string;
  params?: Record<string, string>;
  fallbackUrl?: string;
}

export function generateDeepLink(
  config: DeepLinkConfig,
  { path, params, fallbackUrl }: DeepLinkParams
): string {
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';

  // Use universal link format for web sharing
  return `https://${config.webDomain}${path}${queryString}`;
}

export function generateAppLink(
  config: DeepLinkConfig,
  { path, params }: DeepLinkParams
): string {
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';

  return `${config.customScheme}${path}${queryString}`;
}

export function getAppStoreUrl(config: DeepLinkConfig, platform: 'ios' | 'android'): string {
  if (platform === 'ios') {
    return `https://apps.apple.com/app/id${config.iosAppStoreId}`;
  }
  return `https://play.google.com/store/apps/details?id=${config.androidPackageName}`;
}
```

### Smart App Banner

```tsx
// components/deep-links/smart-app-banner.tsx
import Head from 'next/head';

interface SmartAppBannerProps {
  appId: string;
  appArgument?: string;
}

export function SmartAppBanner({ appId, appArgument }: SmartAppBannerProps) {
  return (
    <Head>
      <meta
        name="apple-itunes-app"
        content={`app-id=${appId}${appArgument ? `, app-argument=${appArgument}` : ''}`}
      />
    </Head>
  );
}

// Usage in page
export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <>
      <SmartAppBanner
        appId="123456789"
        appArgument={`https://yourapp.com/product/${params.id}`}
      />
      {/* Page content */}
    </>
  );
}
```

### Open in App Component

```tsx
// components/deep-links/open-in-app.tsx
'use client';

import { useState, useEffect } from 'react';
import { Smartphone, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpenInAppProps {
  appName: string;
  appIcon: string;
  deepLink: string;
  iosAppStoreUrl: string;
  androidPlayStoreUrl: string;
}

export function OpenInApp({
  appName,
  appIcon,
  deepLink,
  iosAppStoreUrl,
  androidPlayStoreUrl,
}: OpenInAppProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }

    // Check if banner was dismissed
    const dismissed = sessionStorage.getItem('open-in-app-dismissed');
    if (!dismissed && platform) {
      setShowBanner(true);
    }
  }, [platform]);

  const handleOpenApp = () => {
    // Try to open the app
    window.location.href = deepLink;

    // If app doesn't open after timeout, redirect to store
    setTimeout(() => {
      const storeUrl = platform === 'ios' ? iosAppStoreUrl : androidPlayStoreUrl;
      window.location.href = storeUrl;
    }, 2000);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('open-in-app-dismissed', 'true');
  };

  if (!platform) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={appIcon}
                alt={appName}
                className="h-12 w-12 rounded-xl"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {appName}
                </p>
                <p className="text-sm text-gray-500">
                  Open in the {appName} app
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenApp}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Deep Link Redirect Page

```tsx
// app/open/[...path]/page.tsx
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DeepLinkRedirect } from '@/components/deep-links/deep-link-redirect';

interface OpenPageProps {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string>>;
}

export default async function OpenPage({ params, searchParams }: OpenPageProps) {
  const { path } = await params;
  const query = await searchParams;
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  const targetPath = '/' + path.join('/');
  const queryString = new URLSearchParams(query).toString();
  const fullPath = queryString ? `${targetPath}?${queryString}` : targetPath;

  // Detect if request is from a mobile device
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);

  if (!isMobile) {
    // Redirect desktop users directly to web content
    redirect(fullPath);
  }

  // For mobile, show the deep link redirect component
  return (
    <DeepLinkRedirect
      webUrl={fullPath}
      deepLink={`myapp://${path.join('/')}${queryString ? `?${queryString}` : ''}`}
      appName="MyApp"
      appIcon="/app-icon.png"
    />
  );
}
```

### Deep Link Redirect Component

```tsx
// components/deep-links/deep-link-redirect.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Globe, Loader2 } from 'lucide-react';

interface DeepLinkRedirectProps {
  webUrl: string;
  deepLink: string;
  appName: string;
  appIcon: string;
}

export function DeepLinkRedirect({
  webUrl,
  deepLink,
  appName,
  appIcon,
}: DeepLinkRedirectProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'trying' | 'failed' | 'success'>('trying');

  useEffect(() => {
    // Try to open the app
    const appOpenTime = Date.now();
    window.location.href = deepLink;

    // Check if app opened
    const checkAppOpened = setTimeout(() => {
      // If we're still here after 2 seconds, the app didn't open
      if (Date.now() - appOpenTime > 1500) {
        setStatus('failed');
      }
    }, 2000);

    // Listen for visibility change (app opening hides the page)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setStatus('success');
        clearTimeout(checkAppOpened);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(checkAppOpened);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [deepLink]);

  const handleContinueToWeb = () => {
    router.push(webUrl);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-sm text-center">
        <img
          src={appIcon}
          alt={appName}
          className="mx-auto mb-6 h-20 w-20 rounded-2xl shadow-lg"
        />

        {status === 'trying' && (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Opening {appName}...
            </h1>
            <p className="mt-2 text-gray-500">
              If the app doesn't open automatically, tap below.
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              App not installed
            </h1>
            <p className="mt-2 text-gray-500">
              You can download {appName} or continue on the web.
            </p>
          </>
        )}

        <div className="mt-8 space-y-3">
          <a
            href={deepLink}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Smartphone className="h-5 w-5" />
            Open in App
          </a>

          <button
            onClick={handleContinueToWeb}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Globe className="h-5 w-5" />
            Continue on Web
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Share with Deep Link

```tsx
// components/deep-links/share-deep-link.tsx
'use client';

import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareDeepLinkProps {
  title: string;
  text?: string;
  url: string;
}

export function ShareDeepLink({ title, text, url }: ShareDeepLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      <button
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}
```

### Route Handler for Deep Links

```tsx
// app/api/deep-link/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '/';
  const params = Object.fromEntries(searchParams.entries());
  delete params.path;

  const queryString = new URLSearchParams(params).toString();
  const redirectUrl = queryString ? `${path}?${queryString}` : path;

  // Check for mobile user agent
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);

  if (isMobile) {
    // Redirect to app open page
    return NextResponse.redirect(
      new URL(`/open${redirectUrl}`, request.url)
    );
  }

  // Direct redirect for desktop
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
```

## Usage

```tsx
// Add smart app banner to pages
import { SmartAppBanner } from '@/components/deep-links/smart-app-banner';

export default function ProductPage({ params }) {
  return (
    <>
      <SmartAppBanner
        appId="123456789"
        appArgument={`https://yourapp.com/product/${params.id}`}
      />
      {/* Content */}
    </>
  );
}

// Generate shareable deep links
import { generateDeepLink } from '@/lib/deep-links/deep-link-handler';

const shareUrl = generateDeepLink(config, {
  path: `/product/${productId}`,
  params: { ref: 'share' },
});

// Add open in app banner
import { OpenInApp } from '@/components/deep-links/open-in-app';

function Layout({ children }) {
  return (
    <>
      <OpenInApp
        appName="MyApp"
        appIcon="/app-icon.png"
        deepLink={`myapp://current-path`}
        iosAppStoreUrl="https://apps.apple.com/app/id123456789"
        androidPlayStoreUrl="https://play.google.com/store/apps/details?id=com.myapp"
      />
      {children}
    </>
  );
}
```

## Related Skills

- [L5/share-api](./share-api.md) - Web Share API
- [L3/social-share](../organisms/social-share.md) - Social sharing
- [L5/push-notifications](./push-notifications.md) - Push notifications

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with universal/app links support
