---
id: pt-device-detection
name: Device Detection
version: 1.0.0
layer: L5
category: utilities
description: Device and browser detection for responsive and conditional rendering
tags: [device, browser, detection, responsive, user-agent, next15]
composes: []
dependencies: []
formula: "DeviceDetection = UserAgent + MediaQueries + FeatureDetection + SSRCompatibility"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Device Detection

## When to Use

- Serving optimized content per device
- Browser-specific workarounds
- Mobile vs desktop layouts
- Feature availability checks
- Analytics and tracking

## Composition Diagram

```
Device Detection Flow
=====================

Server-Side (SSR):
+------------------------------------------+
|  Request Headers                         |
|  - User-Agent parsing                    |
|  - Client hints (if available)           |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Device Context Provider                 |
|  - Initial device state                  |
|  - Hydration sync                        |
+------------------------------------------+

Client-Side:
+------------------------------------------+
|  Media Queries                           |
|  - Screen dimensions                     |
|  - Device capabilities                   |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Feature Detection                       |
|  - Browser APIs                          |
|  - Touch support                         |
+------------------------------------------+
```

## Server-Side Detection

```typescript
// lib/device/server-detection.ts
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBot: boolean;
  browser: {
    name: string | undefined;
    version: string | undefined;
  };
  os: {
    name: string | undefined;
    version: string | undefined;
  };
  device: {
    type: string | undefined;
    vendor: string | undefined;
    model: string | undefined;
  };
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const deviceType = result.device.type;
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = !isMobile && !isTablet;

  // Bot detection
  const botPatterns = [
    /bot/i,
    /spider/i,
    /crawl/i,
    /slurp/i,
    /googlebot/i,
    /bingbot/i,
  ];
  const isBot = botPatterns.some((pattern) => pattern.test(userAgent));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isBot,
    browser: {
      name: result.browser.name,
      version: result.browser.version,
    },
    os: {
      name: result.os.name,
      version: result.os.version,
    },
    device: {
      type: deviceType,
      vendor: result.device.vendor,
      model: result.device.model,
    },
  };
}

// Client hints (more accurate but not universally supported)
export async function getClientHints() {
  const headersList = await headers();

  return {
    mobile: headersList.get('sec-ch-ua-mobile') === '?1',
    platform: headersList.get('sec-ch-ua-platform')?.replace(/"/g, ''),
    brands: headersList.get('sec-ch-ua'),
  };
}
```

## Device Context Provider

```typescript
// providers/device-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { DeviceInfo } from '@/lib/device/server-detection';

interface DeviceContextType extends DeviceInfo {
  isClient: boolean;
  screenWidth: number;
  screenHeight: number;
  hasTouch: boolean;
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
}

const DeviceContext = createContext<DeviceContextType | null>(null);

interface DeviceProviderProps {
  children: ReactNode;
  initialDeviceInfo: DeviceInfo;
}

export function DeviceProvider({ children, initialDeviceInfo }: DeviceProviderProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceContextType>({
    ...initialDeviceInfo,
    isClient: false,
    screenWidth: 0,
    screenHeight: 0,
    hasTouch: false,
    prefersReducedMotion: false,
    prefersDarkMode: false,
  });

  useEffect(() => {
    // Client-side detection
    const updateDeviceInfo = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

      const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const prefersDarkMode =
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Re-evaluate mobile based on screen width
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth < 768;
      const isTablet = screenWidth >= 768 && screenWidth < 1024;
      const isDesktop = screenWidth >= 1024;

      setDeviceInfo((prev) => ({
        ...prev,
        isClient: true,
        isMobile,
        isTablet,
        isDesktop,
        screenWidth,
        screenHeight: window.innerHeight,
        hasTouch,
        prefersReducedMotion,
        prefersDarkMode,
      }));
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);

    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return (
    <DeviceContext.Provider value={deviceInfo}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider');
  }
  return context;
}
```

## Layout Integration

```typescript
// app/layout.tsx
import { DeviceProvider } from '@/providers/device-provider';
import { getDeviceInfo } from '@/lib/device/server-detection';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const deviceInfo = await getDeviceInfo();

  return (
    <html lang="en">
      <body>
        <DeviceProvider initialDeviceInfo={deviceInfo}>
          {children}
        </DeviceProvider>
      </body>
    </html>
  );
}
```

## Media Query Hook

```typescript
// hooks/use-media-query.ts
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Convenience hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}
```

## Feature Detection Hook

```typescript
// hooks/use-feature-detection.ts
'use client';

import { useState, useEffect } from 'react';

interface FeatureSupport {
  webGL: boolean;
  webP: boolean;
  avif: boolean;
  serviceWorker: boolean;
  pushNotifications: boolean;
  geolocation: boolean;
  clipboard: boolean;
  share: boolean;
  bluetooth: boolean;
  webRTC: boolean;
}

export function useFeatureDetection(): FeatureSupport {
  const [features, setFeatures] = useState<FeatureSupport>({
    webGL: false,
    webP: false,
    avif: false,
    serviceWorker: false,
    pushNotifications: false,
    geolocation: false,
    clipboard: false,
    share: false,
    bluetooth: false,
    webRTC: false,
  });

  useEffect(() => {
    const detectFeatures = async () => {
      // WebGL
      const canvas = document.createElement('canvas');
      const webGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );

      // Image format support
      const webP = await checkImageFormat('webp');
      const avif = await checkImageFormat('avif');

      setFeatures({
        webGL,
        webP,
        avif,
        serviceWorker: 'serviceWorker' in navigator,
        pushNotifications: 'PushManager' in window,
        geolocation: 'geolocation' in navigator,
        clipboard: 'clipboard' in navigator,
        share: 'share' in navigator,
        bluetooth: 'bluetooth' in navigator,
        webRTC: 'RTCPeerConnection' in window,
      });
    };

    detectFeatures();
  }, []);

  return features;
}

async function checkImageFormat(format: 'webp' | 'avif'): Promise<boolean> {
  const testImages = {
    webp: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKBzgADlAgIGkyCR/wAABAAACvcA==',
  };

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = testImages[format];
  });
}
```

## Conditional Component Rendering

```typescript
// components/responsive/device-only.tsx
'use client';

import { useDevice } from '@/providers/device-provider';
import { ReactNode } from 'react';

interface DeviceOnlyProps {
  children: ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  touch?: boolean;
  fallback?: ReactNode;
}

export function DeviceOnly({
  children,
  mobile = false,
  tablet = false,
  desktop = false,
  touch,
  fallback = null,
}: DeviceOnlyProps) {
  const device = useDevice();

  // Wait for client-side hydration
  if (!device.isClient) {
    // Use server-side device info for initial render
    const show =
      (mobile && device.isMobile) ||
      (tablet && device.isTablet) ||
      (desktop && device.isDesktop);

    return show ? <>{children}</> : <>{fallback}</>;
  }

  let show = false;

  if (mobile && device.isMobile) show = true;
  if (tablet && device.isTablet) show = true;
  if (desktop && device.isDesktop) show = true;
  if (touch !== undefined && device.hasTouch === touch) show = true;

  return show ? <>{children}</> : <>{fallback}</>;
}

// Usage
function Navigation() {
  return (
    <>
      <DeviceOnly mobile tablet>
        <MobileNav />
      </DeviceOnly>
      <DeviceOnly desktop>
        <DesktopNav />
      </DeviceOnly>
    </>
  );
}
```

## Browser Detection Utilities

```typescript
// lib/device/browser-utils.ts
export function getBrowserInfo(userAgent: string) {
  const browsers = [
    { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
    { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
    { name: 'Safari', pattern: /Version\/(\d+).*Safari/ },
    { name: 'Edge', pattern: /Edg\/(\d+)/ },
    { name: 'Opera', pattern: /OPR\/(\d+)/ },
    { name: 'IE', pattern: /MSIE (\d+)|Trident.*rv:(\d+)/ },
  ];

  for (const browser of browsers) {
    const match = userAgent.match(browser.pattern);
    if (match) {
      return {
        name: browser.name,
        version: parseInt(match[1] || match[2], 10),
      };
    }
  }

  return { name: 'Unknown', version: 0 };
}

export function isBrowserSupported(userAgent: string): boolean {
  const browser = getBrowserInfo(userAgent);

  const minimumVersions: Record<string, number> = {
    Chrome: 90,
    Firefox: 88,
    Safari: 14,
    Edge: 90,
    Opera: 76,
  };

  const minVersion = minimumVersions[browser.name];
  if (!minVersion) return false;

  return browser.version >= minVersion;
}
```

## Server Component Device Check

```typescript
// components/server-device-check.tsx
import { getDeviceInfo } from '@/lib/device/server-detection';

export async function ServerDeviceCheck({
  mobile,
  desktop,
  children,
}: {
  mobile?: boolean;
  desktop?: boolean;
  children: React.ReactNode;
}) {
  const device = await getDeviceInfo();

  if (mobile && !device.isMobile) return null;
  if (desktop && !device.isDesktop) return null;

  return <>{children}</>;
}

// Usage in Server Component
export default async function Page() {
  return (
    <div>
      <ServerDeviceCheck desktop>
        <HeavyDesktopWidget />
      </ServerDeviceCheck>
    </div>
  );
}
```

## Anti-patterns

### Don't Rely Only on User-Agent

```typescript
// BAD - User-Agent can be spoofed
if (userAgent.includes('Mobile')) {
  showMobileUI();
}

// GOOD - Combine with screen size
const isMobile = device.isMobile || screenWidth < 768;
```

## Related Skills

- [responsive-design](./responsive-design.md)
- [ab-testing](./ab-testing.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Server-side detection
- Client-side media queries
- Feature detection
