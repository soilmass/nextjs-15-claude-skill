---
id: pt-translations
name: Translation Management Patterns
version: 2.0.0
layer: L5
category: i18n
description: Managing translations with namespaces, pluralization, interpolation, and type safety
tags: [i18n, translations, localization, next-intl, type-safety]
composes: []
dependencies:
  next-intl: "^3.25.0"
formula: Message Files + Namespaces + ICU Format + Type Safety = Scalable Localization
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

- Managing translation strings across multiple languages with type safety
- Implementing pluralization rules for count-based content (1 item, 2 items)
- Using ICU message format for complex interpolation with variables
- Creating rich text translations with embedded links or formatting
- Validating translation coverage across all supported locales

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   TRANSLATION MANAGEMENT                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Message Files                       │      │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │      │
│  │  │ en.json │  │ es.json │  │ fr.json │  │ de.json │ │      │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Namespaces                          │      │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │      │
│  │  │  HomePage   │  │  Navigation  │  │   Common   │  │      │
│  │  │  Auth       │  │  Products    │  │   Errors   │  │      │
│  │  └─────────────┘  └──────────────┘  └────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                ICU Message Format                     │      │
│  │  ┌──────────────┐  ┌───────────────┐  ┌───────────┐ │      │
│  │  │ Interpolation│  │ Pluralization │  │ Rich Text │ │      │
│  │  │ {name}       │  │ {count, plural}│  │ <link>    │ │      │
│  │  └──────────────┘  └───────────────┘  └───────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               Component Usage                         │      │
│  │  ┌─────────────────┐  ┌───────────────────────────┐ │      │
│  │  │ useTranslations │  │ getTranslations (server)  │ │      │
│  │  │ t("key")        │  │ t.rich("key", {link: ...})│ │      │
│  │  └─────────────────┘  └───────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Translation Management Patterns

## Overview

Effective translation management ensures maintainable, type-safe, and scalable localization. This pattern covers namespaced messages, pluralization, rich text, and ICU message format.

## Implementation

### Type-Safe Messages

```typescript
// types/messages.ts
// Auto-generate from your default locale JSON
import en from "@/messages/en.json";

export type Messages = typeof en;
export type MessageKeys = keyof Messages;

// Or define manually for strict typing
export interface AppMessages {
  Metadata: {
    title: string;
    description: string;
    siteName: string;
  };
  Navigation: {
    home: string;
    about: string;
    blog: string;
    contact: string;
    signIn: string;
    signOut: string;
  };
  HomePage: {
    title: string;
    heading: string;
    subheading: string;
    cta: string;
    features: {
      title: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
  };
  // ... more namespaces
}

// global.d.ts
import type { AppMessages } from "@/types/messages";

declare global {
  interface IntlMessages extends AppMessages {}
}
```

### Message File Organization

```
messages/
├── en.json          # Default/source language
├── es.json
├── fr.json
├── de.json
├── ja.json
└── zh.json
```

```json
// messages/en.json - Comprehensive example
{
  "Metadata": {
    "title": "My Application",
    "description": "Build amazing things with our platform",
    "siteName": "MyApp"
  },
  
  "Navigation": {
    "home": "Home",
    "about": "About",
    "blog": "Blog",
    "products": "Products",
    "pricing": "Pricing",
    "contact": "Contact",
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "dashboard": "Dashboard"
  },
  
  "HomePage": {
    "title": "Welcome to MyApp",
    "heading": "Build Something Amazing",
    "subheading": "The all-in-one platform for modern development",
    "cta": "Get Started Free",
    "trustedBy": "Trusted by {count, number} companies worldwide",
    "features": {
      "title": "Why Choose Us",
      "performance": {
        "title": "Blazing Fast",
        "description": "Optimized for speed and performance"
      },
      "security": {
        "title": "Secure by Default",
        "description": "Enterprise-grade security built in"
      },
      "scalable": {
        "title": "Infinitely Scalable",
        "description": "Grows with your business needs"
      }
    }
  },
  
  "Auth": {
    "signIn": {
      "title": "Sign In",
      "description": "Welcome back! Please sign in to continue.",
      "email": "Email address",
      "password": "Password",
      "rememberMe": "Remember me",
      "forgotPassword": "Forgot password?",
      "submit": "Sign In",
      "noAccount": "Don't have an account?",
      "signUp": "Sign up"
    },
    "signUp": {
      "title": "Create Account",
      "description": "Join thousands of users today.",
      "name": "Full name",
      "email": "Email address",
      "password": "Password",
      "confirmPassword": "Confirm password",
      "terms": "I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>",
      "submit": "Create Account",
      "hasAccount": "Already have an account?",
      "signIn": "Sign in"
    },
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailExists": "An account with this email already exists",
      "weakPassword": "Password must be at least 8 characters",
      "required": "{field} is required"
    }
  },
  
  "Blog": {
    "title": "Blog",
    "description": "Insights and updates from our team",
    "readMore": "Read more",
    "publishedOn": "Published on {date, date, long}",
    "author": "By {name}",
    "readingTime": "{minutes, plural, =1 {1 minute} other {# minutes}} read",
    "categories": "Categories",
    "tags": "Tags",
    "relatedPosts": "Related Posts",
    "noPosts": "No posts found",
    "searchPlaceholder": "Search articles..."
  },
  
  "Products": {
    "title": "Products",
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "price": "{price, number, currency}",
    "originalPrice": "Was {price, number, currency}",
    "discount": "{percent, number, percent} off",
    "inStock": "In Stock",
    "outOfStock": "Out of Stock",
    "lowStock": "Only {count, plural, =1 {1 item} other {# items}} left",
    "reviews": "{count, plural, =0 {No reviews} =1 {1 review} other {# reviews}}",
    "rating": "{rating} out of 5 stars"
  },
  
  "Cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "continueShopping": "Continue Shopping",
    "subtotal": "Subtotal",
    "shipping": "Shipping",
    "tax": "Tax",
    "total": "Total",
    "checkout": "Proceed to Checkout",
    "remove": "Remove",
    "quantity": "Quantity",
    "itemCount": "{count, plural, =0 {No items} =1 {1 item} other {# items}} in cart"
  },
  
  "Common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "update": "Update",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "all": "All",
    "none": "None",
    "yes": "Yes",
    "no": "No",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "submit": "Submit",
    "confirm": "Confirm",
    "learnMore": "Learn more"
  },
  
  "Errors": {
    "notFound": {
      "title": "Page Not Found",
      "description": "The page you're looking for doesn't exist.",
      "action": "Go Home"
    },
    "serverError": {
      "title": "Server Error",
      "description": "Something went wrong on our end. Please try again later.",
      "action": "Refresh Page"
    },
    "unauthorized": {
      "title": "Unauthorized",
      "description": "You don't have permission to access this page.",
      "action": "Sign In"
    }
  },
  
  "Dates": {
    "today": "Today",
    "yesterday": "Yesterday",
    "tomorrow": "Tomorrow",
    "thisWeek": "This week",
    "lastWeek": "Last week",
    "thisMonth": "This month",
    "lastMonth": "Last month",
    "daysAgo": "{days, plural, =1 {1 day} other {# days}} ago",
    "hoursAgo": "{hours, plural, =1 {1 hour} other {# hours}} ago",
    "minutesAgo": "{minutes, plural, =1 {1 minute} other {# minutes}} ago",
    "justNow": "Just now"
  }
}
```

### Using Translations in Components

```typescript
// Server Component with translations
// app/[locale]/page.tsx
import { useTranslations, useFormatter } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    title: t("title"),
    description: t("subheading"),
  };
}

export default function HomePage() {
  const t = useTranslations("HomePage");
  const format = useFormatter();

  return (
    <main>
      <h1>{t("heading")}</h1>
      <p>{t("subheading")}</p>
      
      {/* Interpolation with values */}
      <p>{t("trustedBy", { count: 10000 })}</p>
      
      {/* Nested translations */}
      <section>
        <h2>{t("features.title")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            title={t("features.performance.title")}
            description={t("features.performance.description")}
          />
          <FeatureCard
            title={t("features.security.title")}
            description={t("features.security.description")}
          />
          <FeatureCard
            title={t("features.scalable.title")}
            description={t("features.scalable.description")}
          />
        </div>
      </section>
    </main>
  );
}

// Client Component with translations
// components/product-card.tsx
"use client";

import { useTranslations, useFormatter } from "next-intl";

interface ProductCardProps {
  product: {
    name: string;
    price: number;
    originalPrice?: number;
    stock: number;
    reviewCount: number;
    rating: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("Products");
  const format = useFormatter();

  const discount = product.originalPrice
    ? (1 - product.price / product.originalPrice)
    : 0;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold">{product.name}</h3>
      
      {/* Currency formatting */}
      <p className="text-lg font-bold">
        {t("price", { price: product.price })}
      </p>
      
      {product.originalPrice && (
        <>
          <p className="text-sm text-muted-foreground line-through">
            {t("originalPrice", { price: product.originalPrice })}
          </p>
          <p className="text-sm text-green-600">
            {t("discount", { percent: discount })}
          </p>
        </>
      )}
      
      {/* Pluralization */}
      <p className="text-sm">
        {product.stock > 0
          ? product.stock < 5
            ? t("lowStock", { count: product.stock })
            : t("inStock")
          : t("outOfStock")
        }
      </p>
      
      {/* Reviews with pluralization */}
      <p className="text-sm text-muted-foreground">
        {t("reviews", { count: product.reviewCount })}
      </p>
      
      <button className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded">
        {t("addToCart")}
      </button>
    </div>
  );
}
```

### Rich Text with HTML Tags

```typescript
// messages/en.json
{
  "Auth": {
    "signUp": {
      "terms": "I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>"
    }
  }
}

// components/sign-up-form.tsx
"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export function SignUpForm() {
  const t = useTranslations("Auth.signUp");

  return (
    <form>
      {/* ... form fields ... */}
      
      <label className="flex items-center gap-2">
        <input type="checkbox" required />
        <span>
          {t.rich("terms", {
            terms: (chunks) => (
              <Link href="/terms" className="underline">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="underline">
                {chunks}
              </Link>
            ),
          })}
        </span>
      </label>
    </form>
  );
}
```

### Formatting Utilities

```typescript
// lib/i18n-utils.ts
import { useFormatter, useNow, useTimeZone } from "next-intl";

export function useI18nFormatters() {
  const format = useFormatter();
  const now = useNow();
  const timeZone = useTimeZone();

  return {
    // Date formatting
    formatDate: (date: Date, style: "full" | "long" | "medium" | "short" = "medium") =>
      format.dateTime(date, { dateStyle: style }),

    formatTime: (date: Date, style: "full" | "long" | "medium" | "short" = "short") =>
      format.dateTime(date, { timeStyle: style }),

    formatDateTime: (date: Date) =>
      format.dateTime(date, {
        dateStyle: "medium",
        timeStyle: "short",
      }),

    // Relative time
    formatRelativeTime: (date: Date) =>
      format.relativeTime(date, now),

    // Number formatting
    formatNumber: (num: number) =>
      format.number(num),

    formatCurrency: (amount: number, currency = "USD") =>
      format.number(amount, { style: "currency", currency }),

    formatPercent: (value: number) =>
      format.number(value, { style: "percent" }),

    formatCompact: (num: number) =>
      format.number(num, { notation: "compact" }),

    // List formatting
    formatList: (items: string[], type: "conjunction" | "disjunction" = "conjunction") =>
      format.list(items, { type }),
  };
}

// Usage in component
function StatsDisplay({ stats }: { stats: Stats }) {
  const { formatNumber, formatCurrency, formatCompact, formatRelativeTime } = useI18nFormatters();

  return (
    <div>
      <p>Users: {formatCompact(stats.userCount)}</p>
      <p>Revenue: {formatCurrency(stats.revenue)}</p>
      <p>Last updated: {formatRelativeTime(stats.updatedAt)}</p>
    </div>
  );
}
```

### Translation Validation Script

```typescript
// scripts/validate-translations.ts
import fs from "fs";
import path from "path";

const messagesDir = path.join(process.cwd(), "messages");
const defaultLocale = "en";

function loadJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function getKeys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return getKeys(value, fullKey);
    }
    return [fullKey];
  });
}

function validateTranslations() {
  const defaultPath = path.join(messagesDir, `${defaultLocale}.json`);
  const defaultMessages = loadJson(defaultPath);
  const defaultKeys = new Set(getKeys(defaultMessages));

  const localeFiles = fs.readdirSync(messagesDir).filter(
    (f) => f.endsWith(".json") && f !== `${defaultLocale}.json`
  );

  const issues: string[] = [];

  for (const file of localeFiles) {
    const locale = file.replace(".json", "");
    const messages = loadJson(path.join(messagesDir, file));
    const keys = new Set(getKeys(messages));

    // Check for missing keys
    for (const key of defaultKeys) {
      if (!keys.has(key)) {
        issues.push(`[${locale}] Missing key: ${key}`);
      }
    }

    // Check for extra keys
    for (const key of keys) {
      if (!defaultKeys.has(key)) {
        issues.push(`[${locale}] Extra key: ${key}`);
      }
    }
  }

  if (issues.length > 0) {
    console.error("Translation issues found:");
    issues.forEach((issue) => console.error(`  - ${issue}`));
    process.exit(1);
  }

  console.log("All translations are valid!");
}

validateTranslations();
```

## Variants

### Lazy Loading Translations

```typescript
// i18n/request.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  // Lazy load only needed namespaces
  const commonMessages = (await import(`../messages/${locale}/common.json`)).default;
  
  return {
    messages: commonMessages,
  };
});

// Load additional namespaces on demand
// app/[locale]/blog/page.tsx
import { getMessages } from "next-intl/server";

export default async function BlogPage() {
  // Merge additional messages
  const blogMessages = (await import(`@/messages/${locale}/blog.json`)).default;
  // ...
}
```

## Anti-patterns

1. **Hardcoded strings**: Text in components instead of message files
2. **Missing pluralization**: Not handling singular/plural forms
3. **No type safety**: Untyped translation keys
4. **Incomplete translations**: Missing keys in non-default locales
5. **Client-side only**: Not using server translations for metadata

## Related Skills

- `L5/patterns/i18n-routing` - Locale-based routing
- `L5/patterns/date-formatting` - Date/time formatting
- `L5/patterns/number-formatting` - Number formatting
- `L5/patterns/locale-detection` - Detecting user locale

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with next-intl and type safety
