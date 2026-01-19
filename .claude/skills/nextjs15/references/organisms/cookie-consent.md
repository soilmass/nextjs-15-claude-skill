---
id: o-cookie-consent
name: Cookie Consent
version: 2.0.0
layer: L3
category: utility
composes:
  - ../molecules/card.md
description: GDPR-compliant cookie consent banner with preference management
tags: [cookie, consent, gdpr, privacy, banner, compliance]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "CookieConsent = Dialog(m-dialog) + Card(m-card) + Button(a-button) + Switch(a-switch)"
dependencies:
  - react
  - lucide-react
  - js-cookie
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Cookie Consent

## Overview

A GDPR-compliant cookie consent organism with customizable categories, preference management modal, and persistent storage. Supports granular consent for analytics, marketing, and functional cookies.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CookieConsent (L3)                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Banner (fixed bottom)                                        │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  [Cookie Icon] Message text + Privacy Policy link       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Button(a-button)[]: [Preferences] [Reject] [Accept]    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  PreferencesModal - Dialog(m-dialog)                          │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Card(m-card): Header + Close button                    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  CategoryToggle[]                                       │  │  │
│  │  │  ┌───────────────────────────────────────────────────┐  │  │  │
│  │  │  │  Category Name + Description                      │  │  │  │
│  │  │  │  Switch(a-switch) + Expand Button                 │  │  │  │
│  │  │  │  ┌─────────────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  Cookie Details Table (expandable)          │  │  │  │  │
│  │  │  │  └─────────────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Footer: Button(a-button)[Accept All][Reject][Save]     │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/cookie-consent.tsx
'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Cookies from 'js-cookie';
import { X, Cookie, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required?: boolean;
  cookies?: Array<{
    name: string;
    provider: string;
    purpose: string;
    expiry: string;
  }>;
}

interface ConsentState {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  [key: string]: boolean;
}

interface CookieConsentProps {
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  categories?: CookieCategory[];
  onConsentChange?: (consent: ConsentState) => void;
  position?: 'bottom' | 'bottom-left' | 'bottom-right';
  consentCookieName?: string;
  consentCookieExpiry?: number;
}

// Default cookie categories
const defaultCategories: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Strictly Necessary',
    description:
      'These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas.',
    required: true,
    cookies: [
      {
        name: 'session_id',
        provider: 'This website',
        purpose: 'Maintains user session',
        expiry: 'Session',
      },
      {
        name: 'cookie_consent',
        provider: 'This website',
        purpose: 'Stores cookie preferences',
        expiry: '1 year',
      },
    ],
  },
  {
    id: 'functional',
    name: 'Functional',
    description:
      'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.',
    cookies: [
      {
        name: 'language',
        provider: 'This website',
        purpose: 'Remembers language preference',
        expiry: '1 year',
      },
      {
        name: 'theme',
        provider: 'This website',
        purpose: 'Remembers theme preference',
        expiry: '1 year',
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description:
      'These cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.',
    cookies: [
      {
        name: '_ga',
        provider: 'Google Analytics',
        purpose: 'Distinguishes users',
        expiry: '2 years',
      },
      {
        name: '_gid',
        provider: 'Google Analytics',
        purpose: 'Distinguishes users',
        expiry: '24 hours',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description:
      'These cookies are used to track visitors across websites to display relevant advertisements.',
    cookies: [
      {
        name: '_fbp',
        provider: 'Facebook',
        purpose: 'Tracks visits across websites',
        expiry: '3 months',
      },
    ],
  },
];

// Get initial consent state from cookie
function getInitialConsent(cookieName: string): ConsentState | null {
  try {
    const saved = Cookies.get(cookieName);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Invalid JSON, return null
  }
  return null;
}

// Save consent to cookie
function saveConsent(
  cookieName: string,
  consent: ConsentState,
  expiry: number
): void {
  Cookies.set(cookieName, JSON.stringify(consent), { expires: expiry });
}

// Category Toggle Component
function CategoryToggle({
  category,
  enabled,
  onToggle,
  expanded,
  onExpandToggle,
}: {
  category: CookieCategory;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  expanded: boolean;
  onExpandToggle: () => void;
}) {
  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{category.name}</h4>
            {category.required && (
              <span className="text-xs text-muted-foreground">(Required)</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {category.description}
          </p>
        </div>

        <div className="flex items-center gap-3 ml-4">
          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={category.required}
            onClick={() => onToggle(!enabled)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              enabled ? 'bg-primary' : 'bg-input',
              category.required && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform',
                enabled && 'translate-x-5'
              )}
            />
          </button>

          {/* Expand button */}
          {category.cookies && category.cookies.length > 0 && (
            <button
              type="button"
              onClick={onExpandToggle}
              className="p-1 hover:bg-accent rounded"
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Cookie details */}
      {expanded && category.cookies && (
        <div className="border-t px-4 py-3 bg-muted/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-medium">Cookie</th>
                <th className="pb-2 font-medium">Provider</th>
                <th className="pb-2 font-medium">Purpose</th>
                <th className="pb-2 font-medium">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {category.cookies.map((cookie) => (
                <tr key={cookie.name}>
                  <td className="py-1 font-mono text-xs">{cookie.name}</td>
                  <td className="py-1">{cookie.provider}</td>
                  <td className="py-1">{cookie.purpose}</td>
                  <td className="py-1">{cookie.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Preferences Modal
function PreferencesModal({
  open,
  onOpenChange,
  categories,
  consent,
  onConsentChange,
  onSave,
  privacyPolicyUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CookieCategory[];
  consent: ConsentState;
  onConsentChange: (consent: ConsentState) => void;
  onSave: () => void;
  privacyPolicyUrl?: string;
}) {
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>(
    []
  );

  const toggleExpanded = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-background shadow-lg">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <Dialog.Title className="font-semibold">
                Cookie Preferences
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-sm hover:bg-accent p-1">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience, serve
              personalized content, and analyze our traffic. You can choose
              which categories of cookies you allow.
              {privacyPolicyUrl && (
                <>
                  {' '}
                  Learn more in our{' '}
                  <a
                    href={privacyPolicyUrl}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                  .
                </>
              )}
            </p>

            <div className="space-y-3">
              {categories.map((category) => (
                <CategoryToggle
                  key={category.id}
                  category={category}
                  enabled={consent[category.id] ?? false}
                  onToggle={(enabled) =>
                    onConsentChange({ ...consent, [category.id]: enabled })
                  }
                  expanded={expandedCategories.includes(category.id)}
                  onExpandToggle={() => toggleExpanded(category.id)}
                />
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background p-4">
            <button
              onClick={() => {
                const allEnabled = categories.reduce(
                  (acc, cat) => ({ ...acc, [cat.id]: true }),
                  {} as ConsentState
                );
                onConsentChange(allEnabled);
              }}
              className="px-4 py-2 text-sm hover:bg-accent rounded-lg"
            >
              Accept All
            </button>
            <button
              onClick={() => {
                const onlyRequired = categories.reduce(
                  (acc, cat) => ({
                    ...acc,
                    [cat.id]: cat.required ?? false,
                  }),
                  {} as ConsentState
                );
                onConsentChange(onlyRequired);
              }}
              className="px-4 py-2 text-sm hover:bg-accent rounded-lg"
            >
              Reject All
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Save Preferences
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Main Cookie Consent Banner
export function CookieConsent({
  privacyPolicyUrl = '/privacy',
  cookiePolicyUrl,
  categories = defaultCategories,
  onConsentChange,
  position = 'bottom',
  consentCookieName = 'cookie_consent',
  consentCookieExpiry = 365,
}: CookieConsentProps) {
  const [showBanner, setShowBanner] = React.useState(false);
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [consent, setConsent] = React.useState<ConsentState>(() => {
    // Initialize with all required categories enabled
    return categories.reduce(
      (acc, cat) => ({ ...acc, [cat.id]: cat.required ?? false }),
      {} as ConsentState
    );
  });

  // Check for existing consent on mount
  React.useEffect(() => {
    const existingConsent = getInitialConsent(consentCookieName);
    if (existingConsent) {
      setConsent(existingConsent);
      onConsentChange?.(existingConsent);
    } else {
      setShowBanner(true);
    }
  }, [consentCookieName, onConsentChange]);

  const handleAcceptAll = () => {
    const allConsent = categories.reduce(
      (acc, cat) => ({ ...acc, [cat.id]: true }),
      {} as ConsentState
    );
    saveConsent(consentCookieName, allConsent, consentCookieExpiry);
    setConsent(allConsent);
    setShowBanner(false);
    onConsentChange?.(allConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent = categories.reduce(
      (acc, cat) => ({ ...acc, [cat.id]: cat.required ?? false }),
      {} as ConsentState
    );
    saveConsent(consentCookieName, minimalConsent, consentCookieExpiry);
    setConsent(minimalConsent);
    setShowBanner(false);
    onConsentChange?.(minimalConsent);
  };

  const handleSavePreferences = () => {
    saveConsent(consentCookieName, consent, consentCookieExpiry);
    setShowBanner(false);
    setShowPreferences(false);
    onConsentChange?.(consent);
  };

  const positionClasses = {
    bottom: 'bottom-0 left-0 right-0',
    'bottom-left': 'bottom-4 left-4 max-w-md',
    'bottom-right': 'bottom-4 right-4 max-w-md',
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner */}
      <div
        className={cn(
          'fixed z-50 border-t bg-background p-4 shadow-lg',
          position === 'bottom' ? '' : 'rounded-lg border',
          positionClasses[position]
        )}
        role="dialog"
        aria-label="Cookie consent"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Cookie className="h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <p className="text-sm">
                We use cookies to enhance your experience. By continuing to
                visit this site you agree to our use of cookies.{' '}
                <a
                  href={cookiePolicyUrl || privacyPolicyUrl}
                  className="text-primary hover:underline"
                >
                  Learn more
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
            <button
              onClick={() => setShowPreferences(true)}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent"
            >
              Preferences
            </button>
            <button
              onClick={handleRejectAll}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent"
            >
              Reject All
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      <PreferencesModal
        open={showPreferences}
        onOpenChange={setShowPreferences}
        categories={categories}
        consent={consent}
        onConsentChange={setConsent}
        onSave={handleSavePreferences}
        privacyPolicyUrl={privacyPolicyUrl}
      />
    </>
  );
}

// Hook to check consent
export function useCookieConsent(
  consentCookieName = 'cookie_consent'
): ConsentState | null {
  const [consent, setConsent] = React.useState<ConsentState | null>(null);

  React.useEffect(() => {
    setConsent(getInitialConsent(consentCookieName));
  }, [consentCookieName]);

  return consent;
}
```

## Usage

### Basic Usage

```tsx
import { CookieConsent } from '@/components/organisms/cookie-consent';

export function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsent
          privacyPolicyUrl="/privacy"
          onConsentChange={(consent) => {
            if (consent.analytics) {
              initAnalytics();
            }
            if (consent.marketing) {
              initMarketing();
            }
          }}
        />
      </body>
    </html>
  );
}
```

### Check Consent in Components

```tsx
import { useCookieConsent } from '@/components/organisms/cookie-consent';

export function AnalyticsScript() {
  const consent = useCookieConsent();

  if (!consent?.analytics) return null;

  return <Script src="https://analytics.example.com/script.js" />;
}
```

### Custom Categories

```tsx
<CookieConsent
  categories={[
    {
      id: 'necessary',
      name: 'Essential',
      description: 'Required for the site to work',
      required: true,
    },
    {
      id: 'preferences',
      name: 'Preferences',
      description: 'Remember your settings',
    },
  ]}
/>
```

## Props API

### CookieConsent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `privacyPolicyUrl` | `string` | `'/privacy'` | URL to privacy policy page |
| `cookiePolicyUrl` | `string` | `undefined` | URL to cookie policy (falls back to privacy) |
| `categories` | `CookieCategory[]` | Default categories | Cookie consent categories |
| `onConsentChange` | `(consent: ConsentState) => void` | `undefined` | Handler when consent changes |
| `position` | `'bottom' \| 'bottom-left' \| 'bottom-right'` | `'bottom'` | Banner position |
| `consentCookieName` | `string` | `'cookie_consent'` | Cookie name for storing consent |
| `consentCookieExpiry` | `number` | `365` | Days until consent cookie expires |

### CookieCategory

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique category identifier |
| `name` | `string` | Display name |
| `description` | `string` | Category description |
| `required` | `boolean` | Whether category is required (optional) |
| `cookies` | `CookieInfo[]` | List of cookies in category (optional) |

### CookieInfo

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Cookie name |
| `provider` | `string` | Cookie provider |
| `purpose` | `string` | Cookie purpose |
| `expiry` | `string` | Expiration time |

### useCookieConsent Hook

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `consentCookieName` | `string` | `'cookie_consent'` | Cookie name to read |

Returns: `ConsentState | null`

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Hidden | Consent already given | No banner visible |
| Banner Visible | First visit / no consent | Bottom banner with options |
| Preferences Open | Modal open | Full-screen modal with category toggles |
| Category Expanded | Details shown | Cookie table visible under category |
| Toggle On | Category enabled | Switch in primary color |
| Toggle Off | Category disabled | Switch in neutral color |
| Toggle Disabled | Required category | Switch grayed out, cannot toggle off |
| Saving | Preferences being saved | Brief transition before closing |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus through banner buttons, modal controls |
| `Enter` | Activate focused button, toggle category |
| `Space` | Toggle category switch |
| `Escape` | Close preferences modal |
| `Arrow Down/Up` | Navigate within expanded cookie table |

## Screen Reader Announcements

- Banner announced with `role="dialog"` and `aria-label="Cookie consent"`
- Category toggles have `role="switch"` with `aria-checked` state
- Required categories announce "(Required)" in label
- Category descriptions read when toggle focused
- Expand/collapse buttons announce state with `aria-label`
- Cookie details table has proper header associations
- Modal title and close button properly labeled
- Accept/Reject/Save buttons clearly labeled
- Policy links announced with their text

## Anti-patterns

### 1. No Privacy Policy Link
```tsx
// Bad - no way to read policy
<CookieConsent />

// Good - link to privacy policy
<CookieConsent
  privacyPolicyUrl="/privacy"
  cookiePolicyUrl="/cookies"
/>
```

### 2. Missing Consent Change Handler
```tsx
// Bad - no response to consent changes
<CookieConsent
  privacyPolicyUrl="/privacy"
/>

// Good - handle consent to load/unload scripts
<CookieConsent
  privacyPolicyUrl="/privacy"
  onConsentChange={(consent) => {
    if (consent.analytics) {
      initGoogleAnalytics();
    }
    if (consent.marketing) {
      initFacebookPixel();
    }
  }}
/>
```

### 3. Short Cookie Expiry
```tsx
// Bad - consent expires too quickly, annoying users
<CookieConsent
  consentCookieExpiry={7}
/>

// Good - reasonable expiry (1 year typical)
<CookieConsent
  consentCookieExpiry={365}
/>
```

### 4. Missing Cookie Details
```tsx
// Bad - categories without cookie information
<CookieConsent
  categories={[
    { id: 'analytics', name: 'Analytics', description: 'Analytics cookies' }
  ]}
/>

// Good - full cookie transparency
<CookieConsent
  categories={[
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Help us understand how visitors interact with our site',
      cookies: [
        { name: '_ga', provider: 'Google Analytics', purpose: 'Distinguishes users', expiry: '2 years' },
        { name: '_gid', provider: 'Google Analytics', purpose: 'Distinguishes users', expiry: '24 hours' },
      ]
    }
  ]}
/>
```

## Related Skills

- `patterns/cookie-management` - Cookie handling
- `patterns/compliance` - GDPR compliance
- `organisms/announcement-banner` - Banner pattern

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial GDPR-compliant implementation
- Preference management modal
- Category-based consent
- Cookie details table
- Persistent storage with js-cookie
