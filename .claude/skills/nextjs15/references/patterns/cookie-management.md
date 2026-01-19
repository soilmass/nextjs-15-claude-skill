---
id: pt-cookie-management
name: Cookie Management
version: 2.0.0
layer: L5
category: browser
description: Cookie handling and GDPR-compliant consent management
tags: [cookies, gdpr, consent, privacy, compliance]
composes:
  - ../organisms/dialog.md
  - ../atoms/input-switch.md
dependencies: []
formula: Cookie Consent + Category Preferences + Compliance = GDPR Cookies
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

- Implementing GDPR-compliant cookie banners
- Managing user consent preferences
- Controlling analytics and marketing cookies
- Storing secure session cookies
- Setting cookie expiry and attributes

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Cookie Consent Architecture                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cookie Categories                                   │   │
│  │                                                     │   │
│  │ [x] Necessary (Always enabled)                      │   │
│  │ [ ] Analytics (Google Analytics, etc.)              │   │
│  │ [ ] Marketing (Ads, tracking)                       │   │
│  │ [ ] Preferences (UI settings)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Consent Flow                                        │   │
│  │                                                     │   │
│  │ 1. Check for existing consent cookie                │   │
│  │ 2. Show banner if no consent                        │   │
│  │ 3. Block non-essential cookies until consent        │   │
│  │ 4. Store preferences in cookie                      │   │
│  │ 5. Initialize allowed services                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Cookie Attributes:                                         │
│  - HttpOnly (server-only access)                           │
│  - Secure (HTTPS only)                                     │
│  - SameSite (Strict/Lax/None)                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Cookie Management

## Overview

A comprehensive cookie management system with GDPR-compliant consent handling, category-based preferences, and integration with analytics providers.

## Implementation

### Cookie Consent Provider

```tsx
// lib/cookies/cookie-consent-provider.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextValue {
  preferences: CookiePreferences;
  hasConsented: boolean;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updatePreferences: (preferences: Partial<CookiePreferences>) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  isPreferencesOpen: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

const CONSENT_COOKIE = 'cookie_consent';
const PREFERENCES_COOKIE = 'cookie_preferences';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return context;
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const consent = getCookie(CONSENT_COOKIE);
    const savedPrefs = getCookie(PREFERENCES_COOKIE);

    if (consent === 'true') {
      setHasConsented(true);
      if (savedPrefs) {
        try {
          setPreferences({ ...defaultPreferences, ...JSON.parse(savedPrefs as string) });
        } catch {
          setPreferences(defaultPreferences);
        }
      }
    } else {
      // Show banner if not consented
      setShowBanner(true);
    }
  }, []);

  // Apply preferences when they change
  useEffect(() => {
    if (hasConsented) {
      applyPreferences(preferences);
    }
  }, [preferences, hasConsented]);

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    setCookie(CONSENT_COOKIE, 'true', {
      expires: expiryDate,
      path: '/',
      sameSite: 'lax',
    });

    setCookie(PREFERENCES_COOKIE, JSON.stringify(prefs), {
      expires: expiryDate,
      path: '/',
      sameSite: 'lax',
    });

    setPreferences(prefs);
    setHasConsented(true);
    setShowBanner(false);
  }, []);

  const acceptAll = useCallback(() => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }, [savePreferences]);

  const rejectAll = useCallback(() => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
    
    // Clear non-essential cookies
    clearNonEssentialCookies();
  }, [savePreferences]);

  const updatePreferences = useCallback(
    (updates: Partial<CookiePreferences>) => {
      const newPrefs = { ...preferences, ...updates, necessary: true };
      savePreferences(newPrefs);
      
      // Clear cookies for disabled categories
      Object.entries(updates).forEach(([category, enabled]) => {
        if (!enabled && category !== 'necessary') {
          clearCookiesByCategory(category as CookieCategory);
        }
      });
    },
    [preferences, savePreferences]
  );

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        showBanner,
        acceptAll,
        rejectAll,
        updatePreferences,
        openPreferences,
        closePreferences,
        isPreferencesOpen,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

// Cookie category mappings
const cookieCategories: Record<CookieCategory, string[]> = {
  necessary: ['session', 'csrf', 'cookie_consent', 'cookie_preferences'],
  functional: ['theme', 'language', 'sidebar_collapsed'],
  analytics: ['_ga', '_gid', '_gat', 'mp_', 'amplitude'],
  marketing: ['_fbp', '_gcl', 'ads_'],
};

function applyPreferences(preferences: CookiePreferences) {
  // Enable/disable analytics
  if (typeof window !== 'undefined') {
    if (preferences.analytics && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    } else if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }

    // Enable/disable marketing
    if (window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: preferences.marketing ? 'granted' : 'denied',
        ad_user_data: preferences.marketing ? 'granted' : 'denied',
        ad_personalization: preferences.marketing ? 'granted' : 'denied',
      });
    }
  }
}

function clearNonEssentialCookies() {
  (['functional', 'analytics', 'marketing'] as CookieCategory[]).forEach((category) => {
    clearCookiesByCategory(category);
  });
}

function clearCookiesByCategory(category: CookieCategory) {
  const patterns = cookieCategories[category];
  
  if (typeof document !== 'undefined') {
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (patterns.some((pattern) => name.startsWith(pattern) || name.includes(pattern))) {
        deleteCookie(name);
      }
    });
  }
}
```

### Cookie Banner Component

```tsx
// components/cookies/cookie-banner.tsx
'use client';

import { useState } from 'react';
import { X, Settings, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent, CookieCategory } from '@/lib/cookies/cookie-consent-provider';
import { CookiePreferencesModal } from './cookie-preferences-modal';

export function CookieBanner() {
  const {
    showBanner,
    acceptAll,
    rejectAll,
    openPreferences,
    isPreferencesOpen,
    closePreferences,
  } = useCookieConsent();

  if (!showBanner && !isPreferencesOpen) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          >
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      We value your privacy
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      We use cookies to enhance your browsing experience, serve
                      personalized content, and analyze our traffic. By clicking
                      "Accept All", you consent to our use of cookies.{' '}
                      <a
                        href="/privacy"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={openPreferences}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                  </button>
                  <button
                    onClick={rejectAll}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={acceptAll}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={closePreferences}
      />
    </>
  );
}
```

### Cookie Preferences Modal

```tsx
// components/cookies/cookie-preferences-modal.tsx
'use client';

import { useState } from 'react';
import { X, Cookie, BarChart3, Megaphone, Cog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent, CookiePreferences } from '@/lib/cookies/cookie-consent-provider';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  {
    id: 'necessary' as const,
    name: 'Necessary',
    description: 'Essential for the website to function properly. Cannot be disabled.',
    icon: Cookie,
    required: true,
  },
  {
    id: 'functional' as const,
    name: 'Functional',
    description: 'Enable personalized features like theme preferences and saved settings.',
    icon: Cog,
    required: false,
  },
  {
    id: 'analytics' as const,
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website.',
    icon: BarChart3,
    required: false,
  },
  {
    id: 'marketing' as const,
    name: 'Marketing',
    description: 'Used to deliver relevant advertisements and track ad campaign performance.',
    icon: Megaphone,
    required: false,
  },
];

export function CookiePreferencesModal({ isOpen, onClose }: CookiePreferencesModalProps) {
  const { preferences, updatePreferences, acceptAll, rejectAll } = useCookieConsent();
  const [localPrefs, setLocalPrefs] = useState<CookiePreferences>(preferences);

  const handleToggle = (category: keyof CookiePreferences) => {
    if (category === 'necessary') return; // Cannot toggle necessary
    setLocalPrefs((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = () => {
    updatePreferences(localPrefs);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cookie Preferences
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Manage your cookie preferences below. You can enable or disable
                different types of cookies according to your preferences.
              </p>

              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                          <category.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                            {category.required && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Required)
                              </span>
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle(category.id)}
                        disabled={category.required}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          localPrefs[category.id]
                            ? 'bg-blue-600'
                            : 'bg-gray-200 dark:bg-gray-700'
                        } ${category.required ? 'cursor-not-allowed opacity-50' : ''}`}
                        role="switch"
                        aria-checked={localPrefs[category.id]}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                            localPrefs[category.id] ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between border-t border-gray-200 p-6 dark:border-gray-800">
              <button
                onClick={() => {
                  rejectAll();
                  onClose();
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Reject All
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    acceptAll();
                    onClose();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Accept All
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Cookie Settings Link

```tsx
// components/cookies/cookie-settings-link.tsx
'use client';

import { Settings } from 'lucide-react';
import { useCookieConsent } from '@/lib/cookies/cookie-consent-provider';

export function CookieSettingsLink() {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      onClick={openPreferences}
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    >
      <Settings className="h-4 w-4" />
      Cookie Settings
    </button>
  );
}
```

### Cookie Utility Functions

```tsx
// lib/cookies/utils.ts
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export function setSecureCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  const defaultOptions: CookieOptions = {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  };

  setCookie(name, value, { ...defaultOptions, ...options });
}

export function getSecureCookie(name: string): string | undefined {
  const value = getCookie(name);
  return value as string | undefined;
}

export function removeSecureCookie(name: string, path = '/') {
  deleteCookie(name, { path });
}

// Server-side cookie utilities
export async function getServerCookie(name: string) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export async function setServerCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.set(name, value, options);
}
```

## Usage

```tsx
// Setup in layout
import { CookieConsentProvider } from '@/lib/cookies/cookie-consent-provider';
import { CookieBanner } from '@/components/cookies/cookie-banner';

export default function RootLayout({ children }) {
  return (
    <CookieConsentProvider>
      {children}
      <CookieBanner />
    </CookieConsentProvider>
  );
}

// Check consent before loading scripts
import { useCookieConsent } from '@/lib/cookies/cookie-consent-provider';

function AnalyticsLoader() {
  const { preferences, hasConsented } = useCookieConsent();

  if (!hasConsented || !preferences.analytics) {
    return null;
  }

  return (
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
      strategy="afterInteractive"
    />
  );
}

// Add cookie settings link in footer
import { CookieSettingsLink } from '@/components/cookies/cookie-settings-link';

function Footer() {
  return (
    <footer>
      <CookieSettingsLink />
    </footer>
  );
}
```

## Related Skills

- [L3/cookie-consent](../organisms/cookie-consent.md) - Cookie consent banner
- [L5/analytics-events](./analytics-events.md) - Analytics tracking
- [L5/compliance](../patterns/compliance.md) - GDPR compliance

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with GDPR-compliant consent
