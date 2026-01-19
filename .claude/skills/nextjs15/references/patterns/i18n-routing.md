---
id: pt-i18n-routing
name: Internationalization Routing Patterns
version: 2.0.0
layer: L5
category: i18n
description: Locale-based routing patterns for Next.js 15 with App Router using next-intl
tags: [i18n, routing, localization, next-intl, middleware]
composes:
  - ../molecules/action-menu.md
  - ../atoms/input-button.md
dependencies:
  next-intl: "^3.25.0"
formula: next-intl + Middleware + [locale] Routes + Language Switcher = Multi-Language Application
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

- Building a multi-language website or application that needs to support multiple locales
- Implementing locale-based URL prefixing for SEO optimization (/en/about, /es/about)
- Creating a language switcher component that persists user preferences
- Setting up locale detection based on browser settings or cookies
- Generating locale-specific metadata for search engines

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     I18N ROUTING PATTERN                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Request    │───▶│  Middleware  │───▶│   Locale     │      │
│  │              │    │  Detection   │    │   Redirect   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                    │              │
│         ▼                   ▼                    ▼              │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              app/[locale]/layout.tsx                  │      │
│  │  ┌────────────────────────────────────────────────┐  │      │
│  │  │         NextIntlClientProvider                 │  │      │
│  │  │  ┌─────────────┐  ┌─────────────────────────┐ │  │      │
│  │  │  │  Messages   │  │    Page Components      │ │  │      │
│  │  │  │  (JSON)     │  │  useTranslations()      │ │  │      │
│  │  │  └─────────────┘  └─────────────────────────┘ │  │      │
│  │  └────────────────────────────────────────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Language Switcher                        │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │      │
│  │  │  Dropdown   │  │   Cookie    │  │   Router    │   │      │
│  │  │  Menu       │  │   Update    │  │   Push      │   │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Internationalization Routing Patterns

## Overview

Internationalization (i18n) routing enables serving content in multiple languages with proper URL structures. This pattern covers locale detection, URL prefixing, and seamless navigation between languages.

## Implementation

### Next.js Configuration

```typescript
// next.config.ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  // Other config...
};

export default withNextIntl(nextConfig);
```

### i18n Configuration

```typescript
// i18n/config.ts
export const locales = ["en", "es", "fr", "de", "ja", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  zh: "中文",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  ja: "🇯🇵",
  zh: "🇨🇳",
};

// RTL languages
export const rtlLocales: Locale[] = [];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./config";

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  const validLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: "UTC",
    now: new Date(),
  };
});
```

### Middleware for Locale Detection

```typescript
// middleware.ts
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/config";

export default createMiddleware({
  // Supported locales
  locales,
  
  // Default locale when no match
  defaultLocale,
  
  // Locale prefix strategy
  localePrefix: "as-needed", // or "always" | "never"
  
  // Locale detection from Accept-Language header
  localeDetection: true,
  
  // Alternate links for SEO
  alternateLinks: true,
  
  // Cookie name for locale preference
  localeCookie: "NEXT_LOCALE",
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - Static files (e.g. /favicon.ico)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
```

### App Directory Structure

```
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   └── products/
│       └── page.tsx
├── api/
│   └── ...
└── globals.css
```

### Root Layout with Locale

```typescript
// app/[locale]/layout.tsx
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { locales, isRtl, type Locale } from "@/i18n/config";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Get messages for client components
  const messages = await getMessages();

  return (
    <html lang={locale} dir={isRtl(locale as Locale) ? "rtl" : "ltr"}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Page with Translations

```typescript
// app/[locale]/page.tsx
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/components/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{t("heading")}</h1>
      <p className="text-lg text-muted-foreground mb-8">
        {t("subheading")}
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/about"
          className="block p-6 border rounded-lg hover:border-primary"
        >
          <h2 className="text-xl font-semibold">{t("cards.about.title")}</h2>
          <p className="text-muted-foreground">
            {t("cards.about.description")}
          </p>
        </Link>

        <Link
          href="/blog"
          className="block p-6 border rounded-lg hover:border-primary"
        >
          <h2 className="text-xl font-semibold">{t("cards.blog.title")}</h2>
          <p className="text-muted-foreground">
            {t("cards.blog.description")}
          </p>
        </Link>

        <Link
          href="/products"
          className="block p-6 border rounded-lg hover:border-primary"
        >
          <h2 className="text-xl font-semibold">{t("cards.products.title")}</h2>
          <p className="text-muted-foreground">
            {t("cards.products.description")}
          </p>
        </Link>
      </div>
    </main>
  );
}
```

### Locale-Aware Link Component

```typescript
// components/link.tsx
import NextLink from "next/link";
import { useLocale } from "next-intl";
import { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof NextLink>;

export function Link({ href, ...props }: LinkProps) {
  const locale = useLocale();

  // Handle string hrefs
  const localizedHref =
    typeof href === "string"
      ? href.startsWith("/")
        ? `/${locale}${href}`
        : href
      : {
          ...href,
          pathname: href.pathname?.startsWith("/")
            ? `/${locale}${href.pathname}`
            : href.pathname,
        };

  return <NextLink href={localizedHref} {...props} />;
}

// Alternative: Using next-intl's Link
// components/navigation.tsx
import { Link } from "next-intl";

export function Navigation() {
  return (
    <nav>
      {/* Automatically handles locale prefix */}
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  );
}
```

### Language Switcher

```typescript
// components/language-switcher.tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    
    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {localeFlags[locale]} {localeNames[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={loc === locale ? "bg-accent" : ""}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Server Actions with Locale

```typescript
// app/actions/set-locale.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export async function setLocale(locale: Locale, pathname: string) {
  if (!locales.includes(locale)) {
    throw new Error("Invalid locale");
  }

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  // Redirect to new locale
  const newPathname = pathname.replace(/^\/[a-z]{2}/, "") || "/";
  redirect(`/${locale}${newPathname}`);
}
```

### Message Files Structure

```json
// messages/en.json
{
  "Metadata": {
    "title": "My App",
    "siteName": "My App",
    "description": "A great application"
  },
  "HomePage": {
    "title": "Welcome",
    "heading": "Welcome to My App",
    "subheading": "Build something amazing today",
    "cards": {
      "about": {
        "title": "About Us",
        "description": "Learn more about our mission"
      },
      "blog": {
        "title": "Blog",
        "description": "Read our latest articles"
      },
      "products": {
        "title": "Products",
        "description": "Explore our offerings"
      }
    }
  },
  "Navigation": {
    "home": "Home",
    "about": "About",
    "blog": "Blog",
    "contact": "Contact"
  },
  "Common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  }
}

// messages/es.json
{
  "Metadata": {
    "title": "Mi App",
    "siteName": "Mi App",
    "description": "Una gran aplicación"
  },
  "HomePage": {
    "title": "Bienvenido",
    "heading": "Bienvenido a Mi App",
    "subheading": "Construye algo increíble hoy",
    "cards": {
      "about": {
        "title": "Sobre Nosotros",
        "description": "Conoce más sobre nuestra misión"
      },
      "blog": {
        "title": "Blog",
        "description": "Lee nuestros últimos artículos"
      },
      "products": {
        "title": "Productos",
        "description": "Explora nuestras ofertas"
      }
    }
  }
}
```

## Variants

### Domain-Based Routing

```typescript
// middleware.ts
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "de"],
  defaultLocale: "en",
  
  // Domain-based routing
  domains: [
    {
      domain: "example.com",
      defaultLocale: "en",
    },
    {
      domain: "example.de",
      defaultLocale: "de",
    },
  ],
});
```

### Locale from Database/User Preference

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

export async function middleware(request: NextRequest) {
  // Check for user preference in cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  
  // Then check Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language");
  const browserLocale = acceptLanguage?.split(",")[0]?.split("-")[0];
  
  // Determine locale
  const locale = 
    (cookieLocale && locales.includes(cookieLocale as any) ? cookieLocale : null) ||
    (browserLocale && locales.includes(browserLocale as any) ? browserLocale : null) ||
    defaultLocale;

  // Continue with locale
  // ...
}
```

## Anti-patterns

1. **Hardcoded strings**: Text directly in components instead of translation files
2. **Missing translations**: Incomplete translation coverage
3. **No fallback**: Missing default locale handling
4. **SEO ignored**: Missing hreflang tags
5. **No locale persistence**: Losing preference on navigation

## Related Skills

- `L5/patterns/translations` - Translation management
- `L5/patterns/locale-detection` - Detecting user locale
- `L5/patterns/date-formatting` - Locale-aware dates
- `L5/patterns/number-formatting` - Locale-aware numbers

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with next-intl for Next.js 15
