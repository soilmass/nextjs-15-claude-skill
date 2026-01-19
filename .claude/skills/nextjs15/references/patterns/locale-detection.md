---
id: pt-locale-detection
name: Locale Detection Patterns
version: 2.0.0
layer: L5
category: i18n
description: Detecting and persisting user locale preferences from various sources
tags: [i18n, locale, detection, geolocation, preferences]
composes: []
dependencies:
  next-intl: "^3.25.0"
formula: Accept-Language + Geolocation + Cookie + User Preference = Optimal Locale Selection
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Automatically detecting user language from browser Accept-Language header
- Using geolocation to infer locale preferences from country codes
- Persisting user locale choices across sessions with cookies
- Syncing locale preferences with authenticated user accounts
- Building smart language switchers with region grouping

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOCALE DETECTION                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Detection Priority Chain                 │      │
│  │                                                       │      │
│  │  ┌──────────────────────────────────────────────┐    │      │
│  │  │  1. Cookie Preference  ──────────────────┐   │    │      │
│  │  │     NEXT_LOCALE=es                       │   │    │      │
│  │  └──────────────────────────────────────────│───┘    │      │
│  │                                             │         │      │
│  │  ┌──────────────────────────────────────────│───┐    │      │
│  │  │  2. Accept-Language Header  ─────────────┤   │    │      │
│  │  │     en-US,en;q=0.9,es;q=0.8             │   │    │      │
│  │  └──────────────────────────────────────────│───┘    │      │
│  │                                             │         │      │
│  │  ┌──────────────────────────────────────────│───┐    │      │
│  │  │  3. Geolocation (IP/Vercel)  ────────────┤   │    │      │
│  │  │     Country: DE → Locale: de             │   │    │      │
│  │  └──────────────────────────────────────────│───┘    │      │
│  │                                             │         │      │
│  │  ┌──────────────────────────────────────────│───┐    │      │
│  │  │  4. User Account Preference  ────────────┤   │    │      │
│  │  │     user.preferredLocale                 │   │    │      │
│  │  └──────────────────────────────────────────│───┘    │      │
│  │                                             ▼         │      │
│  │  ┌──────────────────────────────────────────────┐    │      │
│  │  │  5. Default Locale Fallback                  │    │      │
│  │  │     defaultLocale = "en"                     │    │      │
│  │  └──────────────────────────────────────────────┘    │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Persistence                         │      │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────┐  │      │
│  │  │   Cookie    │  │ localStorage│  │   Database   │  │      │
│  │  │ (1 year)    │  │  (client)   │  │   (user)     │  │      │
│  │  └─────────────┘  └────────────┘  └──────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Locale Detection Patterns

## Overview

Locale detection determines the best language/region for users based on various signals: browser settings, IP geolocation, user preferences, and URL patterns. This pattern covers detection strategies and preference persistence.

## Implementation

### Comprehensive Locale Detection Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

const LOCALE_COOKIE = "NEXT_LOCALE";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Detect locale from various sources
  const detectedLocale = detectLocale(request);

  // Redirect to localized URL
  const newUrl = new URL(`/${detectedLocale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  const response = NextResponse.redirect(newUrl);

  // Persist detected locale
  response.cookies.set(LOCALE_COOKIE, detectedLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return response;
}

function detectLocale(request: NextRequest): Locale {
  // Priority 1: User preference cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // Priority 2: Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage) {
    const browserLocale = parseAcceptLanguage(acceptLanguage);
    if (browserLocale) {
      return browserLocale;
    }
  }

  // Priority 3: Geolocation (Vercel provides this)
  const country = request.geo?.country;
  if (country) {
    const geoLocale = countryToLocale(country);
    if (geoLocale) {
      return geoLocale;
    }
  }

  // Fallback to default
  return defaultLocale;
}

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

function parseAcceptLanguage(header: string): Locale | null {
  // Parse Accept-Language header: "en-US,en;q=0.9,es;q=0.8"
  const languages = header
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code?.split("-")[0]?.toLowerCase() || "",
        quality: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    if (isValidLocale(code)) {
      return code;
    }
  }

  return null;
}

function countryToLocale(country: string): Locale | null {
  const countryLocaleMap: Record<string, Locale> = {
    US: "en",
    GB: "en",
    AU: "en",
    CA: "en",
    ES: "es",
    MX: "es",
    AR: "es",
    FR: "fr",
    BE: "fr",
    DE: "de",
    AT: "de",
    CH: "de",
    JP: "ja",
    CN: "zh",
    TW: "zh",
  };

  return countryLocaleMap[country] || null;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
```

### Client-Side Locale Detection

```typescript
// lib/detect-client-locale.ts
import { locales, defaultLocale, type Locale } from "@/i18n/config";

export function detectClientLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  // Priority 1: localStorage preference
  const storedLocale = localStorage.getItem("preferredLocale");
  if (storedLocale && isValidLocale(storedLocale)) {
    return storedLocale;
  }

  // Priority 2: Browser language
  const browserLang = navigator.language.split("-")[0];
  if (browserLang && isValidLocale(browserLang)) {
    return browserLang;
  }

  // Priority 3: Navigator languages array
  for (const lang of navigator.languages) {
    const code = lang.split("-")[0];
    if (code && isValidLocale(code)) {
      return code;
    }
  }

  return defaultLocale;
}

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
```

### Locale Provider with Persistence

```typescript
// contexts/locale-context.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isChanging: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isChanging, setIsChanging] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      if (newLocale === locale || !locales.includes(newLocale)) {
        return;
      }

      setIsChanging(true);

      // Update cookie via API route
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });

      // Update localStorage
      localStorage.setItem("preferredLocale", newLocale);

      // Navigate to new locale
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPathname);

      setLocaleState(newLocale);
      setIsChanging(false);
    },
    [locale, pathname, router]
  );

  // Sync with server on mount
  useEffect(() => {
    const storedLocale = localStorage.getItem("preferredLocale");
    if (storedLocale && storedLocale !== locale && locales.includes(storedLocale as Locale)) {
      // Server and client disagree, update to client preference
      setLocale(storedLocale as Locale);
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isChanging }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleContext must be used within LocaleProvider");
  }
  return context;
}
```

### API Route for Locale Preference

```typescript
// app/api/locale/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { locales, type Locale } from "@/i18n/config";

const schema = z.object({
  locale: z.enum(locales as [Locale, ...Locale[]]),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid locale" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });

  // Set locale cookie
  response.cookies.set("NEXT_LOCALE", result.data.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false, // Allow client-side access
  });

  return response;
}
```

### Locale Detection with User Account

```typescript
// lib/auth-locale.ts
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type Locale, defaultLocale } from "@/i18n/config";

export async function getAuthenticatedUserLocale(): Promise<Locale> {
  const session = await getSession();

  if (!session?.userId) {
    return defaultLocale;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { preferredLocale: true },
  });

  return (user?.preferredLocale as Locale) || defaultLocale;
}

export async function updateUserLocale(userId: string, locale: Locale) {
  await prisma.user.update({
    where: { id: userId },
    data: { preferredLocale: locale },
  });
}

// Server action
// app/actions/locale.ts
"use server";

import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { updateUserLocale } from "@/lib/auth-locale";
import { locales, type Locale } from "@/i18n/config";

export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    throw new Error("Invalid locale");
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // Update user preference if authenticated
  const session = await getSession();
  if (session?.userId) {
    await updateUserLocale(session.userId, locale);
  }
}
```

### Intelligent Language Switcher

```typescript
// components/smart-language-switcher.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/app/actions/locale";

export function SmartLanguageSwitcher() {
  const t = useTranslations("Navigation");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = async (newLocale: Locale) => {
    // Update server-side
    await setUserLocale(newLocale);

    // Navigate to new locale
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
    router.refresh();
  };

  // Group locales by region
  const localeGroups = {
    americas: ["en", "es"] as Locale[],
    europe: ["fr", "de"] as Locale[],
    asia: ["ja", "zh"] as Locale[],
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeFlags[locale]} {localeNames[locale]}
          </span>
          <span className="sm:hidden">{localeFlags[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(localeGroups).map(([region, regionLocales], index) => (
          <div key={region}>
            {index > 0 && <DropdownMenuSeparator />}
            {regionLocales
              .filter((l) => locales.includes(l))
              .map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className="flex items-center justify-between"
                >
                  <span>
                    {localeFlags[loc]} {localeNames[loc]}
                  </span>
                  {loc === locale && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Region-Specific Content

```typescript
// lib/region-content.ts
import { headers } from "next/headers";
import { type Locale } from "@/i18n/config";

interface RegionConfig {
  currency: string;
  measurementSystem: "metric" | "imperial";
  dateFormat: "MDY" | "DMY" | "YMD";
  timezone: string;
}

const regionConfigs: Record<string, RegionConfig> = {
  US: {
    currency: "USD",
    measurementSystem: "imperial",
    dateFormat: "MDY",
    timezone: "America/New_York",
  },
  GB: {
    currency: "GBP",
    measurementSystem: "metric",
    dateFormat: "DMY",
    timezone: "Europe/London",
  },
  DE: {
    currency: "EUR",
    measurementSystem: "metric",
    dateFormat: "DMY",
    timezone: "Europe/Berlin",
  },
  JP: {
    currency: "JPY",
    measurementSystem: "metric",
    dateFormat: "YMD",
    timezone: "Asia/Tokyo",
  },
};

const defaultConfig: RegionConfig = {
  currency: "USD",
  measurementSystem: "metric",
  dateFormat: "DMY",
  timezone: "UTC",
};

export async function getRegionConfig(): Promise<RegionConfig> {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";

  return regionConfigs[country] || defaultConfig;
}
```

## Variants

### A/B Testing with Locale

```typescript
// middleware.ts - Locale-based feature flags
const localeFeatures: Record<Locale, string[]> = {
  en: ["feature-a", "feature-b"],
  es: ["feature-a"],
  // ...
};

export function getLocaleFeatures(locale: Locale): string[] {
  return localeFeatures[locale] || [];
}
```

## Anti-patterns

1. **Ignoring user preference**: Always using auto-detection
2. **No persistence**: Re-detecting on every visit
3. **Blocking on detection**: Slow page loads for geolocation
4. **Hard redirects**: Not preserving URL intent
5. **Missing fallbacks**: Breaking when detection fails

## Related Skills

- `L5/patterns/i18n-routing` - Locale-based routing
- `L5/patterns/translations` - Translation management
- `L5/patterns/middleware` - Middleware patterns
- `L5/patterns/cookies` - Cookie management

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with multi-source detection
